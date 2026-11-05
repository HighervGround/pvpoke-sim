const { battle3v3 } = require('./battle3v3.js');
const F = (id, moves) => ({ id, moves, ivs: [4, 15, 15] });
const AZU = ['BUBBLE', 'PLAY_ROUGH', 'ICE_BEAM'];
const GFISK = ['MUD_SHOT', 'ROCK_SLIDE', 'EARTHQUAKE'];
const CLOD = ['POISON_STING', 'STONE_EDGE', 'EARTHQUAKE'];
const MALT = ['DRAGON_BREATH', 'MOONBLAST', 'SKY_ATTACK'];
const MMED = ['COUNTER', 'POWER_UP_PUNCH', 'ICE_PUNCH'];
const MSAB = ['SHADOW_CLAW', 'FOUL_PLAY', 'POWER_GEM'];
const MMAW = ['FAIRY_WIND', 'PLAY_ROUGH', 'IRON_HEAD'];
const MVEN = ['VINE_WHIP', 'FRENZY_PLANT', 'SLUDGE_BOMB'];
const MSTL = ['DRAGON_TAIL', 'BREAKING_SWIPE', 'PSYCHIC_FANGS'];
const MANDI = ['SNARL', 'FOUL_PLAY', 'AERIAL_ACE'];
const META = [
  ['M-Altaria/Azumarill/G-Stunfisk', [F('altaria_mega', MALT), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  ['M-Altaria/Clodsire/Mandibuzz', [F('altaria_mega', MALT), F('clodsire', CLOD), F('mandibuzz', MANDI)]],
  ['M-Medicham/Azumarill/Bastiodon', [F('medicham_mega', MMED), F('azumarill', AZU), F('bastiodon', ['SMACK_DOWN', 'STONE_EDGE', 'FLAMETHROWER'])]],
  ['M-Medicham/Lanturn/Altaria', [F('medicham_mega', MMED), F('lanturn', ['SPARK', 'SURF', 'THUNDERBOLT']), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  ['M-Sableye/Azumarill/Clodsire', [F('sableye_mega', MSAB), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['M-Mawile/Azumarill/Mandibuzz', [F('mawile_mega', MMAW), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  ['M-Venusaur/Azumarill/G-Stunfisk', [F('venusaur_mega', MVEN), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  ['M-Steelix/Azumarill/Mandibuzz', [F('steelix_mega', MSTL), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  ['M-Lopunny/Clodsire/Azumarill', [F('lopunny_mega', ['DOUBLE_KICK', 'TRIPLE_AXEL', 'FIRE_PUNCH']), F('clodsire', CLOD), F('azumarill', AZU)]],
  ['M-Banette/Azumarill/Clodsire', [F('banette_mega', ['SHADOW_CLAW', 'SHADOW_BALL', 'DAZZLING_GLEAM']), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Azumarill/G-Stunfisk/Altaria', [F('azumarill', AZU), F('stunfisk_galarian', GFISK), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  ['S-Feraligatr/Clodsire/Azumarill', [F('feraligatr_shadow', ['SHADOW_CLAW', 'HYDRO_CANNON', 'ICE_BEAM']), F('clodsire', CLOD), F('azumarill', AZU)]],
  ['Annihilape/Azumarill/G-Stunfisk', [F('annihilape', ['COUNTER', 'RAGE_FIST', 'SHADOW_BALL']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  ['Carbink/Azumarill/Mandibuzz', [F('carbink', ['ROCK_THROW', 'ROCK_SLIDE', 'MOONBLAST']), F('azumarill', AZU), F('mandibuzz', MANDI)]],
  ['Registeel/Altaria/Azumarill', [F('registeel', ['LOCK_ON', 'FOCUS_BLAST', 'FLASH_CANNON']), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST']), F('azumarill', AZU)]],
  ['Bastiodon/Azumarill/Medicham', [F('bastiodon', ['SMACK_DOWN', 'STONE_EDGE', 'FLAMETHROWER']), F('azumarill', AZU), F('medicham', MMED)]],
  ['Lanturn/Trevenant/Azumarill', [F('lanturn', ['SPARK', 'SURF', 'THUNDERBOLT']), F('trevenant', ['SHADOW_CLAW', 'SEED_BOMB', 'SHADOW_BALL']), F('azumarill', AZU)]],
  ['Cresselia/G-Stunfisk/Azumarill', [F('cresselia', ['PSYCHO_CUT', 'GRASS_KNOT', 'MOONBLAST']), F('stunfisk_galarian', GFISK), F('azumarill', AZU)]],
  ['Jellicent/Clodsire/Azumarill', [F('jellicent', ['HEX', 'SURF', 'SHADOW_BALL']), F('clodsire', CLOD), F('azumarill', AZU)]],
  ['Noctowl/G-Stunfisk/Azumarill', [F('noctowl', ['WING_ATTACK', 'SKY_ATTACK', 'SHADOW_BALL']), F('stunfisk_galarian', GFISK), F('azumarill', AZU)]],
  ['Umbreon/Azumarill/Clodsire', [F('umbreon', ['SNARL', 'FOUL_PLAY', 'LAST_RESORT']), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Charjabug/Azumarill/Clodsire', [F('charjabug', ['VOLT_SWITCH', 'DISCHARGE', 'CRUNCH']), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Lickitung/Azumarill/Altaria', [F('lickitung', ['LICK', 'BODY_SLAM', 'POWER_WHIP']), F('azumarill', AZU), F('altaria', ['DRAGON_BREATH', 'SKY_ATTACK', 'MOONBLAST'])]],
  ['Sableye/Azumarill/G-Stunfisk', [F('sableye', ['SHADOW_CLAW', 'FOUL_PLAY', 'RETURN']), F('azumarill', AZU), F('stunfisk_galarian', GFISK)]],
  ['Mandibuzz/Azumarill/Clodsire', [F('mandibuzz', MANDI), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Aegislash/Azumarill/Clodsire', [F('aegislash_shield', ['PSYCHO_CUT', 'SHADOW_BALL', 'GYRO_BALL']), F('azumarill', AZU), F('clodsire', CLOD)]],
  ['Tinkaton/Azumarill/Clodsire', [F('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE']), F('azumarill', AZU), F('clodsire', CLOD)]],
];
module.exports = { F, META };
