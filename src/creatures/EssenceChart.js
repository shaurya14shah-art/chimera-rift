/* ═══════════════════════════════════════════════════
   EssenceChart.js — Type effectiveness matrix
   10 Essences, dual-essence support, resonance/dissonance
   ═══════════════════════════════════════════════════ */

import { ESSENCE } from '../constants.js';

/**
 * Effectiveness multiplier matrix.
 * CHART[attacker_essence][defender_essence] = multiplier
 * 2.0 = super effective, 0.5 = not effective, 1.0 = neutral, 0.0 = immune
 */
const CHART = {
  [ESSENCE.FLUX]: {
    [ESSENCE.FLUX]: 0.5, [ESSENCE.TERRA]: 0.5, [ESSENCE.TIDE]: 1.0, [ESSENCE.EMBER]: 1.0,
    [ESSENCE.BLOOM]: 1.0, [ESSENCE.GALE]: 1.0, [ESSENCE.PSYCHE]: 1.0, [ESSENCE.VOID]: 0.5,
    [ESSENCE.LUMEN]: 1.0, [ESSENCE.FORGE]: 2.0,
  },
  [ESSENCE.TERRA]: {
    [ESSENCE.FLUX]: 2.0, [ESSENCE.TERRA]: 0.5, [ESSENCE.TIDE]: 0.5, [ESSENCE.EMBER]: 1.0,
    [ESSENCE.BLOOM]: 0.5, [ESSENCE.GALE]: 1.0, [ESSENCE.PSYCHE]: 1.0, [ESSENCE.VOID]: 1.0,
    [ESSENCE.LUMEN]: 1.0, [ESSENCE.FORGE]: 1.5,
  },
  [ESSENCE.TIDE]: {
    [ESSENCE.FLUX]: 1.0, [ESSENCE.TERRA]: 2.0, [ESSENCE.TIDE]: 0.5, [ESSENCE.EMBER]: 2.0,
    [ESSENCE.BLOOM]: 0.5, [ESSENCE.GALE]: 1.0, [ESSENCE.PSYCHE]: 1.0, [ESSENCE.VOID]: 1.0,
    [ESSENCE.LUMEN]: 1.0, [ESSENCE.FORGE]: 1.0,
  },
  [ESSENCE.EMBER]: {
    [ESSENCE.FLUX]: 1.0, [ESSENCE.TERRA]: 0.5, [ESSENCE.TIDE]: 0.5, [ESSENCE.EMBER]: 0.5,
    [ESSENCE.BLOOM]: 2.0, [ESSENCE.GALE]: 1.0, [ESSENCE.PSYCHE]: 1.0, [ESSENCE.VOID]: 1.0,
    [ESSENCE.LUMEN]: 1.0, [ESSENCE.FORGE]: 2.0,
  },
  [ESSENCE.BLOOM]: {
    [ESSENCE.FLUX]: 1.0, [ESSENCE.TERRA]: 2.0, [ESSENCE.TIDE]: 2.0, [ESSENCE.EMBER]: 0.5,
    [ESSENCE.BLOOM]: 0.5, [ESSENCE.GALE]: 0.5, [ESSENCE.PSYCHE]: 1.0, [ESSENCE.VOID]: 0.5,
    [ESSENCE.LUMEN]: 1.0, [ESSENCE.FORGE]: 1.0,
  },
  [ESSENCE.GALE]: {
    [ESSENCE.FLUX]: 1.0, [ESSENCE.TERRA]: 0.5, [ESSENCE.TIDE]: 1.0, [ESSENCE.EMBER]: 1.0,
    [ESSENCE.BLOOM]: 2.0, [ESSENCE.GALE]: 0.5, [ESSENCE.PSYCHE]: 0.5, [ESSENCE.VOID]: 1.0,
    [ESSENCE.LUMEN]: 1.0, [ESSENCE.FORGE]: 2.0,
  },
  [ESSENCE.PSYCHE]: {
    [ESSENCE.FLUX]: 1.0, [ESSENCE.TERRA]: 1.0, [ESSENCE.TIDE]: 1.0, [ESSENCE.EMBER]: 1.0,
    [ESSENCE.BLOOM]: 1.0, [ESSENCE.GALE]: 2.0, [ESSENCE.PSYCHE]: 0.5, [ESSENCE.VOID]: 0.5,
    [ESSENCE.LUMEN]: 1.0, [ESSENCE.FORGE]: 2.0,
  },
  [ESSENCE.VOID]: {
    [ESSENCE.FLUX]: 1.0, [ESSENCE.TERRA]: 1.0, [ESSENCE.TIDE]: 1.0, [ESSENCE.EMBER]: 1.0,
    [ESSENCE.BLOOM]: 2.0, [ESSENCE.GALE]: 1.0, [ESSENCE.PSYCHE]: 2.0, [ESSENCE.VOID]: 0.5,
    [ESSENCE.LUMEN]: 0.5, [ESSENCE.FORGE]: 1.0,
  },
  [ESSENCE.LUMEN]: {
    [ESSENCE.FLUX]: 1.0, [ESSENCE.TERRA]: 1.0, [ESSENCE.TIDE]: 1.0, [ESSENCE.EMBER]: 0.5,
    [ESSENCE.BLOOM]: 1.0, [ESSENCE.GALE]: 1.0, [ESSENCE.PSYCHE]: 0.5, [ESSENCE.VOID]: 2.0,
    [ESSENCE.LUMEN]: 0.5, [ESSENCE.FORGE]: 1.0,
  },
  [ESSENCE.FORGE]: {
    [ESSENCE.FLUX]: 0.5, [ESSENCE.TERRA]: 1.0, [ESSENCE.TIDE]: 1.0, [ESSENCE.EMBER]: 0.5,
    [ESSENCE.BLOOM]: 1.0, [ESSENCE.GALE]: 2.0, [ESSENCE.PSYCHE]: 1.0, [ESSENCE.VOID]: 1.0,
    [ESSENCE.LUMEN]: 2.0, [ESSENCE.FORGE]: 0.5,
  },
};

/**
 * Get effectiveness multiplier for a single essence vs a single essence
 */
export function getEffectiveness(attackEssence, defenseEssence) {
  return CHART[attackEssence]?.[defenseEssence] ?? 1.0;
}

/**
 * Get effectiveness multiplier for an attack essence against a dual-essence defender.
 * Average of both matchups, but super-effective and immunity are weighted.
 */
export function getDualEffectiveness(attackEssence, defEssence1, defEssence2) {
  const e1 = getEffectiveness(attackEssence, defEssence1);
  const e2 = getEffectiveness(attackEssence, defEssence2);
  
  // If either is immune, result is 0.25 (partial immunity, not full)
  if (e1 === 0 || e2 === 0) return 0.25;
  
  // Geometric mean for more dramatic super-effective/resistant combos
  return Math.sqrt(e1 * e2);
}

/**
 * Get effectiveness text label
 */
export function getEffectivenessText(multiplier) {
  if (multiplier >= 1.8) return 'super effective!';
  if (multiplier >= 1.3) return 'effective!';
  if (multiplier <= 0.3) return 'barely effective...';
  if (multiplier <= 0.6) return 'not very effective...';
  return null; // neutral, no text
}

// ── Resonance / Dissonance ──
// Adjacent essences on the Prism Wheel are harmonious
const PRISM_WHEEL = [
  ESSENCE.FLUX, ESSENCE.LUMEN, ESSENCE.EMBER, ESSENCE.TERRA,
  ESSENCE.BLOOM, ESSENCE.TIDE, ESSENCE.GALE, ESSENCE.FORGE,
  ESSENCE.PSYCHE, ESSENCE.VOID
];

/**
 * Check if two essences are harmonious (adjacent on the Prism Wheel)
 */
export function areHarmonious(e1, e2) {
  const i1 = PRISM_WHEEL.indexOf(e1);
  const i2 = PRISM_WHEEL.indexOf(e2);
  if (i1 === -1 || i2 === -1) return false;
  const diff = Math.abs(i1 - i2);
  return diff === 1 || diff === PRISM_WHEEL.length - 1;
}

/**
 * Check if two essences are opposing (across the Prism Wheel)
 */
export function areOpposing(e1, e2) {
  const i1 = PRISM_WHEEL.indexOf(e1);
  const i2 = PRISM_WHEEL.indexOf(e2);
  if (i1 === -1 || i2 === -1) return false;
  const diff = Math.abs(i1 - i2);
  return diff === Math.floor(PRISM_WHEEL.length / 2);
}

/**
 * Get resonance multiplier for a dual-essence Chimera
 */
export function getResonanceMultiplier(essence1, essence2) {
  if (areHarmonious(essence1, essence2)) return 1.15; // +15% boost
  if (areOpposing(essence1, essence2)) return 1.20;   // +20% damage but moves cost more
  return 1.0; // neutral
}

/**
 * Get the resonance state name
 */
export function getResonanceState(essence1, essence2) {
  if (areHarmonious(essence1, essence2)) return 'Harmonious';
  if (areOpposing(essence1, essence2)) return 'Dissonant';
  return 'Neutral';
}
