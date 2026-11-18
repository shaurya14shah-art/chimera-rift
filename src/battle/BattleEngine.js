/* ═══════════════════════════════════════════════════
   BattleEngine.js — Turn-based battle state machine
   Handles all combat logic, damage, status, terrain,
   fusion, AI, and victory/defeat conditions.
   ═══════════════════════════════════════════════════ */

import { BATTLE_STATE, STATUS, TERRAIN, TERRAIN_DURATION, TERRAIN_EFFECTS,
         MOVE_CATEGORY, FUSION_DURATION, FUSION_STAT_BONUS, FUSION_EXHAUST_TURNS } from '../constants.js';
import { getDualEffectiveness, getEffectivenessText, getResonanceMultiplier } from '../creatures/EssenceChart.js';
import { TRAITS } from '../creatures/TraitData.js';

export class BattleEngine {
  constructor() {
    this.state = BATTLE_STATE.INTRO;
    this.playerParty = [];
    this.activePlayerIndex = 0;
    this.enemy = null;         // Chimera instance
    this.isTrainerBattle = false;
    this.enemyTrainer = null;
    this.enemyParty = [];
    this.activeEnemyIndex = 0;

    // Terrain
    this.terrain = TERRAIN.NONE;
    this.terrainTurns = 0;

    // Turn tracking
    this.turnNumber = 0;

    // Message queue for UI
    this.messages = [];
    this.currentMessage = '';

    // Result callbacks
    this.onVictory = null;
    this.onDefeat = null;
    this.onRun = null;

    // Pending actions
    this.playerAction = null;
    this.pendingDamage = null;
  }

  /**
   * Initialize a wild encounter battle
   */
  initWild(playerParty, wildChimera) {
    this.playerParty = playerParty;
    this.activePlayerIndex = this._findFirstAlive(playerParty);
    this.enemy = wildChimera;
    this.enemy.isWild = true;
    this.isTrainerBattle = false;
    this.enemyTrainer = null;
    this.enemyParty = [wildChimera];
    this.activeEnemyIndex = 0;
    this._resetBattle();
  }

  /**
   * Initialize a trainer battle
   */
  initTrainer(playerParty, trainer) {
    this.playerParty = playerParty;
    this.activePlayerIndex = this._findFirstAlive(playerParty);
    this.enemyTrainer = trainer;
    this.enemyParty = trainer.party;
    this.activeEnemyIndex = 0;
    this.enemy = this.enemyParty[0];
    this.isTrainerBattle = true;
    this._resetBattle();
  }

  _resetBattle() {
    this.state = BATTLE_STATE.INTRO;
    this.terrain = TERRAIN.NONE;
    this.terrainTurns = 0;
    this.turnNumber = 0;
    this.messages = [];
    this.pendingDamage = null;

    // Reset battle state for all combatants
    this.playerParty.forEach(c => c.resetBattleState());
    this.enemyParty.forEach(c => c.resetBattleState());
  }

  _findFirstAlive(party) {
    return party.findIndex(c => !c.isFainted());
  }

  get playerChimera() {
    return this.playerParty[this.activePlayerIndex];
  }

  // ── State Machine ──

  /**
   * Advance to player select state
   */
  startSelect() {
    this.state = BATTLE_STATE.SELECT;
    this.currentMessage = 'What will you do?';
  }

  /**
   * Player selects a move
   */
  selectMove(moveIndex) {
    const chimera = this.playerChimera;
    if (!chimera || chimera.isFainted()) return;
    if (moveIndex < 0 || moveIndex >= chimera.moves.length) return;
    if (chimera.moves[moveIndex].currentPP <= 0) {
      this.currentMessage = 'No PP left for this move!';
      return;
    }

    this.playerAction = { type: 'move', moveIndex };
    this._executeTurn();
  }

  /**
   * Player attempts to run
   */
  selectRun() {
    if (this.isTrainerBattle) {
      this.currentMessage = "Can't run from a trainer battle!";
      return;
    }

    const playerSpd = this.playerChimera.getEffectiveStat('spd');
    const enemySpd = this.enemy.getEffectiveStat('spd');
    const escapeChance = (playerSpd / enemySpd) * 0.6 + 0.3;

    if (Math.random() < escapeChance) {
      this.state = BATTLE_STATE.RUN;
      this.currentMessage = 'Got away safely!';
      if (this.onRun) setTimeout(() => this.onRun(), 1500);
    } else {
      this.currentMessage = "Couldn't escape!";
      // Enemy still attacks
      this.playerAction = { type: 'run_failed' };
      this._executeTurn();
    }
  }

  /**
   * Player switches chimera
   */
  selectSwitch(partyIndex) {
    if (partyIndex === this.activePlayerIndex) return;
    if (this.playerParty[partyIndex].isFainted()) return;

    const oldName = this.playerChimera.nickname;
    this.activePlayerIndex = partyIndex;
    this.playerChimera.resetBattleState();

    this.playerAction = { type: 'switch' };
    this.messages.push(`${oldName}, come back!`);
    this.messages.push(`Go, ${this.playerChimera.nickname}!`);
    this._executeTurn();
  }

  // ── Turn Execution ──

  _executeTurn() {
    this.state = BATTLE_STATE.EXECUTE;
    this.turnNumber++;

    const player = this.playerChimera;
    const enemy = this.enemy;

    // Determine turn order
    const playerSpeed = player.getEffectiveStat('spd');
    const enemySpeed = enemy.getEffectiveStat('spd');

    // Check for status preventing action
    const playerCanAct = this._checkStatusAction(player);
    const enemyCanAct = this._checkStatusAction(enemy);

    // Get enemy action (AI)
    const enemyMoveIdx = this._getAIMove(enemy, player);

    // Priority check
    let playerPriority = 0;
    let enemyPriority = 0;
    if (this.playerAction?.type === 'move') {
      playerPriority = player.moves[this.playerAction.moveIndex]?.priority || 0;
    }
    if (enemyMoveIdx >= 0) {
      enemyPriority = enemy.moves[enemyMoveIdx]?.priority || 0;
    }

    // Switches always go first
    if (this.playerAction?.type === 'switch') {
      playerPriority = 100;
    }

    const playerFirst = playerPriority > enemyPriority ||
      (playerPriority === enemyPriority && playerSpeed >= enemySpeed);

    // Execute in order
    const results = [];

    if (playerFirst) {
      if (playerCanAct) results.push(...this._executeAction(player, enemy, this.playerAction, 'player'));
      if (!enemy.isFainted() && enemyCanAct) results.push(...this._executeAction(enemy, player, { type: 'move', moveIndex: enemyMoveIdx }, 'enemy'));
    } else {
      if (enemyCanAct) results.push(...this._executeAction(enemy, player, { type: 'move', moveIndex: enemyMoveIdx }, 'enemy'));
      if (!player.isFainted() && playerCanAct) results.push(...this._executeAction(player, enemy, this.playerAction, 'player'));
    }

    // End-of-turn effects
    results.push(...this._endOfTurnEffects(player, enemy));

    // Check for fainting
    if (enemy.isFainted()) {
      results.push(...this._handleEnemyFaint());
    }
    if (player.isFainted()) {
      results.push(...this._handlePlayerFaint());
    }

    // Queue all messages
    this.messages = results.map(r => r.message).filter(Boolean);
    this.pendingDamage = results.find(r => r.damage)?.damage || null;

    // Process message queue (UI will read these)
    if (this.messages.length > 0) {
      this.currentMessage = this.messages.shift();
    }

    // If no victory/defeat, return to select
    if (this.state === BATTLE_STATE.EXECUTE) {
      this.state = BATTLE_STATE.RESULT;
    }
  }

  _executeAction(attacker, defender, action, side) {
    const results = [];

    if (!action || action.type === 'run_failed' || action.type === 'switch') {
      return results;
    }

    if (action.type !== 'move') return results;

    const move = attacker.moves[action.moveIndex];
    if (!move) return results;

    // Use PP
    attacker.useMove(action.moveIndex);

    results.push({ message: `${attacker.nickname} used ${move.name}!` });

    // Accuracy check
    let accuracy = move.accuracy;
    const traitData = TRAITS[attacker.trait];
    if (traitData?.accuracyMod) accuracy += traitData.accuracyMod;

    // Luminous Aura terrain = perfect accuracy
    if (this.terrain === TERRAIN.LUMINOUS && TERRAIN_EFFECTS[TERRAIN.LUMINOUS]?.perfectAccuracy) {
      accuracy = 100;
    }

    if (Math.random() * 100 > accuracy) {
      results.push({ message: 'But it missed!' });
      return results;
    }

    // Protection check
    if (defender.isProtecting) {
      results.push({ message: `${defender.nickname} protected itself!` });
      return results;
    }

    // Protect move
    if (move.effect?.protect) {
      attacker.isProtecting = true;
      results.push({ message: `${attacker.nickname} braced for an attack!` });
      return results;
    }

    // Status moves
    if (move.category === MOVE_CATEGORY.STATUS || move.category === MOVE_CATEGORY.FIELD) {
      results.push(...this._applyStatusMove(attacker, defender, move, side));
      return results;
    }

    // Damage moves
    let totalDamage = 0;
    let hits = 1;

    if (move.effect?.multiHit) {
      hits = Math.floor(Math.random() * (move.effect.multiHit.max - move.effect.multiHit.min + 1)) + move.effect.multiHit.min;
    }

    // Charged Field extra hit
    if (this.terrain === TERRAIN.CHARGED && TERRAIN_EFFECTS[TERRAIN.CHARGED]?.extraHitChance) {
      if (Math.random() < TERRAIN_EFFECTS[TERRAIN.CHARGED].extraHitChance) {
        hits++;
        results.push({ message: 'The Charged Field sparked an extra hit!' });
      }
    }

    for (let i = 0; i < hits; i++) {
      const dmg = this._calcDamage(attacker, defender, move);
      totalDamage += dmg.damage;
      const fainted = defender.takeDamage(dmg.damage);

      if (dmg.critical) results.push({ message: 'A critical hit!' });
      if (dmg.effectivenessText) results.push({ message: `It's ${dmg.effectivenessText}` });
      if (fainted) break;
    }

    if (hits > 1) results.push({ message: `Hit ${hits} time(s)!` });

    results.push({ damage: { target: side === 'player' ? 'enemy' : 'player', amount: totalDamage } });

    // Recoil
    if (move.effect?.recoil) {
      const recoil = Math.floor(totalDamage * move.effect.recoil);
      attacker.takeDamage(recoil);
      results.push({ message: `${attacker.nickname} took recoil damage!` });
    }

    // Drain
    if (move.effect?.drain) {
      const heal = Math.floor(totalDamage * move.effect.drain);
      attacker.heal(heal);
      results.push({ message: `${attacker.nickname} drained energy!` });
    }

    // Status effect application
    if (move.effect?.chance && move.effect?.status) {
      if (Math.random() * 100 < move.effect.chance) {
        if (defender.status === STATUS.NONE) {
          defender.status = move.effect.status;
          defender.statusTurns = 0;
          results.push({ message: `${defender.nickname} was ${this._statusText(move.effect.status)}!` });
        }
      }
    }

    // Stat changes
    if (move.effect?.statChange) {
      results.push(...this._applyStatChange(attacker, defender, move.effect.statChange, side));
    }

    // Terrain setting
    if (move.effect?.terrainSet) {
      this.terrain = move.effect.terrainSet;
      this.terrainTurns = TERRAIN_DURATION;
      const terrainName = TERRAIN_EFFECTS[this.terrain]?.name || this.terrain;
      results.push({ message: `The battlefield became ${terrainName}!` });
    }

    // Bond adjustment (small positive for landing hits)
    if (side === 'player') {
      attacker.adjustBond(1);
    }

    return results;
  }

  _calcDamage(attacker, defender, move) {
    const isStrike = move.category === MOVE_CATEGORY.STRIKE;
    const atkStat = isStrike ? attacker.getEffectiveStat('atk') : attacker.getEffectiveStat('spAtk');
    const defStat = isStrike ? defender.getEffectiveStat('def') : defender.getEffectiveStat('spDef');

    // Base damage
    let damage = ((2 * attacker.level / 5 + 2) * move.power * (atkStat / defStat)) / 50 + 2;

    // STAB (Same-Type Attack Bonus) — if move essence matches either chimera essence
    const essences = attacker.species.essences;
    if (essences.includes(move.essence)) {
      damage *= 1.5;
    }

    // Type effectiveness (dual-essence defender)
    const defEssences = defender.species.essences;
    const effectiveness = getDualEffectiveness(move.essence, defEssences[0], defEssences[1]);
    damage *= effectiveness;

    // Resonance bonus for attacker's dual essences
    const resonanceMult = getResonanceMultiplier(essences[0], essences[1]);
    damage *= resonanceMult;

    // Bond multiplier
    damage *= attacker.getBondMultiplier();

    // Terrain bonus
    const terrainEffect = TERRAIN_EFFECTS[this.terrain];
    if (terrainEffect) {
      if (move.essence === terrainEffect.boostEssence) {
        damage *= terrainEffect.boostMult || 1;
      }
      if (move.essence === terrainEffect.weakenEssence) {
        damage *= terrainEffect.weakenMult || 1;
      }
    }

    // Critical hit (6.25% base)
    let critical = false;
    if (Math.random() < 0.0625) {
      damage *= 1.5;
      critical = true;
    }

    // Random factor (85-100%)
    damage *= 0.85 + Math.random() * 0.15;

    // Floor
    damage = Math.max(1, Math.floor(damage));

    return {
      damage,
      critical,
      effectiveness,
      effectivenessText: getEffectivenessText(effectiveness),
    };
  }

  _applyStatusMove(attacker, defender, move, side) {
    const results = [];

    // Heal
    if (move.effect?.heal) {
      const amount = Math.floor(attacker.maxHp * move.effect.heal);
      // Check Void Zone healing reduction
      let actualHeal = amount;
      if (this.terrain === TERRAIN.VOID_ZONE && TERRAIN_EFFECTS[TERRAIN.VOID_ZONE]?.healReduction) {
        actualHeal = Math.floor(amount * TERRAIN_EFFECTS[TERRAIN.VOID_ZONE].healReduction);
        results.push({ message: 'The Void Zone weakened the healing!' });
      }
      attacker.heal(actualHeal);
      results.push({ message: `${attacker.nickname} restored HP!` });
    }

    // Cure status
    if (move.effect?.cureStatus) {
      attacker.status = STATUS.NONE;
      attacker.statusTurns = 0;
      results.push({ message: `${attacker.nickname} was cured!` });
    }

    // Self-sleep (Rest)
    if (move.effect?.selfSleep) {
      attacker.status = STATUS.SLEEP;
      attacker.statusTurns = 0;
    }

    // Status infliction
    if (move.effect?.status && !move.effect?.chance) {
      if (defender.status === STATUS.NONE) {
        defender.status = move.effect.status;
        defender.statusTurns = 0;
        results.push({ message: `${defender.nickname} was ${this._statusText(move.effect.status)}!` });
      } else {
        results.push({ message: 'But it had no effect...' });
      }
    }

    // Stat changes
    if (move.effect?.statChange) {
      results.push(...this._applyStatChange(attacker, defender, move.effect.statChange, side));
    }
    if (move.effect?.statChange2) {
      results.push(...this._applyStatChange(attacker, defender, move.effect.statChange2, side));
    }

    // Terrain
    if (move.effect?.terrainSet) {
      this.terrain = move.effect.terrainSet;
      this.terrainTurns = TERRAIN_DURATION;
      results.push({ message: `The battlefield became ${TERRAIN_EFFECTS[this.terrain]?.name}!` });
    }

    // Protect
    if (move.effect?.protect) {
      attacker.isProtecting = true;
      results.push({ message: `${attacker.nickname} braced for an attack!` });
    }

    return results;
  }

  _applyStatChange(attacker, defender, statChange, side) {
    const results = [];
    const target = statChange.target === 'self' ? attacker :
                   statChange.target === 'enemy' ? defender : attacker;
    const stat = statChange.stat;
    const stages = statChange.stages;

    const oldStage = target.statStages[stat] || 0;
    target.statStages[stat] = Math.max(-6, Math.min(6, oldStage + stages));
    const newStage = target.statStages[stat];

    const statNames = { atk: 'Attack', def: 'Defense', spAtk: 'Sp.Attack', spDef: 'Sp.Defense', spd: 'Speed', accuracy: 'Accuracy', evasion: 'Evasion' };
    const change = stages > 0 ? (stages >= 2 ? 'sharply rose' : 'rose') : (stages <= -2 ? 'sharply fell' : 'fell');

    if (newStage !== oldStage) {
      results.push({ message: `${target.nickname}'s ${statNames[stat] || stat} ${change}!` });
    } else {
      results.push({ message: `${target.nickname}'s ${statNames[stat] || stat} can't go any ${stages > 0 ? 'higher' : 'lower'}!` });
    }

    return results;
  }

  _checkStatusAction(chimera) {
    switch (chimera.status) {
      case STATUS.SLEEP:
        chimera.statusTurns++;
        if (chimera.statusTurns >= 3 || Math.random() < 0.33) {
          chimera.status = STATUS.NONE;
          chimera.statusTurns = 0;
          this.messages.push(`${chimera.nickname} woke up!`);
          return true;
        }
        this.messages.push(`${chimera.nickname} is fast asleep.`);
        return false;

      case STATUS.FREEZE:
        if (Math.random() < 0.2) {
          chimera.status = STATUS.NONE;
          this.messages.push(`${chimera.nickname} thawed out!`);
          return true;
        }
        this.messages.push(`${chimera.nickname} is frozen solid!`);
        return false;

      case STATUS.PARALYZE:
        if (Math.random() < 0.25) {
          this.messages.push(`${chimera.nickname} is paralyzed! It can't move!`);
          return false;
        }
        return true;

      case STATUS.CONFUSE:
        chimera.statusTurns++;
        if (chimera.statusTurns >= 4) {
          chimera.status = STATUS.NONE;
          chimera.statusTurns = 0;
          this.messages.push(`${chimera.nickname} snapped out of confusion!`);
          return true;
        }
        if (Math.random() < 0.33) {
          const selfDmg = Math.floor(chimera.maxHp * 0.1);
          chimera.takeDamage(selfDmg);
          this.messages.push(`${chimera.nickname} hurt itself in confusion!`);
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  _endOfTurnEffects(player, enemy) {
    const results = [];

    // Reset protect
    player.isProtecting = false;
    enemy.isProtecting = false;

    // Status damage
    for (const chimera of [player, enemy]) {
      if (chimera.isFainted()) continue;

      if (chimera.status === STATUS.BURN) {
        const dmg = Math.max(1, Math.floor(chimera.maxHp * 0.0625));
        chimera.takeDamage(dmg);
        results.push({ message: `${chimera.nickname} was hurt by its burn!` });
      }

      if (chimera.status === STATUS.POISON) {
        const dmg = Math.max(1, Math.floor(chimera.maxHp * 0.125));
        chimera.takeDamage(dmg);
        results.push({ message: `${chimera.nickname} was hurt by poison!` });
      }
    }

    // Terrain effects
    if (this.terrain !== TERRAIN.NONE) {
      const effect = TERRAIN_EFFECTS[this.terrain];

      // Overgrown heal
      if (effect?.healPerTurn && effect?.healEssence) {
        for (const chimera of [player, enemy]) {
          if (chimera.isFainted()) continue;
          if (chimera.species.essences.includes(effect.healEssence)) {
            const heal = Math.floor(chimera.maxHp * effect.healPerTurn);
            chimera.heal(heal);
            results.push({ message: `${chimera.nickname} was healed by the ${effect.name}!` });
          }
        }
      }

      // Decrement terrain timer
      this.terrainTurns--;
      if (this.terrainTurns <= 0) {
        results.push({ message: `The ${effect?.name || 'terrain'} faded away.` });
        this.terrain = TERRAIN.NONE;
      }
    }

    // Fusion timer
    for (const chimera of [player, enemy]) {
      if (chimera.isFused) {
        chimera.fusionTurns--;
        if (chimera.fusionTurns <= 0) {
          chimera.isFused = false;
          chimera.exhaustedTurns = FUSION_EXHAUST_TURNS;
          results.push({ message: `${chimera.nickname}'s fusion ended! It's exhausted!` });
        }
      }
      if (chimera.exhaustedTurns > 0) {
        chimera.exhaustedTurns--;
      }
    }

    return results;
  }

  _handleEnemyFaint() {
    const results = [];
    results.push({ message: `${this.enemy.nickname} fainted!` });

    // Bond boost for winning
    this.playerChimera.adjustBond(3);

    // XP gain
    const baseXP = this.enemy.level * 7 + 10;
    const trainerBonus = this.isTrainerBattle ? 1.5 : 1;
    const xpGained = Math.floor(baseXP * trainerBonus);
    
    const levelUps = this.playerChimera.gainXP(xpGained);
    results.push({ message: `${this.playerChimera.nickname} gained ${xpGained} XP!` });

    for (const lu of levelUps) {
      results.push({ message: `${this.playerChimera.nickname} grew to level ${lu.level}!` });
      if (lu.newMove) {
        results.push({ message: `${this.playerChimera.nickname} learned ${lu.newMove.name}!` });
      }
    }

    // Check for evolution
    if (this.playerChimera.canEvolve()) {
      const oldName = this.playerChimera.nickname;
      this.playerChimera.evolve();
      results.push({ message: `${oldName} evolved into ${this.playerChimera.species.name}!` });
    }

    // Check if trainer has more chimeras
    if (this.isTrainerBattle) {
      const nextAlive = this.enemyParty.findIndex((c, i) => i > this.activeEnemyIndex && !c.isFainted());
      if (nextAlive >= 0) {
        this.activeEnemyIndex = nextAlive;
        this.enemy = this.enemyParty[nextAlive];
        this.enemy.resetBattleState();
        results.push({ message: `${this.enemyTrainer.name} sent out ${this.enemy.nickname}!` });
        this.state = BATTLE_STATE.RESULT;
        return results;
      }
    }

    // Victory!
    this.state = BATTLE_STATE.VICTORY;
    if (this.isTrainerBattle) {
      results.push({ message: `You defeated ${this.enemyTrainer.name}!` });
    }
    if (this.onVictory) setTimeout(() => this.onVictory(), 2000);

    return results;
  }

  _handlePlayerFaint() {
    const results = [];
    results.push({ message: `${this.playerChimera.nickname} fainted!` });
    this.playerChimera.adjustBond(-5); // Bond penalty for fainting

    // Check if player has more chimeras
    const nextAlive = this._findFirstAlive(this.playerParty);
    if (nextAlive >= 0 && nextAlive !== this.activePlayerIndex) {
      this.activePlayerIndex = nextAlive;
      this.playerChimera.resetBattleState();
      results.push({ message: `Go, ${this.playerChimera.nickname}!` });
      this.state = BATTLE_STATE.RESULT;
      return results;
    }

    // Defeat
    if (this._findFirstAlive(this.playerParty) < 0) {
      this.state = BATTLE_STATE.DEFEAT;
      results.push({ message: 'All your Chimeras have fainted...' });
      if (this.onDefeat) setTimeout(() => this.onDefeat(), 2000);
    }

    return results;
  }

  // ── AI ──
  _getAIMove(enemy, player) {
    const validMoves = enemy.moves.map((m, i) => ({ ...m, index: i }))
      .filter(m => m.currentPP > 0);

    if (validMoves.length === 0) return -1; // Struggle (no PP)

    // Simple tactical AI:
    // 1. If HP low, prefer healing/status moves
    // 2. Prefer super-effective moves
    // 3. Random among decent options

    const scored = validMoves.map(move => {
      let score = move.power || 30; // Base score from power

      // STAB bonus
      if (enemy.species.essences.includes(move.essence)) {
        score *= 1.3;
      }

      // Type effectiveness
      const eff = getDualEffectiveness(move.essence, player.species.essences[0], player.species.essences[1]);
      score *= eff;

      // Healing when low HP
      if (move.effect?.heal && enemy.hpPercent < 0.4) {
        score *= 2.5;
      }

      // Status moves less valuable if enemy already has status
      if (move.effect?.status && player.status !== STATUS.NONE) {
        score *= 0.3;
      }

      return { ...move, score };
    });

    // Sort by score and pick from top 2 with some randomness
    scored.sort((a, b) => b.score - a.score);
    const pick = Math.random() < 0.7 ? 0 : Math.min(1, scored.length - 1);
    return scored[pick]?.index ?? 0;
  }

  // ── Message Queue ──
  advanceMessage() {
    if (this.messages.length > 0) {
      this.currentMessage = this.messages.shift();
      return true;
    }

    // All messages consumed — return to select or end
    if (this.state === BATTLE_STATE.RESULT) {
      this.startSelect();
    }
    return false;
  }

  _statusText(status) {
    const map = {
      [STATUS.BURN]: 'burned',
      [STATUS.FREEZE]: 'frozen',
      [STATUS.PARALYZE]: 'paralyzed',
      [STATUS.POISON]: 'poisoned',
      [STATUS.SLEEP]: 'put to sleep',
      [STATUS.CONFUSE]: 'confused',
    };
    return map[status] || 'afflicted';
  }
}
