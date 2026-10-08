const fs = require('fs');
const { ready } = require('./pvpoke_harness.js');
const { battle3v3 } = require('./battle3v3.js');
const roster = JSON.parse(fs.readFileSync('roster_main_pinned.json', 'utf8'));
const byId = {}; roster.forEach(c => { (byId[c.id] = byId[c.id] || []).push(c); });
const spec = (id) => { const c = byId[id][0]; return { id: c.id, moves: c.moves, ivs: c.ivs, level: c.level }; };
const toSpec = (t) => ({ id: t.id, moves: t.moves, ivs: t.ivs, level: t.level });
const meta = JSON.parse(fs.readFileSync('meta_teams.json', 'utf8')).map(t => t.map(toSpec));
ready.then(() => {
  const tests = [
    ['NEW Umbreon lead', [spec('umbreon'), spec('corviknight'), spec('whiscash')]],
    ['NEW Whiscash lead', [spec('whiscash'), spec('corviknight'), spec('umbreon')]],
    ['OLD champ (Mimikyu/W/L)', [spec('mimikyu'), spec('whiscash'), spec('lanturn')]],
  ];
  for (const [name, team] of tests) {
    let w = 0, n = 0;
    for (const mt of meta) for (let r = 0; r < 5; r++) { if (battle3v3(team, mt).winner === 'a') w++; n++; }
    console.log(`${(w/n*100).toFixed(1)}% (${w}/${n}): ${name}`);
  }
});
