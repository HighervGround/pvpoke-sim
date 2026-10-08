// Anti-meta spice: optimize trios vs ONLY the top-20 threats (the meta core).
const fs = require('fs');
const { ready, rankTeamShields } = require('./pvpoke_harness.js');
const CANDIDATES = JSON.parse(fs.readFileSync('roster_main_pinned.json', 'utf8'));
const THREATS = JSON.parse(fs.readFileSync('threats_v2.json', 'utf8')).slice(0, 20);
const ALL = JSON.parse(fs.readFileSync('threats_v2.json', 'utf8'));
const SHIELD_W = { 0: 0.25, 1: 0.5, 2: 0.25 };
function* combos(arr, k, start = 0, prefix = []) {
  if (k === 0) { yield prefix; return; }
  for (let i = start; i <= arr.length - k; i++) yield* combos(arr, k - 1, i + 1, [...prefix, arr[i]]);
}
function teamScore(team, threats) {
  let total = 0;
  for (const s of [0, 1, 2]) total += SHIELD_W[s] * rankTeamShields(team, threats, s).threatScore;
  return total;
}
ready.then(() => {
  console.log(`Scoring vs top-20: ${THREATS.map(t=>t.label).join(', ')}`);
  const scored = [];
  for (const team of combos(CANDIDATES, 3)) {
    const anti = teamScore(team, THREATS);
    const broad = teamScore(team, ALL);
    scored.push({ anti, broad, team: team.map(c => c.label), specs: team.map(c => ({ id: c.id, moves: c.moves, ivs: c.ivs, level: c.level })) });
  }
  scored.sort((a, b) => a.anti - b.anti);
  console.log('\nTop 5 ANTI-META (vs top 20):');
  scored.slice(0, 5).forEach((s, i) => {
    // best blind lead vs top 20 at 1 shield
    const { rankings } = rankTeamShields(s.specs, THREATS, 1);
    const leadScores = s.specs.map((c, k) => {
      const rows = THREATS.map((t, j) => ({ s: rankings[j].matchups[k].score, w: t.w }));
      return { label: c.label || s.team[k], avg: rows.reduce((a,x) => a+x.s*x.w,0)/rows.reduce((a,x) => a+x.w,0) };
    }).sort((a,b) => a.avg - b.avg);
    console.log(`  ${i+1}. LEAD ${leadScores[0].label} | ${s.team.join(' / ')}  (anti: ${s.anti.toFixed(0)}, broad-120: ${s.broad.toFixed(0)})`);
  });
  fs.writeFileSync('anti_meta.json', JSON.stringify(scored.slice(0,5), null, 1));
});
