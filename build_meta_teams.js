// Build synergistic meta teams: lead from top 30, partners from top 120 chosen
// to resist the lead's weaknesses (basic team-building coverage).
const fs = require('fs');
const gm = JSON.parse(fs.readFileSync('pvpoke/src/data/gamemaster.json', 'utf8'));
const threats = JSON.parse(fs.readFileSync('threats_v2.json', 'utf8'));

// Attacking type -> defending type multipliers (standard chart, only SE/NVE needed)
const SE = {
  Normal: [], Fire: ['Grass','Ice','Bug','Steel'], Water: ['Fire','Ground','Rock'],
  Electric: ['Water','Flying'], Grass: ['Water','Ground','Rock'], Ice: ['Grass','Ground','Flying','Dragon'],
  Fighting: ['Normal','Ice','Rock','Dark','Steel'], Poison: ['Grass','Fairy'], Ground: ['Fire','Electric','Poison','Rock','Steel'],
  Flying: ['Grass','Fighting','Bug'], Psychic: ['Fighting','Poison'], Bug: ['Grass','Psychic','Dark'],
  Rock: ['Fire','Ice','Flying','Bug'], Ghost: ['Psychic','Ghost'], Dragon: ['Dragon'],
  Dark: ['Psychic','Ghost'], Steel: ['Ice','Rock','Fairy'], Fairy: ['Fighting','Dragon','Dark']
};
const NVE = {
  Normal: ['Rock','Steel'], Fire: ['Fire','Water','Rock','Dragon'], Water: ['Water','Grass','Dragon'],
  Electric: ['Electric','Grass','Dragon'], Grass: ['Fire','Grass','Poison','Flying','Bug','Dragon','Steel'],
  Ice: ['Fire','Water','Ice','Steel'], Fighting: ['Poison','Flying','Psychic','Bug','Fairy'],
  Poison: ['Poison','Ground','Rock','Ghost'], Ground: ['Grass','Bug'], Flying: ['Electric','Rock','Steel'],
  Psychic: ['Psychic','Steel'], Bug: ['Fire','Fighting','Poison','Flying','Ghost','Steel','Fairy'],
  Rock: ['Fighting','Ground','Steel'], Ghost: ['Dark'], Dragon: ['Steel'], Dark: ['Fighting','Dark','Fairy'],
  Steel: ['Fire','Water','Electric','Steel'], Fairy: ['Fire','Poison','Steel']
};
const IMMUNE = { Normal: ['Ghost'], Electric: ['Ground'], Fighting: ['Ghost'], Poison: ['Steel'], Ground: ['Flying'], Psychic: ['Dark'], Ghost: ['Normal'], Dragon: ['Fairy'] };

const byId = {};
gm.pokemon.forEach(p => { byId[p.speciesId] = p; });

function weaknesses(types) {
  const out = new Set();
  for (const atk of Object.keys(SE)) {
    let mult = 1;
    for (const def of types) {
      if (IMMUNE[atk]?.includes(def)) { mult = 0; break; }
      if (SE[atk]?.includes(def)) mult *= 2;
      else if (NVE[atk]?.includes(def)) mult *= 0.5;
    }
    if (mult > 1) out.add(atk);
  }
  return out;
}
function resists(types) {
  const out = new Set();
  for (const atk of Object.keys(SE)) {
    let mult = 1;
    for (const def of types) {
      if (IMMUNE[atk]?.includes(def)) { mult = 0; break; }
      if (SE[atk]?.includes(def)) mult *= 2;
      else if (NVE[atk]?.includes(def)) mult *= 0.5;
    }
    if (mult < 1) out.add(atk);
  }
  return out;
}

const tTypes = threats.map(t => {
  const p = byId[t.id];
  return p ? p.types.map(x => x.charAt(0).toUpperCase() + x.slice(1)) : [];
});

const teams = [];
const seen = new Set();
for (let li = 0; li < 30; li++) {
  const leadWeak = weaknesses(tTypes[li]);
  const leadResist = resists(tTypes[li]);
  const used = new Set([li]);
  const partners = [];
  for (let round = 0; round < 2; round++) {
    const covered = new Set([...leadResist]);
    partners.forEach(pi => resists(tTypes[pi]).forEach(r => covered.add(r)));
    let best = -1, bestScore = -1;
    for (let i = 0; i < threats.length; i++) {
      if (used.has(i)) continue;
      const r = resists(tTypes[i]);
      let score = 0;
      leadWeak.forEach(w => { if (r.has(w) && !covered.has(w)) score += 2; else if (r.has(w)) score += 0.5; });
      // tie-break: rating
      score += threats[i].rating / 10000;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    if (best >= 0) { used.add(best); partners.push(best); }
  }
  const trio = [li, ...partners];
  const key = [...trio].sort((a,b) => a-b).join(',');
  if (seen.has(key)) continue;
  seen.add(key);
  teams.push(trio.map(i => threats[i]));
}
fs.writeFileSync('meta_teams.json', JSON.stringify(teams, null, 1));
console.log(`Built ${teams.length} synergistic meta teams from ${threats.length} threats`);
teams.slice(0, 5).forEach(t => console.log(' ', t.map(x => x.label).join(' / ')));
