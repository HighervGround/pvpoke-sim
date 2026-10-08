// Head-to-head: new pinned winner vs old maxed winner (at true levels) + lead-order test.
const fs = require('fs');
const { ready, makePoke } = require('./pvpoke_harness.js');
const { battle3v3 } = require('./battle3v3.js');

const roster = JSON.parse(fs.readFileSync('roster_main_pinned.json', 'utf8'));
const byId = {};
roster.forEach(c => { (byId[c.id] = byId[c.id] || []).push(c); });
const spec = (id, n=0) => { const c = byId[id][n]; return { id: c.id, moves: c.moves, ivs: c.ivs, level: c.level }; };
const threats = JSON.parse(fs.readFileSync('threats_v2.json', 'utf8'));
const toSpec = (t) => ({ id: t.id, moves: t.moves, ivs: t.ivs, level: t.level });
const metaTeams = [];
for (let i = 0; i < 13 * 3; i += 3) metaTeams.push(threats.slice(i, i + 3).map(toSpec));

const NEW = [spec('whiscash'), spec('mimikyu'), spec('lanturn')];       // lead whiscash
const OLD = [spec('mimikyu'), spec('azumarill'), spec('stunfisk')];      // lead mimikyu

ready.then(() => {
  // 1. head-to-head
  let w = 0; const N = 20;
  for (let i = 0; i < N; i++) if (battle3v3(NEW, OLD).winner === 'a') w++;
  console.log(`NEW (Whiscash/Mimikyu/Lanturn) vs OLD (Mimikyu/Azumarill/Stunfisk): ${w}/${N}`);

  // 2. lead orders for NEW vs meta
  const orders = [
    ['whiscash','mimikyu','lanturn'],
    ['mimikyu','whiscash','lanturn'],
    ['lanturn','whiscash','mimikyu'],
  ];
  for (const o of orders) {
    const team = o.map(id => spec(id));
    let wins = 0, total = 0;
    for (const meta of metaTeams) for (let r = 0; r < 5; r++) {
      if (battle3v3(team, meta).winner === 'a') wins++;
      total++;
    }
    console.log(`  lead ${o[0]}: ${(wins/total*100).toFixed(1)}% (${wins}/${total})`);
  }
});
