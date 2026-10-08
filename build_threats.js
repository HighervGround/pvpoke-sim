// Build a real-meta threat list from PvPoke's LIVE Mega Edition rankings.
// Top 40 by rating. Moveset = PvPoke's recommended set from the JSON.
// IVs/level = PvPoke's own defaultIVs (max stat product) from the loaded GameMaster.
// Weight = rating.
const https = require('https');
const fs = require('fs');
const { ready } = require('./pvpoke_harness.js');

const URL = 'https://pvpoke.com/data/rankings/mega/overall/rankings-1500.json';
const TOP_N = 40;

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'pvp-sim' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => (res.statusCode === 200 ? resolve(data) : reject(new Error('HTTP ' + res.statusCode))));
    }).on('error', reject);
  });
}

ready.then(async () => {
  console.log('Fetching live Mega rankings...');
  const data = JSON.parse(await fetch(URL));
  const top = [...data].sort((a, b) => b.rating - a.rating).slice(0, TOP_N);

  // defaultIVs are generated per-species at GameMaster load time
  const gm = GameMaster.getInstance();
  const byId = {};
  gm.data.pokemon.forEach((p) => { byId[p.speciesId] = p; });

  const threats = [];
  const failed = [];
  for (const e of top) {
    const gp = byId[e.speciesId];
    const moves = (e.moveset || []).filter(Boolean);
    if (!gp || !gp.defaultIVs || !gp.defaultIVs.cp1500 || !gp.defaultIVs.cp1500.length) {
      failed.push(e.speciesId + ' (no defaultIVs)'); continue;
    }
    if (moves.length < 2) { failed.push(e.speciesId + ' (moveset)'); continue; }
    const [level, a, d, h] = gp.defaultIVs.cp1500;
    threats.push({ id: e.speciesId, moves, ivs: [a, d, h], level, label: e.speciesName, w: e.rating, rating: e.rating });
  }
  console.log(`Built ${threats.length} threats, ${failed.length} skipped:`, failed.join('; ') || 'none');
  console.log('Top 8:', threats.slice(0, 8).map(t => `${t.label}(${t.rating})`).join(', '));
  fs.writeFileSync('threats_v2.json', JSON.stringify(threats, null, 1));
  console.log('Wrote threats_v2.json');
});
