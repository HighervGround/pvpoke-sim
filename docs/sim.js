// Browser port of pvpoke_harness.js (makePoke / duel) and battle3v3.js.
// Same engine, same driver logic, same switch policies, including the
// 2026-10-30 same-snapshot switch fix. A spec is
// {id, moves:[fast, charged1, charged2?], ivs:[atk, def, hp], level?}.
window.SIM = (function () {
  var readyResolve;
  var ready = new Promise(function (r) { readyResolve = r; });

  function levelForCap(p, capCP) {
    for (var l = 51; l >= 1; l -= 0.5) {
      p.setLevel(l, false);
      if (p.calculateCP() <= capCP) return l;
    }
    return 1;
  }

  function makePoke(battle, spec, index) {
    var p = new Pokemon(spec.id, index, battle);
    if (!p || typeof p.selectMove !== 'function') {
      throw new Error('species not found in gamemaster: ' + spec.id);
    }
    p.ivs = { atk: spec.ivs[0], def: spec.ivs[1], hp: spec.ivs[2] };
    p.selectMove('fast', spec.moves[0]);
    p.selectMove('charged', spec.moves[1], 0);
    if (spec.moves[2]) p.selectMove('charged', spec.moves[2], 1);
    var cap = (typeof battle.getCP === 'function') ? battle.getCP() : 1500;
    var lvl = spec.level || levelForCap(p, cap);
    p.setLevel(lvl);
    return p;
  }

  function cpOf(spec) {
    var battle = new Battle();
    battle.setCP(1500);
    var p = makePoke(battle, spec, 0);
    return p.calculateCP();
  }

  // 1v1 duel at a fixed shield count. Returns 'a' | 'b' | 'tie'.
  function duel(specA, specB, shields) {
    var battle = new Battle();
    battle.setCP(1500);
    var a = makePoke(battle, specA, 0);
    var b = makePoke(battle, specB, 1);
    battle.setNewPokemon(a, 0, true);
    battle.setNewPokemon(b, 1, true);
    a.setShields(shields);
    b.setShields(shields);
    battle.simulate();
    var w = battle.getWinner();
    if (!w.pokemon) return 'tie';
    return w.pokemon === a ? 'a' : 'b';
  }

  // Full 3v3. Ported verbatim from battle3v3.js (see that file for the
  // long comments on the seat-bias fixes).
  function battle3v3(teamA, teamB, aiLevel) {
    aiLevel = aiLevel || 3;
    var battle = new Battle();
    battle.setCP(1500);
    battle.setBattleMode('simulate');

    var players = [new Player(0, aiLevel, battle), new Player(1, aiLevel, battle)];
    battle.setPlayers(players);
    players[0].shields = 2;
    players[1].shields = 2;

    players[0].setTeam(teamA.map(function (s) { return makePoke(battle, s, 0); }));
    players[1].setTeam(teamB.map(function (s) { return makePoke(battle, s, 1); }));

    battle.setNewPokemon(players[0].getTeam()[0], 0, true);
    battle.setNewPokemon(players[1].getTeam()[0], 1, true);
    syncShields(0);
    syncShields(1);

    battle.start();

    function syncShields(idx) {
      var poke = battle.getPokemon()[idx];
      if (poke) {
        poke.shields = players[idx].getShields();
        poke.startingShields = players[idx].getShields();
      }
    }
    function active() { return battle.getPokemon(); }

    function switchIn(side, teamIdx) {
      var newMon = players[side].getTeam()[teamIdx];
      battle.getPokemon()[side === 0 ? 1 : 0].cooldown = 500;
      battle.setNewPokemon(newMon, side, false);
      newMon.cooldown = 0;
      syncShields(side);
    }

    function switchInVoluntary(side, teamIdx) {
      var poke = battle.getPokemon()[side];
      var player = players[side];
      player.switchTimer = player.switchTime;
      poke.statBuffs = [0, 0];
      poke.startStatBuffs = [0, 0];
      poke.setStartHp(poke.hp);
      poke.setStartEnergy(poke.energy);
      var newMon = player.getTeam()[teamIdx];
      battle.setNewPokemon(newMon, side, false);
      newMon.cooldown = 0;
      syncShields(side);
    }

    var lastVolCheck = [-1000, -1000];
    function decideVoluntarySwitch(side, turn) {
      if (turn - lastVolCheck[side] < 15) return -1;
      lastVolCheck[side] = turn;
      var player = players[side];
      if (player.getSwitchTimer() > 0 || player.getRemainingPokemon() < 2) return -1;
      var activeMon = battle.getPokemon()[side];
      var opponent = battle.getPokemon()[side === 0 ? 1 : 0];
      if (activeMon.hp <= 0 || opponent.hp <= 0) return -1;
      if (activeMon.hp / activeMon.stats.hp > 0.75) return -1;
      var ai = player.getAI();
      var rActive = ai.runScenario('NO_BAIT', activeMon, opponent).average;
      if (rActive >= 475) return -1;
      var best = null;
      var team = player.getTeam();
      for (var n = 0; n < team.length; n++) {
        if (team[n].hp > 0 && team[n] !== activeMon) {
          var r = ai.runScenario('NO_BAIT', team[n], opponent).average;
          if (!best || r > best.r) best = { idx: n, r: r };
        }
      }
      if (best && best.r - rActive > 125) return best.idx;
      return -1;
    }

    var turns = 0;
    var MAX_TURNS = 6000;

    while (players[0].getRemainingPokemon() > 0 && players[1].getRemainingPokemon() > 0 && turns < MAX_TURNS) {
      var t = 0;
      while (active()[0].hp > 0 && active()[1].hp > 0 && t++ < 2500 && turns < MAX_TURNS) {
        battle.step();
        turns++;
        if (turns % 15 === 0) {
          var d0 = decideVoluntarySwitch(0, turns);
          var d1 = decideVoluntarySwitch(1, turns);
          var decisions = [d0, d1];
          var order = Math.random() < 0.5 ? [0, 1] : [1, 0];
          for (var oi = 0; oi < order.length; oi++) {
            var s = order[oi];
            if (decisions[s] >= 0) switchInVoluntary(s, decisions[s]);
          }
        }
      }
      if (turns >= MAX_TURNS) break;

      var faintedSides = [0, 1].filter(function (i) {
        return active()[i].hp <= 0 && players[i].getRemainingPokemon() > 0;
      });
      var choices = faintedSides.map(function (i) { return players[i].getAI().decideSwitch(); });
      var switched = false;
      var applyOrder = faintedSides.map(function (_, k) { return k; });
      if (faintedSides.length === 2 && Math.random() < 0.5) applyOrder.reverse();
      applyOrder.forEach(function (k) {
        var side = faintedSides[k];
        var choice = choices[k];
        if (typeof choice === 'number' && choice >= 0 && players[side].getTeam()[choice].hp > 0) {
          switchIn(side, choice);
          switched = true;
        }
      });
      if (faintedSides.length === 2 && switched) {
        var act = active();
        if (act[0]) act[0].cooldown = 0;
        if (act[1]) act[1].cooldown = 0;
      }
      if (!switched) break;
    }

    var rA = players[0].getRemainingPokemon();
    var rB = players[1].getRemainingPokemon();
    return {
      winner: rA > rB ? 'a' : rB > rA ? 'b' : 'tie',
      remainingA: rA,
      remainingB: rB,
      turns: turns
    };
  }

  // Grade a team against a meta array of [weight, name, teamSpecs].
  // reps = battles per seat per matchup. Async, yields between matchups
  // and reports progress so the page stays alive.
  async function gradeTeam(team, meta, reps, onProgress) {
    var rows = [];
    var uw = 0, ut = 0, ww = 0, wt = 0;
    for (var i = 0; i < meta.length; i++) {
      var weight = meta[i][0], name = meta[i][1], foe = meta[i][2];
      var w = 0, k;
      for (k = 0; k < reps; k++) { if (battle3v3(team, foe).winner === 'a') w++; }
      for (k = 0; k < reps; k++) { if (battle3v3(foe, team).winner === 'b') w++; }
      var total = reps * 2;
      rows.push({ name: name, weight: weight, wins: w, total: total });
      uw += w; ut += total; ww += w * weight; wt += total * weight;
      if (onProgress) onProgress((i + 1) / meta.length);
      await new Promise(function (r) { setTimeout(r, 0); });
    }
    return {
      weighted: 100 * ww / wt,
      unweighted: 100 * uw / ut,
      rows: rows
    };
  }

  // Head-to-head: full team score plus the 1v1 shield grid.
  async function headToHead(teamA, teamB, reps, onProgress) {
    var w = 0, k;
    for (k = 0; k < reps; k++) { if (battle3v3(teamA, teamB).winner === 'a') w++; }
    for (k = 0; k < reps; k++) { if (battle3v3(teamB, teamA).winner === 'b') w++; }
    if (onProgress) onProgress(0.5);
    var grid = [];
    for (var i = 0; i < teamA.length; i++) {
      var row = [];
      for (var j = 0; j < teamB.length; j++) {
        row.push([0, 1, 2].map(function (sh) {
          var r = duel(teamA[i], teamB[j], sh);
          return r === 'a' ? 'W' : r === 'b' ? 'L' : 'T';
        }).join('/'));
      }
      grid.push(row);
    }
    if (onProgress) onProgress(1);
    return { wins: w, total: reps * 2, grid: grid };
  }

  function loadEngine(cb) {
    // TrainingAI reads its archetype data synchronously at engine load,
    // so the data must be in place before engine.js executes.
    if (window.__loadEngine) { window.__loadEngine(cb); return; }
    var s = document.createElement('script');
    s.src = 'engine.js';
    s.onload = cb;
    s.onerror = function () { throw new Error('engine.js failed to load'); };
    document.head.appendChild(s);
  }

  function init() {
    Promise.all([
      fetch('data/gamemaster.json').then(function (r) { return r.json(); }),
      fetch('data/aiArchetypes.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      window.__GM = res[0];
      window.__AI = res[1];
      loadEngine(function () {
        var gm = GameMaster.getInstance();
        var check = function () {
          if (gm.data && gm.data.pokemon && gm.data.pokemon.length) readyResolve(gm);
          else setTimeout(check, 25);
        };
        check();
      });
    });
  }
  init();

  return {
    ready: ready,
    makePoke: makePoke,
    cpOf: cpOf,
    duel: duel,
    battle3v3: battle3v3,
    gradeTeam: gradeTeam,
    headToHead: headToHead
  };
})();
