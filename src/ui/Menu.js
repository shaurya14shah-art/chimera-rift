import { KEYS } from '../constants.js';

// Since game object is in main.js, we can use the methods attached to it.

let gameRef = null;

export function initMenu(game) {
  gameRef = game;

  document.getElementById('btn-menu-party').addEventListener('click', () => setMenuContent('Party view not implemented yet.'));
  document.getElementById('btn-menu-inventory').addEventListener('click', () => setMenuContent('Inventory view not implemented yet.'));
  document.getElementById('btn-menu-codex').addEventListener('click', () => setMenuContent('Codex view not implemented yet.'));
  
  document.getElementById('btn-menu-save').addEventListener('click', () => {
    if (gameRef && gameRef.saveGame) {
      gameRef.saveGame();
      setMenuContent('Game Saved successfully!');
    } else {
      setMenuContent('Save failed.');
    }
  });

  document.getElementById('btn-menu-settings').addEventListener('click', () => {
    gameRef.audio.toggleMute();
    setMenuContent('Audio toggled.');
  });

  document.getElementById('btn-menu-close').addEventListener('click', closeMenu);
}

export function openMenu() {
  if (!gameRef) return;
  gameRef.previousScene = gameRef.scene;
  gameRef.scene = 'menu';
  document.getElementById('in-game-menu').classList.remove('hidden');
  setMenuContent('Select an option.');
  gameRef.audio.playSFX('cursor');
}

export function closeMenu() {
  if (!gameRef) return;
  if (gameRef.scene === 'menu') {
    gameRef.scene = gameRef.previousScene || 'overworld';
  }
  document.getElementById('in-game-menu').classList.add('hidden');
  gameRef.audio.playSFX('cursor');
}

export function updateMenu(dt) {
  // Can close with menu key or escape
  if (gameRef.input.isPressed(KEYS.MENU) || gameRef.input.isPressed(['Escape'])) {
    closeMenu();
  }
}

function setMenuContent(text) {
  const content = document.querySelector('.menu-placeholder-text');
  if (content) {
    content.textContent = text;
  }
}
