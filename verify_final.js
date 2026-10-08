const fs = require('fs');
const { ready } = require('./pvpoke_harness.js');
const { battle3v3 } = require('./battle3v3.js');
const roster = JSON.parse(fs.readFileSync('roster_main_pinned.json', 'utf8'));
const byId = {}; roster.forEach(c => { (byId[c.id] = byId[c.id] || []).push(c); });
const spec = (id) => { const c = byId[id][0]; return { id: c.id, moves: c.moves, ivs: c.ivs, level: c.level }; };
const toSpec = (t) => ({ id: t.id, moves: t.moves, ivs: t.ivs, level: t.level });
const meta = JSON.parse(fs.readFileSync('meta_teams.json', 'utf8')).map(t => t.map(toSpec));
ready.then(() => {
  const champ = [spec('mimikyu'), spec('stunfisk'), spec('abomasnow')];
  let w = 0, n = 0;
  for (const mt of meta) for (let r = 0; r < 5; r++) { if (battle3v3(champ, mt).winner === 'a') w++; n++; }
  console.log(`champ 5-rep: ${(w/n*100).toFixed(1)}% (${w}/${n})`);
  // Cramorant teams specifically (Cole's complaint)
  const cram = meta.filter(t => JSON.stringify(t).includes('cramorant'));
  let w2 = 0, n2 = 0;
  for (const mt of cram) for (let r = 0; r < 5; r++) { if (battle3v3(champ, mt).winner === 'a') w2++; n2++; }
  console.log(`vs ${cram.length} Cramorant teams: ${(w2/n2*100).toFixed(0)}% (${w2}/${n2})`);
  // head-to-head vs the Lanturn trio (previous pick)
  const old = [spec('umbreon'), spec('lanturn'), spec('whiscash')];
  let w3 = 0;
  for (let r = 0; r < 20; r++) if (battle3v3(champ, old).winner === 'a') w3++;
  console.log(`champ vs old Lanturn trio: ${w3}/20`);
});
