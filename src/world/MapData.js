/* ═══════════════════════════════════════════════════
   MapData.js — All map definitions for Chapter 1
   Each map is a grid of tile IDs + metadata
   ═══════════════════════════════════════════════════ */

import { TILE_SIZE } from '../constants.js';

// Tile Legend:
// 1=grass_light, 2=grass_dark, 3=dirt, 4=stone, 5-8=water(animated),
// 9=wall, 10=tall_grass(encounter), 11=sand, 12=cave_floor, 13=rift_floor,
// 14=cobblestone, 15=flower, 16=tree_trunk, 17=tree_canopy, 18=house_wall,
// 19=house_roof, 20=door, 21=window, 22=heal, 23=shop

function generateMap(width, height, genFn) {
  const layers = {
    ground: new Array(width * height).fill(0),
    decoration: new Array(width * height).fill(0),
    collision: new Array(width * height).fill(0),
    above: new Array(width * height).fill(0),
    encounter: new Array(width * height).fill(0),
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const result = genFn(x, y, width, height);
      if (result.ground) layers.ground[idx] = result.ground;
      if (result.decoration) layers.decoration[idx] = result.decoration;
      if (result.collision) layers.collision[idx] = result.collision;
      if (result.above) layers.above[idx] = result.above;
      if (result.encounter) layers.encounter[idx] = result.encounter;
    }
  }

  return layers;
}

// ═══════════════════════════════════════════════════
// PRISM TOWN — Starting town
// ═══════════════════════════════════════════════════
export const PRISM_TOWN = {
  id: 'prism_town',
  name: 'Prism Town',
  width: 30,
  height: 25,
  biome: 'town',
  music: 'town',
  layers: generateMap(30, 25, (x, y, w, h) => {
    // Border walls
    if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
      if (x === 15 && y === 24) return { ground: 3 }; // Path out
      return { ground: 9, collision: 1 };
    }

    // Town cobblestone center
    if (x >= 8 && x <= 22 && y >= 6 && y <= 18) {
      // Professor's Lab (top center)
      if (y >= 6 && y <= 9 && x >= 12 && x <= 18) {
        if (y === 6) return { ground: 19, collision: 1 }; // Roof
        if (y === 9 && x === 15) return { ground: 20 }; // Door
        if (y === 7 && (x === 14 || x === 16)) return { ground: 21, collision: 1 }; // Windows
        return { ground: 18, collision: 1 }; // Walls
      }

      // Heal Center (left)
      if (y >= 12 && y <= 15 && x >= 8 && x <= 12) {
        if (y === 12) return { ground: 19, collision: 1 };
        if (y === 15 && x === 10) return { ground: 20 };
        if (y === 13 && x === 10) return { ground: 22, collision: 1 }; // Heal cross
        return { ground: 18, collision: 1 };
      }

      // Shop (right)
      if (y >= 12 && y <= 15 && x >= 18 && x <= 22) {
        if (y === 12) return { ground: 19, collision: 1 };
        if (y === 15 && x === 20) return { ground: 20 };
        if (y === 13 && x === 20) return { ground: 23, collision: 1 }; // Shop sign
        return { ground: 18, collision: 1 };
      }

      return { ground: 14 }; // Cobblestone
    }

    // Path from town to Route 1 (bottom)
    if (x >= 14 && x <= 16 && y >= 18) {
      return { ground: 3 }; // Dirt path
    }

    // Trees around border
    if ((x < 3 || x > w - 4 || y < 3 || y > h - 4) && Math.random() < 0.4) {
      return { ground: 1, decoration: 16, collision: 1, above: 17 };
    }

    // Flowers
    if (Math.random() < 0.1) {
      return { ground: 15 };
    }

    // Default grass
    return { ground: (x + y) % 3 === 0 ? 2 : 1 };
  }),
  npcs: [
    {
      id: 'rival_kael', name: 'Kael', x: 13, y: 17,
      sprite: 'npc_rival', direction: 'up',
      dialog: [
        { speaker: 'Kael', text: "So you're a Rift Walker too? Don't get in my way." },
        { speaker: 'Kael', text: "Chimeras are tools. The sooner you learn that, the better." },
        { speaker: 'Kael', text: "Let me show you how it's done!" },
      ],
      event: 'RIVAL_BATTLE_1',
      condition: 'HAS_STARTER',
    },
  ],
  warps: [
    { x: 15, y: 24, target: 'route_1', spawnX: 15, spawnY: 1 },
    { x: 15, y: 9, target: 'prof_lab', spawnX: 5, spawnY: 8 },
    { x: 10, y: 15, target: 'heal_center', spawnX: 5, spawnY: 8 },
    { x: 20, y: 15, target: 'shop', spawnX: 5, spawnY: 8 },
  ],
  playerSpawn: { x: 15, y: 20 },
};

// ═══════════════════════════════════════════════════
// ROUTE 1 — First wilderness route
// ═══════════════════════════════════════════════════
export const ROUTE_1 = {
  id: 'route_1',
  name: 'Rift Path',
  width: 30,
  height: 40,
  biome: 'meadow',
  music: 'overworld',
  layers: generateMap(30, 40, (x, y, w, h) => {
    // Borders
    if (x === 0 || x === w - 1) return { ground: 9, collision: 1 };
    if (y === 0 || y === h - 1) return { ground: 3 }; // Open for warps

    // Main path (winding)
    const pathCenterX = 15 + Math.sin(y * 0.2) * 4;
    if (Math.abs(x - pathCenterX) < 2) return { ground: 3 };

    // Water (small pond)
    if (x >= 20 && x <= 24 && y >= 15 && y <= 18) {
      return { ground: 5, collision: 1 };
    }

    // Tall grass (encounter zones)
    if (y >= 5 && y <= 12 && x >= 3 && x <= 12) {
      return { ground: 1, encounter: 10 };
    }
    if (y >= 20 && y <= 28 && x >= 18 && x <= 26) {
      return { ground: 2, encounter: 10 };
    }
    if (y >= 32 && y <= 37 && x >= 5 && x <= 15) {
      return { ground: 1, encounter: 10 };
    }

    // Trees (scattered)
    if (Math.random() < 0.06 && Math.abs(x - pathCenterX) > 4) {
      return { ground: 1, decoration: 16, collision: 1, above: 17 };
    }

    // Flowers
    if (Math.random() < 0.08) return { ground: 15 };

    return { ground: (x + y) % 3 === 0 ? 2 : 1 };
  }),
  npcs: [
    {
      id: 'trainer_1', name: 'Bug Catcher Leo', x: 10, y: 10,
      sprite: 'npc_trainer', direction: 'down',
      isTrainer: true,
      party: [
        { species: 'thornsprout', level: 5 },
      ],
      dialog: [
        { speaker: 'Bug Catcher Leo', text: "I just caught a Thornsprout! Want to see how strong it is?" },
      ],
      defeatDialog: [
        { speaker: 'Bug Catcher Leo', text: "Wow, your Chimera is tough! I need to train more." },
      ],
    },
    {
      id: 'trainer_2', name: 'Hiker Bram', x: 22, y: 25,
      sprite: 'npc_trainer', direction: 'left',
      isTrainer: true,
      party: [
        { species: 'cinderpup', level: 6 },
        { species: 'crystalisk', level: 5 },
      ],
      dialog: [
        { speaker: 'Hiker Bram', text: "These mountains are full of Terra-essence Chimeras!" },
      ],
      defeatDialog: [
        { speaker: 'Hiker Bram', text: "You've got real talent as a Rift Walker." },
      ],
    },
  ],
  warps: [
    { x: 15, y: 0, target: 'prism_town', spawnX: 15, spawnY: 23 },
    { x: 5, y: 39, target: 'route_2', spawnX: 5, spawnY: 1 },
    { x: 25, y: 39, target: 'route_3', spawnX: 25, spawnY: 1 },
  ],
  encounterRate: 0.08,
  encounterTable: 'route_1',
  playerSpawn: { x: 15, y: 2 },
};

// ═══════════════════════════════════════════════════
// ROUTE 2 — Path to Verdant Rift
// ═══════════════════════════════════════════════════
export const ROUTE_2 = {
  id: 'route_2',
  name: 'Verdant Way',
  width: 25,
  height: 35,
  biome: 'meadow',
  music: 'overworld',
  layers: generateMap(25, 35, (x, y, w, h) => {
    if (x === 0 || x === w - 1) return { ground: 9, collision: 1 };
    if (y === 0 || y === h - 1) return { ground: 3 };

    // Dense forest feel
    if (Math.random() < 0.12 && x > 2 && x < w - 3) {
      return { ground: 2, decoration: 16, collision: 1, above: 17 };
    }

    // Encounter zones
    if (y >= 10 && y <= 18 && x >= 3 && x <= 20) {
      if (Math.random() < 0.6) return { ground: 2, encounter: 10 };
    }
    if (y >= 25 && y <= 30 && x >= 5 && x <= 18) {
      if (Math.random() < 0.5) return { ground: 2, encounter: 10 };
    }

    // Path
    if (Math.abs(x - 12) < 2) return { ground: 3 };

    return { ground: (x + y) % 2 === 0 ? 1 : 2 };
  }),
  npcs: [
    {
      id: 'trainer_3', name: 'Ranger Ivy', x: 12, y: 15,
      sprite: 'npc_trainer', direction: 'down',
      isTrainer: true,
      party: [
        { species: 'floracore', level: 8 },
        { species: 'lumifae', level: 7 },
      ],
      dialog: [
        { speaker: 'Ranger Ivy', text: "The Verdant Rift is just ahead. Be careful — it's dense in there." },
      ],
      defeatDialog: [
        { speaker: 'Ranger Ivy', text: "You'll do fine in the Rift. Trust your Chimeras." },
      ],
    },
  ],
  warps: [
    { x: 5, y: 0, target: 'route_1', spawnX: 5, spawnY: 38 },
    { x: 12, y: 34, target: 'verdant_rift', spawnX: 12, spawnY: 1 },
  ],
  encounterRate: 0.10,
  encounterTable: 'route_2',
  playerSpawn: { x: 5, y: 2 },
};

// ═══════════════════════════════════════════════════
// ROUTE 3 — Path to Crystal Rift
// ═══════════════════════════════════════════════════
export const ROUTE_3 = {
  id: 'route_3',
  name: 'Crystal Path',
  width: 25,
  height: 35,
  biome: 'meadow',
  music: 'overworld',
  layers: generateMap(25, 35, (x, y, w, h) => {
    if (x === 0 || x === w - 1) return { ground: 9, collision: 1 };
    if (y === 0 || y === h - 1) return { ground: 3 };

    // Rocky terrain
    if (Math.random() < 0.08) return { ground: 4, collision: Math.random() < 0.5 ? 1 : 0 };

    // Encounter zones
    if (y >= 8 && y <= 16 && x >= 4 && x <= 20) {
      if (Math.random() < 0.5) return { ground: 1, encounter: 10 };
    }
    if (y >= 22 && y <= 30 && x >= 3 && x <= 18) {
      if (Math.random() < 0.5) return { ground: 2, encounter: 10 };
    }

    // Path
    if (Math.abs(x - 13) < 2) return { ground: 3 };

    return { ground: (x + y) % 4 === 0 ? 4 : 1 };
  }),
  npcs: [
    {
      id: 'trainer_4', name: 'Scholar Elan', x: 13, y: 12,
      sprite: 'npc_trainer', direction: 'down',
      isTrainer: true,
      party: [
        { species: 'gloomoth', level: 9 },
        { species: 'psywyrm', level: 8 },
      ],
      dialog: [
        { speaker: 'Scholar Elan', text: "The Crystal Rift contains Forge and Terra essence Chimeras." },
      ],
      defeatDialog: [
        { speaker: 'Scholar Elan', text: "Interesting... Your bond with your Chimeras is unusually strong." },
      ],
    },
  ],
  warps: [
    { x: 25, y: 0, target: 'route_1', spawnX: 25, spawnY: 38 },
    { x: 13, y: 34, target: 'crystal_rift', spawnX: 13, spawnY: 1 },
  ],
  encounterRate: 0.10,
  encounterTable: 'route_3',
  playerSpawn: { x: 25, y: 2 },
};

// ═══════════════════════════════════════════════════
// VERDANT RIFT — First dungeon
// ═══════════════════════════════════════════════════
export const VERDANT_RIFT = {
  id: 'verdant_rift',
  name: 'Verdant Rift',
  width: 20,
  height: 25,
  biome: 'rift',
  music: 'boss',
  layers: generateMap(20, 25, (x, y, w, h) => {
    if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
      if (x === 12 && y === 0) return { ground: 13 }; // Warp out
      return { ground: 9, collision: 1 };
    }

    // Rift floor with encounter zones
    if (Math.random() < 0.5 && y > 3 && y < h - 3 && x > 2 && x < w - 3) {
      return { ground: 13, encounter: 10 };
    }

    return { ground: 13 };
  }),
  npcs: [],
  warps: [
    { x: 12, y: 0, target: 'route_2', spawnX: 12, spawnY: 33 },
  ],
  encounterRate: 0.12,
  encounterTable: 'verdant_rift',
  playerSpawn: { x: 10, y: 2 },
};

// ═══════════════════════════════════════════════════
// CRYSTAL RIFT — Second dungeon
// ═══════════════════════════════════════════════════
export const CRYSTAL_RIFT = {
  id: 'crystal_rift',
  name: 'Crystal Rift',
  width: 20,
  height: 25,
  biome: 'rift',
  music: 'boss',
  layers: generateMap(20, 25, (x, y, w, h) => {
    if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
      if (x === 13 && y === 0) return { ground: 12 }; // Warp out
      return { ground: 9, collision: 1 };
    }

    if (Math.random() < 0.5 && y > 3 && y < h - 3 && x > 2 && x < w - 3) {
      return { ground: 12, encounter: 10 };
    }

    return { ground: 12 };
  }),
  npcs: [],
  warps: [
    { x: 13, y: 0, target: 'route_3', spawnX: 13, spawnY: 33 },
  ],
  encounterRate: 0.12,
  encounterTable: 'crystal_rift',
  playerSpawn: { x: 10, y: 2 },
};

// ═══════════════════════════════════════════════════
// INTERIORS
// ═══════════════════════════════════════════════════
export const PROF_LAB = {
  id: 'prof_lab',
  name: "Professor's Lab",
  width: 12,
  height: 10,
  biome: 'town',
  music: 'town',
  layers: generateMap(12, 10, (x, y, w, h) => {
    if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
      if (x === 5 && y === h - 1) return { ground: 14 }; // Door
      return { ground: 18, collision: 1 }; // Walls
    }
    return { ground: 14 }; // Floor
  }),
  npcs: [
    {
      id: 'prof_lumen', name: 'Professor Lumen', x: 5, y: 3,
      sprite: 'npc_professor', direction: 'down',
      dialog: [
        { speaker: 'Prof. Lumen', text: "Ah, you must be the new Rift Walker! I'm Professor Lumen." },
        { speaker: 'Prof. Lumen', text: "The Prism shattered a thousand years ago, creating the Rifts that overlay our world." },
        { speaker: 'Prof. Lumen', text: "Where Rifts collide, hybrid creatures called Chimeras are born." },
        { speaker: 'Prof. Lumen', text: "I'd like you to have one of these Chimeras to start your journey." },
        { speaker: 'Prof. Lumen', text: "Choose wisely — your bond with your first Chimera will shape everything." },
      ],
      event: 'STARTER_CHOICE',
    }
  ],
  warps: [
    { x: 5, y: 9, target: 'prism_town', spawnX: 15, spawnY: 10 },
  ],
  playerSpawn: { x: 5, y: 8 },
};

export const HEAL_CENTER = {
  id: 'heal_center',
  name: 'Heal Center',
  width: 12,
  height: 10,
  biome: 'town',
  music: 'town',
  layers: generateMap(12, 10, (x, y, w, h) => {
    if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
      if (x === 5 && y === h - 1) return { ground: 14 }; // Door
      return { ground: 18, collision: 1 };
    }
    if (x >= 4 && x <= 6 && y === 4) return { ground: 22, collision: 1 }; // Counter
    return { ground: 14 };
  }),
  npcs: [
    {
      id: 'nurse', name: 'Nurse Aria', x: 5, y: 3,
      sprite: 'npc_nurse', direction: 'down',
      dialog: [
        { speaker: 'Nurse Aria', text: "Welcome to the Heal Center! I'll restore your Chimeras to full health." },
      ],
      event: 'HEAL_PARTY',
    }
  ],
  warps: [
    { x: 5, y: 9, target: 'prism_town', spawnX: 10, spawnY: 16 },
  ],
  playerSpawn: { x: 5, y: 8 },
};

export const SHOP = {
  id: 'shop',
  name: 'Prism Shop',
  width: 12,
  height: 10,
  biome: 'town',
  music: 'town',
  layers: generateMap(12, 10, (x, y, w, h) => {
    if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
      if (x === 5 && y === h - 1) return { ground: 14 }; // Door
      return { ground: 18, collision: 1 };
    }
    if (x >= 4 && x <= 6 && y === 4) return { ground: 23, collision: 1 }; // Counter
    return { ground: 14 };
  }),
  npcs: [
    {
      id: 'shopkeeper', name: 'Merchant Daro', x: 5, y: 3,
      sprite: 'npc_shop', direction: 'down',
      dialog: [
        { speaker: 'Merchant Daro', text: "Welcome! Need supplies for the Rifts? I've got Rift Capsules and Potions." },
      ],
      event: 'OPEN_SHOP',
    }
  ],
  warps: [
    { x: 5, y: 9, target: 'prism_town', spawnX: 20, spawnY: 16 },
  ],
  playerSpawn: { x: 5, y: 8 },
};

// ── Map Registry ──
export const ALL_MAPS = {
  prism_town: PRISM_TOWN,
  prof_lab: PROF_LAB,
  heal_center: HEAL_CENTER,
  shop: SHOP,
  route_1: ROUTE_1,
  route_2: ROUTE_2,
  route_3: ROUTE_3,
  verdant_rift: VERDANT_RIFT,
  crystal_rift: CRYSTAL_RIFT,
};

export function getMap(id) {
  return ALL_MAPS[id] || PRISM_TOWN;
}
