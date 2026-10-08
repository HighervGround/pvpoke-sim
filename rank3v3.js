// 3v3 team ranking: top v2 trios vs meta teams built from the live top-40.
// Each pairing runs N full 3v3 battles (AI randomness); score = win rate.
// Usage: node rank3v3.js <v2results.json> [reps]
const fs = require('fs');
const { ready } = require('./pvpoke_harness.js');
const { battle3v3 } = require('./battle3v3.js');

const resultsFile = process.argv[2];
const REPS = parseInt(process.argv[3] || '3', 10);
const N_TEAMS = 5;   // top-N v2 trios
const META_TEAMS = 13; // triples from top-40

const v2 = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const threats = JSON.parse(fs.readFileSync('threats_v2.json', 'utf8'));

const toSpec = (t) => ({ id: t.id, moves: t.moves, ivs: t.ivs, level: t.level });

// Meta teams: consecutive triples from the rating-ordered top 40, best first as lead
const metaTeams = [];
for (let i = 0; i < META_TEAMS * 3; i += 3) {
  metaTeams.push(threats.slice(i, i + 3).map(toSpec));
}

ready.then(() => {
  const cands = v2.top.slice(0, N_TEAMS);
  console.log(`${cands.length} trios x ${metaTeams.length} meta teams x ${REPS} reps = ${cands.length * metaTeams.length * REPS} battles`);
  const t0 = Date.now();
  const rows = cands.map((c) => {
    const trio = c.specs.map(toSpec);
    // rotate so v2-chosen lead is first
    const leadName = c.lead;
    const li = trio.findIndex((s, i) => (c.team[i] || '').toLowerCase().startsWith(leadName));
    const ordered = li > 0 ? [...trio.slice(li), ...trio.slice(0, li)] : trio;
    let wins = 0, total = 0;
    for (const meta of metaTeams) {
      for (let r = 0; r < REPS; r++) {
        const res = battle3v3(ordered, meta);
        if (res.winner === 'a') wins++;
        total++;
      }
    }
    return { team: c.team, lead: c.lead, winRate: wins / total, wins, total };
  });
  rows.sort((a, b) => b.winRate - a.winRate);
  console.log(`\n3v3 ranking (${((Date.now() - t0) / 1000).toFixed(0)}s):`);
  rows.forEach((r) => console.log(`  ${(r.winRate * 100).toFixed(1)}% (${r.wins}/${r.total}): LEAD ${r.lead} | ${r.team.join(' / ')}`));
  fs.writeFileSync(resultsFile.replace('.json', '_3v3.json'), JSON.stringify(rows, null, 1));
});
