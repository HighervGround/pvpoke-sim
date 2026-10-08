// Headless harness for PvPoke's REAL battle engine (Battle.js + ActionLogic AI).
// Shims browser globals, loads the engine, exposes duel() once ready.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
// Engine location: ./pvpoke submodule by default, override with PVPOKE_PATH.
const enginePath = process.env.PVPOKE_PATH || path.join(__dirname, 'pvpoke');
const pvpokePath = enginePath.endsWith(path.sep) ? enginePath : enginePath + path.sep;

// ---- browser shims ----
const GM = JSON.parse(fs.readFileSync(pvpokePath + 'src/data/gamemaster.json', 'utf8'));
const chain = new Proxy(function () {}, {
  get: (t, p) => (...a) => chain,
  apply: () => chain
});
global.$ = new Proxy(function () {}, {
  get: (t, p) => {
    if (p === 'ajax') return (opts) => { setImmediate(() => opts.success(GM)); };
    if (p === 'getJSON') return (url, cb) => {
      const data = JSON.parse(fs.readFileSync(pvpokePath + 'src/data/training/aiArchetypes.json', 'utf8'));
      cb(data);
      return chain;
    };
    return (...a) => chain;
  },
  apply: () => chain
});
global.host = 'http://localhost/';
global.webRoot = '/';
global.siteVersion = '1';
global.settings = { gamemaster: 'gamemaster', matrixDirection: 'row' };

// getDefaultMultiBattleSettings lives in the UI layer; define the equivalent here
global.getDefaultMultiBattleSettings = function () {
  return {
    shields: 1, ivs: 'original', bait: 1, levelCap: 50,
    startHp: 1, startEnergy: 0, startCooldown: 0,
    optimizeMoveTiming: true, startStatBuffs: [0, 0]
  };
};
global.window = {
  localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } },
  location: { href: '' }
};

// ---- load engine (concatenated so class/var declarations share scope) ----
const files = [
  'src/js/GameMaster.js',
  'src/js/battle/DamageCalculator.js',
  'src/js/pokemon/Pokemon.js',
  'src/js/pokemon/Player.js',
  'src/js/battle/timeline/TimelineAction.js',
  'src/js/battle/timeline/TimelineEvent.js',
  'src/js/battle/actions/ActionLogic.js',
  'src/js/battle/Battle.js',
  'src/js/training/DecisionOption.js',
  'src/js/training/TrainingAI.js',
  'src/js/battle/rankers/TeamRanker.js'
];
const src = files.map(f => fs.readFileSync(pvpokePath + f, 'utf8')).join('\n;\n');
vm.runInThisContext(src, { filename: 'pvpoke-engine.js' });

// ---- readiness: gamemaster loads async via the shimmed ajax ----
const gm = GameMaster.getInstance();
const ready = new Promise((resolve) => {
  const check = () => {
    if (gm.data.pokemon && gm.data.pokemon.length) resolve();
    else setTimeout(check, 10);
  };
  check();
});

// ---- driver ----
function levelForCap(p, capCP) {
  // Highest half-level whose CP stays at or under the cap, for the IVs already set on p.
  for (let l = 51; l >= 1; l -= 0.5) {
    p.setLevel(l, false);
    if (p.calculateCP() <= capCP) return l;
  }
  return 1;
}

function makePoke(battle, spec, index) {
  const p = new Pokemon(spec.id, index, battle);
  if (!p || typeof p.selectMove !== 'function') {
    throw new Error('species not found in gamemaster: ' + spec.id);
  }
  p.ivs = { atk: spec.ivs[0], def: spec.ivs[1], hp: spec.ivs[2] };
  p.selectMove('fast', spec.moves[0]);
  p.selectMove('charged', spec.moves[1], 0);
  if (spec.moves[2]) p.selectMove('charged', spec.moves[2], 1);
  // Pin the requested IVs: setLevel(...,true) marks the Pokemon custom so
  // initialize() will NOT overwrite our IVs with the gamemaster defaults.
  // Default: best level under the league CP cap. spec.level pins an exact level.
  const cap = (typeof battle.getCP === 'function') ? battle.getCP() : 1500;
  const lvl = spec.level || levelForCap(p, cap);
  p.setLevel(lvl); // initialize=true -> isCustom=true, keeps our IVs and level
  return p;
}

// spec = {id, moves:[fast,ch1,ch2], ivs:[a,d,h]}. Returns 'a' | 'b' | 'tie'.
// Call only after `ready` resolves.
function duel(specA, specB, shields) {
  const battle = new Battle();
  battle.setCP(1500);
  const a = makePoke(battle, specA, 0);
  const b = makePoke(battle, specB, 1);
  battle.setNewPokemon(a, 0, true);
  battle.setNewPokemon(b, 1, true);
  a.setShields(shields);
  b.setShields(shields);
  battle.simulate();
  const w = battle.getWinner();
  if (!w.pokemon) return 'tie';
  return w.pokemon === a ? 'a' : 'b';
}

module.exports = { duel, ready, rankTeam, rankTeamShields, makePoke };

// ---- team-builder ranking via PvPoke's real TeamRanker ----
// teamSpecs / threatSpecs: [{id, moves:[fast,ch1,ch2], ivs:[a,d,h], w?}]
// Returns weighted threat score (lower = better, PvPoke-style).
function rankTeam(teamSpecs, threatSpecs) {
  const ranker = RankerMaster.getInstance();
  ranker.setShieldMode('single');
  ranker.setRecommendMoveUsage(false);

  // Pre-initialize Pokemon (level for 1500 CP) on a temp battle
  const tmp = new Battle();
  tmp.setCP(1500);
  const initPoke = (spec, idx) => {
    const p = makePoke(tmp, spec, idx);
    tmp.setNewPokemon(p, idx, true);
    return p;
  };
  const team = teamSpecs.map((s, i) => initPoke(s, i));
  const targets = threatSpecs.map((s, i) => initPoke(s, i));

  ranker.setTargets(targets);
  const result = ranker.rank(team, 1500, { name: 'all' }, null, 'team-builder');

  let total = 0, wsum = 0;
  result.rankings.forEach((r, i) => {
    // threat's best outing vs our team: lower = better covered
    const threatScore = Math.min(...r.matchups.map(m => m.score));
    total += (threatSpecs[i].w || 1) * threatScore;
    wsum += (threatSpecs[i].w || 1);
  });
  return { threatScore: total / wsum, rankings: result.rankings };
}

// Same as rankTeam but with an explicit shield count for both sides (0, 1, or 2).
// index 0 = our mons, index 1 = threats (matches the ranker's internal convention).
function rankTeamShields(teamSpecs, threatSpecs, shields) {
  const ranker = RankerMaster.getInstance();
  ranker.setShieldMode('single');
  ranker.setRecommendMoveUsage(false);
  const base = getDefaultMultiBattleSettings();
  ranker.applySettings(Object.assign({}, base, { shields: shields }), 0);
  ranker.applySettings(Object.assign({}, base, { shields: shields }), 1);

  const tmp = new Battle();
  tmp.setCP(1500);
  const initPoke = (spec, idx) => {
    const p = makePoke(tmp, spec, idx);
    tmp.setNewPokemon(p, idx, true);
    return p;
  };
  const team = teamSpecs.map((s, i) => initPoke(s, i));
  const targets = threatSpecs.map((s, i) => initPoke(s, i));

  ranker.setTargets(targets);
  const result = ranker.rank(team, 1500, { name: 'all' }, null, 'team-builder');

  let total = 0, wsum = 0;
  result.rankings.forEach((r, i) => {
    const threatScore = Math.min(...r.matchups.map(m => m.score));
    total += (threatSpecs[i].w || 1) * threatScore;
    wsum += (threatSpecs[i].w || 1);
  });
  return { threatScore: total / wsum, rankings: result.rankings };
}

// CLI sanity test: node pvpoke_harness.js test
if (process.argv[2] === 'test') {
  ready.then(() => {
    const whis = { id: 'whiscash', moves: ['MUD_SHOT', 'MUD_BOMB', 'BLIZZARD'], ivs: [4, 15, 14] };
    const melm = { id: 'melmetal', moves: ['THUNDER_SHOCK', 'DOUBLE_IRON_BASH', 'DYNAMIC_PUNCH'], ivs: [15, 15, 15] };
    const alt = { id: 'altaria', moves: ['DRAGON_BREATH', 'SKY_ATTACK', 'FLAMETHROWER'], ivs: [0, 15, 8] };
    console.log('whiscash vs melmetal (1 shield):', duel(whis, melm, 1));
    console.log('altaria mirror (1 shield):', duel(alt, alt, 1));
    const mimi = { id: 'mimikyu', moves: ['SHADOW_CLAW', 'SHADOW_SNEAK', 'PLAY_ROUGH'], ivs: [15, 12, 15] };
    const nine = { id: 'ninetales', moves: ['FIRE_SPIN', 'WEATHER_BALL_FIRE', 'SCORCHING_SANDS'], ivs: [0, 15, 15] };
    console.log('mimikyu vs melmetal (1 shield):', duel(mimi, melm, 1));
    console.log('ninetales vs melmetal (1 shield):', duel(nine, melm, 1));
  });
}
