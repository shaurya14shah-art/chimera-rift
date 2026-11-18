/* ═══════════════════════════════════════════════════
   MoveData.js — All move definitions (40+ moves)
   ═══════════════════════════════════════════════════ */

import { ESSENCE, MOVE_CATEGORY, TERRAIN, STATUS } from '../constants.js';

/**
 * Move Definition:
 * {
 *   id: string,
 *   name: string,
 *   essence: ESSENCE,
 *   category: MOVE_CATEGORY,
 *   power: number (0 for status moves),
 *   accuracy: number (0-100),
 *   pp: number (uses before needing rest),
 *   priority: number (0 = normal, positive = goes first, negative = goes last),
 *   effect: { ... } (status effect, stat changes, terrain, etc.),
 *   description: string,
 *   animation: string (used by battle animations),
 * }
 */

export const MOVES = {
  // ══════════════════════════════
  // EMBER MOVES
  // ══════════════════════════════
  molten_howl: {
    id: 'molten_howl', name: 'Molten Howl', essence: ESSENCE.EMBER,
    category: MOVE_CATEGORY.PULSE, power: 55, accuracy: 95, pp: 15, priority: 0,
    effect: { chance: 20, status: STATUS.BURN },
    description: 'A howl that releases waves of molten heat. May burn.',
    animation: 'ember_burst',
  },
  flame_fang: {
    id: 'flame_fang', name: 'Flame Fang', essence: ESSENCE.EMBER,
    category: MOVE_CATEGORY.STRIKE, power: 65, accuracy: 95, pp: 15, priority: 0,
    effect: { chance: 10, status: STATUS.BURN },
    description: 'Bites with fangs wreathed in flame.',
    animation: 'bite',
  },
  shadowburn: {
    id: 'shadowburn', name: 'Shadowburn', essence: ESSENCE.EMBER,
    category: MOVE_CATEGORY.PULSE, power: 85, accuracy: 85, pp: 8, priority: 0,
    effect: { chance: 30, status: STATUS.BURN, terrainSet: TERRAIN.SCORCHED },
    description: 'Dark fire that erases what it touches. Sets Scorched Earth.',
    animation: 'dark_fire',
  },
  scorch: {
    id: 'scorch', name: 'Scorch', essence: ESSENCE.EMBER,
    category: MOVE_CATEGORY.FIELD, power: 0, accuracy: 100, pp: 5, priority: 0,
    effect: { terrainSet: TERRAIN.SCORCHED },
    description: 'Sets the battlefield ablaze with Scorched Earth terrain.',
    animation: 'terrain_fire',
  },
  inferno_rush: {
    id: 'inferno_rush', name: 'Inferno Rush', essence: ESSENCE.EMBER,
    category: MOVE_CATEGORY.STRIKE, power: 90, accuracy: 80, pp: 5, priority: 0,
    effect: { recoil: 0.25 },
    description: 'A reckless charge wreathed in flames. Takes recoil damage.',
    animation: 'charge_fire',
  },

  // ══════════════════════════════
  // TIDE MOVES
  // ══════════════════════════════
  prism_tide: {
    id: 'prism_tide', name: 'Prism Tide', essence: ESSENCE.TIDE,
    category: MOVE_CATEGORY.PULSE, power: 60, accuracy: 100, pp: 15, priority: 0,
    effect: {},
    description: 'A wave of prismatic water that shimmers with light.',
    animation: 'water_wave',
  },
  torrent_rush: {
    id: 'torrent_rush', name: 'Torrent Rush', essence: ESSENCE.TIDE,
    category: MOVE_CATEGORY.STRIKE, power: 70, accuracy: 90, pp: 12, priority: 1,
    effect: {},
    description: 'Dashes through the enemy on a stream of water. High priority.',
    animation: 'water_dash',
  },
  dream_current: {
    id: 'dream_current', name: 'Dream Current', essence: ESSENCE.TIDE,
    category: MOVE_CATEGORY.PULSE, power: 50, accuracy: 100, pp: 15, priority: 0,
    effect: { chance: 20, status: STATUS.SLEEP },
    description: 'A soothing current that may lull the target to sleep.',
    animation: 'water_spiral',
  },
  deluge: {
    id: 'deluge', name: 'Deluge', essence: ESSENCE.TIDE,
    category: MOVE_CATEGORY.PULSE, power: 85, accuracy: 85, pp: 8, priority: 0,
    effect: { terrainSet: TERRAIN.FLOODED },
    description: 'Floods the battlefield. Sets Flooded terrain.',
    animation: 'water_flood',
  },
  aqua_shield: {
    id: 'aqua_shield', name: 'Aqua Shield', essence: ESSENCE.TIDE,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 10, priority: 0,
    effect: { statChange: { target: 'self', stat: 'def', stages: 2 } },
    description: 'Surrounds self in a shield of water. Sharply raises Defense.',
    animation: 'water_shield',
  },

  // ══════════════════════════════
  // BLOOM MOVES
  // ══════════════════════════════
  root_barrage: {
    id: 'root_barrage', name: 'Root Barrage', essence: ESSENCE.BLOOM,
    category: MOVE_CATEGORY.STRIKE, power: 55, accuracy: 95, pp: 15, priority: 0,
    effect: { multiHit: { min: 2, max: 4 } },
    description: 'Strikes with a volley of roots. Hits 2-4 times.',
    animation: 'root_strike',
  },
  healing_radiance: {
    id: 'healing_radiance', name: 'Healing Radiance', essence: ESSENCE.BLOOM,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 8, priority: 0,
    effect: { heal: 0.5 },
    description: 'Emits a warm radiance that restores 50% max HP.',
    animation: 'heal_glow',
  },
  overgrowth_pulse: {
    id: 'overgrowth_pulse', name: 'Overgrowth Pulse', essence: ESSENCE.BLOOM,
    category: MOVE_CATEGORY.PULSE, power: 75, accuracy: 90, pp: 10, priority: 0,
    effect: { terrainSet: TERRAIN.OVERGROWN },
    description: 'Explosive plant growth. Sets Overgrown terrain.',
    animation: 'bloom_burst',
  },
  vine_whip: {
    id: 'vine_whip', name: 'Vine Whip', essence: ESSENCE.BLOOM,
    category: MOVE_CATEGORY.STRIKE, power: 45, accuracy: 100, pp: 20, priority: 0,
    effect: {},
    description: 'Lashes with a thorny vine.',
    animation: 'whip',
  },
  spore_cloud: {
    id: 'spore_cloud', name: 'Spore Cloud', essence: ESSENCE.BLOOM,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 80, pp: 10, priority: 0,
    effect: { status: STATUS.SLEEP },
    description: 'Releases sleep-inducing spores.',
    animation: 'spore',
  },

  // ══════════════════════════════
  // TERRA MOVES
  // ══════════════════════════════
  boulder_slam: {
    id: 'boulder_slam', name: 'Boulder Slam', essence: ESSENCE.TERRA,
    category: MOVE_CATEGORY.STRIKE, power: 75, accuracy: 90, pp: 12, priority: 0,
    effect: {},
    description: 'Slams a massive boulder onto the target.',
    animation: 'rock_drop',
  },
  prism_guard: {
    id: 'prism_guard', name: 'Prism Guard', essence: ESSENCE.TERRA,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 8, priority: 0,
    effect: { statChange: { target: 'self', stat: 'def', stages: 2 }, statChange2: { target: 'self', stat: 'spDef', stages: 1 } },
    description: 'Crystalline armor hardens. Sharply raises Defense and Sp.Def.',
    animation: 'crystal_shield',
  },
  earthquake: {
    id: 'earthquake', name: 'Earthquake', essence: ESSENCE.TERRA,
    category: MOVE_CATEGORY.STRIKE, power: 90, accuracy: 85, pp: 5, priority: 0,
    effect: {},
    description: 'Shakes the ground violently.',
    animation: 'quake',
  },
  mud_shot: {
    id: 'mud_shot', name: 'Mud Shot', essence: ESSENCE.TERRA,
    category: MOVE_CATEGORY.STRIKE, power: 50, accuracy: 95, pp: 15, priority: 0,
    effect: { statChange: { target: 'enemy', stat: 'spd', stages: -1 } },
    description: 'Hurls mud that lowers the target\'s Speed.',
    animation: 'mud_throw',
  },

  // ══════════════════════════════
  // FLUX MOVES
  // ══════════════════════════════
  thunderdive: {
    id: 'thunderdive', name: 'Thunderdive', essence: ESSENCE.FLUX,
    category: MOVE_CATEGORY.STRIKE, power: 70, accuracy: 90, pp: 12, priority: 0,
    effect: { chance: 20, status: STATUS.PARALYZE },
    description: 'Dives from above trailing lightning. May paralyze.',
    animation: 'lightning_dive',
  },
  static_pulse: {
    id: 'static_pulse', name: 'Static Pulse', essence: ESSENCE.FLUX,
    category: MOVE_CATEGORY.PULSE, power: 50, accuracy: 100, pp: 20, priority: 0,
    effect: { chance: 10, status: STATUS.PARALYZE },
    description: 'A burst of static energy.',
    animation: 'electric_pulse',
  },
  overcharge: {
    id: 'overcharge', name: 'Overcharge', essence: ESSENCE.FLUX,
    category: MOVE_CATEGORY.PULSE, power: 90, accuracy: 80, pp: 5, priority: 0,
    effect: { terrainSet: TERRAIN.CHARGED, recoil: 0.15 },
    description: 'Unleashes massive energy. Sets Charged Field. Takes recoil.',
    animation: 'lightning_explosion',
  },
  reality_tear: {
    id: 'reality_tear', name: 'Reality Tear', essence: ESSENCE.FLUX,
    category: MOVE_CATEGORY.PULSE, power: 120, accuracy: 70, pp: 3, priority: 0,
    effect: { terrainSet: TERRAIN.CHARGED },
    description: 'Tears reality itself. Immensely powerful but inaccurate.',
    animation: 'rift_tear',
  },
  surge: {
    id: 'surge', name: 'Surge', essence: ESSENCE.FLUX,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 10, priority: 0,
    effect: { statChange: { target: 'self', stat: 'spAtk', stages: 2 } },
    description: 'Charges up energy. Sharply raises Sp.Attack.',
    animation: 'charge_up',
  },

  // ══════════════════════════════
  // GALE MOVES
  // ══════════════════════════════
  steel_screech: {
    id: 'steel_screech', name: 'Steel Screech', essence: ESSENCE.GALE,
    category: MOVE_CATEGORY.PULSE, power: 60, accuracy: 90, pp: 15, priority: 0,
    effect: { statChange: { target: 'enemy', stat: 'def', stages: -1 } },
    description: 'A metallic screech that lowers the enemy\'s Defense.',
    animation: 'sonic_wave',
  },
  radiant_storm: {
    id: 'radiant_storm', name: 'Radiant Storm', essence: ESSENCE.GALE,
    category: MOVE_CATEGORY.PULSE, power: 95, accuracy: 80, pp: 5, priority: 0,
    effect: { chance: 15, status: STATUS.CONFUSE },
    description: 'A magnificent storm of golden lightning. May confuse.',
    animation: 'storm_golden',
  },
  tailwind: {
    id: 'tailwind', name: 'Tailwind', essence: ESSENCE.GALE,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 10, priority: 0,
    effect: { statChange: { target: 'self', stat: 'spd', stages: 2 } },
    description: 'Creates a tailwind. Sharply raises Speed.',
    animation: 'wind_boost',
  },
  air_slash: {
    id: 'air_slash', name: 'Air Slash', essence: ESSENCE.GALE,
    category: MOVE_CATEGORY.STRIKE, power: 60, accuracy: 95, pp: 15, priority: 0,
    effect: { chance: 15, flinch: true },
    description: 'Slashes with compressed air. May cause flinching.',
    animation: 'wind_slash',
  },

  // ══════════════════════════════
  // PSYCHE MOVES
  // ══════════════════════════════
  mind_drain: {
    id: 'mind_drain', name: 'Mind Drain', essence: ESSENCE.PSYCHE,
    category: MOVE_CATEGORY.PULSE, power: 60, accuracy: 100, pp: 15, priority: 0,
    effect: { drain: 0.5 },
    description: 'Drains mental energy. Restores HP equal to 50% of damage dealt.',
    animation: 'psyche_drain',
  },
  null_blaze: {
    id: 'null_blaze', name: 'Null Blaze', essence: ESSENCE.PSYCHE,
    category: MOVE_CATEGORY.PULSE, power: 80, accuracy: 85, pp: 8, priority: 0,
    effect: { chance: 20, status: STATUS.CONFUSE },
    description: 'Entropy-fire that distorts the mind. May confuse.',
    animation: 'void_fire',
  },
  hypnosis: {
    id: 'hypnosis', name: 'Hypnosis', essence: ESSENCE.PSYCHE,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 70, pp: 10, priority: 0,
    effect: { status: STATUS.SLEEP },
    description: 'Hypnotizes the target into sleep.',
    animation: 'hypno_spiral',
  },
  psyche_wave: {
    id: 'psyche_wave', name: 'Psyche Wave', essence: ESSENCE.PSYCHE,
    category: MOVE_CATEGORY.PULSE, power: 50, accuracy: 100, pp: 20, priority: 0,
    effect: {},
    description: 'A wave of psychic energy.',
    animation: 'psyche_wave',
  },

  // ══════════════════════════════
  // VOID MOVES
  // ══════════════════════════════
  shadow_bite: {
    id: 'shadow_bite', name: 'Shadow Bite', essence: ESSENCE.VOID,
    category: MOVE_CATEGORY.STRIKE, power: 60, accuracy: 95, pp: 15, priority: 0,
    effect: {},
    description: 'Bites with fangs forged from shadow.',
    animation: 'shadow_strike',
  },
  void_pulse: {
    id: 'void_pulse', name: 'Void Pulse', essence: ESSENCE.VOID,
    category: MOVE_CATEGORY.PULSE, power: 70, accuracy: 90, pp: 12, priority: 0,
    effect: { terrainSet: TERRAIN.VOID_ZONE },
    description: 'A pulse of nothingness. Sets Void Zone terrain.',
    animation: 'void_pulse',
  },
  entropy_wave: {
    id: 'entropy_wave', name: 'Entropy Wave', essence: ESSENCE.VOID,
    category: MOVE_CATEGORY.PULSE, power: 85, accuracy: 85, pp: 8, priority: 0,
    effect: { statChange: { target: 'enemy', stat: 'spAtk', stages: -1 } },
    description: 'A wave that decays everything it touches. Lowers Sp.Atk.',
    animation: 'entropy',
  },
  dark_shroud: {
    id: 'dark_shroud', name: 'Dark Shroud', essence: ESSENCE.VOID,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 10, priority: 0,
    effect: { statChange: { target: 'enemy', stat: 'accuracy', stages: -2 } },
    description: 'Cloaks the field in darkness. Sharply lowers enemy accuracy.',
    animation: 'dark_cloud',
  },

  // ══════════════════════════════
  // LUMEN MOVES
  // ══════════════════════════════
  light_beam: {
    id: 'light_beam', name: 'Light Beam', essence: ESSENCE.LUMEN,
    category: MOVE_CATEGORY.PULSE, power: 65, accuracy: 100, pp: 15, priority: 0,
    effect: {},
    description: 'A concentrated beam of pure light.',
    animation: 'light_beam',
  },
  luminous_aura: {
    id: 'luminous_aura', name: 'Luminous Aura', essence: ESSENCE.LUMEN,
    category: MOVE_CATEGORY.FIELD, power: 0, accuracy: 100, pp: 5, priority: 0,
    effect: { terrainSet: TERRAIN.LUMINOUS },
    description: 'Bathes the field in light. Sets Luminous Aura terrain.',
    animation: 'light_terrain',
  },
  solar_flare: {
    id: 'solar_flare', name: 'Solar Flare', essence: ESSENCE.LUMEN,
    category: MOVE_CATEGORY.PULSE, power: 90, accuracy: 85, pp: 5, priority: 0,
    effect: { chance: 20, status: STATUS.BURN },
    description: 'An intense flare of solar energy. May burn.',
    animation: 'solar_explosion',
  },
  purify: {
    id: 'purify', name: 'Purify', essence: ESSENCE.LUMEN,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 8, priority: 0,
    effect: { cureStatus: true, heal: 0.25 },
    description: 'Purifies ailments and restores 25% HP.',
    animation: 'heal_light',
  },

  // ══════════════════════════════
  // FORGE MOVES
  // ══════════════════════════════
  iron_bash: {
    id: 'iron_bash', name: 'Iron Bash', essence: ESSENCE.FORGE,
    category: MOVE_CATEGORY.STRIKE, power: 70, accuracy: 90, pp: 12, priority: 0,
    effect: {},
    description: 'Bashes with a hardened iron body part.',
    animation: 'metal_strike',
  },
  gear_grind: {
    id: 'gear_grind', name: 'Gear Grind', essence: ESSENCE.FORGE,
    category: MOVE_CATEGORY.STRIKE, power: 50, accuracy: 85, pp: 15, priority: 0,
    effect: { multiHit: { min: 2, max: 2 } },
    description: 'Grinds the target between gears. Hits twice.',
    animation: 'gear_spin',
  },
  metal_coat: {
    id: 'metal_coat', name: 'Metal Coat', essence: ESSENCE.FORGE,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 10, priority: 0,
    effect: { statChange: { target: 'self', stat: 'def', stages: 2 } },
    description: 'Coats body in metal. Sharply raises Defense.',
    animation: 'metal_shield',
  },
  forge_cannon: {
    id: 'forge_cannon', name: 'Forge Cannon', essence: ESSENCE.FORGE,
    category: MOVE_CATEGORY.PULSE, power: 95, accuracy: 80, pp: 5, priority: 0,
    effect: { statChange: { target: 'self', stat: 'spAtk', stages: -1 } },
    description: 'Fires a devastating cannon blast. Lowers own Sp.Attack.',
    animation: 'cannon_blast',
  },

  // ══════════════════════════════
  // UNIVERSAL MOVES (learnable by many)
  // ══════════════════════════════
  tackle: {
    id: 'tackle', name: 'Tackle', essence: ESSENCE.TERRA,
    category: MOVE_CATEGORY.STRIKE, power: 40, accuracy: 100, pp: 25, priority: 0,
    effect: {},
    description: 'A basic physical charge.',
    animation: 'tackle',
  },
  growl: {
    id: 'growl', name: 'Growl', essence: ESSENCE.TERRA,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 20, priority: 0,
    effect: { statChange: { target: 'enemy', stat: 'atk', stages: -1 } },
    description: 'An intimidating growl that lowers Attack.',
    animation: 'growl',
  },
  rest: {
    id: 'rest', name: 'Rest', essence: ESSENCE.PSYCHE,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 5, priority: 0,
    effect: { heal: 1.0, status: STATUS.SLEEP, selfSleep: 2 },
    description: 'Falls asleep to fully heal. Sleeps for 2 turns.',
    animation: 'sleep',
  },
  protect: {
    id: 'protect', name: 'Protect', essence: ESSENCE.FORGE,
    category: MOVE_CATEGORY.STATUS, power: 0, accuracy: 100, pp: 5, priority: 3,
    effect: { protect: true },
    description: 'Completely blocks the next attack. May fail if used consecutively.',
    animation: 'shield',
  },
};

export function getMove(id) {
  return MOVES[id] || null;
}

export function getMovesByEssence(essence) {
  return Object.values(MOVES).filter(m => m.essence === essence);
}
