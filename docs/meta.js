// Meta team sets for grading. v3 = usage-weighted Mega Edition GL field (Nov 2026).
// v2 = corrected unweighted field. Teams use [4,15,15] IVs and ranked movesets.
(function () {
// Meta v2 (Nov 4, 2026): rebuilt from PvPoke Mega Edition rankings (imported Nov 3, 2026),
// PokeSHIORI usage data (top usage: Melmetal, Charjabug, Cramorant), Dexerto's current
// best-team picks, and comps actually faced on Nov 3-4.
const F = (id, moves) => ({ id, moves, ivs: [4, 15, 15] });
const AZU = ['BUBBLE', 'PLAY_ROUGH', 'ICE_BEAM'];
const CLOD = ['POISON_STING', 'STONE_EDGE', 'EARTHQUAKE'];
const GFISK = ['MUD_SHOT', 'ROCK_SLIDE', 'EARTHQUAKE'];
const MELM = ['THUNDER_SHOCK', 'DOUBLE_IRON_BASH', 'DYNAMIC_PUNCH'];
const MSAB = ['SHADOW_CLAW', 'FOUL_PLAY', 'DAZZLING_GLEAM'];
const MALT = ['DRAGON_BREATH', 'MOONBLAST', 'SKY_ATTACK'];
const MANDI = ['SNARL', 'FOUL_PLAY', 'AERIAL_ACE'];
const META2 = [
  // --- new in v2: Melmetal / usage-driven cores ---
  ['Melmetal/Azumarill/Clodsire', [F('melmetal', MELM), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Melmetal/Charjabug/Azumarill', [F('melmetal', MELM), F('charjabug', ['VOLT_SWITCH', 'DISCHARGE', 'CRUNCH']), F('azumarill', AZU)]],
  ['Altaria/Melmetal/Seismitoad', [F('altaria', ['PECK', 'MOONBLAST', 'FLAMETHROWER']), F('melmetal', MELM), F('seismitoad', ['MUD_SHOT', 'MUDDY_WATER', 'EARTH_POWER'])]],
  ['Cramorant/Azumarill/Clodsire', [F('cramorant', ['PECK', 'DRILL_PECK', 'FLY']), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['M-Sableye/Corviknight/S-Quagsire', [F('sableye_mega', MSAB), F('corviknight', ['SAND_ATTACK', 'SKY_ATTACK', 'IRON_HEAD']), F('quagsire_shadow', ['MUD_SHOT', 'AQUA_TAIL', 'STONE_EDGE'])]],
  ['Charjabug/Melmetal/G-Stunfisk', [F('charjabug', ['VOLT_SWITCH', 'DISCHARGE', 'CRUNCH']), F('melmetal', MELM), F('stunfisk_galarian', GFISK)]],
  // --- comps actually faced Nov 3 ---
  ['Charizard/Annihilape/Primeape (faced)', [F('charizard', ['WING_ATTACK', 'BLAST_BURN', 'DRAGON_CLAW']), F('annihilape', ['COUNTER', 'RAGE_FIST', 'SHADOW_BALL']), F('primeape', ['KARATE_CHOP', 'NIGHT_SLASH', 'CLOSE_COMBAT'])]],
  ['Gastrodon/Lickilicky/G-Weezing (faced)', [F('gastrodon', ['MUD_SLAP', 'EARTH_POWER', 'BODY_SLAM']), F('lickilicky', ['LICK', 'BODY_SLAM', 'EARTHQUAKE']), F('weezing_galarian', ['TACKLE', 'BRUTAL_SWING', 'OVERHEAT'])]],
  ['Annihilape/Melmetal/Marowak (faced)', [F('annihilape', ['COUNTER', 'RAGE_FIST', 'SHADOW_BALL']), F('melmetal', MELM), F('marowak', ['MUD_SLAP', 'ROCK_SLIDE', 'BONE_CLUB'])]],
  // --- strongest cores carried over from v1 ---
  ['M-Altaria/Azumarill/G-Stunfisk', [F('altaria_mega', MALT), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  ['M-Altaria/Clodsire/Mandibuzz', [F('altaria_mega', MALT), F('clodsire', CLOD), F('mandibuzz', MANDI)]],
  ['M-Medicham/Azumarill/Bastiodon', [F('medicham_mega', ['COUNTER', 'POWER_UP_PUNCH', 'ICE_PUNCH']), F('azumarill', AZU), F('bastiodon', ['SMACK_DOWN', 'STONE_EDGE', 'FLAMETHROWER'])]],
  ['M-Medicham/Lanturn/Altaria', [F('medicham_mega', ['COUNTER', 'POWER_UP_PUNCH', 'ICE_PUNCH']), F('lanturn', ['SPARK', 'SURF', 'THUNDERBOLT']), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  ['M-Sableye/Azumarill/Clodsire', [F('sableye_mega', MSAB), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['M-Mawile/Azumarill/Mandibuzz', [F('mawile_mega', ['FAIRY_WIND', 'PLAY_ROUGH', 'IRON_HEAD']), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  ['M-Venusaur/Azumarill/G-Stunfisk', [F('venusaur_mega', ['VINE_WHIP', 'FRENZY_PLANT', 'SLUDGE_BOMB']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  ['M-Steelix/Azumarill/Mandibuzz', [F('steelix_mega', ['DRAGON_TAIL', 'BREAKING_SWIPE', 'PSYCHIC_FANGS']), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  ['M-Lopunny/Clodsire/Azumarill', [F('lopunny_mega', ['DOUBLE_KICK', 'TRIPLE_AXEL', 'FIRE_PUNCH']), F('clodsire', CLOD), F('azumarill', AZU)]],
  ['M-Banette/Azumarill/Clodsire', [F('banette_mega', ['SHADOW_CLAW', 'SHADOW_BALL', 'DAZZLING_GLEAM']), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Azumarill/G-Stunfisk/Altaria', [F('azumarill', AZU), F('stunfisk_galarian', GFISK), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  ['S-Feraligatr/Clodsire/Azumarill', [F('feraligatr_shadow', ['SHADOW_CLAW', 'HYDRO_CANNON', 'ICE_BEAM']), F('clodsire', CLOD), F('azumarill', AZU)]],
  ['Annihilape/Azumarill/G-Stunfisk', [F('annihilape', ['COUNTER', 'RAGE_FIST', 'SHADOW_BALL']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  ['Carbink/Azumarill/Mandibuzz', [F('carbink', ['ROCK_THROW', 'ROCK_SLIDE', 'MOONBLAST']), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  ['Registeel/Altaria/Azumarill', [F('registeel', ['LOCK_ON', 'FOCUS_BLAST', 'FLASH_CANNON']), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST']), F('azumarill', AZU)]],
  ['Lanturn/Trevenant/Azumarill', [F('lanturn', ['SPARK', 'SURF', 'THUNDERBOLT']), F('trevenant', ['SHADOW_CLAW', 'SEED_BOMB', 'SHADOW_BALL']), F('azumarill', AZU)]],
  ['Cresselia/G-Stunfisk/Azumarill', [F('cresselia', ['PSYCHO_CUT', 'GRASS_KNOT', 'MOONBLAST']), F('stunfisk_galarian', GFISK), F('azumarill', AZU)]],
  ['Jellicent/Clodsire/Azumarill', [F('jellicent', ['HEX', 'SURF', 'SHADOW_BALL']), F('clodsire', CLOD), F('azumarill', AZU)]],
  ['Charjabug/Azumarill/Clodsire', [F('charjabug', ['VOLT_SWITCH', 'DISCHARGE', 'CRUNCH']), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Lickitung/Azumarill/Altaria', [F('lickitung', ['LICK', 'BODY_SLAM', 'POWER_WHIP']), F('azumarill', AZU), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  ['Sableye/Azumarill/G-Stunfisk', [F('sableye', ['SHADOW_CLAW', 'FOUL_PLAY', 'POWER_GEM']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  ['Mandibuzz/Azumarill/Clodsire', [F('mandibuzz', MANDI), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Tinkaton/Azumarill/Clodsire', [F('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE']), F('azumarill', AZU), F('clodsire', CLOD)]],
];

window.META2 = META2;
})();

(function () {
// Meta v3 (Nov 4, 2026): usage-weighted field for Mega Edition GL.
// Weights: 3 = shells anchored on top-usage Pokemon (Melmetal/Charjabug/Cramorant/Azumarill cores,
//            per PokeSHIORI usage + PvPoke rankings imported Nov 3, 2026)
//          2 = shells anchored on PvPoke top-20 species, or comps actually faced Nov 3-4
//          1 = other plausible shells carried over
const F = (id, moves) => ({ id, moves, ivs: [4, 15, 15] });
const AZU = ['BUBBLE', 'PLAY_ROUGH', 'ICE_BEAM'];
const CLOD = ['POISON_STING', 'STONE_EDGE', 'EARTHQUAKE'];
const GFISK = ['MUD_SHOT', 'ROCK_SLIDE', 'EARTHQUAKE'];
const MELM = ['THUNDER_SHOCK', 'DOUBLE_IRON_BASH', 'DYNAMIC_PUNCH'];
const MSAB = ['SHADOW_CLAW', 'FOUL_PLAY', 'DAZZLING_GLEAM'];
const MALT = ['DRAGON_BREATH', 'MOONBLAST', 'SKY_ATTACK'];
const MANDI = ['SNARL', 'FOUL_PLAY', 'AERIAL_ACE'];
const CHJ = ['VOLT_SWITCH', 'DISCHARGE', 'CRUNCH'];
const CORV = ['SAND_ATTACK', 'AIR_CUTTER', 'IRON_HEAD'];
const SQUAG = ['MUD_SHOT', 'AQUA_TAIL', 'STONE_EDGE'];
// [weight, name, team]
const META3 = [
  [3, 'Melmetal/Azumarill/Clodsire', [F('melmetal', MELM), F('azumarill', AZU), F('clodsire', CLOD)]],
  [3, 'Melmetal/Charjabug/Azumarill', [F('melmetal', MELM), F('charjabug', CHJ), F('azumarill', AZU)]],
  [3, 'Charjabug/Melmetal/G-Stunfisk', [F('charjabug', CHJ), F('melmetal', MELM), F('stunfisk_galarian', GFISK)]],
  [3, 'Charjabug/Azumarill/Clodsire', [F('charjabug', CHJ), F('azumarill', AZU), F('clodsire', CLOD)]],
  [3, 'Cramorant/Azumarill/Clodsire', [F('cramorant', ['PECK', 'SURF', 'FLY']), F('azumarill', AZU), F('clodsire', CLOD)]],
  [3, 'Altaria/Melmetal/Seismitoad', [F('altaria', ['PECK', 'MOONBLAST', 'FLAMETHROWER']), F('melmetal', MELM), F('seismitoad', ['MUD_SHOT', 'MUDDY_WATER', 'EARTH_POWER'])]],
  [3, 'M-Sableye/Azumarill/Clodsire', [F('sableye_mega', MSAB), F('azumarill', AZU), F('clodsire', CLOD)]],
  [3, 'Jellicent/Clodsire/Azumarill', [F('jellicent', ['HEX', 'SURF', 'SHADOW_BALL']), F('clodsire', CLOD), F('azumarill', AZU)]],
  [3, 'Tinkaton/Azumarill/Clodsire', [F('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE']), F('azumarill', AZU), F('clodsire', CLOD)]],
  [2, 'M-Sableye/Corviknight/S-Quagsire', [F('sableye_mega', MSAB), F('corviknight', CORV), F('quagsire_shadow', SQUAG)]],
  [2, 'M-Sableye/Corviknight/Clodsire', [F('sableye_mega', MSAB), F('corviknight', CORV), F('clodsire', CLOD)]],
  [2, 'S-Ninetales/Azumarill/Clodsire', [F('ninetales_shadow', ['EMBER', 'WEATHER_BALL_FIRE', 'ENERGY_BALL']), F('azumarill', AZU), F('clodsire', CLOD)]],
  [2, 'Florges/Melmetal/Clodsire', [F('florges', ['FAIRY_WIND', 'CHILLING_WATER', 'MOONBLAST']), F('melmetal', MELM), F('clodsire', CLOD)]],
  [2, 'G-Corsola/Azumarill/Tinkaton', [F('corsola_galarian', ['ASTONISH', 'NIGHT_SHADE', 'POWER_GEM']), F('azumarill', AZU), F('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE'])]],
  [2, 'Thievul/Tinkaton/Jellicent', [F('thievul', ['SUCKER_PUNCH', 'NIGHT_SLASH', 'ICY_WIND']), F('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE']), F('jellicent', ['HEX', 'SURF', 'SHADOW_BALL'])]],
  [2, 'Araquanid/Azumarill/G-Stunfisk', [F('araquanid', ['INFESTATION', 'WATER_PULSE', 'MIRROR_COAT']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  [2, 'S-Hydreigon/Azumarill/Clodsire', [F('hydreigon_shadow', ['DRAGON_BREATH', 'BRUTAL_SWING', 'FLY']), F('azumarill', AZU), F('clodsire', CLOD)]],
  [2, 'M-Altaria/Azumarill/G-Stunfisk', [F('altaria_mega', MALT), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  [2, 'Charizard/Annihilape/Primeape (faced)', [F('charizard', ['WING_ATTACK', 'BLAST_BURN', 'DRAGON_CLAW']), F('annihilape', ['COUNTER', 'RAGE_FIST', 'SHADOW_BALL']), F('primeape', ['KARATE_CHOP', 'NIGHT_SLASH', 'CLOSE_COMBAT'])]],
  [2, 'Gastrodon/Lickilicky/G-Weezing (faced)', [F('gastrodon', ['MUD_SLAP', 'EARTH_POWER', 'BODY_SLAM']), F('lickilicky', ['LICK', 'BODY_SLAM', 'EARTHQUAKE']), F('weezing_galarian', ['TACKLE', 'BRUTAL_SWING', 'OVERHEAT'])]],
  [2, 'Annihilape/Melmetal/Marowak (faced)', [F('annihilape', ['COUNTER', 'RAGE_FIST', 'SHADOW_BALL']), F('melmetal', MELM), F('marowak', ['MUD_SLAP', 'ROCK_SLIDE', 'BONE_CLUB'])]],
  [2, 'Lickitung/Azumarill/Altaria', [F('lickitung', ['LICK', 'BODY_SLAM', 'POWER_WHIP']), F('azumarill', AZU), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  [2, 'Annihilape/Azumarill/G-Stunfisk', [F('annihilape', ['COUNTER', 'RAGE_FIST', 'SHADOW_BALL']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  [2, 'S-Feraligatr/Clodsire/Azumarill', [F('feraligatr_shadow', ['SHADOW_CLAW', 'HYDRO_CANNON', 'ICE_BEAM']), F('clodsire', CLOD), F('azumarill', AZU)]],
  [1, 'M-Altaria/Clodsire/Mandibuzz', [F('altaria_mega', MALT), F('clodsire', CLOD), F('mandibuzz', MANDI)]],
  [1, 'M-Medicham/Azumarill/Bastiodon', [F('medicham_mega', ['COUNTER', 'POWER_UP_PUNCH', 'ICE_PUNCH']), F('azumarill', AZU), F('bastiodon', ['SMACK_DOWN', 'STONE_EDGE', 'FLAMETHROWER'])]],
  [1, 'M-Medicham/Lanturn/Altaria', [F('medicham_mega', ['COUNTER', 'POWER_UP_PUNCH', 'ICE_PUNCH']), F('lanturn', ['SPARK', 'SURF', 'THUNDERBOLT']), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  [1, 'M-Mawile/Azumarill/Mandibuzz', [F('mawile_mega', ['FAIRY_WIND', 'PLAY_ROUGH', 'IRON_HEAD']), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  [1, 'M-Venusaur/Azumarill/G-Stunfisk', [F('venusaur_mega', ['VINE_WHIP', 'FRENZY_PLANT', 'SLUDGE_BOMB']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  [1, 'M-Steelix/Azumarill/Mandibuzz', [F('steelix_mega', ['DRAGON_TAIL', 'BREAKING_SWIPE', 'PSYCHIC_FANGS']), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  [1, 'M-Lopunny/Clodsire/Azumarill', [F('lopunny_mega', ['DOUBLE_KICK', 'TRIPLE_AXEL', 'FIRE_PUNCH']), F('clodsire', CLOD), F('azumarill', AZU)]],
  [1, 'M-Banette/Azumarill/Clodsire', [F('banette_mega', ['SHADOW_CLAW', 'SHADOW_BALL', 'DAZZLING_GLEAM']), F('azumarill', AZU), F('clodsire', CLOD)]],
  [1, 'Azumarill/G-Stunfisk/Altaria', [F('azumarill', AZU), F('stunfisk_galarian', GFISK), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  [1, 'Carbink/Azumarill/Mandibuzz', [F('carbink', ['ROCK_THROW', 'ROCK_SLIDE', 'MOONBLAST']), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  [1, 'Registeel/Altaria/Azumarill', [F('registeel', ['LOCK_ON', 'FOCUS_BLAST', 'FLASH_CANNON']), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST']), F('azumarill', AZU)]],
  [1, 'Lanturn/Trevenant/Azumarill', [F('lanturn', ['SPARK', 'SURF', 'THUNDERBOLT']), F('trevenant', ['SHADOW_CLAW', 'SEED_BOMB', 'SHADOW_BALL']), F('azumarill', AZU)]],
  [1, 'Cresselia/G-Stunfisk/Azumarill', [F('cresselia', ['PSYCHO_CUT', 'GRASS_KNOT', 'MOONBLAST']), F('stunfisk_galarian', GFISK), F('azumarill', AZU)]],
  [1, 'Sableye/Azumarill/G-Stunfisk', [F('sableye', ['SHADOW_CLAW', 'FOUL_PLAY', 'POWER_GEM']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  [1, 'Mandibuzz/Azumarill/Clodsire', [F('mandibuzz', MANDI), F('azumarill', AZU), F('clodsire', CLOD)]],
];

window.META3 = META3;
})();
