/* ═══════════════════════════════════════════════════
   SaveSystem.js — Save/Load via LocalStorage
   ═══════════════════════════════════════════════════ */

const SAVE_KEY = 'chimera_rift_save';

export class SaveSystem {
  static save(gameState) {
    try {
      const data = {
        version: 1,
        timestamp: Date.now(),
        playerName: gameState.playerName,
        party: gameState.party.map(c => c.serialize()),
        currentMap: gameState.currentMap,
        playerX: gameState.playerX,
        playerY: gameState.playerY,
        storyFlags: gameState.storyFlags,
        codex: gameState.codex,
        items: gameState.items,
        money: gameState.money,
        playtime: gameState.playtime,
        badges: gameState.badges || [],
        defeatedTrainers: gameState.defeatedTrainers || [],
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  static hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  static deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }
}
