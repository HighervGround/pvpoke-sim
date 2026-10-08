const fs = require('fs');
const { ready } = require('./pvpoke_harness.js');
const { battle3v3 } = require('./battle3v3.js');
const roster = JSON.parse(fs.readFileSync('roster_main_pinned.json', 'utf8'));
const byId = {}; roster.forEach(c => { (byId[c.id] = byId[c.id] || []).push(c); });
const spec = (id) => { const c = byId[id][0]; return { id: c.id, moves: c.moves, ivs: c.ivs, level: c.level }; };
const toSpec = (t) => ({ id: t.id, moves: t.moves, ivs: t.ivs, level: t.level });
const meta = JSON.parse(fs.readFileSync('meta_teams.json', 'utf8'));
ready.then(() => {
  const team = [spec('umbreon'), spec('corviknight'), spec('whiscash')];
  for (const foe of ['melmetal','cramorant','cradily','jumpluff']) {
    const foeteams = meta.filter(t => t.some(m => m.id === foe));
    let w = 0, n = 0;
    for (const ft of foeteams) for (let r = 0; r < 5; r++) {
      if (battle3v3(team, ft.map(toSpec)).winner === 'a') w++; n++;
    }
    const names = foeteams.map(t => t.map(m => m.label).join('/')).slice(0,4);
    console.log(`${foe}: ${w}/${n} (${(w/n*100).toFixed(0)}%) across ${foeteams.length} teams`);
    names.forEach(x => console.log('   ' + x));
  }
});
