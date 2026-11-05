const { ready } = require('./pvpoke_harness.js');
const { battle3v3 } = require('./battle3v3.js');
const { META3 } = require('./mega_meta_v3.js');
const S = (id, moves, ivs) => ({ id, moves, ivs });
const TINK = S('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE'], [10, 14, 15]);
const CLOD = S('clodsire', ['POISON_STING', 'STONE_EDGE', 'EARTHQUAKE'], [0, 14, 13]);
const GAST = S('gastrodon', ['MUD_SLAP', 'EARTH_POWER', 'BODY_SLAM'], [0, 10, 15]);
const MORP = S('morpeko_full_belly', ['THUNDER_SHOCK', 'AURA_WHEEL_ELECTRIC', 'PSYCHIC_FANGS'], [11, 15, 14]);
const MIMI = S('mimikyu', ['SHADOW_CLAW', 'SHADOW_SNEAK', 'PLAY_ROUGH'], [15, 12, 15]);
const AZU = S('azumarill', ['BUBBLE', 'PLAY_ROUGH', 'ICE_BEAM'], [0, 15, 15]);
const SDRA = S('dragonair_shadow', ['DRAGON_BREATH', 'BODY_SLAM', 'AQUA_TAIL'], [12, 9, 15]);
const JEL = S('jellicent', ['HEX', 'SURF', 'SHADOW_BALL'], [11, 12, 15]);
const SERP = S('serperior', ['VINE_WHIP', 'AERIAL_ACE', 'GRASS_KNOT'], [9, 15, 13]);
const MEOW = S('meowscarada', ['LEAFAGE', 'FLOWER_TRICK', 'NIGHT_SLASH'], [15, 15, 15]);
const DIG = S('diggersby', ['MUD_SHOT', 'SCORCHING_SANDS', 'FIRE_PUNCH'], [5, 15, 14]);
const REGI = S('registeel', ['LOCK_ON', 'FOCUS_BLAST', 'ZAP_CANNON'], [12, 13, 14]);
const TAL = S('talonflame', ['INCINERATE', 'FLY', 'BRAVE_BIRD'], [0, 15, 15]);
const MAND = S('mandibuzz', ['SNARL', 'AERIAL_ACE', 'FOUL_PLAY'], [11, 14, 13]);
const ALT = S('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'FLAMETHROWER'], [0, 15, 8]);
const STABLE = [
  ['Morpeko / Tinkaton / Gastrodon', [MORP, TINK, GAST]],
  ['Tinkaton / Clodsire / Gastrodon (main)', [TINK, CLOD, GAST]],
  ['Morpeko / Mimikyu / Clodsire', [MORP, MIMI, CLOD]],
  ['ShDragonair / Tinkaton / Mimikyu', [SDRA, TINK, MIMI]],
  ['ShDragonair / Azumarill / Tinkaton (spice)', [SDRA, AZU, TINK]],
  ['Jellicent / Azumarill / Serperior (counter)', [JEL, AZU, SERP]],
  ['Tinkaton / Azumarill / Mimikyu (mono Fairy)', [TINK, AZU, MIMI]],
  ['Meowscarada / Mimikyu / Azumarill', [MEOW, MIMI, AZU]],
  ['Meowscarada / Tinkaton / Gastrodon', [MEOW, TINK, GAST]],
  ['Diggersby / Serperior / Registeel (anti-Charjabug)', [DIG, SERP, REGI]],
  ['Talonflame / Registeel / Serperior (anti-Lickitung)', [TAL, REGI, SERP]],
  ['Jellicent / Mandibuzz / Altaria (stolen shell)', [JEL, MAND, ALT]],
];
ready.then(() => {
  const out = [];
  for (const [name, team] of STABLE) {
    let uw = 0, ut = 0, ww = 0, wt = 0; const holes = [];
    for (const [weight, mname, foe] of META3) {
      let w = 0;
      for (let i = 0; i < 33; i++) { if (battle3v3(team, foe).winner === 'a') w++; }
      for (let i = 0; i < 33; i++) { if (battle3v3(foe, team).winner === 'b') w++; }
      uw += w; ut += 66; ww += w * weight; wt += 66 * weight;
      if (w <= 13) holes.push(`${mname} ${w}/66`);
    }
    out.push({ name, un: 100 * uw / ut, wd: 100 * ww / wt, holes });
  }
  out.sort((a, b) => b.wd - a.wd);
  for (const r of out) {
    console.log(`${r.name}\n  weighted ${r.wd.toFixed(1)}% | unweighted ${r.un.toFixed(1)}%${r.holes.length ? ' | hard holes: ' + r.holes.join(' | ') : ' | no hard holes'}`);
  }
});
