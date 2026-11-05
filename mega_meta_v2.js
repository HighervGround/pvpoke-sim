// Meta v2 (Nov 4, 2026): rebuilt from PvPoke Mega Edition rankings (imported Nov 3, 2026),
// PokeSHIORI usage data (top usage: Melmetal, Charjabug, Cramorant), Dexerto's current
// best-team picks, and comps the owner actually faced on Nov 3-4.
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
  // --- comps the owner actually faced Nov 3 ---
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
module.exports = { F, META2 };
