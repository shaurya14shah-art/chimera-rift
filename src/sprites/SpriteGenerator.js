/* ═══════════════════════════════════════════════════
   SpriteGenerator.js — Procedural pixel-art sprite generator
   Creates all Chimera sprites, player sprites, and tiles
   entirely from code. No external assets needed.
   ═══════════════════════════════════════════════════ */

import { ESSENCE_COLORS, TILE_SIZE } from '../constants.js';

/**
 * Create an offscreen canvas of given dimensions
 */
function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas: c, ctx };
}

/**
 * Set a pixel on a context (1x1 rect for pixel art)
 */
function px(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

/**
 * Darken a hex color by a factor (0-1)
 */
function darken(hex, factor = 0.3) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * (1 - factor))},${Math.floor(g * (1 - factor))},${Math.floor(b * (1 - factor))})`;
}

/**
 * Lighten a hex color by a factor (0-1)
 */
function lighten(hex, factor = 0.3) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))},${Math.min(255, Math.floor(g + (255 - g) * factor))},${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
}

// ═══════════════════════════════════════════════════
// CHIMERA SPRITE DEFINITIONS
// Each chimera is defined as a function that draws onto a 32x32 canvas
// ═══════════════════════════════════════════════════

const CHIMERA_SPRITES = {
  cinderpup: (ctx, frame = 0) => {
    const c1 = '#d94f30', c2 = '#8b6914', c3 = '#ff6633', c4 = '#f0d060';
    // Body
    for (let y = 16; y < 24; y++) {
      for (let x = 8; x < 24; x++) {
        px(ctx, x, y + (frame % 2 === 1 ? -1 : 0), ((x + y) % 3 === 0) ? c3 : c1);
      }
    }
    // Head
    for (let y = 10; y < 17; y++) {
      for (let x = 10; x < 22; x++) {
        if (Math.abs(x - 16) + Math.abs(y - 13) < 8) {
          px(ctx, x, y, c2);
        }
      }
    }
    // Eyes
    px(ctx, 13, 13, '#fff'); px(ctx, 14, 13, '#fff');
    px(ctx, 18, 13, '#fff'); px(ctx, 19, 13, '#fff');
    px(ctx, 14, 13, '#111'); px(ctx, 19, 13, '#111');
    // Ears (pointed)
    px(ctx, 10, 9, c2); px(ctx, 11, 8, c2); px(ctx, 11, 9, c2);
    px(ctx, 21, 9, c2); px(ctx, 20, 8, c2); px(ctx, 20, 9, c2);
    // Magma veins (glowing)
    const glowIntensity = frame % 2 === 0 ? c4 : c3;
    px(ctx, 12, 19, glowIntensity); px(ctx, 15, 20, glowIntensity);
    px(ctx, 18, 18, glowIntensity); px(ctx, 20, 21, glowIntensity);
    // Legs
    px(ctx, 10, 24, c2); px(ctx, 10, 25, c2); px(ctx, 11, 24, c2); px(ctx, 11, 25, c2);
    px(ctx, 20, 24, c2); px(ctx, 20, 25, c2); px(ctx, 21, 24, c2); px(ctx, 21, 25, c2);
    // Tail (flame)
    px(ctx, 24, 18, c3); px(ctx, 25, 17, c4); px(ctx, 26, 16 + (frame % 2), c3);
  },

  aquillume: (ctx, frame = 0) => {
    const c1 = '#1a9e8f', c2 = '#60e0d0', c3 = '#f0d060', c4 = '#80ffef';
    const bob = Math.sin(frame * 0.5) > 0 ? -1 : 0;
    // Bell body (jellyfish dome)
    for (let y = 8; y < 18; y++) {
      for (let x = 10; x < 22; x++) {
        const dist = Math.sqrt((x - 16) ** 2 + (y - 13) ** 2);
        if (dist < 7) {
          px(ctx, x, y + bob, dist < 4 ? c4 : (dist < 6 ? c2 : c1));
        }
      }
    }
    // Eyes
    px(ctx, 13, 14 + bob, '#fff'); px(ctx, 19, 14 + bob, '#fff');
    // Bioluminescent core
    px(ctx, 15, 12 + bob, c3); px(ctx, 16, 12 + bob, c3); px(ctx, 17, 12 + bob, c3);
    // Tentacles
    for (let t = 0; t < 5; t++) {
      const tx = 11 + t * 2;
      for (let ty = 18; ty < 26; ty++) {
        const wave = Math.sin((ty + frame) * 0.8) > 0 ? 1 : 0;
        px(ctx, tx + wave, ty + bob, ty % 2 === 0 ? c2 : c4);
      }
    }
  },

  thornsprout: (ctx, frame = 0) => {
    const c1 = '#3aa84f', c2 = '#8b6914', c3 = '#2a7030', c4 = '#60d060';
    // Shell (chestnut-like)
    for (let y = 10; y < 22; y++) {
      for (let x = 8; x < 24; x++) {
        const dist = Math.sqrt((x - 16) ** 2 + (y - 16) ** 2);
        if (dist < 8) {
          px(ctx, x, y, dist < 5 ? c2 : c3);
        }
      }
    }
    // Thorns
    const thornColor = c3;
    px(ctx, 8, 12, thornColor); px(ctx, 7, 11, thornColor);
    px(ctx, 24, 12, thornColor); px(ctx, 25, 11, thornColor);
    px(ctx, 12, 8, thornColor); px(ctx, 13, 7, thornColor);
    px(ctx, 20, 8, thornColor); px(ctx, 19, 7, thornColor);
    // Sprout on top
    px(ctx, 15, 7, c1); px(ctx, 16, 6, c4); px(ctx, 17, 7, c1);
    px(ctx, 16, 5 + (frame % 2), c4);
    // Eyes (cute, small)
    px(ctx, 13, 15, '#fff'); px(ctx, 14, 15, '#111');
    px(ctx, 18, 15, '#fff'); px(ctx, 19, 15, '#111');
    // Feet
    px(ctx, 11, 22, c2); px(ctx, 12, 22, c2); px(ctx, 12, 23, c2);
    px(ctx, 20, 22, c2); px(ctx, 21, 22, c2); px(ctx, 20, 23, c2);
  },

  zephyrix: (ctx, frame = 0) => {
    const c1 = '#a8b8c8', c2 = '#3a9bdc', c3 = '#60b0ff', c4 = '#ffffff';
    const wingFlap = frame % 2;
    // Body
    for (let y = 14; y < 22; y++) {
      for (let x = 12; x < 20; x++) {
        px(ctx, x, y, c1);
      }
    }
    // Head
    for (let y = 10; y < 15; y++) {
      for (let x = 13; x < 19; x++) {
        px(ctx, x, y, c1);
      }
    }
    // Beak
    px(ctx, 19, 12, c2); px(ctx, 20, 12, c2); px(ctx, 21, 12, c2);
    // Eye
    px(ctx, 17, 11, '#fff'); px(ctx, 17, 12, '#111');
    // Wings
    for (let i = 0; i < 6; i++) {
      px(ctx, 8 + i, 14 - wingFlap * 2 + i * 0.5, c3);
      px(ctx, 8 + i, 15 - wingFlap * 2 + i * 0.5, c2);
      px(ctx, 24 - i, 14 - wingFlap * 2 + i * 0.5, c3);
      px(ctx, 24 - i, 15 - wingFlap * 2 + i * 0.5, c2);
    }
    // Lightning sparks
    if (frame % 2 === 0) {
      px(ctx, 10, 18, c4); px(ctx, 22, 16, c4); px(ctx, 14, 22, c4);
    }
    // Tail feathers
    px(ctx, 14, 22, c2); px(ctx, 15, 23, c3); px(ctx, 16, 24, c2);
  },

  gloomoth: (ctx, frame = 0) => {
    const c1 = '#1a1a2e', c2 = '#7b3fa0', c3 = '#a060c0', c4 = '#d080f0';
    const wingPos = frame % 2;
    // Body
    for (let y = 14; y < 22; y++) {
      for (let x = 14; x < 18; x++) {
        px(ctx, x, y, c1);
      }
    }
    // Wings (spread)
    for (let y = 10; y < 20; y++) {
      for (let x = 4; x < 14; x++) {
        const dist = Math.sqrt((x - 12) ** 2 + (y - 15) ** 2);
        if (dist < 9) {
          px(ctx, x, y - wingPos, dist < 4 ? c4 : (dist < 6 ? c3 : c2));
        }
      }
      for (let x = 18; x < 28; x++) {
        const dist = Math.sqrt((x - 20) ** 2 + (y - 15) ** 2);
        if (dist < 9) {
          px(ctx, x, y - wingPos, dist < 4 ? c4 : (dist < 6 ? c3 : c2));
        }
      }
    }
    // Hypnotic eye patterns on wings
    px(ctx, 9, 14, '#fff'); px(ctx, 10, 14, c4);
    px(ctx, 22, 14, '#fff'); px(ctx, 23, 14, c4);
    // Head eyes (red)
    px(ctx, 14, 13, '#ff3333'); px(ctx, 17, 13, '#ff3333');
    // Antennae
    px(ctx, 15, 12, c3); px(ctx, 14, 11, c4); px(ctx, 13, 10, c4);
    px(ctx, 17, 12, c3); px(ctx, 18, 11, c4); px(ctx, 19, 10, c4);
  },

  ferrowl: (ctx, frame = 0) => {
    const c1 = '#708090', c2 = '#a8b8c8', c3 = '#505860', c4 = '#c0d0e0';
    // Body
    for (let y = 14; y < 24; y++) {
      for (let x = 10; x < 22; x++) {
        px(ctx, x, y, (x + y) % 2 === 0 ? c1 : c3); // Interlocking metal texture
      }
    }
    // Head (round owl face)
    for (let y = 8; y < 15; y++) {
      for (let x = 10; x < 22; x++) {
        const dist = Math.sqrt((x - 16) ** 2 + (y - 11) ** 2);
        if (dist < 5) {
          px(ctx, x, y, c2);
        }
      }
    }
    // Large owl eyes
    px(ctx, 13, 10, c4); px(ctx, 14, 10, c4); px(ctx, 13, 11, '#f0d060'); px(ctx, 14, 11, '#111');
    px(ctx, 18, 10, c4); px(ctx, 19, 10, c4); px(ctx, 18, 11, '#f0d060'); px(ctx, 19, 11, '#111');
    // Beak
    px(ctx, 15, 12, '#d94f30'); px(ctx, 16, 12, '#d94f30'); px(ctx, 16, 13, '#d94f30');
    // Metal feather wings
    for (let i = 0; i < 4; i++) {
      px(ctx, 7 + i, 16 + i, c4); px(ctx, 7 + i, 17 + i, c1);
      px(ctx, 25 - i, 16 + i, c4); px(ctx, 25 - i, 17 + i, c1);
    }
    // Talons
    px(ctx, 12, 24, c3); px(ctx, 13, 25, c3);
    px(ctx, 19, 24, c3); px(ctx, 20, 25, c3);
  },

  emberclaw: (ctx, frame = 0) => {
    const c1 = '#d94f30', c2 = '#1a1a2e', c3 = '#ff4400', c4 = '#f0d060';
    // Large body (dire wolf)
    for (let y = 12; y < 24; y++) {
      for (let x = 6; x < 26; x++) {
        const inBody = Math.abs(x - 16) < (y - 12) * 0.8 + 4;
        if (inBody) {
          px(ctx, x, y, ((x + y) % 4 === 0) ? c3 : c2);
        }
      }
    }
    // Dark flame aura
    if (frame % 2 === 0) {
      for (let i = 0; i < 5; i++) {
        const fx = 8 + Math.random() * 16;
        const fy = 10 + Math.random() * 4;
        px(ctx, fx, fy, c3);
      }
    }
    // Head
    for (let y = 6; y < 13; y++) {
      for (let x = 10; x < 22; x++) {
        if (Math.abs(x - 16) + Math.abs(y - 9) < 7) {
          px(ctx, x, y, c2);
        }
      }
    }
    // Glowing eyes
    px(ctx, 13, 9, c3); px(ctx, 14, 9, c4);
    px(ctx, 18, 9, c3); px(ctx, 19, 9, c4);
    // Fangs
    px(ctx, 13, 12, '#fff'); px(ctx, 19, 12, '#fff');
    // Legs (dark)
    for (let leg of [9, 13, 19, 23]) {
      px(ctx, leg, 24, c2); px(ctx, leg, 25, c2); px(ctx, leg, 26, c1);
    }
  },

  tidalynx: (ctx, frame = 0) => {
    const c1 = '#1a9e8f', c2 = '#a8b8c8', c3 = '#60e0d0', c4 = '#80ffef';
    // Sleek body
    for (let y = 14; y < 22; y++) {
      for (let x = 8; x < 24; x++) {
        const inBody = y < 18 ? (x > 10 && x < 22) : (x > 9 && x < 23);
        if (inBody) px(ctx, x, y, (y % 2 === 0) ? c1 : c3);
      }
    }
    // Head
    for (let y = 10; y < 15; y++) {
      for (let x = 12; x < 20; x++) {
        px(ctx, x, y, c1);
      }
    }
    // Ears (tufted)
    px(ctx, 12, 8, c2); px(ctx, 12, 9, c3); px(ctx, 11, 8, c2);
    px(ctx, 19, 8, c2); px(ctx, 19, 9, c3); px(ctx, 20, 8, c2);
    // Eyes
    px(ctx, 14, 11, '#fff'); px(ctx, 14, 12, c4);
    px(ctx, 18, 11, '#fff'); px(ctx, 18, 12, c4);
    // Water trail
    for (let i = 0; i < 3; i++) {
      px(ctx, 24 + i * 2, 18 + (frame + i) % 3, c4);
    }
    // Legs (running pose)
    px(ctx, 10, 22, c1); px(ctx, 10, 23, c1); px(ctx, 13, 22, c1); px(ctx, 13, 23 + frame % 2, c1);
    px(ctx, 19, 22, c1); px(ctx, 19, 23 + frame % 2, c1); px(ctx, 22, 22, c1); px(ctx, 22, 23, c1);
  },

  crystalisk: (ctx, frame = 0) => {
    const c1 = '#8b6914', c2 = '#708090', c3 = '#c0d0e0', c4 = '#f0d060';
    // Shell (crystal-covered)
    for (let y = 8; y < 20; y++) {
      for (let x = 8; x < 24; x++) {
        const dist = Math.sqrt((x - 16) ** 2 + (y - 14) ** 2);
        if (dist < 8) {
          const isCrystal = (x + y) % 3 === 0;
          px(ctx, x, y, isCrystal ? c3 : c2);
        }
      }
    }
    // Crystal spires on shell
    px(ctx, 14, 6, c3); px(ctx, 14, 7, c4); px(ctx, 14, 8, c3);
    px(ctx, 18, 7, c3); px(ctx, 18, 8, c4);
    px(ctx, 11, 9, c3); px(ctx, 11, 10, c4);
    // Head (peeking from shell)
    for (let y = 18; y < 22; y++) {
      for (let x = 12; x < 18; x++) {
        px(ctx, x, y, c1);
      }
    }
    // Eyes
    px(ctx, 13, 19, '#fff'); px(ctx, 14, 19, '#111');
    px(ctx, 16, 19, '#fff'); px(ctx, 17, 19, '#111');
    // Feet
    px(ctx, 10, 22, c1); px(ctx, 11, 22, c1); px(ctx, 10, 23, c1);
    px(ctx, 21, 22, c1); px(ctx, 22, 22, c1); px(ctx, 22, 23, c1);
    // Light refraction
    if (frame % 2 === 0) {
      px(ctx, 15, 9, '#ffffff'); px(ctx, 19, 11, '#ffffff');
    }
  },

  lumifae: (ctx, frame = 0) => {
    const c1 = '#f0d060', c2 = '#3aa84f', c3 = '#fff0a0', c4 = '#ffffff';
    const bob = frame % 2;
    // Tiny deer body
    for (let y = 16; y < 22; y++) {
      for (let x = 12; x < 20; x++) {
        px(ctx, x, y - bob, c3);
      }
    }
    // Head
    for (let y = 12; y < 17; y++) {
      for (let x = 13; x < 19; x++) {
        px(ctx, x, y - bob, c3);
      }
    }
    // Antlers (light flowers)
    px(ctx, 13, 10 - bob, c1); px(ctx, 12, 9 - bob, c4); px(ctx, 11, 8 - bob, c2);
    px(ctx, 19, 10 - bob, c1); px(ctx, 20, 9 - bob, c4); px(ctx, 21, 8 - bob, c2);
    // Eyes (gentle)
    px(ctx, 14, 14 - bob, '#111'); px(ctx, 17, 14 - bob, '#111');
    // Light particles around
    if (frame % 2 === 0) {
      px(ctx, 10, 14, c1); px(ctx, 22, 12, c1); px(ctx, 16, 8, c4);
    }
    // Thin legs
    px(ctx, 13, 22, c3); px(ctx, 13, 23, c1);
    px(ctx, 18, 22, c3); px(ctx, 18, 23, c1);
  },

  psywyrm: (ctx, frame = 0) => {
    const c1 = '#7b3fa0', c2 = '#1a9e8f', c3 = '#a060c0', c4 = '#60e0d0';
    // Serpentine body (wavy)
    for (let i = 0; i < 14; i++) {
      const sx = 8 + i * 1.2;
      const sy = 16 + Math.sin((i + frame) * 0.6) * 3;
      px(ctx, sx, sy, i % 2 === 0 ? c1 : c2);
      px(ctx, sx, sy + 1, i % 2 === 0 ? c3 : c4);
      px(ctx, sx + 1, sy, i % 2 === 0 ? c3 : c4);
      px(ctx, sx + 1, sy + 1, i % 2 === 0 ? c1 : c2);
    }
    // Head
    for (let y = 12; y < 17; y++) {
      for (let x = 6; x < 12; x++) {
        px(ctx, x, y + Math.sin(frame * 0.5) > 0 ? -1 : 0, c1);
      }
    }
    // Eyes (glowing psyche)
    px(ctx, 7, 13, c4); px(ctx, 8, 13, '#fff');
    px(ctx, 10, 13, c4); px(ctx, 11, 13, '#fff');
    // Fins/whiskers
    px(ctx, 6, 11, c3); px(ctx, 5, 10, c4);
    px(ctx, 12, 11, c3); px(ctx, 13, 10, c4);
  },

  voidmaw: (ctx, frame = 0) => {
    const c1 = '#1a1a2e', c2 = '#d94f30', c3 = '#2a1a3e', c4 = '#ff4400';
    // Bulky body
    for (let y = 12; y < 24; y++) {
      for (let x = 8; x < 24; x++) {
        const dist = Math.sqrt((x - 16) ** 2 + (y - 18) ** 2);
        if (dist < 8) {
          px(ctx, x, y, ((x + y) % 5 === 0) ? c2 : c1);
        }
      }
    }
    // Head/jaw (gaping)
    for (let y = 8; y < 14; y++) {
      for (let x = 10; x < 22; x++) {
        px(ctx, x, y, c3);
      }
    }
    // Maw (open, dark interior with entropy-fire)
    for (let y = 12; y < 15; y++) {
      for (let x = 12; x < 20; x++) {
        px(ctx, x, y, '#000');
      }
    }
    px(ctx, 13, 13, c4); px(ctx, 16, 12, c4); px(ctx, 18, 13, c4);
    // Eyes (void-dark with ember glow)
    px(ctx, 12, 9, c2); px(ctx, 13, 9, c4);
    px(ctx, 19, 9, c2); px(ctx, 20, 9, c4);
    // Entropy particles
    if (frame % 2 === 0) {
      px(ctx, 14, 6, c2); px(ctx, 22, 10, c2); px(ctx, 8, 14, c4);
    }
  },

  galecrest: (ctx, frame = 0) => {
    const c1 = '#a8b8c8', c2 = '#f0d060', c3 = '#3a9bdc', c4 = '#ffffff';
    const wingFlap = frame % 2;
    // Majestic body
    for (let y = 12; y < 22; y++) {
      for (let x = 10; x < 22; x++) {
        px(ctx, x, y, c1);
      }
    }
    // Head with crest
    for (let y = 6; y < 13; y++) {
      for (let x = 12; x < 20; x++) {
        px(ctx, x, y, c1);
      }
    }
    px(ctx, 14, 4, c2); px(ctx, 15, 3, c2); px(ctx, 16, 2, c2); px(ctx, 17, 3, c2); px(ctx, 18, 4, c2);
    // Golden eye
    px(ctx, 17, 9, c2); px(ctx, 18, 9, '#111');
    // Beak
    px(ctx, 20, 10, c2); px(ctx, 21, 10, c2);
    // Magnificent wings
    for (let i = 0; i < 8; i++) {
      const wy = 12 + i * 0.3 - wingFlap * 3;
      px(ctx, 4 + i, wy, c2); px(ctx, 4 + i, wy + 1, c3); px(ctx, 4 + i, wy + 2, c1);
      px(ctx, 28 - i, wy, c2); px(ctx, 28 - i, wy + 1, c3); px(ctx, 28 - i, wy + 2, c1);
    }
    // Lightning trail
    if (frame % 2 === 0) {
      px(ctx, 6, 18, c2); px(ctx, 26, 16, c2); px(ctx, 16, 22, c4);
    }
    // Tail
    px(ctx, 14, 22, c2); px(ctx, 15, 23, c3); px(ctx, 16, 24, c2); px(ctx, 17, 23, c3); px(ctx, 18, 22, c2);
  },

  floracore: (ctx, frame = 0) => {
    const c1 = '#3aa84f', c2 = '#3a9bdc', c3 = '#60d060', c4 = '#60b0ff';
    // Tree trunk body
    for (let y = 14; y < 26; y++) {
      for (let x = 13; x < 19; x++) {
        px(ctx, x, y, '#3d2810');
      }
    }
    // Canopy (energy-crackling leaves)
    for (let y = 4; y < 16; y++) {
      for (let x = 8; x < 24; x++) {
        const dist = Math.sqrt((x - 16) ** 2 + (y - 10) ** 2);
        if (dist < 8) {
          const isFlux = (x + y + frame) % 5 === 0;
          px(ctx, x, y, isFlux ? c4 : ((x + y) % 2 === 0 ? c1 : c3));
        }
      }
    }
    // Flux sparks in canopy
    if (frame % 2 === 0) {
      px(ctx, 11, 8, c2); px(ctx, 20, 7, c4); px(ctx, 14, 5, c2);
    }
    // Eyes in trunk
    px(ctx, 14, 17, '#fff'); px(ctx, 15, 17, c1);
    px(ctx, 17, 17, '#fff'); px(ctx, 18, 17, c1);
    // Roots (feet)
    px(ctx, 11, 25, '#3d2810'); px(ctx, 12, 26, '#3d2810');
    px(ctx, 20, 25, '#3d2810'); px(ctx, 21, 26, '#3d2810');
  },

  riftborn: (ctx, frame = 0) => {
    const c1 = '#3a9bdc', c2 = '#1a1a2e', c3 = '#7b3fa0', c4 = '#ffffff';
    // Fractured geometric body — shifting
    const centerX = 16, centerY = 16;
    for (let y = 6; y < 26; y++) {
      for (let x = 6; x < 26; x++) {
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (dist < 10) {
          const angle = Math.atan2(y - centerY, x - centerX);
          const segment = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 6 + frame * 0.5) % 6;
          const colors = [c1, c2, c3, c4, c1, c3];
          if (Math.random() > 0.15 || dist < 4) {
            px(ctx, x, y, colors[segment]);
          }
        }
      }
    }
    // Central eye/core
    for (let y = 14; y < 19; y++) {
      for (let x = 14; x < 19; x++) {
        const dist = Math.sqrt((x - 16) ** 2 + (y - 16.5) ** 2);
        if (dist < 2.5) {
          px(ctx, x, y, c4);
        }
      }
    }
    px(ctx, 16, 16, '#000');
    // Floating fragments
    if (frame % 2 === 0) {
      px(ctx, 4, 10, c1); px(ctx, 28, 20, c3);
      px(ctx, 6, 22, c1); px(ctx, 26, 8, c3);
    }
  },
};

/**
 * Generate a battle sprite for a chimera (32x32, 4 animation frames)
 * Returns an offscreen canvas with all 4 frames side by side (128x32)
 */
export function generateChimeraSprite(chimeraId) {
  const { canvas, ctx } = createCanvas(128, 32);
  const drawFn = CHIMERA_SPRITES[chimeraId];
  if (!drawFn) {
    // Fallback: draw a colored circle
    for (let f = 0; f < 4; f++) {
      ctx.fillStyle = '#ff00ff';
      ctx.beginPath();
      ctx.arc(f * 32 + 16, 16, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas;
  }

  for (let f = 0; f < 4; f++) {
    ctx.save();
    ctx.translate(f * 32, 0);
    drawFn(ctx, f);
    ctx.restore();
  }

  return canvas;
}

/**
 * Generate a miniature overworld sprite (16x16, 4 directions × 2 walk frames = 8 frames)
 * Layout: 128x16, each 16x16 frame: down0, down1, up0, up1, left0, left1, right0, right1
 */
export function generateOverworldSprite(chimeraId) {
  const { canvas, ctx } = createCanvas(128, 16);
  const color = ESSENCE_COLORS[chimeraId] || '#ffffff';

  // Simple pixel character for each direction
  for (let d = 0; d < 4; d++) {
    for (let f = 0; f < 2; f++) {
      const ox = (d * 2 + f) * 16;
      // Body (4x4 center)
      ctx.fillStyle = color;
      ctx.fillRect(ox + 6, 6, 4, 6);
      // Head (4x3)
      ctx.fillStyle = lighten(color, 0.3);
      ctx.fillRect(ox + 6, 3, 4, 3);
      // Eyes
      ctx.fillStyle = '#111';
      if (d === 0) { px(ctx, ox + 7, 4, '#111'); px(ctx, ox + 9, 4, '#111'); } // down
      if (d === 1) { px(ctx, ox + 7, 4, '#111'); px(ctx, ox + 9, 4, '#111'); } // up (no eyes visible)
      if (d === 2) { px(ctx, ox + 7, 4, '#111'); } // left
      if (d === 3) { px(ctx, ox + 9, 4, '#111'); } // right
      // Legs (walking)
      ctx.fillStyle = darken(color, 0.2);
      if (f === 0) {
        px(ctx, ox + 6, 12, darken(color, 0.2)); px(ctx, ox + 9, 12, darken(color, 0.2));
        px(ctx, ox + 6, 13, darken(color, 0.2)); px(ctx, ox + 9, 13, darken(color, 0.2));
      } else {
        px(ctx, ox + 7, 12, darken(color, 0.2)); px(ctx, ox + 8, 12, darken(color, 0.2));
        px(ctx, ox + 7, 13, darken(color, 0.2)); px(ctx, ox + 8, 13, darken(color, 0.2));
      }
    }
  }

  return canvas;
}

/**
 * Generate the player character sprite (16x16, same layout as overworld)
 */
export function generatePlayerSprite() {
  const { canvas, ctx } = createCanvas(128, 16);
  const bodyColor = '#3060a0';
  const skinColor = '#f0c090';
  const hairColor = '#2a1a10';

  for (let d = 0; d < 4; d++) {
    for (let f = 0; f < 2; f++) {
      const ox = (d * 2 + f) * 16;
      // Body (shirt/jacket)
      ctx.fillStyle = bodyColor;
      ctx.fillRect(ox + 5, 7, 6, 5);
      // Arms
      ctx.fillStyle = bodyColor;
      px(ctx, ox + 4, 8, bodyColor); px(ctx, ox + 11, 8, bodyColor);
      // Head (skin)
      ctx.fillStyle = skinColor;
      ctx.fillRect(ox + 6, 2, 4, 5);
      // Hair
      ctx.fillStyle = hairColor;
      ctx.fillRect(ox + 5, 1, 6, 2);
      if (d === 0 || d === 2) { px(ctx, ox + 5, 3, hairColor); }
      if (d === 0 || d === 3) { px(ctx, ox + 10, 3, hairColor); }
      // Eyes
      if (d === 0) { // Down
        px(ctx, ox + 7, 4, '#111'); px(ctx, ox + 9, 4, '#111');
      } else if (d === 1) { // Up - no eyes
        ctx.fillStyle = hairColor;
        ctx.fillRect(ox + 6, 2, 4, 3);
      } else if (d === 2) { // Left
        px(ctx, ox + 7, 4, '#111');
      } else { // Right
        px(ctx, ox + 9, 4, '#111');
      }
      // Legs
      ctx.fillStyle = '#2a3050';
      if (f === 0) {
        px(ctx, ox + 6, 12, '#2a3050'); px(ctx, ox + 9, 12, '#2a3050');
        px(ctx, ox + 6, 13, '#1a1a30'); px(ctx, ox + 9, 13, '#1a1a30');
      } else {
        px(ctx, ox + 7, 12, '#2a3050'); px(ctx, ox + 8, 12, '#2a3050');
        px(ctx, ox + 7, 13, '#1a1a30'); px(ctx, ox + 8, 13, '#1a1a30');
      }
    }
  }

  return canvas;
}

/**
 * Generate the tileset for all world tiles
 * Returns a canvas with tiles laid out in a grid
 */
export function generateTileset() {
  const COLS = 16;
  const ROWS = 16;
  const { canvas, ctx } = createCanvas(COLS * TILE_SIZE, ROWS * TILE_SIZE);

  // Tile 1: Grass (light)
  fillTile(ctx, 0, 0, '#3a6830', (x, y) => (x + y) % 3 === 0 ? '#4a8040' : null);
  // Tile 2: Grass (dark)
  fillTile(ctx, 1, 0, '#2a5020', (x, y) => (x + y) % 4 === 0 ? '#3a6830' : null);
  // Tile 3: Dirt path
  fillTile(ctx, 2, 0, '#8b7355', (x, y) => (x * y) % 5 === 0 ? '#9b8365' : null);
  // Tile 4: Stone path
  fillTile(ctx, 3, 0, '#606060', (x, y) => (x + y) % 2 === 0 ? '#707070' : null);
  // Tile 5: Water (animated base — tiles 200+ will offset)
  fillTile(ctx, 4, 0, '#1a5080', (x, y) => (x + y) % 2 === 0 ? '#2060a0' : null);
  // Tile 6: Water frame 2
  fillTile(ctx, 5, 0, '#2060a0', (x, y) => (x + y) % 2 === 0 ? '#1a5080' : null);
  // Tile 7: Water frame 3
  fillTile(ctx, 6, 0, '#1a6090', (x, y) => (x + y) % 3 === 0 ? '#2070b0' : null);
  // Tile 8: Water frame 4
  fillTile(ctx, 7, 0, '#2070b0', (x, y) => (x + y) % 3 === 0 ? '#1a6090' : null);
  // Tile 9: Wall (stone)
  fillTile(ctx, 8, 0, '#404040', (x, y) => y < 2 ? '#505050' : ((x % 4 === 0 || y === 8) ? '#353535' : null));
  // Tile 10: Tall grass (encounter zone)
  fillTile(ctx, 9, 0, '#2a5020');
  drawTallGrass(ctx, 9 * TILE_SIZE, 0);
  // Tile 11: Sand
  fillTile(ctx, 10, 0, '#d4b896', (x, y) => (x + y) % 4 === 0 ? '#c4a886' : null);
  // Tile 12: Cave floor
  fillTile(ctx, 11, 0, '#2a2030', (x, y) => (x * y) % 7 === 0 ? '#3a3040' : null);
  // Tile 13: Rift floor (distorted)
  fillTile(ctx, 12, 0, '#0a0018', (x, y) => (x + y) % 3 === 0 ? '#1a0030' : null);
  // Tile 14: Town floor (cobblestone)
  fillTile(ctx, 13, 0, '#606060', (x, y) => {
    if ((x === 0 || y === 0) && (x + y) > 0) return '#555';
    return (x + y) % 2 === 0 ? '#6a6a6a' : null;
  });
  // Tile 15: Flower
  fillTile(ctx, 14, 0, '#3a6830', (x, y) => {
    if (x === 7 && y === 5) return '#ff6090';
    if (x === 8 && y === 5) return '#ff6090';
    if (x === 7 && y === 6) return '#ff4070';
    if (x === 4 && y === 10) return '#f0d060';
    if (x === 5 && y === 10) return '#f0d060';
    return (x + y) % 3 === 0 ? '#4a8040' : null;
  });
  // Tile 16: Tree trunk
  fillTile(ctx, 15, 0, '#3a6830');
  ctx.fillStyle = '#3d2810';
  ctx.fillRect(15 * TILE_SIZE + 5, 0, 6, TILE_SIZE);
  // Row 2 — Tree canopy, roof tiles, etc.
  // Tile 17: Tree canopy
  fillTile(ctx, 0, 1, 'transparent');
  ctx.fillStyle = '#2a6020';
  for (let y = 2; y < 14; y++) {
    for (let x = 1; x < 15; x++) {
      if (Math.sqrt((x - 8) ** 2 + (y - 8) ** 2) < 7) {
        px(ctx, x, TILE_SIZE + y, (x + y) % 2 === 0 ? '#3a7030' : '#2a6020');
      }
    }
  }
  // Tile 18: House wall
  fillTile(ctx, 1, 1, '#8b7355', (x, y) => y === 0 ? '#6b5335' : null);
  // Tile 19: House roof
  fillTile(ctx, 2, 1, '#b03030', (x, y) => y % 4 < 2 ? '#c04040' : null);
  // Tile 20: Door
  fillTile(ctx, 3, 1, '#5a3a10');
  ctx.fillStyle = '#f0d060';
  ctx.fillRect(3 * TILE_SIZE + 10, TILE_SIZE + 8, 2, 2); // doorknob
  // Tile 21: Window
  fillTile(ctx, 4, 1, '#8b7355');
  ctx.fillStyle = '#80c0ff';
  ctx.fillRect(4 * TILE_SIZE + 4, TILE_SIZE + 4, 8, 8);
  ctx.fillStyle = '#6b5335';
  ctx.fillRect(4 * TILE_SIZE + 7, TILE_SIZE + 4, 2, 8);
  ctx.fillRect(4 * TILE_SIZE + 4, TILE_SIZE + 7, 8, 2);
  // Tile 22: Heal station
  fillTile(ctx, 5, 1, '#ffffff');
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(5 * TILE_SIZE + 6, TILE_SIZE + 3, 4, 10);
  ctx.fillRect(5 * TILE_SIZE + 3, TILE_SIZE + 6, 10, 4);
  // Tile 23: Shop sign
  fillTile(ctx, 6, 1, '#3060a0');
  ctx.fillStyle = '#f0d060';
  ctx.fillRect(6 * TILE_SIZE + 3, TILE_SIZE + 3, 10, 10);
  ctx.fillStyle = '#3060a0';
  ctx.fillRect(6 * TILE_SIZE + 5, TILE_SIZE + 5, 6, 6);

  return canvas;
}

function fillTile(ctx, col, row, baseColor, pattern = null) {
  const ox = col * TILE_SIZE;
  const oy = row * TILE_SIZE;
  if (baseColor && baseColor !== 'transparent') {
    ctx.fillStyle = baseColor;
    ctx.fillRect(ox, oy, TILE_SIZE, TILE_SIZE);
  }
  if (pattern) {
    for (let y = 0; y < TILE_SIZE; y++) {
      for (let x = 0; x < TILE_SIZE; x++) {
        const c = pattern(x, y);
        if (c) {
          ctx.fillStyle = c;
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }
      }
    }
  }
}

function drawTallGrass(ctx, ox, oy) {
  const blades = [2, 5, 8, 11, 14];
  for (const bx of blades) {
    for (let h = 0; h < 8; h++) {
      ctx.fillStyle = h < 3 ? '#4a9040' : '#3a7030';
      ctx.fillRect(ox + bx, oy + TILE_SIZE - 2 - h, 1, 1);
      if (h > 3) {
        ctx.fillRect(ox + bx + (h % 2 === 0 ? 1 : -1), oy + TILE_SIZE - 2 - h, 1, 1);
      }
    }
  }
}

// Export sprite cache
export const spriteCache = {};

export function initSprites() {
  // Generate all chimera battle sprites
  const chimeraIds = Object.keys(CHIMERA_SPRITES);
  for (const id of chimeraIds) {
    spriteCache[`chimera_${id}`] = generateChimeraSprite(id);
  }

  // Player sprite
  spriteCache.player = generatePlayerSprite();

  // Tileset
  spriteCache.tileset = generateTileset();

  return spriteCache;
}
