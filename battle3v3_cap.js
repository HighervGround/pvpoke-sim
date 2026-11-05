// Full 3v3 battle driver on PvPoke's real engine.
// Both sides use PvPoke's TrainingAI (level 3) for switch decisions at faint time.
// Shield decisions mid-battle use the engine's deterministic ActionLogic (simulate mode).
// HP/energy carry over on survivors; switch-ins start at 0 energy; benched mons keep damage.
// 2 shields per player per match (player-level, synced to switch-ins).
const { ready, makePoke } = require('./pvpoke_harness.js');

function syncShields(battle, players, idx) {
  const poke = battle.getPokemon()[idx];
  if (poke) {
    poke.shields = players[idx].getShields();
    poke.startingShields = players[idx].getShields();
  }
}

// teamA / teamB: [{id, moves:[fast,ch1,ch2], ivs:[a,d,h], level?}] — lead first.
// Returns { winner: 'a'|'b'|'tie', remainingA, remainingB, turns }
function battle3v3(teamA, teamB, capCP = 1500, aiLevel = 3) {
  const battle = new Battle();
  battle.setCP(capCP);
  battle.setBattleMode('simulate');

  const players = [new Player(0, aiLevel, battle), new Player(1, aiLevel, battle)];
  battle.setPlayers(players);
  players[0].shields = 2;
  players[1].shields = 2;

  players[0].setTeam(teamA.map((s) => makePoke(battle, s, 0)));
  players[1].setTeam(teamB.map((s) => makePoke(battle, s, 1)));

  battle.setNewPokemon(players[0].getTeam()[0], 0, true);
  battle.setNewPokemon(players[1].getTeam()[0], 1, true);
  syncShields(battle, players, 0);
  syncShields(battle, players, 1);

  battle.start();

  const active = () => battle.getPokemon();

  // Manual switch-in, mirroring Battle.processAction's "switch" case for a fainted mon:
  // incoming mon keeps its saved HP/energy (0 energy fresh), survivor is untouched,
  // winner gets a 500ms cooldown (the real faint-switch window).
  function switchIn(side, teamIdx) {
    const newMon = players[side].getTeam()[teamIdx];
    battle.getPokemon()[side === 0 ? 1 : 0].cooldown = 500;
    battle.setNewPokemon(newMon, side, false);
    newMon.cooldown = 0;
    syncShields(battle, players, side);
  }

  // Voluntary switch, mirroring processAction's branch for hp > 0:
  // outgoing mon's HP/energy/buffs are saved, 45s switch lock starts.
  function switchInVoluntary(side, teamIdx) {
    const poke = battle.getPokemon()[side];
    const player = players[side];
    player.switchTimer = player.switchTime; // 45s lock, no console spam
    poke.statBuffs = [0, 0];
    poke.startStatBuffs = [0, 0];
    poke.setStartHp(poke.hp);
    poke.setStartEnergy(poke.energy);
    const newMon = player.getTeam()[teamIdx];
    battle.setNewPokemon(newMon, side, false);
    newMon.cooldown = 0;
    syncShields(battle, players, side);
  }

  // Voluntary-switch policy (extracted core of the AI's SWITCH_BASIC idea):
  // if clearly losing the current matchup and a benched mon rates much better,
  // switch. Checked every 40 turns per side; gated on the real switch clock.
  // Decide a voluntary switch WITHOUT applying it (team index, or -1).
  // Seat-bias fix (2026-10-30, same change as the faint fix below): both
  // sides' decisions are taken from the same board snapshot, then applied.
  // The old flow checked side 0 first and applied its switch immediately, so
  // side 1's check, moments later in the same tick, evaluated against side
  // 0's brand-new mon and could counter-switch into a locked opponent, while
  // side 0 never got the same reply. In the Forretress/Drapion/Jellicent
  // matchup that artifact alone was worth ~60 points of win rate by seat.
  function decideVoluntarySwitch(side, turn) {
    if (turn - lastVolCheck[side] < 15) return -1;
    lastVolCheck[side] = turn;
    const player = players[side];
    if (player.getSwitchTimer() > 0 || player.getRemainingPokemon() < 2) return -1;
    const activeMon = battle.getPokemon()[side];
    const opponent = battle.getPokemon()[side === 0 ? 1 : 0];
    if (activeMon.hp <= 0 || opponent.hp <= 0) return -1;
    if (activeMon.hp / activeMon.stats.hp > 0.75) return -1;
    const ai = player.getAI();
    const rActive = ai.runScenario('NO_BAIT', activeMon, opponent).average;
    if (rActive >= 475) return -1;
    let best = null;
    const team = player.getTeam();
    for (let n = 0; n < team.length; n++) {
      if (team[n].hp > 0 && team[n] !== activeMon) {
        const r = ai.runScenario('NO_BAIT', team[n], opponent).average;
        if (!best || r > best.r) best = { idx: n, r };
      }
    }
    if (best && best.r - rActive > 125) return best.idx;
    return -1;
  }
  const lastVolCheck = [-1000, -1000];

  let turns = 0;
  const MAX_TURNS = 6000;

  while (players[0].getRemainingPokemon() > 0 && players[1].getRemainingPokemon() > 0 && turns < MAX_TURNS) {
    // Step the 1v1 until a faint
    let t = 0;
    while (active()[0].hp > 0 && active()[1].hp > 0 && t++ < 2500 && turns < MAX_TURNS) {
      battle.step();
      turns++;
      if (turns % 15 === 0) {
        const d0 = decideVoluntarySwitch(0, turns);
        const d1 = decideVoluntarySwitch(1, turns);
        const decisions = [d0, d1];
        const order = Math.random() < 0.5 ? [0, 1] : [1, 0];
        for (const s of order) {
          if (decisions[s] >= 0) switchInVoluntary(s, decisions[s]);
        }
      }
    }
    if (turns >= MAX_TURNS) break;

    // Fainted sides switch via the AI.
    // Side-bias fix (2026-10-30): decide ALL switch-ins from the same board
    // state before applying any of them, and cancel the survivor-pause after
    // a double faint. The old sequential loop handed seat B two gifts on a
    // double faint: (1) its decideSwitch() evaluates bench mons against the
    // opponent's CURRENT active, so it picked against side 0's already-set
    // replacement while side 0 picked blind against a fainted mon;
    // (2) switchIn's opponent cooldown = 500 (meant to pause a lone survivor
    // while a replacement enters) landed on side 0's fresh mon. Mirrors ran
    // 0/99 for side A before this fix; the 1v1 engine itself is seat-fair.
    const faintedSides = [0, 1].filter(
      (i) => active()[i].hp <= 0 && players[i].getRemainingPokemon() > 0
    );
    const choices = faintedSides.map((i) => players[i].getAI().decideSwitch());
    let switched = false;
    // On a double faint, apply the two switch-ins in a coin-flip order: the
    // engine gives the last-registered mon a systematic edge in the next leg
    // (reversing the order flipped a 2-mon mirror from 0/99 to 99/99), and
    // the mons' own state is identical either way, so no deterministic order
    // is fair. Randomizing makes the gift seat-neutral in expectation.
    const applyOrder = faintedSides.map((_, k) => k);
    if (faintedSides.length === 2 && Math.random() < 0.5) applyOrder.reverse();
    applyOrder.forEach((k) => {
      const side = faintedSides[k];
      const choice = choices[k];
      if (typeof choice === 'number' && choice >= 0 && players[side].getTeam()[choice].hp > 0) {
        switchIn(side, choice);
        switched = true;
      }
    });
    if (faintedSides.length === 2 && switched) {
      const act = active();
      if (act[0]) act[0].cooldown = 0;
      if (act[1]) act[1].cooldown = 0;
    }
    if (!switched) break;
  }

  const rA = players[0].getRemainingPokemon();
  const rB = players[1].getRemainingPokemon();
  return {
    winner: rA > rB ? 'a' : rB > rA ? 'b' : 'tie',
    remainingA: rA,
    remainingB: rB,
    turns,
    hpA: players[0].getTeam().map((p) => Math.max(0, Math.round(p.hp))),
    hpB: players[1].getTeam().map((p) => Math.max(0, Math.round(p.hp))),
  };
}

module.exports = { battle3v3, ready };

// CLI sanity: node battle3v3.js
if (require.main === module) {
  ready.then(() => {
    const azu = { id: 'azumarill', moves: ['BUBBLE', 'PLAY_ROUGH', 'ICE_BEAM'], ivs: [0, 15, 15] };
    const quag = { id: 'quagsire', moves: ['MUD_SHOT', 'AQUA_TAIL', 'MUD_BOMB'], ivs: [0, 15, 14] };
    const lant = { id: 'lanturn', moves: ['SPARK', 'SURF', 'THUNDERBOLT'], ivs: [0, 14, 14] };
    const alt = { id: 'altaria', moves: ['DRAGON_BREATH', 'SKY_ATTACK', 'FLAMETHROWER'], ivs: [0, 15, 8] };
    const talon = { id: 'talonflame', moves: ['INCINERATE', 'FLAME_CHARGE', 'FLY'], ivs: [2, 15, 15] };
    const jel = { id: 'jellicent', moves: ['HEX', 'SURF', 'SHADOW_BALL'], ivs: [11, 15, 12] };
    console.log('Mirror (should be ~50/50, exercises switches):');
    for (let i = 0; i < 3; i++) {
      const r = battle3v3([azu, quag, lant], [azu, quag, lant]);
      console.log(`  winner=${r.winner} remaining=${r.remainingA}-${r.remainingB} turns=${r.turns} hpA=${r.hpA} hpB=${r.hpB}`);
    }
    console.log('Azu/Quag/Lant vs Alt/Talon/Jel:');
    for (let i = 0; i < 3; i++) {
      const r = battle3v3([azu, quag, lant], [alt, talon, jel]);
      console.log(`  winner=${r.winner} remaining=${r.remainingA}-${r.remainingB} turns=${r.turns}`);
    }
  });
}
