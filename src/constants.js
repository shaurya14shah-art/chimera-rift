/* ═══════════════════════════════════════════════════
   CHIMERA RIFT — Game Constants
   All magic numbers, configurations, and enums live here.
   ═══════════════════════════════════════════════════ */

// ── Display ──
export const NATIVE_WIDTH = 480;
export const NATIVE_HEIGHT = 320;
export const TILE_SIZE = 16;
export const FPS = 60;
export const FRAME_TIME = 1000 / FPS;

// ── Essences (Type System) ──
export const ESSENCE = {
  FLUX:   'flux',
  TERRA:  'terra',
  TIDE:   'tide',
  EMBER:  'ember',
  BLOOM:  'bloom',
  GALE:   'gale',
  PSYCHE: 'psyche',
  VOID:   'void',
  LUMEN:  'lumen',
  FORGE:  'forge',
};

export const ESSENCE_COLORS = {
  [ESSENCE.FLUX]:   '#3a9bdc',
  [ESSENCE.TERRA]:  '#8b6914',
  [ESSENCE.TIDE]:   '#1a9e8f',
  [ESSENCE.EMBER]:  '#d94f30',
  [ESSENCE.BLOOM]:  '#3aa84f',
  [ESSENCE.GALE]:   '#a8b8c8',
  [ESSENCE.PSYCHE]: '#7b3fa0',
  [ESSENCE.VOID]:   '#1a1a2e',
  [ESSENCE.LUMEN]:  '#f0d060',
  [ESSENCE.FORGE]:  '#708090',
};

export const ESSENCE_NAMES = {
  [ESSENCE.FLUX]:   'Flux',
  [ESSENCE.TERRA]:  'Terra',
  [ESSENCE.TIDE]:   'Tide',
  [ESSENCE.EMBER]:  'Ember',
  [ESSENCE.BLOOM]:  'Bloom',
  [ESSENCE.GALE]:   'Gale',
  [ESSENCE.PSYCHE]: 'Psyche',
  [ESSENCE.VOID]:   'Void',
  [ESSENCE.LUMEN]:  'Lumen',
  [ESSENCE.FORGE]:  'Forge',
};

// ── Move Categories ──
export const MOVE_CATEGORY = {
  STRIKE: 'strike',  // Physical — ATK vs DEF
  PULSE:  'pulse',   // Special — SP.ATK vs SP.DEF
  STATUS: 'status',  // No damage — buffs/debuffs
  FIELD:  'field',   // Terrain setters
};

// ── Battle States ──
export const BATTLE_STATE = {
  INTRO:      'intro',
  SELECT:     'select',
  MOVE_SELECT:'move_select',
  BAG:        'bag',
  PARTY:      'party',
  FUSE_SELECT:'fuse_select',
  EXECUTE:    'execute',
  ANIMATE:    'animate',
  RESULT:     'result',
  FAINT:      'faint',
  CAPTURE:    'capture',
  XP:         'xp',
  LEVEL_UP:   'level_up',
  VICTORY:    'victory',
  DEFEAT:     'defeat',
  RUN:        'run',
  END:        'end',
};

// ── Terrain Types ──
export const TERRAIN = {
  NONE:       'none',
  SCORCHED:   'scorched',
  FLOODED:    'flooded',
  OVERGROWN:  'overgrown',
  CHARGED:    'charged',
  VOID_ZONE:  'void_zone',
  LUMINOUS:   'luminous',
};

export const TERRAIN_DURATION = 5; // turns

export const TERRAIN_EFFECTS = {
  [TERRAIN.SCORCHED]: {
    name: 'Scorched Earth',
    color: '#d94f30',
    boostEssence: ESSENCE.EMBER,
    boostMult: 1.3,
    weakenEssence: ESSENCE.BLOOM,
    weakenMult: 0.5,
  },
  [TERRAIN.FLOODED]: {
    name: 'Flooded Field',
    color: '#1a9e8f',
    boostEssence: ESSENCE.TIDE,
    boostMult: 1.3,
    weakenEssence: ESSENCE.EMBER,
    weakenMult: 0.7,
  },
  [TERRAIN.OVERGROWN]: {
    name: 'Overgrown',
    color: '#3aa84f',
    boostEssence: ESSENCE.BLOOM,
    boostMult: 1.3,
    healPerTurn: 0.05, // 5% max HP
    healEssence: ESSENCE.BLOOM,
  },
  [TERRAIN.CHARGED]: {
    name: 'Charged Field',
    color: '#3a9bdc',
    boostEssence: ESSENCE.FLUX,
    boostMult: 1.3,
    extraHitChance: 0.25,
  },
  [TERRAIN.VOID_ZONE]: {
    name: 'Void Zone',
    color: '#1a1a2e',
    boostEssence: ESSENCE.VOID,
    boostMult: 1.3,
    healReduction: 0.5,
  },
  [TERRAIN.LUMINOUS]: {
    name: 'Luminous Aura',
    color: '#f0d060',
    boostEssence: ESSENCE.LUMEN,
    boostMult: 1.3,
    perfectAccuracy: true,
  },
};

// ── Bond Levels ──
export const BOND_LEVEL = {
  STRANGER:   { min: 0,  max: 20,  name: 'Stranger' },
  COMPANION:  { min: 21, max: 50,  name: 'Companion' },
  BONDED:     { min: 51, max: 75,  name: 'Bonded' },
  RESONANT:   { min: 76, max: 95,  name: 'Resonant' },
  SOULBOUND:  { min: 96, max: 100, name: 'Soulbound' },
};

// ── Stats ──
export const STAT = {
  HP:     'hp',
  ATK:    'atk',
  DEF:    'def',
  SP_ATK: 'spAtk',
  SP_DEF: 'spDef',
  SPD:    'spd',
};

// ── Status Effects ──
export const STATUS = {
  NONE:     'none',
  BURN:     'burn',     // Damage over time, -ATK
  FREEZE:   'freeze',   // Can't move (chance to thaw)
  PARALYZE: 'paralyze', // Chance to skip turn, -SPD
  POISON:   'poison',   // Damage over time
  SLEEP:    'sleep',    // Can't move (wakes after N turns)
  CONFUSE:  'confuse',  // May hit self
};

// ── Directions ──
export const DIR = {
  UP:    'up',
  DOWN:  'down',
  LEFT:  'left',
  RIGHT: 'right',
};

// ── Scene IDs ──
export const SCENE = {
  TITLE:     'title',
  OVERWORLD: 'overworld',
  BATTLE:    'battle',
  DIALOG:    'dialog',
  MENU:      'menu',
  CODEX:     'codex',
  PARTY:     'party',
  CUTSCENE:  'cutscene',
};

// ── Key Bindings ──
export const KEYS = {
  UP:       ['ArrowUp', 'w', 'W'],
  DOWN:     ['ArrowDown', 's', 'S'],
  LEFT:     ['ArrowLeft', 'a', 'A'],
  RIGHT:    ['ArrowRight', 'd', 'D'],
  CONFIRM:  ['Enter', ' ', 'z', 'Z'],
  CANCEL:   ['Escape', 'x', 'X', 'Backspace'],
  MENU:     ['Escape', 'm', 'M'],
  INTERACT: ['Enter', ' ', 'e', 'E'],
  RUN:      ['Shift'],
  CODEX:    ['c', 'C'],
  PARTY:    ['p', 'P'],
  BAG:      ['b', 'B'],
};

// ── XP Curve ──
export function xpForLevel(level) {
  return Math.floor(level * level * level * 0.8);
}

// ── Max Party Size ──
export const MAX_PARTY = 6;

// ── Capture Rate ──
export function captureChance(chimera, ball) {
  const hpRatio = chimera.currentHp / chimera.maxHp;
  const statusBonus = chimera.status !== STATUS.NONE ? 1.5 : 1;
  const rate = ((1 - hpRatio * 0.6) * ball.catchRate * statusBonus) / chimera.catchDifficulty;
  return Math.min(Math.max(rate, 0.05), 0.95); // 5% to 95%
}

// ── Fusion Constants ──
export const FUSION_DURATION = 3;      // turns
export const FUSION_BOND_REQ = 76;     // minimum bond
export const FUSION_STAT_BONUS = 1.2;  // 20% stat boost
export const FUSION_EXHAUST_TURNS = 2; // turns unable to fight after

// ── Wild Encounter Rate ──
export const ENCOUNTER_RATE = 0.08; // 8% per step in grass

// ── Player Speed ──
export const PLAYER_SPEED = 2; // pixels per frame
export const PLAYER_RUN_SPEED = 3.5;

// ── NPC Interaction Distance ──
export const INTERACT_DISTANCE = TILE_SIZE * 1.5;
