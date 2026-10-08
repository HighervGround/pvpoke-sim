const fs = require('fs');
const { ready } = require('./pvpoke_harness.js');
const { battle3v3 } = require('./battle3v3.js');
const roster = JSON.parse(fs.readFileSync('roster_main_pinned.json', 'utf8'));
const byId = {}; roster.forEach(c => { (byId[c.id] = byId[c.id] || []).push(c); });
const spec = (id) => { const c = byId[id][0]; return { id: c.id, moves: c.moves, ivs: c.ivs, level: c.level }; };
const toSpec = (t) => ({ id: t.id, moves: t.moves, ivs: t.ivs, level: t.level });
const meta = JSON.parse(fs.readFileSync('meta_teams.json', 'utf8')).map(t => t.map(toSpec));
const cramTeams = meta.filter(t => ['cramorant'].some(f => JSON.stringify(t).includes(f)));
ready.then(() => {
  const trios = [
    ['Umbreon/Corviknight/Whiscash (now)', ['umbreon','corviknight','whiscash']],
    ['Umbreon/Corviknight/Lanturn', ['umbreon','corviknight','lanturn']],
    ['Umbreon/Lanturn/Whiscash', ['umbreon','lanturn','whiscash']],
    ['Corviknight/Lanturn/Whiscash', ['corviknight','lanturn','whiscash']],
  ];
  for (const [name, ids] of trios) {
    const team = ids.map(spec);
    let w1 = 0, n1 = 0;
    for (const mt of meta) for (let r = 0; r < 3; r++) { if (battle3v3(team, mt).winner === 'a') w1++; n1++; }
    // best lead for this trio vs cram teams
    const leads = [];
    for (let li = 0; li < 3; li++) {
      const lt = [team[li], team[(li+1)%3], team[(li+2)%3]];
      let w = 0, n = 0;
      for (const mt of cramTeams) for (let r = 0; r < 3; r++) { if (battle3v3(lt, mt).winner === 'a') w++; n++; }
      leads.push(`${ids[li]}:${w}/${n}`);
    }
    console.log(`${(w1/n1*100).toFixed(0)}% vs all 30 | cram-team leads [${leads.join(' ')}]: ${name}`);
  }
});
