// Cross-check finalist teams with PvPoke's real TeamRanker (headless).
const { ready, rankTeam } = require('./pvpoke_harness.js');

const TEAM_A = [ // web UI pick
  { id: 'whiscash', moves: ['MUD_SHOT','MUD_BOMB','BLIZZARD'], ivs: [4,15,14] },
  { id: 'mimikyu', moves: ['SHADOW_CLAW','SHADOW_SNEAK','PLAY_ROUGH'], ivs: [15,12,15] },
  { id: 'ninetales', moves: ['FIRE_SPIN','WEATHER_BALL_FIRE','SCORCHING_SANDS'], ivs: [0,15,15] },
];
const TEAM_B = [ // local optimizer pick
  { id: 'clodsire', moves: ['POISON_STING','STONE_EDGE','EARTHQUAKE'], ivs: [0,14,13] },
  { id: 'stunfisk', moves: ['THUNDER_SHOCK','MUD_BOMB','DISCHARGE'], ivs: [0,14,15] },
  { id: 'umbreon', moves: ['SNARL','FOUL_PLAY','DARK_PULSE'], ivs: [2,10,10] },
];
const THREATS = [
  { id: 'melmetal', moves: ['THUNDER_SHOCK','DOUBLE_IRON_BASH','DYNAMIC_PUNCH'], ivs: [15,15,15], label: 'Melmetal', w: 3 },
  { id: 'sableye_mega', moves: ['SHADOW_CLAW','FOUL_PLAY','DAZZLING_GLEAM'], ivs: [0,15,15], label: 'Mega Sableye', w: 3 },
  { id: 'mimikyu', moves: ['SHADOW_CLAW','SHADOW_SNEAK','PLAY_ROUGH'], ivs: [0,15,15], label: 'Mimikyu', w: 2 },
  { id: 'dunsparce', moves: ['ROLLOUT','ROCK_SLIDE','DRILL_RUN'], ivs: [0,15,15], label: 'Dunsparce', w: 2 },
  { id: 'umbreon', moves: ['SNARL','FOUL_PLAY','LAST_RESORT'], ivs: [0,15,15], label: 'Umbreon', w: 2 },
  { id: 'vigoroth', moves: ['COUNTER','BODY_SLAM','ROCK_SLIDE'], ivs: [0,15,15], label: 'Vigoroth', w: 2 },
  { id: 'stunfisk', moves: ['THUNDER_SHOCK','DISCHARGE','MUD_SHOT'], ivs: [0,15,15], label: 'Stunfisk', w: 2 },
  { id: 'altaria', moves: ['DRAGON_BREATH','MOONBLAST','SKY_ATTACK'], ivs: [0,15,15], label: 'Altaria', w: 2 },
];

ready.then(() => {
  for (const [name, team] of [['Whiscash/Mimikyu/Ninetales', TEAM_A], ['Clodsire/Stunfisk/Umbreon', TEAM_B]]) {
    const { threatScore, rankings } = rankTeam(team, THREATS);
    console.log(`\n${name}: threat score ${threatScore.toFixed(1)} (lower = better)`);
    const worst = [...rankings]
      .map((r, i) => ({ label: THREATS[i].label, s: Math.min(...r.matchups.map(m => m.score)) }))
      .sort((a, b) => b.s - a.s).slice(0, 4);
    console.log('  worst threats: ' + worst.map(w => `${w.label} (${w.s.toFixed(0)})`).join(', '));
  }
});
