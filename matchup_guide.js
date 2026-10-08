// Correct-perspective matchup guide: score is from the THREAT's perspective.
// score < 500 = WE win, score > 500 = WE lose.
const fs = require('fs');
const { ready, rankTeamShields } = require('./pvpoke_harness.js');
const roster = JSON.parse(fs.readFileSync('roster_main_pinned.json', 'utf8'));
const byId = {}; roster.forEach(c => { (byId[c.id] = byId[c.id] || []).push(c); });
const spec = (id) => { const c = byId[id][0]; return { id: c.id, moves: c.moves, ivs: c.ivs, level: c.level, label: c.label }; };
const foes = [
  ['jumpluff', ['FAIRY_WIND','AERIAL_ACE','ENERGY_BALL'], [4,15,15]],
  ['snorlax', ['LICK','BODY_SLAM','SUPER_POWER'], [5,15,15]],
  ['snorlax_shadow', ['LICK','BODY_SLAM','SUPER_POWER'], [5,15,15]],
  ['thievul', ['SNARL','PLAY_ROUGH','PSYCHIC'], [4,15,15]],
  ['jellicent', ['HEX','SURF','SHADOW_BALL'], [4,15,15]],
  ['ninetales_shadow', ['EMBER','WEATHER_BALL_FIRE','ENERGY_BALL'], [0,15,15]],
  ['cramorant', ['PECK','DIVE','FLY'], [4,15,15]],
  ['cradily', ['ACID','ROCK_TOMB','GRASS_KNOT'], [0,15,15]],
  ['melmetal', ['THUNDER_SHOCK','DOUBLE_IRON_BASH','DYNAMIC_PUNCH'], [4,15,15]],
];
ready.then(() => {
  const team = [spec('mimikyu'), spec('stunfisk'), spec('abomasnow')];
  const names = ['Mimikyu','Stunfisk','Abomasnow'];
  for (const [id, moves, ivs] of foes) {
    const foe = { id, moves, ivs, w: 1 };
    const line = [];
    for (const s of [0,1,2]) {
      const { rankings } = rankTeamShields(team, [foe], s);
      const res = rankings[0].matchups.map((m, i) => `${names[i]}:${m.score < 500 ? 'W' : 'L'}(${m.score.toFixed(0)})`).join(' ');
      line.push(`[${s}sh: ${res}]`);
    }
    console.log(`${id}: ${line.join(' ')}`);
  }
});
