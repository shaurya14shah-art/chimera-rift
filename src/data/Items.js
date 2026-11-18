/* ═══════════════════════════════════════════════════
   Items.js — Item definitions
   ═══════════════════════════════════════════════════ */

export const ITEMS = {
  potion: {
    id: 'potion', name: 'Potion', category: 'heal',
    description: 'Restores 30 HP to one Chimera.',
    effect: { heal: 30 }, price: 100,
  },
  super_potion: {
    id: 'super_potion', name: 'Super Potion', category: 'heal',
    description: 'Restores 60 HP to one Chimera.',
    effect: { heal: 60 }, price: 250,
  },
  antidote: {
    id: 'antidote', name: 'Antidote', category: 'status',
    description: 'Cures poison from one Chimera.',
    effect: { cureStatus: 'poison' }, price: 80,
  },
  full_heal: {
    id: 'full_heal', name: 'Full Heal', category: 'status',
    description: 'Cures any status condition from one Chimera.',
    effect: { cureStatus: 'all' }, price: 400,
  },
  revive: {
    id: 'revive', name: 'Revive', category: 'heal',
    description: 'Revives a fainted Chimera with 50% HP.',
    effect: { revive: 0.5 }, price: 500,
  },
  rift_capsule: {
    id: 'rift_capsule', name: 'Rift Capsule', category: 'capture',
    description: 'A standard capsule for catching wild Chimeras.',
    effect: { catchRate: 1.0 }, price: 150,
  },
  ultra_capsule: {
    id: 'ultra_capsule', name: 'Ultra Capsule', category: 'capture',
    description: 'A high-grade capsule with improved catch rate.',
    effect: { catchRate: 2.0 }, price: 500,
  },
  prism_capsule: {
    id: 'prism_capsule', name: 'Prism Capsule', category: 'capture',
    description: 'The ultimate capsule. Guaranteed capture.',
    effect: { catchRate: 255 }, price: 0, // Can't buy — found only
  },
  bond_berry: {
    id: 'bond_berry', name: 'Bond Berry', category: 'bond',
    description: 'A sweet berry that increases a Chimera\'s bond by 10.',
    effect: { bond: 10 }, price: 200,
  },
  pp_restore: {
    id: 'pp_restore', name: 'Essence Tonic', category: 'pp',
    description: 'Restores 5 PP to one move.',
    effect: { ppRestore: 5 }, price: 300,
  },
};

export const SHOP_INVENTORY = [
  { itemId: 'potion', stock: -1 },
  { itemId: 'antidote', stock: -1 },
  { itemId: 'rift_capsule', stock: -1 },
  { itemId: 'bond_berry', stock: 5 },
  { itemId: 'super_potion', stock: -1 },
  { itemId: 'full_heal', stock: 3 },
  { itemId: 'ultra_capsule', stock: 3 },
  { itemId: 'revive', stock: 2 },
];

export function getItem(id) {
  return ITEMS[id] || null;
}
