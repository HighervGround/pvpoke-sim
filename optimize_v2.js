// v2 optimizer: real-meta threats (live PvPoke Mega rankings, rating-weighted),
// 0/1/2-shield scoring, integrated lead selection.
// Usage: node optimize_v2.js <roster.json> <out.json>
const fs = require('fs');
const { ready, rankTeamShields } = require('./pvpoke_harness.js');

const rosterFile = process.argv[2] || 'roster_alt.json';
const outFile = process.argv[3] || 'team_results_v2_alt.json';
const CANDIDATES = JSON.parse(fs.readFileSync(rosterFile, 'utf8'));
const THREATS = JSON.parse(fs.readFileSync('threats_v2.json', 'utf8'));

// Shield scenario weights: leads are usually decided at 1 shield; 0/2 still matter.
const SHIELD_W = { 0: 0.25, 1: 0.5, 2: 0.25 };

function* combos(arr, k, start = 0, prefix = []) {
  if (k === 0) { yield prefix; return; }
  for (let i = start; i <= arr.length - k; i++) yield* combos(arr, k - 1, i + 1, [...prefix, arr[i]]);
}

function teamScore(team) {
  let total = 0;
  const perShield = {};
  for (const s of [0, 1, 2]) {
    const r = rankTeamShields(team, THREATS, s);
    perShield[s] = r;
    total += SHIELD_W[s] * r.threatScore;
  }
  return { score: total, perShield };
}

ready.then(() => {
  console.log(`${CANDIDATES.length} candidates, ${THREATS.length} threats (live meta), shields 0/1/2.`);
  const t0 = Date.now();
  const all = [...combos(CANDIDATES, 3)];
  console.log(`Scoring ${all.length} teams...`);
  const scored = [];
  all.forEach((team, i) => {
    const { score, perShield } = teamScore(team);
    const r1 = perShield[1].rankings;
    const worst = THREATS.map((t, j) => ({ label: t.label, s: Math.min(...r1[j].matchups.map(m => m.score)) }))
      .sort((a, b) => b.s - a.s).slice(0, 3).map(w => `${w.label}(${w.s.toFixed(0)})`);
    scored.push({ score, team: team.map(c => c.label), worst, specs: team.map(c => ({ id: c.id, moves: c.moves, ivs: c.ivs, level: c.level })) });
    if ((i + 1) % 150 === 0) console.log(`  ${i + 1}/${all.length} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  });
  scored.sort((a, b) => a.score - b.score);

  // Integrated lead selection for the top 5: best blind lead per team (1-shield).
  console.log('\nTop 5 with leads:');
  const final = scored.slice(0, 5).map((s) => {
    const { rankings } = rankTeamShields(s.specs.map(c => ({ ...c })), THREATS, 1);
    const leadScores = s.specs.map((c, k) => {
      const rows = THREATS.map((t, j) => ({ s: rankings[j].matchups[k].score, w: t.w }));
      const avg = rows.reduce((a, x) => a + x.s * x.w, 0) / rows.reduce((a, x) => a + x.w, 0);
      return { label: c.label || c.id, avg };
    }).sort((a, b) => a.avg - b.avg);
    const entry = { ...s, lead: leadScores[0].label.split(' (')[0], leadScores: leadScores.map(l => `${l.label.split(' (')[0]}:${l.avg.toFixed(0)}`) };
    console.log(`  ${s.score.toFixed(1)}: LEAD ${entry.lead} | ${s.team.join(' / ')}  | worst: ${s.worst.join(', ')}`);
    return entry;
  });

  fs.writeFileSync(outFile, JSON.stringify({ meta: 'live mega 1500 overall, top40 by rating', shields: '0/1/2 @ .25/.5/.25', top: final, top15: scored.slice(0, 15).map(({ specs, ...r }) => r) }, null, 1));
  console.log(`Saved to ${outFile}`);
});
