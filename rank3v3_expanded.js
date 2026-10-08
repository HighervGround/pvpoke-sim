// 3v3 ranking vs synergistic meta teams (meta_teams.json), with lead-order optimization.
// Usage: node rank3v3_expanded.js <v2results.json> [reps]
const fs = require('fs');
const { ready } = require('./pvpoke_harness.js');
const { battle3v3 } = require('./battle3v3.js');

const resultsFile = process.argv[2];
const REPS = parseInt(process.argv[3] || '3', 10);
const N_TEAMS = 5;

const v2 = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const metaTeams = JSON.parse(fs.readFileSync('meta_teams.json', 'utf8'));
const toSpec = (t) => ({ id: t.id, moves: t.moves, ivs: t.ivs, level: t.level });

ready.then(() => {
  const cands = v2.top.slice(0, N_TEAMS);
  const meta = metaTeams.map(team => team.map(toSpec));
  console.log(`${cands.length} trios x ${meta.length} meta teams x ${REPS} reps = ${cands.length * meta.length * REPS} battles`);
  const t0 = Date.now();
  const rows = cands.map((c) => {
    const trio = c.specs.map(toSpec);
    const leadName = c.lead;
    const li = trio.findIndex((s, i) => (c.team[i] || '').toLowerCase().startsWith(leadName));
    const ordered = li > 0 ? [...trio.slice(li), ...trio.slice(0, li)] : trio;
    let wins = 0, total = 0;
    for (const mt of meta) for (let r = 0; r < REPS; r++) {
      if (battle3v3(ordered, mt).winner === 'a') wins++;
      total++;
    }
    return { team: c.team, lead: c.lead, specs: ordered, winRate: wins / total, wins, total };
  });
  rows.sort((a, b) => b.winRate - a.winRate);
  console.log(`\n3v3 ranking (${((Date.now() - t0) / 1000).toFixed(0)}s):`);
  rows.forEach((r) => console.log(`  ${(r.winRate * 100).toFixed(1)}% (${r.wins}/${r.total}): LEAD ${r.lead} | ${r.team.join(' / ')}`));

  // Lead-order optimization for the winner: all 3 orders vs all meta teams
  const champ = rows[0];
  console.log(`\nLead optimization for ${champ.team.join('/')}:`);
  const perms = [[0,1,2],[1,0,2],[2,0,1]];
  const leadRows = perms.map(p => {
    const team = p.map(i => champ.specs[i]);
    let wins = 0, total = 0;
    for (const mt of meta) for (let r = 0; r < REPS; r++) {
      if (battle3v3(team, mt).winner === 'a') wins++;
      total++;
    }
    return { order: p.map(i => champ.team[i]), wins, total, winRate: wins / total };
  });
  leadRows.sort((a, b) => b.winRate - a.winRate);
  leadRows.forEach(r => console.log(`  ${(r.winRate*100).toFixed(1)}% (${r.wins}/${r.total}): ${r.order.join(' -> ')}`));
  fs.writeFileSync(resultsFile.replace('.json', '_3v3_expanded.json'),
    JSON.stringify({ ranking: rows.map(({specs, ...r}) => r), leadOrders: leadRows }, null, 1));
});
