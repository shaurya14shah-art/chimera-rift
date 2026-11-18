/* ═══════════════════════════════════════════════════
   Chimera.js — Chimera instance class
   Represents a specific chimera with individual stats,
   moves, bond, traits, and status.
   ═══════════════════════════════════════════════════ */

import { xpForLevel, STATUS, STAT, BOND_LEVEL } from '../constants.js';
import { getChimeraData } from './ChimeraData.js';
import { getMove } from './MoveData.js';
import { TRAITS, rollTrait } from './TraitData.js';

export class Chimera {
  constructor(speciesId, level = 5, options = {}) {
    const data = getChimeraData(speciesId);
    if (!data) throw new Error(`Unknown chimera species: ${speciesId}`);

    // Identity
    this.speciesId = speciesId;
    this.nickname = options.nickname || data.name;
    this.species = data;

    // Level & XP
    this.level = level;
    this.xp = xpForLevel(level);
    this.xpToNext = xpForLevel(level + 1);

    // Trait (random or specified)
    this.trait = options.trait || rollTrait();

    // IVs (individual values, 0-15 for each stat — gives each chimera uniqueness)
    this.ivs = options.ivs || {
      hp: Math.floor(Math.random() * 16),
      atk: Math.floor(Math.random() * 16),
      def: Math.floor(Math.random() * 16),
      spAtk: Math.floor(Math.random() * 16),
      spDef: Math.floor(Math.random() * 16),
      spd: Math.floor(Math.random() * 16),
    };

    // Calculate actual stats
    this._calcStats();

    // Current HP
    this.currentHp = options.currentHp ?? this.maxHp;

    // Moves (up to 4)
    this.moves = this._getInitialMoves();

    // Bond (0-100)
    this.bond = options.bond ?? (options.isWild ? 0 : 30);

    // Status
    this.status = STATUS.NONE;
    this.statusTurns = 0;

    // Battle state (reset each battle)
    this.statStages = { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0, accuracy: 0, evasion: 0 };
    this.isProtecting = false;
    this.lastMoveUsed = null;
    this.flinched = false;

    // Fusion state
    this.isFused = false;
    this.fusionTurns = 0;
    this.exhaustedTurns = 0;

    // Capture info
    this.isWild = options.isWild ?? false;
    this.catchDifficulty = data.catchDifficulty;

    // Codex progress
    this.seen = false;
    this.caught = false;
  }

  _calcStats() {
    const base = this.species.baseStats;
    const traitMods = TRAITS[this.trait]?.statMods || {};

    const calc = (baseStat, iv, statKey) => {
      let val = Math.floor(((baseStat * 2 + iv) * this.level) / 100 + 5);
      if (traitMods[statKey]) val = Math.floor(val * traitMods[statKey]);
      return val;
    };

    // HP has a different formula
    this.maxHp = Math.floor(((base.hp * 2 + this.ivs.hp) * this.level) / 100 + this.level + 10);
    if (traitMods.hp) this.maxHp = Math.floor(this.maxHp * traitMods.hp);

    this.stats = {
      atk:   calc(base.atk, this.ivs.atk, 'atk'),
      def:   calc(base.def, this.ivs.def, 'def'),
      spAtk: calc(base.spAtk, this.ivs.spAtk, 'spAtk'),
      spDef: calc(base.spDef, this.ivs.spDef, 'spDef'),
      spd:   calc(base.spd, this.ivs.spd, 'spd'),
    };
  }

  _getInitialMoves() {
    const learnset = this.species.learnset;
    const eligible = Object.entries(learnset)
      .filter(([lvl]) => parseFloat(lvl) <= this.level)
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
      .map(([, moveId]) => moveId);

    // Take up to 4 most recent moves
    return eligible.slice(0, 4).map(id => ({
      ...getMove(id),
      currentPP: getMove(id)?.pp || 10,
    }));
  }

  // ── Stat with stages ──
  getEffectiveStat(statKey) {
    const base = statKey === 'hp' ? this.maxHp : this.stats[statKey];
    const stage = this.statStages[statKey] || 0;
    const multiplier = stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
    return Math.floor(base * multiplier);
  }

  // ── HP ──
  heal(amount) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + Math.floor(amount));
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - Math.floor(amount));
    return this.currentHp <= 0;
  }

  isFainted() {
    return this.currentHp <= 0;
  }

  get hpPercent() {
    return this.currentHp / this.maxHp;
  }

  // ── Bond ──
  adjustBond(amount) {
    const traitMult = TRAITS[this.trait]?.bondMult || 1;
    this.bond = Math.max(0, Math.min(100, this.bond + amount * traitMult));
  }

  getBondLevel() {
    for (const [key, range] of Object.entries(BOND_LEVEL)) {
      if (this.bond >= range.min && this.bond <= range.max) return range;
    }
    return BOND_LEVEL.STRANGER;
  }

  getBondMultiplier() {
    if (this.bond >= 96) return 1.15;
    if (this.bond >= 76) return 1.10;
    if (this.bond >= 51) return 1.05;
    return 1.0;
  }

  canFuse() {
    return this.bond >= 76 && !this.isFainted() && this.exhaustedTurns <= 0;
  }

  // ── XP & Leveling ──
  gainXP(amount) {
    this.xp += amount;
    const leveledUp = [];

    while (this.xp >= this.xpToNext && this.level < 50) {
      this.level++;
      this.xpToNext = xpForLevel(this.level + 1);
      this._calcStats();
      
      // Heal on level up (small)
      this.heal(this.maxHp * 0.1);

      // Learn new moves
      const newMove = this.species.learnset[this.level];
      if (newMove) {
        const moveData = getMove(newMove);
        if (moveData && !this.moves.find(m => m.id === newMove)) {
          if (this.moves.length < 4) {
            this.moves.push({ ...moveData, currentPP: moveData.pp });
          }
          // If 4 moves, the player will be prompted to replace one
        }
      }

      leveledUp.push({
        level: this.level,
        newMove: newMove ? getMove(newMove) : null,
      });
    }

    return leveledUp;
  }

  // ── Evolution ──
  canEvolve() {
    if (!this.species.evolves) return false;
    return this.level >= this.species.evolves.level && this.bond >= this.species.evolves.bondReq;
  }

  evolve() {
    if (!this.canEvolve()) return false;
    const evoData = getChimeraData(this.species.evolves.into);
    if (!evoData) return false;

    this.speciesId = evoData.id;
    this.species = evoData;
    this._calcStats();
    this.currentHp = this.maxHp; // Full heal on evolution
    this.moves = this._getInitialMoves(); // Refresh moveset

    return true;
  }

  // ── Battle Reset ──
  resetBattleState() {
    this.statStages = { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0, accuracy: 0, evasion: 0 };
    this.isProtecting = false;
    this.lastMoveUsed = null;
    this.flinched = false;
  }

  // ── Move PP ──
  useMove(moveIndex) {
    if (moveIndex < 0 || moveIndex >= this.moves.length) return false;
    if (this.moves[moveIndex].currentPP <= 0) return false;
    this.moves[moveIndex].currentPP--;
    this.lastMoveUsed = this.moves[moveIndex].id;
    return true;
  }

  restoreAllPP() {
    for (const move of this.moves) {
      move.currentPP = getMove(move.id)?.pp || move.pp;
    }
  }

  // ── Full Heal ──
  fullHeal() {
    this.currentHp = this.maxHp;
    this.status = STATUS.NONE;
    this.statusTurns = 0;
    this.restoreAllPP();
    this.exhaustedTurns = 0;
  }

  // ── Serialize for save ──
  serialize() {
    return {
      speciesId: this.speciesId,
      nickname: this.nickname,
      level: this.level,
      xp: this.xp,
      trait: this.trait,
      ivs: { ...this.ivs },
      currentHp: this.currentHp,
      moves: this.moves.map(m => ({ id: m.id, currentPP: m.currentPP })),
      bond: this.bond,
      status: this.status,
    };
  }

  static deserialize(data) {
    const chimera = new Chimera(data.speciesId, data.level, {
      nickname: data.nickname,
      trait: data.trait,
      ivs: data.ivs,
      currentHp: data.currentHp,
      bond: data.bond,
    });
    chimera.xp = data.xp;
    chimera.status = data.status || STATUS.NONE;
    
    // Restore move PP
    if (data.moves) {
      chimera.moves = data.moves.map(m => {
        const moveData = getMove(m.id);
        return moveData ? { ...moveData, currentPP: m.currentPP } : null;
      }).filter(Boolean);
    }

    return chimera;
  }
}
