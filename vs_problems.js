const fs = require('fs');
const { ready, rankTeamShields } = require('./pvpoke_harness.js');
const roster = JSON.parse(fs.readFileSync('roster_main_pinned.json', 'utf8'));
const byId = {}; roster.forEach(c => { (byId[c.id] = byId[c.id] || []).push(c); });
const spec = (id) => { const c = byId[id][0]; return { id: c.id, moves: c.moves, ivs: c.ivs, level: c.level }; };
const foes = [
  { id: 'melmetal', moves: ['THUNDER_SHOCK','DOUBLE_IRON_BASH','DYNAMIC_PUNCH'], ivs: [4,15,15], label: 'Melmetal' },
  { id: 'cradily', moves: ['ACID','ROCK_TOMB','GRASS_KNOT'], ivs: [0,15,15], label: 'Cradily' },
  { id: 'cramorant', moves: ['PECK','DIVE','FLY'], ivs: [4,15,15], label: 'Cramorant' },
  { id: 'jumpluff', moves: ['FAIRY_WIND','AERIAL_ACE','ENERGY_BALL'], ivs: [4,15,15], label: 'Jumpluff' },
];
ready.then(() => {
  const team = [spec('umbreon'), spec('corviknight'), spec('whiscash')];
  const names = ['Umbreon','Corviknight','Whiscash'];
  for (const f of foes) {
    const { rankings } = rankTeamShields(team, [f], 1);
    console.log(`--- ${f.label} (1 shield) ---`);
    rankings[0].matchups.forEach((m, i) => console.log(`  ${names[i]}: ${m.score.toFixed(0)}`));
  }
});
