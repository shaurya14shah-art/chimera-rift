/* ═══════════════════════════════════════════════════
   ChimeraData.js — All 15 Chimera species definitions
   ═══════════════════════════════════════════════════ */

import { ESSENCE } from '../constants.js';

/**
 * Species Definition:
 * {
 *   id: string,
 *   name: string,
 *   essences: [ESSENCE, ESSENCE],
 *   description: string,
 *   baseStats: { hp, atk, def, spAtk, spDef, spd },
 *   learnset: { level: moveId, ... },
 *   catchDifficulty: number (1-5, higher = harder),
 *   evolves: { into: string, level: number, bondReq: number } | null,
 *   signature: string (move id),
 *   cryFreqs: [number, number] (frequencies for procedural cry SFX),
 * }
 */

export const CHIMERA_DATA = {
  cinderpup: {
    id: 'cinderpup',
    name: 'Cinderpup',
    essences: [ESSENCE.EMBER, ESSENCE.TERRA],
    description: 'A smoldering wolf cub with magma veins glowing beneath cracked stone fur. Found near volcanic vents.',
    baseStats: { hp: 48, atk: 55, def: 45, spAtk: 50, spDef: 40, spd: 52 },
    learnset: {
      1: 'tackle',
      1.1: 'growl',
      5: 'molten_howl',
      9: 'mud_shot',
      13: 'flame_fang',
      17: 'boulder_slam',
      22: 'inferno_rush',
    },
    catchDifficulty: 1.5,
    evolves: { into: 'emberclaw', level: 18, bondReq: 50 },
    signature: 'molten_howl',
    cryFreqs: [220, 330],
  },

  aquillume: {
    id: 'aquillume',
    name: 'Aquillume',
    essences: [ESSENCE.TIDE, ESSENCE.LUMEN],
    description: 'A bioluminescent jellyfish that floats on air, trailing prismatic tentacles. Seen near dawn.',
    baseStats: { hp: 55, atk: 30, def: 40, spAtk: 65, spDef: 60, spd: 45 },
    learnset: {
      1: 'prism_tide',
      1.1: 'light_beam',
      6: 'aqua_shield',
      10: 'dream_current',
      14: 'luminous_aura',
      19: 'deluge',
      24: 'solar_flare',
    },
    catchDifficulty: 2,
    evolves: null,
    signature: 'prism_tide',
    cryFreqs: [400, 600],
  },

  thornsprout: {
    id: 'thornsprout',
    name: 'Thornsprout',
    essences: [ESSENCE.BLOOM, ESSENCE.TERRA],
    description: 'A walking seedling with a massive thorn-covered shell like a chestnut. Patient and sturdy.',
    baseStats: { hp: 55, atk: 50, def: 65, spAtk: 40, spDef: 55, spd: 25 },
    learnset: {
      1: 'tackle',
      1.1: 'vine_whip',
      5: 'root_barrage',
      9: 'mud_shot',
      13: 'prism_guard',
      17: 'overgrowth_pulse',
      21: 'healing_radiance',
    },
    catchDifficulty: 1.5,
    evolves: null,
    signature: 'root_barrage',
    cryFreqs: [180, 240],
  },

  zephyrix: {
    id: 'zephyrix',
    name: 'Zephyrix',
    essences: [ESSENCE.GALE, ESSENCE.FLUX],
    description: 'A crackling storm-hawk made of compressed wind and static electricity. Rides the thermals.',
    baseStats: { hp: 42, atk: 45, def: 35, spAtk: 60, spDef: 40, spd: 70 },
    learnset: {
      1: 'static_pulse',
      1.1: 'air_slash',
      6: 'thunderdive',
      10: 'tailwind',
      14: 'steel_screech',
      18: 'overcharge',
    },
    catchDifficulty: 2,
    evolves: { into: 'galecrest', level: 22, bondReq: 60 },
    signature: 'thunderdive',
    cryFreqs: [500, 700],
  },

  gloomoth: {
    id: 'gloomoth',
    name: 'Gloomoth',
    essences: [ESSENCE.VOID, ESSENCE.PSYCHE],
    description: 'A moth with wings that display hypnotic, shifting void-patterns. Comes out at twilight.',
    baseStats: { hp: 50, atk: 35, def: 40, spAtk: 65, spDef: 55, spd: 50 },
    learnset: {
      1: 'psyche_wave',
      1.1: 'shadow_bite',
      5: 'mind_drain',
      9: 'hypnosis',
      13: 'void_pulse',
      17: 'null_blaze',
      22: 'entropy_wave',
    },
    catchDifficulty: 2.5,
    evolves: null,
    signature: 'mind_drain',
    cryFreqs: [300, 180],
  },

  ferrowl: {
    id: 'ferrowl',
    name: 'Ferrowl',
    essences: [ESSENCE.FORGE, ESSENCE.GALE],
    description: 'An owl constructed from interlocking metal feathers that ring like chimes in the wind.',
    baseStats: { hp: 50, atk: 45, def: 60, spAtk: 55, spDef: 50, spd: 40 },
    learnset: {
      1: 'iron_bash',
      1.1: 'air_slash',
      6: 'steel_screech',
      10: 'gear_grind',
      14: 'metal_coat',
      18: 'forge_cannon',
      22: 'tailwind',
    },
    catchDifficulty: 2,
    evolves: null,
    signature: 'steel_screech',
    cryFreqs: [350, 500],
  },

  emberclaw: {
    id: 'emberclaw',
    name: 'Emberclaw',
    essences: [ESSENCE.EMBER, ESSENCE.VOID],
    description: 'Cinderpup\'s evolution — a dire wolf wreathed in dark flame. Its howl curdles the air.',
    baseStats: { hp: 70, atk: 85, def: 65, spAtk: 75, spDef: 55, spd: 72 },
    learnset: {
      1: 'flame_fang',
      1.1: 'shadow_bite',
      1.2: 'molten_howl',
      20: 'shadowburn',
      25: 'entropy_wave',
      30: 'inferno_rush',
    },
    catchDifficulty: 3.5,
    evolves: null,
    signature: 'shadowburn',
    cryFreqs: [150, 250],
  },

  tidalynx: {
    id: 'tidalynx',
    name: 'Tidalynx',
    essences: [ESSENCE.TIDE, ESSENCE.GALE],
    description: 'A sleek water-lynx that runs across water surfaces at blinding speed. Impossible to outrun.',
    baseStats: { hp: 50, atk: 60, def: 45, spAtk: 50, spDef: 45, spd: 80 },
    learnset: {
      1: 'torrent_rush',
      1.1: 'air_slash',
      6: 'prism_tide',
      10: 'tailwind',
      14: 'deluge',
      18: 'radiant_storm',
    },
    catchDifficulty: 2.5,
    evolves: null,
    signature: 'torrent_rush',
    cryFreqs: [420, 560],
  },

  crystalisk: {
    id: 'crystalisk',
    name: 'Crystalisk',
    essences: [ESSENCE.TERRA, ESSENCE.FORGE],
    description: 'A lumbering tortoise with a shell of living crystal that refracts light into rainbows.',
    baseStats: { hp: 75, atk: 55, def: 90, spAtk: 40, spDef: 70, spd: 15 },
    learnset: {
      1: 'tackle',
      1.1: 'iron_bash',
      6: 'prism_guard',
      10: 'boulder_slam',
      14: 'metal_coat',
      18: 'earthquake',
      22: 'forge_cannon',
    },
    catchDifficulty: 2,
    evolves: null,
    signature: 'prism_guard',
    cryFreqs: [120, 180],
  },

  lumifae: {
    id: 'lumifae',
    name: 'Lumifae',
    essences: [ESSENCE.LUMEN, ESSENCE.BLOOM],
    description: 'A tiny fairy-deer with antlers that grow flowers of pure light. Gentle and empathic.',
    baseStats: { hp: 55, atk: 30, def: 45, spAtk: 60, spDef: 65, spd: 50 },
    learnset: {
      1: 'light_beam',
      1.1: 'vine_whip',
      5: 'healing_radiance',
      9: 'spore_cloud',
      13: 'luminous_aura',
      17: 'purify',
      21: 'solar_flare',
    },
    catchDifficulty: 2.5,
    evolves: null,
    signature: 'healing_radiance',
    cryFreqs: [550, 700],
  },

  psywyrm: {
    id: 'psywyrm',
    name: 'Psywyrm',
    essences: [ESSENCE.PSYCHE, ESSENCE.TIDE],
    description: 'A serpentine dragon that swims through thoughts as easily as water. Old and wise.',
    baseStats: { hp: 60, atk: 45, def: 50, spAtk: 75, spDef: 60, spd: 55 },
    learnset: {
      1: 'psyche_wave',
      1.1: 'prism_tide',
      6: 'dream_current',
      10: 'mind_drain',
      14: 'aqua_shield',
      18: 'null_blaze',
      22: 'deluge',
    },
    catchDifficulty: 3,
    evolves: null,
    signature: 'dream_current',
    cryFreqs: [280, 400],
  },

  voidmaw: {
    id: 'voidmaw',
    name: 'Voidmaw',
    essences: [ESSENCE.VOID, ESSENCE.EMBER],
    description: 'A nightmarish salamander that breathes entropy-fire, erasing what it touches from existence.',
    baseStats: { hp: 65, atk: 75, def: 55, spAtk: 80, spDef: 45, spd: 40 },
    learnset: {
      1: 'shadow_bite',
      1.1: 'molten_howl',
      6: 'flame_fang',
      10: 'void_pulse',
      14: 'null_blaze',
      18: 'shadowburn',
      22: 'entropy_wave',
    },
    catchDifficulty: 3,
    evolves: null,
    signature: 'null_blaze',
    cryFreqs: [100, 200],
  },

  galecrest: {
    id: 'galecrest',
    name: 'Galecrest',
    essences: [ESSENCE.GALE, ESSENCE.LUMEN],
    description: 'Zephyrix\'s evolution — a magnificent storm-eagle with golden lightning trailing its wings.',
    baseStats: { hp: 65, atk: 60, def: 55, spAtk: 85, spDef: 60, spd: 95 },
    learnset: {
      1: 'air_slash',
      1.1: 'light_beam',
      1.2: 'thunderdive',
      24: 'radiant_storm',
      28: 'luminous_aura',
      32: 'solar_flare',
    },
    catchDifficulty: 4,
    evolves: null,
    signature: 'radiant_storm',
    cryFreqs: [600, 800],
  },

  floracore: {
    id: 'floracore',
    name: 'Floracore',
    essences: [ESSENCE.BLOOM, ESSENCE.FLUX],
    description: 'A walking tree whose roots crackle with unstable energy. Found where Rifts touch forests.',
    baseStats: { hp: 70, atk: 55, def: 60, spAtk: 70, spDef: 55, spd: 35 },
    learnset: {
      1: 'vine_whip',
      1.1: 'static_pulse',
      6: 'root_barrage',
      10: 'overgrowth_pulse',
      14: 'thunderdive',
      18: 'overcharge',
      22: 'healing_radiance',
    },
    catchDifficulty: 2.5,
    evolves: null,
    signature: 'overgrowth_pulse',
    cryFreqs: [200, 350],
  },

  riftborn: {
    id: 'riftborn',
    name: 'Riftborn',
    essences: [ESSENCE.FLUX, ESSENCE.VOID],
    description: 'A mysterious entity of fractured geometry. The "legendary" of Prism Town\'s Rift. Reality bends around it.',
    baseStats: { hp: 80, atk: 70, def: 70, spAtk: 100, spDef: 80, spd: 75 },
    learnset: {
      1: 'static_pulse',
      1.1: 'shadow_bite',
      10: 'void_pulse',
      15: 'overcharge',
      20: 'entropy_wave',
      25: 'reality_tear',
      30: 'dark_shroud',
    },
    catchDifficulty: 5,
    evolves: null,
    signature: 'reality_tear',
    cryFreqs: [150, 650],
  },
};

export function getChimeraData(id) {
  return CHIMERA_DATA[id] || null;
}

export function getAllChimeraIds() {
  return Object.keys(CHIMERA_DATA);
}

export function getStarterChimeras() {
  return ['cinderpup', 'aquillume', 'thornsprout'];
}

export function getWildChimerasForRoute(routeId) {
  const routes = {
    route_1: [
      { id: 'cinderpup', level: [3, 6], weight: 30 },
      { id: 'thornsprout', level: [3, 5], weight: 30 },
      { id: 'aquillume', level: [3, 6], weight: 20 },
      { id: 'lumifae', level: [4, 6], weight: 10 },
      { id: 'floracore', level: [5, 7], weight: 10 },
    ],
    route_2: [
      { id: 'zephyrix', level: [6, 9], weight: 25 },
      { id: 'ferrowl', level: [7, 9], weight: 20 },
      { id: 'gloomoth', level: [7, 10], weight: 20 },
      { id: 'tidalynx', level: [8, 10], weight: 15 },
      { id: 'psywyrm', level: [8, 11], weight: 10 },
      { id: 'crystalisk', level: [7, 9], weight: 10 },
    ],
    route_3: [
      { id: 'voidmaw', level: [9, 12], weight: 20 },
      { id: 'gloomoth', level: [9, 11], weight: 25 },
      { id: 'psywyrm', level: [10, 12], weight: 20 },
      { id: 'emberclaw', level: [12, 15], weight: 5 },
      { id: 'floracore', level: [9, 11], weight: 15 },
      { id: 'ferrowl', level: [9, 11], weight: 15 },
    ],
    verdant_rift: [
      { id: 'floracore', level: [10, 14], weight: 30 },
      { id: 'thornsprout', level: [10, 13], weight: 25 },
      { id: 'lumifae', level: [11, 14], weight: 20 },
      { id: 'gloomoth', level: [12, 14], weight: 15 },
      { id: 'riftborn', level: [15, 15], weight: 1 }, // Legendary — ultra rare
    ],
    crystal_rift: [
      { id: 'crystalisk', level: [12, 15], weight: 30 },
      { id: 'ferrowl', level: [12, 14], weight: 25 },
      { id: 'voidmaw', level: [13, 15], weight: 20 },
      { id: 'zephyrix', level: [12, 14], weight: 15 },
      { id: 'riftborn', level: [15, 15], weight: 1 }, // Legendary — ultra rare
    ],
  };
  return routes[routeId] || routes.route_1;
}
