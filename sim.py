"""Local PvP battle simulator v2 — built on PvPoke's gamemaster.json data.

Upgrades over v1:
- Proper turn order: charged moves resolve before fast moves; charged-vs-charged
  broken by CMP (effective attack), ties broken randomly.
- Smart shields: only blocks a charged move that would KO or deal heavy damage
  (threshold scales with shields remaining). No more shielding every bait.
- KO-aware move selection: throws the cheapest move that secures a KO; with no
  shields on the other side throws max damage; with shields up mixes bait
  (cheapest) and nuke (best damage-per-energy).
- Buff/debuff application driven by gamemaster data with seeded RNG.
- Multi-trial win rates instead of single binary outcomes.
- Team gauntlets: 3v3 with HP/energy/shield carryover and heuristic switching.
"""
import json, math, os, random

GM_PATH = os.path.join(os.path.dirname(__file__), '..', 'pvpoke', 'src', 'data', 'gamemaster.json')

with open(GM_PATH) as f:
    GM = json.load(f)

POKEMON = {p['speciesId']: p for p in GM['pokemon']}
MOVES = {m['moveId']: m for m in GM['moves']}

# CP multiplier per level (standard)
CPM = {
    1:0.094, 1.5:0.13513752, 2:0.16639787, 2.5:0.192650919, 3:0.21573247,
    3.5:0.236572661, 4:0.25572005, 4.5:0.273530381, 5:0.29024988,
    5.5:0.306057377, 6:0.3210876, 6.5:0.335445036, 7:0.34921268,
    7.5:0.362457751, 8:0.3752356, 8.5:0.387592406, 9:0.39956728,
    9.5:0.411193551, 10:0.4225, 10.5:0.432926419, 11:0.44310755,
    11.5:0.453059959, 12:0.4627984, 12.5:0.472336093, 13:0.48168495,
    13.5:0.4908558, 14:0.49985844, 14.5:0.508701765, 15:0.51739395,
    15.5:0.525942511, 16:0.53435433, 16.5:0.542635737, 17:0.55079269,
    17.5:0.558830586, 18:0.56675452, 18.5:0.574569153, 19:0.58227891,
    19.5:0.589887917, 20:0.5974, 20.5:0.604818814, 21:0.61215729,
    21.5:0.619399365, 22:0.62656716, 22.5:0.633644533, 23:0.64065295,
    23.5:0.647576426, 24:0.65443563, 24.5:0.661214806, 25:0.667934,
    25.5:0.674577537, 26:0.68116492, 26.5:0.687680648, 27:0.69414365,
    27.5:0.700538673, 28:0.70688421, 28.5:0.713164996, 29:0.71939909,
    29.5:0.725571552, 30:0.7317, 30.5:0.734741009, 31:0.73776948,
    31.5:0.740785593, 32:0.74378943, 32.5:0.746781211, 33:0.74976104,
    33.5:0.752729087, 34:0.75568551, 34.5:0.758630378, 35:0.76156384,
    35.5:0.764486064, 36:0.76739717, 36.5:0.770297266, 37:0.7731865,
    37.5:0.776064962, 38:0.77893275, 38.5:0.781790055, 39:0.78463697,
    39.5:0.787473578, 40:0.79030001, 40.5:0.79280395, 41:0.79530001,
    41.5:0.797803921, 42:0.8003, 42.5:0.80280389, 43:0.8053,
    43.5:0.807803941, 44:0.8103, 44.5:0.812803906, 45:0.8153,
    45.5:0.817803901, 46:0.8203, 46.5:0.822803897, 47:0.8253,
    47.5:0.827803893, 48:0.8303, 48.5:0.832803889, 49:0.8353,
    49.5:0.837803885, 50:0.8403, 51:0.84539799,
}

# Standard type chart: attacker -> {defender: multiplier}
TYPE_CHART = {
    'normal':   {'rock':0.625, 'ghost':0.391, 'steel':0.625},
    'fire':     {'fire':0.625, 'water':0.625, 'grass':1.6, 'ice':1.6, 'bug':1.6, 'rock':0.625, 'dragon':0.625, 'steel':1.6},
    'water':    {'fire':1.6, 'water':0.625, 'grass':0.625, 'ground':1.6, 'rock':1.6, 'dragon':0.625},
    'electric': {'water':1.6, 'electric':0.625, 'grass':0.625, 'ground':0.391, 'flying':1.6, 'dragon':0.625},
    'grass':    {'fire':0.625, 'water':1.6, 'grass':0.625, 'poison':0.625, 'ground':1.6, 'flying':0.625, 'bug':0.625, 'rock':1.6, 'dragon':0.625, 'steel':0.625},
    'ice':      {'fire':0.625, 'water':0.625, 'grass':1.6, 'ice':0.625, 'ground':1.6, 'flying':1.6, 'dragon':1.6, 'steel':0.625},
    'fighting': {'normal':1.6, 'ice':1.6, 'poison':0.625, 'flying':0.625, 'psychic':0.625, 'bug':0.625, 'rock':1.6, 'ghost':0.391, 'dark':1.6, 'steel':1.6, 'fairy':0.625},
    'poison':   {'grass':1.6, 'poison':0.625, 'ground':0.625, 'rock':0.625, 'ghost':0.625, 'steel':0.391, 'fairy':1.6},
    'ground':   {'fire':1.6, 'electric':1.6, 'grass':0.625, 'poison':1.6, 'flying':0.391, 'bug':0.625, 'rock':1.6, 'steel':1.6},
    'flying':   {'electric':0.625, 'grass':1.6, 'fighting':1.6, 'bug':1.6, 'rock':0.625, 'steel':0.625},
    'psychic':  {'fighting':1.6, 'poison':1.6, 'psychic':0.625, 'dark':0.391, 'steel':0.625},
    'bug':      {'fire':0.625, 'grass':1.6, 'fighting':0.625, 'poison':0.625, 'flying':0.625, 'psychic':1.6, 'ghost':0.625, 'dark':1.6, 'steel':0.625, 'fairy':0.625},
    'rock':     {'fire':1.6, 'ice':1.6, 'fighting':0.625, 'ground':0.625, 'flying':1.6, 'bug':1.6, 'steel':0.625},
    'ghost':    {'normal':0.391, 'psychic':1.6, 'ghost':1.6, 'dark':0.625},
    'dragon':   {'dragon':1.6, 'steel':0.625, 'fairy':0.391},
    'dark':     {'fighting':0.625, 'psychic':1.6, 'ghost':1.6, 'dark':0.625, 'fairy':0.625},
    'steel':    {'fire':0.625, 'water':0.625, 'electric':0.625, 'ice':1.6, 'rock':1.6, 'steel':0.625, 'fairy':1.6},
    'fairy':    {'fire':0.625, 'fighting':1.6, 'poison':0.625, 'dragon':1.6, 'dark':1.6, 'steel':0.625},
}

def effectiveness(move_type, defender_types):
    mult = 1.0
    for dt in defender_types:
        mult *= TYPE_CHART.get(move_type, {}).get(dt, 1.0)
    return mult

def calc_stats(species_id, atk_iv, def_iv, hp_iv, level):
    p = POKEMON[species_id]
    cpm = CPM[level]
    atk = (p['baseStats']['atk'] + atk_iv) * cpm
    dfn = (p['baseStats']['def'] + def_iv) * cpm
    hp = math.floor((p['baseStats']['hp'] + hp_iv) * cpm)
    return atk, dfn, hp, p['types']

def calc_cp(species_id, atk_iv, def_iv, hp_iv, level):
    atk, dfn, hp, _ = calc_stats(species_id, atk_iv, def_iv, hp_iv, level)
    return max(10, math.floor(atk * math.sqrt(dfn) * math.sqrt(hp) / 10))

def find_level(species_id, atk_iv, def_iv, hp_iv, target_cp=1500):
    """Find highest level at or under target CP."""
    best = 1
    for lvl in sorted(CPM.keys()):
        if lvl > 51:
            continue
        if calc_cp(species_id, atk_iv, def_iv, hp_iv, lvl) <= target_cp:
            best = lvl
    return best

class Battler:
    def __init__(self, species_id, fast_move, charged_moves, atk_iv, def_iv, hp_iv,
                 level=None, shadow=False):
        self.species_id = species_id
        if level is None:
            level = find_level(species_id, atk_iv, def_iv, hp_iv)
        self.level = level
        self.atk, self.dfn, self.max_hp, self.types = calc_stats(
            species_id, atk_iv, def_iv, hp_iv, level)
        if shadow:
            self.atk *= 1.2
            self.dfn *= 0.8333333
        self.fast = MOVES[fast_move]
        self.charged = [MOVES[m] for m in charged_moves]
        self.reset()

    def reset(self):
        self.hp = self.max_hp
        self.energy = 0
        self.atk_stage = 0
        self.def_stage = 0
        self.cooldown_left = 0

    def eff_atk(self):
        return self.atk * self._stage_mult(self.atk_stage)

    def eff_dfn(self):
        return self.dfn * self._stage_mult(self.def_stage)

    @staticmethod
    def _stage_mult(stage):
        if stage >= 0:
            return (12 + stage) / 12
        return 12 / (12 - stage)

    def fast_damage_to(self, other):
        power = self.fast['power']
        stab = 1.2 if self.fast['type'] in self.types else 1.0
        eff = effectiveness(self.fast['type'], other.types)
        return math.floor(0.5 * power * (self.eff_atk() / other.eff_dfn()) * stab * eff) + 1

    def charged_damage_to(self, move, other):
        power = move['power']
        stab = 1.2 if move['type'] in self.types else 1.0
        eff = effectiveness(move['type'], other.types)
        return math.floor(0.5 * power * (self.eff_atk() / other.eff_dfn()) * stab * eff) + 1

    def apply_buffs(self, move, target, rng):
        buffs = move.get('buffs')
        if not buffs:
            return
        chance = float(move.get('buffApplyChance') or 1.0)
        if rng.random() > chance:
            return
        tgt = move.get('buffTarget', 'opponent')
        atk_chg, def_chg = buffs[0], buffs[1]
        if tgt == 'opponent':
            target.atk_stage = max(-4, min(4, target.atk_stage + atk_chg))
            target.def_stage = max(-4, min(4, target.def_stage + def_chg))
        else:
            self.atk_stage = max(-4, min(4, self.atk_stage + atk_chg))
            self.def_stage = max(-4, min(4, self.def_stage + def_chg))


def make_battler(species_id, moves, ivs, level=None, shadow=False):
    """moves = [fast, charged1, charged2]; ivs = (atk, def, hp)."""
    return Battler(species_id, moves[0], moves[1:], ivs[0], ivs[1], ivs[2],
                   level=level, shadow=shadow)


# ---------------------------------------------------------------- AI helpers

def _pick_charged(att, dfn, dfn_shields, rng):
    """Choose which charged move to throw, or None."""
    afford = [m for m in att.charged if att.energy >= m['energy']]
    if not afford:
        return None
    # 1. If something KOs, throw the cheapest KO move.
    ko = [m for m in afford if att.charged_damage_to(m, dfn) >= dfn.hp]
    if ko:
        return min(ko, key=lambda m: m['energy'])
    # 2. No shields left on them: max damage.
    if dfn_shields == 0:
        return max(afford, key=lambda m: att.charged_damage_to(m, dfn))
    # 3. Shields up: bait (cheapest) 60% / nuke (best DPE) 40%.
    bait = min(afford, key=lambda m: m['energy'])
    nuke = max(afford, key=lambda m: att.charged_damage_to(m, dfn) / m['energy'])
    if bait is nuke:
        return bait
    return bait if rng.random() < 0.6 else nuke


def _want_shield(dfn, att, move, shields_left):
    """Smart shield: block KOs and heavy hits, let chip through."""
    if shields_left <= 0:
        return False
    dmg = att.charged_damage_to(move, dfn)
    if dmg >= dfn.hp:
        return True
    if shields_left >= 2 and dmg >= 0.30 * dfn.max_hp:
        return True
    if shields_left == 1 and dmg >= 0.45 * dfn.max_hp:
        return True
    return False


# ---------------------------------------------------------------- battle

def duel(a, b, rng, shields_a=1, shields_b=1, max_turns=800):
    """1v1. Returns (winner 'a'/'b', shields_a_left, shields_b_left).
    Mutates battlers (HP/energy/cooldown) — caller resets when needed."""
    sa, sb = shields_a, shields_b
    for _ in range(max_turns):
        if a.hp <= 0 or b.hp <= 0:
            break
        am = _pick_charged(a, b, sb, rng) if a.cooldown_left <= 0 else None
        bm = _pick_charged(b, a, sa, rng) if b.cooldown_left <= 0 else None
        acts = []
        if am:
            acts.append((0, -a.eff_atk() - rng.random() * 1e-9, a, b, am, 'sb'))
        if bm:
            acts.append((0, -b.eff_atk() - rng.random() * 1e-9, b, a, bm, 'sa'))
        if not am and a.cooldown_left <= 0:
            acts.append((1, 0, a, b, None, None))
        if not bm and b.cooldown_left <= 0:
            acts.append((1, 0, b, a, None, None))
        # charged first, then CMP (higher effective attack), then fast moves
        acts.sort(key=lambda x: (x[0], x[1]))
        for _, _, actor, target, mv, shield_key in acts:
            if actor.hp <= 0 or target.hp <= 0:
                continue
            if mv is not None:
                if shield_key == 'sb':
                    if _want_shield(target, actor, mv, sb):
                        sb -= 1
                    else:
                        target.hp -= actor.charged_damage_to(mv, target)
                else:
                    if _want_shield(target, actor, mv, sa):
                        sa -= 1
                    else:
                        target.hp -= actor.charged_damage_to(mv, target)
                actor.energy = max(0, actor.energy - mv['energy'])
                actor.apply_buffs(mv, target, rng)
                actor.cooldown_left = 1
            else:
                target.hp -= actor.fast_damage_to(target)
                actor.energy = min(100, actor.energy + actor.fast['energyGain'])
                actor.cooldown_left = actor.fast_cooldown
        for x in (a, b):
            if x.cooldown_left > 0:
                x.cooldown_left -= 1
    if a.hp > 0 and b.hp <= 0:
        return 'a', sa, sb
    if b.hp > 0 and a.hp <= 0:
        return 'b', sa, sb
    w = 'a' if a.hp / a.max_hp >= b.hp / b.max_hp else 'b'
    return w, sa, sb


def _switch_score(b, threat):
    """Heuristic: best offensive charged effectiveness vs threat, discounted by
    how hard the threat's fast move hits us. Higher = better switch-in."""
    off = max(
        effectiveness(m['type'], threat.types) * (1.2 if m['type'] in b.types else 1.0)
        for m in b.charged
    )
    incoming = effectiveness(threat.fast['type'], b.types)
    return (off / max(incoming, 0.2)) * (0.5 + 0.5 * b.hp / b.max_hp)


def gauntlet(team_specs, threat_spec, shields=1, trials=3, seed=0):
    """3-mon team vs one threat, winner-stays-loser-switches with full
    HP/energy/shield carryover. Returns win rate in [0,1].

    team_specs: [(species_id, [fast,ch1,ch2], (a,d,h)), ...] (3)
    threat_spec: (species_id, [fast,ch1,ch2], (a,d,h))
    """
    wins = 0
    for t in range(trials):
        rng = random.Random(seed * 7919 + t)
        squad = [make_battler(s, m, iv) for s, m, iv in team_specs]
        foe = make_battler(*threat_spec)
        for b in squad + [foe]:
            b.reset()
        sa, sb = shields, shields
        cur, bench = squad[0], squad[1:]
        team_won = False
        while True:
            w, sa, sb = duel(cur, foe, rng, shields_a=sa, shields_b=sb)
            if w == 'a':
                team_won = True
                break
            if not bench:
                break
            nxt = max(bench, key=lambda b: _switch_score(b, foe))
            bench.remove(nxt)
            cur = nxt
        if team_won:
            wins += 1
    return wins / trials


def matchup_winrate(species_a, moves_a, ivs_a, species_b, moves_b, ivs_b,
                    shields=1, trials=5, seed=0):
    """1v1 win rate for A across trials."""
    wins = 0
    for t in range(trials):
        rng = random.Random(seed * 104729 + t)
        a = make_battler(species_a, moves_a, ivs_a)
        b = make_battler(species_b, moves_b, ivs_b)
        a.reset(); b.reset()
        w, _, _ = duel(a, b, rng, shields_a=shields, shields_b=shields)
        if w == 'a':
            wins += 1
    return wins / trials


if __name__ == '__main__':
    rng = random.Random(0)
    a = make_battler('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'FLAMETHROWER'], (0, 15, 8))
    b = make_battler('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'FLAMETHROWER'], (0, 15, 8))
    a.reset(); b.reset()
    print("mirror:", duel(a, b, rng))
    print("whiscash vs melmetal 1s:",
          matchup_winrate('whiscash', ['MUD_SHOT', 'MUD_BOMB', 'BLIZZARD'], (4, 15, 14),
                          'melmetal', ['THUNDER_SHOCK', 'DOUBLE_IRON_BASH', 'DYNAMIC_PUNCH'],
                          (15, 15, 15), shields=1, trials=5))
