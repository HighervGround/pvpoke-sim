// Derive each candidate's actual current level from its reported CP + IVs,
// then emit optimize_alt_actual.js with levels pinned (as-is today, zero investment).
const fs = require('fs');
const { ready, makePoke } = require('./pvpoke_harness.js');

const CANDIDATES = [
  { id: 'altaria', moves: ['DRAGON_BREATH','FLAMETHROWER','SKY_ATTACK'], ivs: [0,15,8], cp: 1499, label: 'Altaria (1499)' },
  { id: 'quagsire', moves: ['MUD_SHOT','AQUA_TAIL','MUD_BOMB'], ivs: [0,15,14], cp: 1499, label: 'Quagsire (1499)' },
  { id: 'talonflame', moves: ['INCINERATE','FLAME_CHARGE','FLY'], ivs: [2,15,15], cp: 1497, label: 'Talonflame (1497)' },
  { id: 'jellicent', moves: ['HEX','SURF','SHADOW_BALL'], ivs: [11,15,12], cp: 1492, label: 'Jellicent (1492)' },
  { id: 'slowking', moves: ['WATER_GUN','BLIZZARD'], ivs: [11,14,14], cp: 1488, label: 'Slowking (1488) shiny' },
  { id: 'abomasnow', moves: ['POWDER_SNOW','WEATHER_BALL_ICE','ENERGY_BALL'], ivs: [15,15,15], cp: 1484, label: 'Abomasnow (1484) hundo' },
  { id: 'lanturn', moves: ['SPARK','THUNDERBOLT','SURF'], ivs: [8,6,11], cp: 1482, label: 'Lanturn (1482) shiny' },
  { id: 'clodsire', moves: ['POISON_STING','EARTHQUAKE','STONE_EDGE'], ivs: [14,12,15], cp: 1482, label: 'Clodsire (1482)' },
  { id: 'azumarill', moves: ['BUBBLE','PLAY_ROUGH','ICE_BEAM'], ivs: [0,15,15], cp: 1481, label: 'Azumarill (1481)' },
  { id: 'empoleon', moves: ['METAL_SOUND','HYDRO_PUMP','DRILL_PECK'], ivs: [8,13,15], cp: 1478, label: 'Empoleon (1478) shiny' },
  { id: 'avalugg_hisuian', moves: ['TACKLE','BLIZZARD'], ivs: [10,13,12], cp: 1434, label: 'H-Avalugg (1434)' },
  { id: 'dunsparce', moves: ['ROLLOUT','DRILL_RUN'], ivs: [5,5,10], cp: 1351, label: 'Dunsparce (1351) shiny' },
  { id: 'mandibuzz', moves: ['AIR_SLASH','FOUL_PLAY'], ivs: [15,14,14], cp: 1338, label: 'Mandibuzz (1338)' },
  { id: 'malamar', moves: ['PECK','PSYBEAM'], ivs: [15,13,12], cp: 1331, label: 'Malamar (1331)' },
  { id: 'stunfisk_galarian', moves: ['METAL_CLAW','EARTHQUAKE'], ivs: [14,15,13], cp: 1223, label: 'G-Stunfisk (1223)' },
  { id: 'stunfisk_galarian', moves: ['METAL_CLAW','FLASH_CANNON'], ivs: [12,15,15], cp: 1212, label: 'G-Stunfisk (1212)' },
  { id: 'qwilfish_hisuian', moves: ['POISON_STING','SHADOW_BALL'], ivs: [14,15,14], cp: 1211, label: 'H-Qwilfish (1211)' },
  { id: 'charizard', moves: ['FIRE_SPIN','FIRE_BLAST'], ivs: [12,10,13], cp: 1200, label: 'Charizard (1200)' },
  { id: 'carbink', moves: ['ROCK_THROW','ROCK_SLIDE'], ivs: [13,15,14], cp: 820, label: 'Carbink (820)' },
  { id: 'carbink', moves: ['ROCK_THROW','POWER_GEM'], ivs: [10,15,15], cp: 800, label: 'Carbink (800)' },
  { id: 'azumarill', moves: ['ROCK_SMASH','PLAY_ROUGH'], ivs: [14,14,15], cp: 1166, label: 'Azumarill (1166)' },
];

ready.then(() => {
  const b = new Battle(); b.setCP(1500);
  const out = [];
  for (const c of CANDIDATES) {
    let bestL = 1, bestDiff = 1e9;
    for (let l = 1; l <= 51; l += 0.5) {
      const p = makePoke(b, { id: c.id, ivs: c.ivs, moves: c.moves, level: l }, 0);
      const diff = Math.abs(p.cp - c.cp);
      if (diff < bestDiff) { bestDiff = diff; bestL = l; }
      if (diff === 0) break;
    }
    console.log(`${c.label}: reported CP ${c.cp} -> level ${bestL} (diff ${bestDiff})`);
    out.push({ ...c, level: bestL });
  }
  // Emit a new optimizer with pinned levels
  const threats = fs.readFileSync('optimize_alt.js', 'utf8').match(/const THREATS = \[[\s\S]*?\];/)[0];
  const cands = 'const CANDIDATES = ' + JSON.stringify(out.map(({id,moves,ivs,level,label}) => ({id,moves,ivs,level,label})), null, 1) + ';';
  const tail = fs.readFileSync('optimize_alt.js', 'utf8').split('function* combos')[1];
  fs.writeFileSync('optimize_alt_actual.js',
    `// alt account re-run with ACTUAL current levels pinned (as-is today, zero power-ups).\n` +
    `const fs = require('fs');\nconst { ready, rankTeam } = require('./pvpoke_harness.js');\n\n` +
    cands + '\n' + threats + '\nfunction* combos' + tail);
  console.log('Wrote optimize_alt_actual.js');
});
