// alt account re-run with ACTUAL current levels pinned (as-is today, zero power-ups).
const fs = require('fs');
const { ready, rankTeam } = require('./pvpoke_harness.js');

const CANDIDATES = [
 {
  "id": "altaria",
  "moves": [
   "DRAGON_BREATH",
   "FLAMETHROWER",
   "SKY_ATTACK"
  ],
  "ivs": [
   0,
   15,
   8
  ],
  "level": 29.5,
  "label": "Altaria (1499)"
 },
 {
  "id": "quagsire",
  "moves": [
   "MUD_SHOT",
   "AQUA_TAIL",
   "MUD_BOMB"
  ],
  "ivs": [
   0,
   15,
   14
  ],
  "level": 29,
  "label": "Quagsire (1499)"
 },
 {
  "id": "talonflame",
  "moves": [
   "INCINERATE",
   "FLAME_CHARGE",
   "FLY"
  ],
  "ivs": [
   2,
   15,
   15
  ],
  "level": 25.5,
  "label": "Talonflame (1497)"
 },
 {
  "id": "jellicent",
  "moves": [
   "HEX",
   "SURF",
   "SHADOW_BALL"
  ],
  "ivs": [
   11,
   15,
   12
  ],
  "level": 23,
  "label": "Jellicent (1492)"
 },
 {
  "id": "slowking",
  "moves": [
   "WATER_GUN",
   "BLIZZARD"
  ],
  "ivs": [
   11,
   14,
   14
  ],
  "level": 21,
  "label": "Slowking (1488) shiny"
 },
 {
  "id": "abomasnow",
  "moves": [
   "POWDER_SNOW",
   "WEATHER_BALL_ICE",
   "ENERGY_BALL"
  ],
  "ivs": [
   15,
   15,
   15
  ],
  "level": 22,
  "label": "Abomasnow (1484) hundo"
 },
 {
  "id": "lanturn",
  "moves": [
   "SPARK",
   "THUNDERBOLT",
   "SURF"
  ],
  "ivs": [
   8,
   6,
   11
  ],
  "level": 27,
  "label": "Lanturn (1482) shiny"
 },
 {
  "id": "clodsire",
  "moves": [
   "POISON_STING",
   "EARTHQUAKE",
   "STONE_EDGE"
  ],
  "ivs": [
   14,
   12,
   15
  ],
  "level": 27,
  "label": "Clodsire (1482)"
 },
 {
  "id": "azumarill",
  "moves": [
   "BUBBLE",
   "PLAY_ROUGH",
   "ICE_BEAM"
  ],
  "ivs": [
   0,
   15,
   15
  ],
  "level": 44.5,
  "label": "Azumarill (1481)"
 },
 {
  "id": "empoleon",
  "moves": [
   "METAL_SOUND",
   "HYDRO_PUMP",
   "DRILL_PECK"
  ],
  "ivs": [
   8,
   13,
   15
  ],
  "level": 18.5,
  "label": "Empoleon (1478) shiny"
 },
 {
  "id": "avalugg_hisuian",
  "moves": [
   "TACKLE",
   "BLIZZARD"
  ],
  "ivs": [
   10,
   13,
   12
  ],
  "level": 15,
  "label": "H-Avalugg (1434)"
 },
 {
  "id": "dunsparce",
  "moves": [
   "ROLLOUT",
   "DRILL_RUN"
  ],
  "ivs": [
   5,
   5,
   10
  ],
  "level": 33,
  "label": "Dunsparce (1351) shiny"
 },
 {
  "id": "mandibuzz",
  "moves": [
   "AIR_SLASH",
   "FOUL_PLAY"
  ],
  "ivs": [
   15,
   14,
   14
  ],
  "level": 22,
  "label": "Mandibuzz (1338)"
 },
 {
  "id": "malamar",
  "moves": [
   "PECK",
   "PSYBEAM"
  ],
  "ivs": [
   15,
   13,
   12
  ],
  "level": 20,
  "label": "Malamar (1331)"
 },
 {
  "id": "stunfisk_galarian",
  "moves": [
   "METAL_CLAW",
   "EARTHQUAKE"
  ],
  "ivs": [
   14,
   15,
   13
  ],
  "level": 20,
  "label": "G-Stunfisk (1223)"
 },
 {
  "id": "stunfisk_galarian",
  "moves": [
   "METAL_CLAW",
   "FLASH_CANNON"
  ],
  "ivs": [
   12,
   15,
   15
  ],
  "level": 20,
  "label": "G-Stunfisk (1212)"
 },
 {
  "id": "qwilfish_hisuian",
  "moves": [
   "POISON_STING",
   "SHADOW_BALL"
  ],
  "ivs": [
   14,
   15,
   14
  ],
  "level": 20,
  "label": "H-Qwilfish (1211)"
 },
 {
  "id": "charizard",
  "moves": [
   "FIRE_SPIN",
   "FIRE_BLAST"
  ],
  "ivs": [
   12,
   10,
   13
  ],
  "level": 15,
  "label": "Charizard (1200)"
 },
 {
  "id": "carbink",
  "moves": [
   "ROCK_THROW",
   "ROCK_SLIDE"
  ],
  "ivs": [
   13,
   15,
   14
  ],
  "level": 20,
  "label": "Carbink (820)"
 },
 {
  "id": "carbink",
  "moves": [
   "ROCK_THROW",
   "POWER_GEM"
  ],
  "ivs": [
   10,
   15,
   15
  ],
  "level": 20,
  "label": "Carbink (800)"
 },
 {
  "id": "azumarill",
  "moves": [
   "ROCK_SMASH",
   "PLAY_ROUGH"
  ],
  "ivs": [
   14,
   14,
   15
  ],
  "level": 26,
  "label": "Azumarill (1166)"
 }
];
const THREATS = [
  { id: 'melmetal', moves: ['THUNDER_SHOCK','DOUBLE_IRON_BASH','DYNAMIC_PUNCH'], ivs: [15,15,15], label: 'Melmetal', w: 3 },
  { id: 'sableye_mega', moves: ['SHADOW_CLAW','FOUL_PLAY','DAZZLING_GLEAM'], ivs: [0,15,15], label: 'Mega Sableye', w: 3 },
  { id: 'altaria', moves: ['DRAGON_BREATH','MOONBLAST','SKY_ATTACK'], ivs: [0,15,15], label: 'Altaria', w: 2 },
  { id: 'ninetales', moves: ['EMBER','WEATHER_BALL_FIRE','ENERGY_BALL'], ivs: [0,15,15], label: 'Sh Ninetales', w: 2 },
  { id: 'tinkaton', moves: ['FAIRY_WIND','GIGATON_HAMMER','BULLDOZE'], ivs: [10,14,15], label: 'Tinkaton', w: 2 },
  { id: 'mimikyu', moves: ['SHADOW_CLAW','SHADOW_SNEAK','PLAY_ROUGH'], ivs: [0,15,15], label: 'Mimikyu', w: 2 },
  { id: 'cramorant', moves: ['PECK','DIVE','FLY'], ivs: [0,15,15], label: 'Cramorant', w: 2 },
  { id: 'corviknight', moves: ['SAND_ATTACK','AIR_CUTTER','IRON_HEAD'], ivs: [0,15,15], label: 'Corviknight', w: 2 },
  { id: 'florges', moves: ['FAIRY_WIND','CHILLING_WATER','MOONBLAST'], ivs: [0,15,15], label: 'Florges', w: 2 },
  { id: 'stunfisk', moves: ['THUNDER_SHOCK','DISCHARGE','MUD_SHOT'], ivs: [0,15,15], label: 'Stunfisk', w: 2 },
  { id: 'dunsparce', moves: ['ROLLOUT','ROCK_SLIDE','DRILL_RUN'], ivs: [0,15,15], label: 'Dunsparce', w: 2 },
  { id: 'umbreon', moves: ['SNARL','FOUL_PLAY','LAST_RESORT'], ivs: [0,15,15], label: 'Umbreon', w: 2 },
  { id: 'morpeko_full_belly', moves: ['THUNDER_SHOCK','AURA_WHEEL_ELECTRIC','PSYCHIC_FANGS'], ivs: [0,15,15], label: 'Morpeko', w: 1 },
  { id: 'carbink', moves: ['ROCK_THROW','ROCK_SLIDE','MOONBLAST'], ivs: [0,15,15], label: 'Carbink', w: 1 },
  { id: 'araquanid', moves: ['BUG_BITE','BUBBLE_BEAM','MIRROR_COAT'], ivs: [0,15,15], label: 'Araquanid', w: 1 },
  { id: 'mantine', moves: ['WING_ATTACK','AERIAL_ACE','WATER_PULSE'], ivs: [0,15,15], label: 'Mantine', w: 1 },
  { id: 'marowak_alolan', moves: ['FIRE_SPIN','SHADOW_BONE','BONE_CLUB'], ivs: [0,15,15], label: 'A-Marowak', w: 1 },
  { id: 'clodsire', moves: ['POISON_STING','EARTHQUAKE','STONE_EDGE'], ivs: [0,15,15], label: 'Clodsire', w: 1 },
  { id: 'azumarill', moves: ['BUBBLE','PLAY_ROUGH','ICE_BEAM'], ivs: [0,15,15], label: 'Azumarill', w: 1 },
  { id: 'lanturn', moves: ['SPARK','SURF','THUNDERBOLT'], ivs: [0,15,15], label: 'Lanturn', w: 1 },
  { id: 'whiscash', moves: ['MUD_SHOT','MUD_BOMB','BLIZZARD'], ivs: [0,15,15], label: 'Whiscash', w: 1 },
  { id: 'cradily', moves: ['ACID','GRASS_KNOT','ROCK_TOMB'], ivs: [0,15,15], label: 'Cradily', w: 1 },
  { id: 'jumpluff', moves: ['FAIRY_WIND','AERIAL_ACE','ENERGY_BALL'], ivs: [0,15,15], label: 'Jumpluff', w: 1 },
  { id: 'mandibuzz', moves: ['SNARL','FOUL_PLAY','AERIAL_ACE'], ivs: [0,15,15], label: 'Mandibuzz', w: 1 },
  { id: 'vigoroth', moves: ['COUNTER','BODY_SLAM','ROCK_SLIDE'], ivs: [0,15,15], label: 'Vigoroth', w: 1 },
];
function* combos(arr, k, start = 0, prefix = []) {
  if (k === 0) { yield prefix; return; }
  for (let i = start; i <= arr.length - k; i++) yield* combos(arr, k - 1, i + 1, [...prefix, arr[i]]);
}

ready.then(() => {
  const t0 = Date.now();
  const all = [...combos(CANDIDATES, 3)];
  console.log(`Scoring ${all.length} teams with PvPoke's TeamRanker...`);
  const scored = [];
  all.forEach((team, i) => {
    const { threatScore, rankings } = rankTeam(team, THREATS);
    const worst = [...rankings]
      .map((r, j) => ({ label: THREATS[j].label, s: Math.min(...r.matchups.map(m => m.score)) }))
      .sort((a, b) => b.s - a.s).slice(0, 3).map(w => `${w.label}(${w.s.toFixed(0)})`);
    scored.push({ threatScore, team: team.map(c => c.label), worst });
    if ((i + 1) % 150 === 0) console.log(`  ${i + 1}/${all.length} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  });
  scored.sort((a, b) => a.threatScore - b.threatScore);
  console.log('\nTop 15 teams (PvPoke TeamRanker threat score, lower = better):');
  for (const s of scored.slice(0, 15)) {
    console.log(`  ${s.threatScore.toFixed(1)}: ${s.team.join(' / ')}  | worst: ${s.worst.join(', ')}`);
  }
  fs.writeFileSync('team_results_alt.json', JSON.stringify(scored.slice(0, 30), null, 1));
  console.log('Saved to team_results_alt.json');
});
