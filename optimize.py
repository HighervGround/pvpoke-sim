"""Team optimizer v2: two-phase scoring with 3v3 gauntlets.

Phase 1 (fast): gauntlet win-rate vs all threats, 1 shield, 1 trial — ranks all
  1,140 combos, keeps top 60.
Phase 2 (deep): top 60 re-scored with 0/1/2-shield gauntlets, 3 trials each,
  weighted by threat importance.
"""
import itertools, json, time
from sim import gauntlet, matchup_winrate

# Candidate pool: (species_id, [fast, ch1, ch2], (atk,def,hp), label)
# IVs/moves are the trainer's actual box data (no Elite TMs assumed).
CANDIDATES = [
    ('altaria',   ['DRAGON_BREATH','SKY_ATTACK','FLAMETHROWER'], (0,15,8),   'Altaria'),
    ('mimikyu',   ['SHADOW_CLAW','SHADOW_SNEAK','PLAY_ROUGH'],   (15,12,15), 'Mimikyu'),
    ('corviknight',['SAND_ATTACK','AIR_CUTTER','PAYBACK'],        (14,14,15), 'Corviknight'),
    ('malamar',   ['PSYWAVE','FOUL_PLAY','SUPER_POWER'],         (1,14,15),  'Malamar'),
    ('ninetales', ['FIRE_SPIN','WEATHER_BALL_FIRE','SCORCHING_SANDS'], (0,15,15), 'Ninetales'),
    ('whiscash',  ['MUD_SHOT','MUD_BOMB','BLIZZARD'],            (4,15,14),  'Whiscash'),
    ('azumarill', ['BUBBLE','PLAY_ROUGH','ICE_BEAM'],            (0,15,15),  'Azumarill'),
    ('cradily',   ['ACID','GRASS_KNOT','ROCK_TOMB'],             (0,15,15),  'Cradily'),
    ('pelipper',  ['WING_ATTACK','WEATHER_BALL_WATER','HURRICANE'], (1,14,15), 'Pelipper'),
    ('mandibuzz', ['SNARL','AERIAL_ACE','FOUL_PLAY'],            (11,14,13), 'Mandibuzz'),
    ('clodsire',  ['POISON_STING','STONE_EDGE','EARTHQUAKE'],    (0,14,13),  'Clodsire'),
    ('excadrill', ['MUD_SHOT','IRON_HEAD','EARTHQUAKE'],         (4,13,14),  'Excadrill'),
    ('dunsparce', ['ROLLOUT','ROCK_SLIDE','DRILL_RUN'],          (0,10,11),  'Dunsparce'),
    ('stunfisk',  ['THUNDER_SHOCK','MUD_BOMB','DISCHARGE'],      (0,14,15),  'Stunfisk'),
    ('talonflame',['INCINERATE','FLY','BRAVE_BIRD'],             (0,15,15),  'Talonflame'),
    ('umbreon',   ['SNARL','FOUL_PLAY','DARK_PULSE'],            (2,10,10),  'Umbreon'),
    ('vigoroth',  ['COUNTER','ROCK_SLIDE','BODY_SLAM'],          (10,7,14),  'Vigoroth'),
    ('lanturn',   ['SPARK','SURF','THUNDERBOLT'],                (8,8,12),   'Lanturn'),
    ('abomasnow', ['POWDER_SNOW','ENERGY_BALL','WEATHER_BALL_ICE'], (0,15,15), 'Abomasnow'),
    ('jellicent', ['HEX','SURF','SHADOW_BALL'],                  (11,12,15), 'Jellicent'),
]

# Meta threats: (species_id, [fast, ch1, ch2], (atk,def,hp), label, weight)
THREATS = [
    ('melmetal',  ['THUNDER_SHOCK','DOUBLE_IRON_BASH','DYNAMIC_PUNCH'], (15,15,15), 'Melmetal', 3),
    ('sableye',   ['SHADOW_CLAW','FOUL_PLAY','DAZZLING_GLEAM'], (0,15,15), 'Mega Sableye', 3),
    ('altaria',   ['DRAGON_BREATH','MOONBLAST','SKY_ATTACK'],   (0,15,15), 'Altaria', 2),
    ('ninetales', ['EMBER','WEATHER_BALL_FIRE','ENERGY_BALL'],   (0,15,15), 'Sh Ninetales', 2),
    ('tinkaton',  ['FAIRY_WIND','GIGATON_HAMMER','BULLDOZE'],    (10,14,15),'Tinkaton', 2),
    ('mimikyu',   ['SHADOW_CLAW','SHADOW_SNEAK','PLAY_ROUGH'],   (0,15,15), 'Mimikyu', 2),
    ('cramorant', ['PECK','DIVE','FLY'],                         (0,15,15), 'Cramorant', 2),
    ('corviknight',['SAND_ATTACK','AIR_CUTTER','IRON_HEAD'],      (0,15,15), 'Corviknight', 2),
    ('florges',   ['FAIRY_WIND','CHILLING_WATER','MOONBLAST'],   (0,15,15), 'Florges', 2),
    ('stunfisk',  ['THUNDER_SHOCK','DISCHARGE','MUD_SHOT'],      (0,15,15), 'Stunfisk', 2),
    ('dunsparce', ['ROLLOUT','ROCK_SLIDE','DRILL_RUN'],          (0,15,15), 'Dunsparce', 2),
    ('umbreon',   ['SNARL','FOUL_PLAY','LAST_RESORT'],           (0,15,15), 'Umbreon', 2),
    ('morpeko',   ['THUNDER_SHOCK','AURA_WHEEL','PSYCHIC_FANGS'],(0,15,15), 'Morpeko', 1),
    ('carbink',   ['ROCK_THROW','ROCK_SLIDE','MOONBLAST'],       (0,15,15), 'Carbink', 1),
    ('araquanid', ['BUG_BITE','BUBBLE_BEAM','MIRROR_COAT'],      (0,15,15), 'Araquanid', 1),
    ('mantine',   ['WING_ATTACK','AERIAL_ACE','WATER_PULSE'],    (0,15,15), 'Mantine', 1),
    ('marowak',   ['FIRE_SPIN','SHADOW_BONE','BONE_CLUB'],       (0,15,15), 'A-Marowak', 1),
    ('clodsire',  ['POISON_STING','EARTHQUAKE','STONE_EDGE'],    (0,15,15), 'Clodsire', 1),
    ('azumarill', ['BUBBLE','PLAY_ROUGH','ICE_BEAM'],            (0,15,15), 'Azumarill', 1),
    ('lanturn',   ['SPARK','SURF','THUNDERBOLT'],                (0,15,15), 'Lanturn', 1),
    ('whiscash',  ['MUD_SHOT','MUD_BOMB','BLIZZARD'],            (0,15,15), 'Whiscash', 1),
    ('cradily',   ['ACID','GRASS_KNOT','ROCK_TOMB'],             (0,15,15), 'Cradily', 1),
    ('jumpluff',  ['FAIRY_WIND','AERIAL_ACE','ENERGY_BALL'],     (0,15,15), 'Jumpluff', 1),
    ('mandibuzz', ['SNARL','FOUL_PLAY','AERIAL_ACE'],            (0,15,15), 'Mandibuzz', 1),
    ('vigoroth',  ['COUNTER','BODY_SLAM','ROCK_SLIDE'],          (0,15,15), 'Vigoroth', 1),
]

def specs(team):
    return [(s, m, iv) for s, m, iv, _ in team]

def threat_spec(threat):
    s, m, iv, _, _ = threat
    return (s, m, iv)

def phase1_score(team):
    """Fast: mean gauntlet win-rate, 1 shield, 1 trial, weight-averaged."""
    ts = specs(team)
    tot, wsum = 0.0, 0
    for th in THREATS:
        wr = gauntlet(ts, threat_spec(th), shields=1, trials=1, seed=1)
        tot += th[4] * wr
        wsum += th[4]
    return tot / wsum

def phase2_score(team):
    """Deep: mean gauntlet win-rate over 0/1/2 shields, 3 trials, weighted."""
    ts = specs(team)
    tot, wsum = 0.0, 0
    for th in THREATS:
        wr = sum(gauntlet(ts, threat_spec(th), shields=sh, trials=3, seed=7)
                 for sh in (0, 1, 2)) / 3
        tot += th[4] * wr
        wsum += th[4]
    return tot / wsum

if __name__ == '__main__':
    combos = list(itertools.combinations(range(len(CANDIDATES)), 3))
    print(f"Phase 1: {len(combos)} combos x {len(THREATS)} threats (1v1 gauntlets)...")
    t0 = time.time()
    scored = []
    for i, combo in enumerate(combos):
        team = [CANDIDATES[j] for j in combo]
        scored.append((phase1_score(team), [c[3] for c in team]))
        if (i + 1) % 200 == 0:
            print(f"  {i+1}/{len(combos)} ({time.time()-t0:.0f}s)")
    scored.sort(key=lambda x: -x[0])
    top = scored[:60]
    print(f"Phase 1 done in {time.time()-t0:.0f}s. Top: {top[0][1]} = {top[0][0]:.3f}")

    print("Phase 2: deep scoring top 60...")
    t0 = time.time()
    deep = []
    for i, (s1, labels) in enumerate(top):
        team = [CANDIDATES[j] for j in combos[[x[1] for x in scored].index(labels)]]
        s2 = phase2_score(team)
        deep.append((s2, labels))
        if (i + 1) % 10 == 0:
            print(f"  {i+1}/60 ({time.time()-t0:.0f}s)")
    deep.sort(key=lambda x: -x[0])
    print("\nTop 15 teams (weighted gauntlet win-rate):")
    for s, labels in deep[:15]:
        print(f"  {s:.3f}: {' / '.join(labels)}")
    with open('team_results.json', 'w') as f:
        json.dump([{'score': round(s, 4), 'team': l} for s, l in deep[:30]], f, indent=1)
    print("Saved to team_results.json")
