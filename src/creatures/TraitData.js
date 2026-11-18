/* ═══════════════════════════════════════════════════
   TraitData.js — Trait definitions and roller
   ═══════════════════════════════════════════════════ */

export const TRAITS = {
  volatile: {
    name: 'Volatile',
    description: '+25% damage, -15% accuracy.',
    statMods: { atk: 1.25, spAtk: 1.25 },
    accuracyMod: -15,
    weight: 15,
  },
  stalwart: {
    name: 'Stalwart',
    description: '+20% defense, -10% speed.',
    statMods: { def: 1.20, spDef: 1.10 },
    spdMod: 0.9,
    weight: 15,
  },
  swift: {
    name: 'Swift',
    description: '+20% speed, chance to strike first.',
    statMods: { spd: 1.20 },
    firstStrikeChance: 0.15,
    weight: 15,
  },
  resonant: {
    name: 'Resonant',
    description: 'Bond grows 50% faster.',
    bondMult: 1.5,
    weight: 12,
  },
  feral: {
    name: 'Feral',
    description: 'Cannot be fused, but +30% all stats.',
    statMods: { atk: 1.30, def: 1.30, spAtk: 1.30, spDef: 1.30, spd: 1.30, hp: 1.30 },
    canFuse: false,
    weight: 3,
  },
  mythic: {
    name: 'Mythic',
    description: 'Extremely rare. Learns a move from a different essence.',
    bonusMove: true,
    weight: 1,
  },
  calm: {
    name: 'Calm',
    description: '+10% Sp.Def, -5% Attack.',
    statMods: { spDef: 1.10, atk: 0.95 },
    weight: 15,
  },
  brave: {
    name: 'Brave',
    description: '+10% Attack, -5% Speed.',
    statMods: { atk: 1.10, spd: 0.95 },
    weight: 15,
  },
  timid: {
    name: 'Timid',
    description: '+10% Speed, -5% Attack.',
    statMods: { spd: 1.10, atk: 0.95 },
    weight: 15,
  },
  hardy: {
    name: 'Hardy',
    description: 'No stat modifications. Balanced.',
    statMods: {},
    weight: 20,
  },
};

/**
 * Roll a random trait based on weights
 */
export function rollTrait() {
  const entries = Object.entries(TRAITS);
  const totalWeight = entries.reduce((sum, [, t]) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const [id, trait] of entries) {
    roll -= trait.weight;
    if (roll <= 0) return id;
  }

  return 'hardy'; // fallback
}
