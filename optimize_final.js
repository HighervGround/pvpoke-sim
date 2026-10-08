// Full team optimization using PvPoke's REAL TeamRanker (headless).
// Scores all 1,140 combos from the trainer's 20 candidates vs 25 meta threats.
const fs = require('fs');
const { ready, rankTeam } = require('./pvpoke_harness.js');

const CANDIDATES = [
  { id: 'altaria', moves: ['DRAGON_BREATH','SKY_ATTACK','FLAMETHROWER'], ivs: [0,15,8], label: 'Altaria' },
  { id: 'mimikyu', moves: ['SHADOW_CLAW','SHADOW_SNEAK','PLAY_ROUGH'], ivs: [15,12,15], label: 'Mimikyu' },
  { id: 'corviknight', moves: ['SAND_ATTACK','AIR_CUTTER','PAYBACK'], ivs: [14,14,15], label: 'Corviknight' },
  { id: 'malamar', moves: ['PSYWAVE','FOUL_PLAY','SUPER_POWER'], ivs: [1,14,15], label: 'Malamar' },
  { id: 'ninetales', moves: ['FIRE_SPIN','WEATHER_BALL_FIRE','SCORCHING_SANDS'], ivs: [0,15,15], label: 'Ninetales' },
  { id: 'whiscash', moves: ['MUD_SHOT','MUD_BOMB','BLIZZARD'], ivs: [4,15,14], label: 'Whiscash' },
  { id: 'azumarill', moves: ['BUBBLE','PLAY_ROUGH','ICE_BEAM'], ivs: [0,15,15], label: 'Azumarill' },
  { id: 'cradily', moves: ['ACID','GRASS_KNOT','ROCK_TOMB'], ivs: [0,15,15], label: 'Cradily' },
  { id: 'pelipper', moves: ['WING_ATTACK','WEATHER_BALL_WATER','HURRICANE'], ivs: [1,14,15], label: 'Pelipper' },
  { id: 'mandibuzz', moves: ['SNARL','AERIAL_ACE','FOUL_PLAY'], ivs: [11,14,13], label: 'Mandibuzz' },
  { id: 'clodsire', moves: ['POISON_STING','STONE_EDGE','EARTHQUAKE'], ivs: [0,14,13], label: 'Clodsire' },
  { id: 'excadrill', moves: ['MUD_SHOT','IRON_HEAD','EARTHQUAKE'], ivs: [4,13,14], label: 'Excadrill' },
  { id: 'dunsparce', moves: ['ROLLOUT','ROCK_SLIDE','DRILL_RUN'], ivs: [0,10,11], label: 'Dunsparce' },
  { id: 'stunfisk', moves: ['THUNDER_SHOCK','MUD_BOMB','DISCHARGE'], ivs: [0,14,15], label: 'Stunfisk' },
  { id: 'talonflame', moves: ['INCINERATE','FLY','BRAVE_BIRD'], ivs: [0,15,15], label: 'Talonflame' },
  { id: 'umbreon', moves: ['SNARL','FOUL_PLAY','DARK_PULSE'], ivs: [2,10,10], label: 'Umbreon' },
  { id: 'vigoroth', moves: ['COUNTER','ROCK_SLIDE','BODY_SLAM'], ivs: [10,7,14], label: 'Vigoroth' },
  { id: 'lanturn', moves: ['SPARK','SURF','THUNDERBOLT'], ivs: [8,8,12], label: 'Lanturn' },
  { id: 'abomasnow', moves: ['POWDER_SNOW','ENERGY_BALL','WEATHER_BALL_ICE'], ivs: [0,15,15], label: 'Abomasnow' },
  { id: 'jellicent', moves: ['HEX','SURF','SHADOW_BALL'], ivs: [11,12,15], label: 'Jellicent' },
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
  fs.writeFileSync('team_results_final.json', JSON.stringify(scored.slice(0, 30), null, 1));
  console.log('Saved to team_results_final.json');
});
