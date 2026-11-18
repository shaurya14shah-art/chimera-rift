/* ═══════════════════════════════════════════════════
   main.js — Chimera Rift Game Bootstrap
   Ties everything together: engine, scenes, battle,
   creatures, world, and UI.
   ═══════════════════════════════════════════════════ */

import { NATIVE_WIDTH, NATIVE_HEIGHT, TILE_SIZE, KEYS, PLAYER_SPEED, PLAYER_RUN_SPEED,
         ENCOUNTER_RATE, ESSENCE_COLORS, ESSENCE_NAMES, BATTLE_STATE, STATUS } from './constants.js';
import { GameLoop } from './engine/GameLoop.js';
import { Canvas } from './engine/Canvas.js';
import { Input } from './engine/Input.js';
import { Camera } from './engine/Camera.js';
import { TileMap } from './engine/TileMap.js';
import { ParticleSystem, PARTICLE_PRESETS } from './engine/Particles.js';
import { TransitionManager } from './engine/Transition.js';
import { AudioManager } from './engine/AudioManager.js';
import { createParallaxLayers } from './engine/ParallaxLayer.js';
import { initSprites, spriteCache, generateChimeraSprite } from './sprites/SpriteGenerator.js';
import { Chimera } from './creatures/Chimera.js';
import { getChimeraData, getStarterChimeras, getWildChimerasForRoute } from './creatures/ChimeraData.js';
import { BattleEngine } from './battle/BattleEngine.js';
import { getMap, ALL_MAPS } from './world/MapData.js';
import { SaveSystem } from './data/SaveSystem.js';
import { ITEMS, getItem } from './data/Items.js';
import { initMenu, openMenu, updateMenu } from './ui/Menu.js';

// ═══════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════
const game = {
  scene: 'title',  // title | overworld | battle | dialog | starterSelect
  canvas: null,
  input: null,
  camera: null,
  tileMap: null,
  particles: new ParticleSystem(),
  transition: new TransitionManager(),
  audio: new AudioManager(),
  parallaxLayers: [],

  // Player state
  playerName: 'Walker',
  playerX: 0,
  playerY: 0,
  playerDir: 'down',
  playerAnimFrame: 0,
  playerAnimTimer: 0,
  playerMoving: false,

  // Party & inventory
  party: [],
  items: { potion: 3, rift_capsule: 5 },
  money: 1000,

  // World state
  currentMapId: 'prism_town',
  currentMap: null,
  storyFlags: {},
  defeatedTrainers: [],
  codex: {},

  // Battle state
  battleEngine: new BattleEngine(),
  battleAnimTimer: 0,
  battleSpriteFrame: 0,

  // Dialog state
  dialogQueue: [],
  dialogIndex: 0,
  dialogCharIndex: 0,
  dialogTimer: 0,
  dialogCallback: null,

  // Starter selection
  starterIndex: 0,

  // UI state
  menuCursor: 0,
  showBattleActions: true,
  selectedMoveIndex: -1,

  // Timing
  playtime: 0,
  stepCounter: 0,

  // Title screen
  titleParticles: [],
};

// ═══════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════
function init() {
  // Initialize engine
  game.canvas = new Canvas('game-canvas');
  game.input = new Input();
  game.camera = new Camera();
  game.tileMap = new TileMap();

  // Attach global helpers to game object for UI
  game.saveGame = saveGame;
  game.showNotification = showNotification;

  // Generate all sprites
  initSprites();
  
  // Initialize Menu
  initMenu(game);

  // Setup title screen particles
  createTitleParticles();

  // Check for save
  if (SaveSystem.hasSave()) {
    document.getElementById('btn-continue').disabled = false;
  }

  // UI Event listeners
  document.getElementById('btn-new-game').addEventListener('click', startNewGame);
  document.getElementById('btn-continue').addEventListener('click', loadGame);
  document.getElementById('btn-settings').addEventListener('click', () => game.audio.toggleMute());

  // Battle action buttons
  document.getElementById('btn-fight').addEventListener('click', () => onBattleAction('fight'));
  document.getElementById('btn-bag').addEventListener('click', () => onBattleAction('bag'));
  document.getElementById('btn-chimera').addEventListener('click', () => onBattleAction('chimera'));
  document.getElementById('btn-fuse').addEventListener('click', () => onBattleAction('fuse'));
  document.getElementById('btn-run').addEventListener('click', () => onBattleAction('run'));
  document.getElementById('btn-move-back').addEventListener('click', () => showBattleActions());

  // Keyboard shortcut for title
  window.addEventListener('keydown', (e) => {
    if (game.scene === 'title' && (e.key === 'Enter' || e.key === ' ')) {
      startNewGame();
    }
  });

  // Start game loop
  const loop = new GameLoop(update, render);
  loop.start();
}

// ═══════════════════════════════════════════════════
// TITLE SCREEN
// ═══════════════════════════════════════════════════
function createTitleParticles() {
  const container = document.getElementById('title-particles');
  const colors = Object.values(ESSENCE_COLORS);

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'title-particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = `${4 + Math.random() * 6}s`;
    p.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(p);
  }
}

function startNewGame() {
  game.audio.init();
  game.audio.playSFX('confirm');

  // Hide title, show starter selection
  game.scene = 'starterSelect';
  document.getElementById('title-screen').classList.add('hidden');

  // Show dialog for Professor Lumen
  showStarterSelection();
}

function loadGame() {
  const data = SaveSystem.load();
  if (!data) return;

  game.audio.init();
  game.playerName = data.playerName || 'Walker';
  game.party = data.party.map(p => Chimera.deserialize(p));
  game.currentMapId = data.currentMap || 'prism_town';
  game.playerX = data.playerX || 0;
  game.playerY = data.playerY || 0;
  game.storyFlags = data.storyFlags || {};
  game.items = data.items || {};
  game.money = data.money || 0;
  game.playtime = data.playtime || 0;
  game.defeatedTrainers = data.defeatedTrainers || [];
  game.codex = data.codex || {};

  document.getElementById('title-screen').classList.add('hidden');
  enterOverworld(game.currentMapId);
}

// ═══════════════════════════════════════════════════
// STARTER SELECTION
// ═══════════════════════════════════════════════════
function showStarterSelection() {
  const starters = getStarterChimeras();
  game.starterIndex = 0;

  // Show dialog first
  startDialog([
    { speaker: 'Prof. Lumen', text: "Welcome, young Rift Walker! I am Professor Lumen." },
    { speaker: 'Prof. Lumen', text: "The world is fractured — Rifts overlay reality, and Chimeras are born where they collide." },
    { speaker: 'Prof. Lumen', text: "I'd like you to choose your first Chimera partner. Choose wisely!" },
  ], () => {
    game.scene = 'starterSelect';
  });
}

function renderStarterSelect() {
  const starters = getStarterChimeras();
  const ctx = game.canvas.getCtx();

  // Background
  game.canvas.clear('#0a0a18');

  // Title
  game.canvas.drawText('Choose Your First Chimera', NATIVE_WIDTH / 2, 20, {
    color: '#f0d060', size: 10, align: 'center'
  });

  // Draw three starter cards
  for (let i = 0; i < starters.length; i++) {
    const data = getChimeraData(starters[i]);
    const cardX = 40 + i * 150;
    const cardY = 60;
    const cardW = 120;
    const cardH = 180;
    const selected = i === game.starterIndex;

    // Card background
    ctx.fillStyle = selected ? '#1a2a40' : '#121220';
    ctx.strokeStyle = selected ? '#f0d060' : '#333';
    ctx.lineWidth = selected ? 2 : 1;
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Sprite
    const sprite = spriteCache[`chimera_${starters[i]}`];
    if (sprite) {
      const frame = Math.floor(game.battleAnimTimer * 3) % 4;
      ctx.drawImage(sprite, frame * 32, 0, 32, 32, cardX + 28, cardY + 15, 64, 64);
    }

    // Name
    game.canvas.drawText(data.name, cardX + cardW / 2, cardY + 90, {
      color: '#fff', size: 8, align: 'center'
    });

    // Essences
    const e1Color = ESSENCE_COLORS[data.essences[0]];
    const e2Color = ESSENCE_COLORS[data.essences[1]];
    ctx.fillStyle = e1Color;
    ctx.fillRect(cardX + 15, cardY + 108, 40, 12);
    game.canvas.drawText(ESSENCE_NAMES[data.essences[0]], cardX + 35, cardY + 110, {
      color: '#fff', size: 6, align: 'center'
    });
    ctx.fillStyle = e2Color;
    ctx.fillRect(cardX + 65, cardY + 108, 40, 12);
    game.canvas.drawText(ESSENCE_NAMES[data.essences[1]], cardX + 85, cardY + 110, {
      color: '#fff', size: 6, align: 'center'
    });

    // Stats preview
    const stats = data.baseStats;
    const statY = cardY + 130;
    game.canvas.drawText(`HP:${stats.hp}  ATK:${stats.atk}`, cardX + 5, statY, { color: '#888', size: 5 });
    game.canvas.drawText(`DEF:${stats.def}  SPD:${stats.spd}`, cardX + 5, statY + 10, { color: '#888', size: 5 });
    game.canvas.drawText(`SA:${stats.spAtk}  SD:${stats.spDef}`, cardX + 5, statY + 20, { color: '#888', size: 5 });

    // Selection arrow
    if (selected) {
      game.canvas.drawText('▼', cardX + cardW / 2, cardY - 10, {
        color: '#f0d060', size: 10, align: 'center'
      });
    }
  }

  // Instructions
  game.canvas.drawText('← → to choose,  ENTER to confirm', NATIVE_WIDTH / 2, 260, {
    color: '#666', size: 7, align: 'center'
  });

  // Description of selected
  const selectedData = getChimeraData(starters[game.starterIndex]);
  game.canvas.drawText(selectedData.description, NATIVE_WIDTH / 2, 280, {
    color: '#aaa', size: 5, align: 'center'
  });
}

function updateStarterSelect(dt) {
  game.battleAnimTimer += dt;

  if (game.input.isPressed(['ArrowLeft', 'a', 'A'])) {
    game.starterIndex = (game.starterIndex + 2) % 3;
    game.audio.playSFX('cursor');
  }
  if (game.input.isPressed(['ArrowRight', 'd', 'D'])) {
    game.starterIndex = (game.starterIndex + 1) % 3;
    game.audio.playSFX('cursor');
  }
  if (game.input.isPressed(['Enter', ' ', 'z', 'Z'])) {
    const starters = getStarterChimeras();
    const starterSpecies = starters[game.starterIndex];
    const starter = new Chimera(starterSpecies, 5, { bond: 30 });
    game.party.push(starter);

    game.audio.playSFX('confirm');

    // Story dialog
    startDialog([
      { speaker: 'Prof. Lumen', text: `An excellent choice! ${starter.species.name} will be a wonderful partner.` },
      { speaker: 'Prof. Lumen', text: "Take these Rift Capsules — you can use them to catch wild Chimeras." },
      { speaker: 'Prof. Lumen', text: "The Rifts are growing unstable. Head south to Route 1 and investigate." },
      { speaker: 'Prof. Lumen', text: "And be careful of a Rift Walker named Kael... he has different ideas about Chimeras." },
    ], () => {
      game.storyFlags.HAS_STARTER = true;
      enterOverworld('prism_town');
      showNotification(`${starter.species.name} joined your party!`);
    });
  }
}

// ═══════════════════════════════════════════════════
// OVERWORLD
// ═══════════════════════════════════════════════════
function enterOverworld(mapId) {
  const mapData = getMap(mapId);
  game.currentMapId = mapId;
  game.currentMap = mapData;
  game.scene = 'overworld';

  // Load tilemap
  game.tileMap.loadMap(mapData, spriteCache.tileset);

  // Setup camera bounds
  game.camera.setBounds(mapData.width * TILE_SIZE, mapData.height * TILE_SIZE);

  // Set player position if spawn point exists and we're entering fresh
  if (mapData.playerSpawn && game.playerX === 0 && game.playerY === 0) {
    game.playerX = mapData.playerSpawn.x * TILE_SIZE;
    game.playerY = mapData.playerSpawn.y * TILE_SIZE;
  }

  game.camera.snapTo(game.playerX, game.playerY);

  // Setup parallax layers
  game.parallaxLayers = createParallaxLayers(mapData.biome || 'meadow');

  // Show location banner
  showLocationBanner(mapData.name);

  // Start music
  game.audio.startTrack(mapData.music || 'overworld');

  // Show overworld HUD
  document.getElementById('overworld-hud').classList.remove('hidden');
  document.getElementById('battle-hud').classList.add('hidden');
  document.getElementById('battle-menu').classList.add('hidden');

  // Update party bar
  updatePartyBar();

  // Auto-save
  saveGame();
}

function updateOverworld(dt) {
  // Player movement
  const { dx, dy } = game.input.getDirection();
  const isRunning = game.input.isDown(KEYS.RUN);
  const speed = isRunning ? PLAYER_RUN_SPEED : PLAYER_SPEED;

  if (dx !== 0 || dy !== 0) {
    // Update direction
    if (Math.abs(dx) >= Math.abs(dy)) {
      game.playerDir = dx > 0 ? 'right' : 'left';
    } else {
      game.playerDir = dy > 0 ? 'down' : 'up';
    }

    // Try to move
    const newX = game.playerX + dx * speed;
    const newY = game.playerY + dy * speed;

    // Check collision (with 2-pixel inset for smoother movement)
    const inset = 2;
    if (!game.tileMap.isBlockedAtPixel(newX + inset, game.playerY + inset, TILE_SIZE - inset * 2, TILE_SIZE - inset * 2)) {
      game.playerX = newX;
    }
    if (!game.tileMap.isBlockedAtPixel(game.playerX + inset, newY + inset, TILE_SIZE - inset * 2, TILE_SIZE - inset * 2)) {
      game.playerY = newY;
    }

    game.playerMoving = true;
    game.playerAnimTimer += dt;
    if (game.playerAnimTimer >= 0.2) {
      game.playerAnimTimer -= 0.2;
      game.playerAnimFrame = (game.playerAnimFrame + 1) % 2;
    }

    // Step counter for encounters
    game.stepCounter++;
    if (game.stepCounter % 16 === 0) {
      checkWildEncounter();
    }
  } else {
    game.playerMoving = false;
    game.playerAnimFrame = 0;
  }

  // Camera follow
  game.camera.follow({ x: game.playerX, y: game.playerY, width: TILE_SIZE, height: TILE_SIZE });
  game.camera.update(dt);

  // Check warps
  checkWarps();

  // Check NPC interaction
  if (game.input.isPressed(KEYS.INTERACT)) {
    checkNPCInteraction();
  }

  // Menu key
  if (game.input.isPressed(KEYS.MENU)) {
    openMenu();
  }

  // Update tilemap animations
  game.tileMap.update(dt);

  // Particles
  game.particles.update(dt);

  // Playtime
  game.playtime += dt;
}

function renderOverworld(canvas) {
  canvas.clear('#0a0a12');

  // Parallax backgrounds
  for (const layer of game.parallaxLayers) {
    layer.render(canvas, game.camera.x, game.camera.y);
  }

  // Tile layers (below player)
  game.tileMap.renderBelow(canvas, game.camera);

  // NPC sprites
  renderNPCs(canvas);

  // Player sprite
  renderPlayer(canvas);

  // Tile layers (above player)
  game.tileMap.renderAbove(canvas, game.camera);

  // Particles
  game.particles.render(canvas);

  // Transition overlay
  game.transition.render(canvas);

  // Render minimap to separate canvas
  renderMinimap();
}

function renderPlayer(canvas) {
  const sprite = spriteCache.player;
  if (!sprite) return;

  const screen = game.camera.worldToScreen(game.playerX, game.playerY);
  const dirMap = { down: 0, up: 1, left: 2, right: 3 };
  const dirIdx = dirMap[game.playerDir] || 0;
  const frameOffset = (dirIdx * 2 + game.playerAnimFrame) * TILE_SIZE;

  canvas.drawSprite(sprite, frameOffset, 0, TILE_SIZE, TILE_SIZE, screen.x, screen.y, TILE_SIZE, TILE_SIZE);
}

function renderNPCs(canvas) {
  if (!game.currentMap?.npcs) return;

  for (const npc of game.currentMap.npcs) {
    if (npc.condition && !game.storyFlags[npc.condition]) continue;
    if (npc.isTrainer && game.defeatedTrainers.includes(npc.id)) continue;

    const screen = game.camera.worldToScreen(npc.x * TILE_SIZE, npc.y * TILE_SIZE);
    if (screen.x < -TILE_SIZE || screen.x > NATIVE_WIDTH + TILE_SIZE) continue;

    // Draw simple NPC (colored rectangle for now)
    const ctx = canvas.getCtx();
    ctx.fillStyle = npc.isTrainer ? '#d94f30' : '#3a9bdc';
    ctx.fillRect(Math.floor(screen.x + 4), Math.floor(screen.y + 2), 8, 12);
    // Head
    ctx.fillStyle = '#f0c090';
    ctx.fillRect(Math.floor(screen.x + 5), Math.floor(screen.y), 6, 4);
    // Hat/hair for trainers
    if (npc.isTrainer) {
      ctx.fillStyle = '#800000';
      ctx.fillRect(Math.floor(screen.x + 4), Math.floor(screen.y - 1), 8, 2);
    }
  }
}

// ── Warps ──
function checkWarps() {
  if (!game.currentMap?.warps) return;

  const playerTX = Math.floor((game.playerX + TILE_SIZE / 2) / TILE_SIZE);
  const playerTY = Math.floor((game.playerY + TILE_SIZE / 2) / TILE_SIZE);

  for (const warp of game.currentMap.warps) {
    if (playerTX === warp.x && playerTY === warp.y) {
      game.transition.start('fade', 3, () => {
        game.playerX = warp.spawnX * TILE_SIZE;
        game.playerY = warp.spawnY * TILE_SIZE;
        enterOverworld(warp.target);
      });
      break;
    }
  }
}

// ── Wild Encounters ──
function checkWildEncounter() {
  if (!game.currentMap) return;
  if (game.party.length === 0) return; // Cannot battle without a Chimera!

  // Check if player is in encounter zone
  const tileId = game.tileMap.getTileFromLayer('encounter',
    Math.floor((game.playerX + TILE_SIZE / 2) / TILE_SIZE),
    Math.floor((game.playerY + TILE_SIZE / 2) / TILE_SIZE));

  if (tileId <= 0) return;

  const rate = game.currentMap.encounterRate || ENCOUNTER_RATE;
  if (Math.random() > rate) return;

  // Generate wild chimera
  const encounterTable = getWildChimerasForRoute(game.currentMap.encounterTable || game.currentMapId);
  if (!encounterTable || encounterTable.length === 0) return;

  // Weighted random selection
  const totalWeight = encounterTable.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  let selected = encounterTable[0];
  for (const entry of encounterTable) {
    roll -= entry.weight;
    if (roll <= 0) { selected = entry; break; }
  }

  const level = selected.level[0] + Math.floor(Math.random() * (selected.level[1] - selected.level[0] + 1));
  const wildChimera = new Chimera(selected.id, level, { isWild: true });

  startBattle(wildChimera);
}

// ── NPC Interaction ──
function checkNPCInteraction() {
  if (!game.currentMap?.npcs) return;

  const playerCenter = {
    x: game.playerX + TILE_SIZE / 2,
    y: game.playerY + TILE_SIZE / 2
  };

  for (const npc of game.currentMap.npcs) {
    if (npc.condition && !game.storyFlags[npc.condition]) continue;
    
    const npcCenter = {
      x: npc.x * TILE_SIZE + TILE_SIZE / 2,
      y: npc.y * TILE_SIZE + TILE_SIZE / 2
    };

    const dx = playerCenter.x - npcCenter.x;
    const dy = playerCenter.y - npcCenter.y;
    const distSq = dx * dx + dy * dy;

    // Trigger if within ~20 pixels radius
    if (distSq < 400) {
      // Check if this is a defeated trainer
      if (npc.isTrainer && game.defeatedTrainers.includes(npc.id)) {
        startDialog(npc.defeatDialog || [{ speaker: npc.name, text: "You've already beaten me!" }]);
        return;
      }

      // Start dialog
      const dialog = npc.dialog || [{ speaker: npc.name, text: '...' }];
      startDialog(dialog, () => {
        handleNPCEvent(npc);
      });
      return;
    }
  }
}

function handleNPCEvent(npc) {
  switch (npc.event) {
    case 'HEAL_PARTY':
      game.party.forEach(c => c.fullHeal());
      game.audio.playSFX('heal');
      showNotification('Your Chimeras have been fully healed!');
      break;

    case 'STARTER_CHOICE':
      if (!game.storyFlags.HAS_STARTER) {
        showStarterSelection();
      }
      break;

    case 'RIVAL_BATTLE_1':
      if (!game.defeatedTrainers.includes(npc.id)) {
        // Create rival's party
        const rivalParty = [new Chimera('zephyrix', 7, { bond: 40 })];
        startTrainerBattle(npc, rivalParty);
      }
      break;

    default:
      if (npc.isTrainer && !game.defeatedTrainers.includes(npc.id)) {
        const trainerParty = npc.party.map(p => new Chimera(p.species, p.level, { bond: 30 }));
        startTrainerBattle(npc, trainerParty);
      }
      break;
  }
}

// ═══════════════════════════════════════════════════
// BATTLE SYSTEM (UI Integration)
// ═══════════════════════════════════════════════════
function startBattle(wildChimera) {
  game.audio.playSFX('encounter');

  game.transition.start('battle', 2, () => {
    game.scene = 'battle';
    game.battleEngine.initWild(game.party, wildChimera);

    // Setup callbacks
    game.battleEngine.onVictory = () => endBattle('victory');
    game.battleEngine.onDefeat = () => endBattle('defeat');
    game.battleEngine.onRun = () => endBattle('run');

    // Show battle UI
    document.getElementById('overworld-hud').classList.add('hidden');
    document.getElementById('battle-hud').classList.remove('hidden');
    document.getElementById('battle-menu').classList.remove('hidden');

    updateBattleUI();
    game.audio.startTrack('battle');

    // Show intro message
    game.battleEngine.currentMessage = `A wild ${wildChimera.nickname} appeared!`;
    game.battleEngine.state = BATTLE_STATE.RESULT;
    game.battleEngine.messages = [`Go, ${game.battleEngine.playerChimera.nickname}!`];
  });
}

function startTrainerBattle(npc, trainerParty) {
  game.transition.start('battle', 2, () => {
    game.scene = 'battle';
    game.battleEngine.initTrainer(game.party, { name: npc.name, party: trainerParty });
    game.battleEngine.onVictory = () => {
      game.defeatedTrainers.push(npc.id);
      endBattle('victory');
    };
    game.battleEngine.onDefeat = () => endBattle('defeat');

    document.getElementById('overworld-hud').classList.add('hidden');
    document.getElementById('battle-hud').classList.remove('hidden');
    document.getElementById('battle-menu').classList.remove('hidden');

    updateBattleUI();
    game.audio.startTrack('battle');

    game.battleEngine.currentMessage = `${npc.name} wants to battle!`;
    game.battleEngine.state = BATTLE_STATE.RESULT;
    game.battleEngine.messages = [`${npc.name} sent out ${game.battleEngine.enemy.nickname}!`, `Go, ${game.battleEngine.playerChimera.nickname}!`];
  });
}

function endBattle(result) {
  if (result === 'victory') {
    game.audio.playSFX('levelUp');
    game.audio.startTrack('victory');
    setTimeout(() => {
      game.transition.start('fade', 2, () => {
        game.scene = 'overworld';
        document.getElementById('battle-hud').classList.add('hidden');
        document.getElementById('battle-menu').classList.add('hidden');
        document.getElementById('overworld-hud').classList.remove('hidden');
        game.audio.startTrack(game.currentMap?.music || 'overworld');
        updatePartyBar();
        saveGame();
      });
    }, 2000);
  } else if (result === 'defeat') {
    // Heal party and return to town
    game.party.forEach(c => c.fullHeal());
    game.transition.start('fade', 1.5, () => {
      game.scene = 'overworld';
      game.playerX = getMap('prism_town').playerSpawn.x * TILE_SIZE;
      game.playerY = getMap('prism_town').playerSpawn.y * TILE_SIZE;
      enterOverworld('prism_town');
      showNotification('You blacked out... Healed at Prism Town.');
    });
  } else if (result === 'run') {
    game.transition.start('fade', 2, () => {
      game.scene = 'overworld';
      document.getElementById('battle-hud').classList.add('hidden');
      document.getElementById('battle-menu').classList.add('hidden');
      document.getElementById('overworld-hud').classList.remove('hidden');
      game.audio.startTrack(game.currentMap?.music || 'overworld');
    });
  }
}

function updateBattle(dt) {
  game.battleAnimTimer += dt;
  game.battleSpriteFrame = Math.floor(game.battleAnimTimer * 3) % 4;

  const be = game.battleEngine;

  // Handle message advancement
  if (be.state === BATTLE_STATE.RESULT || be.state === BATTLE_STATE.VICTORY || be.state === BATTLE_STATE.DEFEAT) {
    if (game.input.isPressed(KEYS.CONFIRM)) {
      if (!be.advanceMessage()) {
        if (be.state === BATTLE_STATE.VICTORY || be.state === BATTLE_STATE.DEFEAT) {
          // Already handled by callbacks
        }
      }
      updateBattleUI();
    }
  }

  // Handle move selection
  if (be.state === BATTLE_STATE.SELECT) {
    // Keyboard navigation for menu
    if (game.input.isPressed(KEYS.CANCEL)) {
      showBattleActions();
    }
  }

  game.particles.update(dt);
  game.transition.update(dt);
}

function onBattleAction(action) {
  const be = game.battleEngine;
  if (be.state !== BATTLE_STATE.SELECT) return;

  switch (action) {
    case 'fight':
      showMoveSelect();
      break;
    case 'run':
      be.selectRun();
      updateBattleUI();
      break;
    case 'bag':
      // Simple: use first potion if available
      if (game.items.potion > 0) {
        game.items.potion--;
        be.playerChimera.heal(30);
        be.currentMessage = `Used a Potion! ${be.playerChimera.nickname} recovered HP!`;
        be.playerAction = { type: 'item' };
        be.state = BATTLE_STATE.RESULT;
        game.audio.playSFX('heal');
        updateBattleUI();
      } else {
        be.currentMessage = 'No Potions left!';
      }
      updateBattleUI();
      break;
    case 'chimera':
      // Switch to next alive chimera
      const nextAlive = game.party.findIndex((c, i) => i !== be.activePlayerIndex && !c.isFainted());
      if (nextAlive >= 0) {
        be.selectSwitch(nextAlive);
        updateBattleUI();
      } else {
        be.currentMessage = 'No other Chimeras available!';
        updateBattleUI();
      }
      break;
    case 'fuse':
      be.currentMessage = 'Fusion requires Bond level 76+ with two Chimeras!';
      updateBattleUI();
      break;
  }
}

function showMoveSelect() {
  const be = game.battleEngine;
  const moves = be.playerChimera.moves;

  document.getElementById('battle-actions').classList.add('hidden');
  document.getElementById('move-select').classList.remove('hidden');

  const grid = document.getElementById('move-grid');
  grid.innerHTML = '';

  moves.forEach((move, i) => {
    const btn = document.createElement('button');
    btn.className = 'move-btn';
    btn.style.background = ESSENCE_COLORS[move.essence] + '88';
    btn.style.borderColor = ESSENCE_COLORS[move.essence];
    btn.innerHTML = `
      <span class="move-name">${move.name}</span>
      <span class="move-meta">${ESSENCE_NAMES[move.essence]} | ${move.category.toUpperCase()} | PP: ${move.currentPP}/${move.pp}</span>
      <span class="move-meta">PWR: ${move.power || '—'} | ACC: ${move.accuracy}%</span>
    `;
    btn.addEventListener('click', () => {
      be.selectMove(i);
      showBattleActions();
      updateBattleUI();
      game.audio.playSFX('hit');
      game.camera.shake(3, 0.2);
    });
    if (move.currentPP <= 0) {
      btn.disabled = true;
      btn.style.opacity = '0.4';
    }
    grid.appendChild(btn);
  });
}

function showBattleActions() {
  document.getElementById('battle-actions').classList.remove('hidden');
  document.getElementById('move-select').classList.add('hidden');
}

function updateBattleUI() {
  const be = game.battleEngine;
  const player = be.playerChimera;
  const enemy = be.enemy;

  if (!player || !enemy) return;

  // Player info
  document.getElementById('player-chimera-name').textContent = player.nickname;
  document.getElementById('player-chimera-level').textContent = `Lv ${player.level}`;
  document.getElementById('player-hp-text').textContent = `${player.currentHp} / ${player.maxHp}`;
  const playerHpBar = document.getElementById('player-hp-bar');
  playerHpBar.style.width = `${player.hpPercent * 100}%`;
  playerHpBar.className = 'hp-bar' + (player.hpPercent < 0.2 ? ' low' : player.hpPercent < 0.5 ? ' medium' : '');

  // XP bar
  const xpProgress = (player.xp - xpForLevel(player.level)) / (player.xpToNext - xpForLevel(player.level));
  document.getElementById('player-xp-bar').style.width = `${Math.max(0, xpProgress) * 100}%`;

  // Bond
  document.getElementById('bond-value').textContent = `${Math.floor(player.bond)}%`;

  // Player essences
  const playerEssences = document.getElementById('player-essences');
  playerEssences.innerHTML = player.species.essences.map(e =>
    `<span class="essence-badge" style="background:${ESSENCE_COLORS[e]}">${ESSENCE_NAMES[e]}</span>`
  ).join('');

  // Enemy info
  document.getElementById('enemy-name').textContent = enemy.nickname;
  document.getElementById('enemy-level').textContent = `Lv ${enemy.level}`;
  document.getElementById('enemy-hp-text').textContent = 'HP';
  const enemyHpBar = document.getElementById('enemy-hp-bar');
  enemyHpBar.style.width = `${enemy.hpPercent * 100}%`;
  enemyHpBar.className = 'hp-bar' + (enemy.hpPercent < 0.2 ? ' low' : enemy.hpPercent < 0.5 ? ' medium' : '');

  // Enemy essences
  const enemyEssences = document.getElementById('enemy-essences');
  enemyEssences.innerHTML = enemy.species.essences.map(e =>
    `<span class="essence-badge" style="background:${ESSENCE_COLORS[e]}">${ESSENCE_NAMES[e]}</span>`
  ).join('');

  // Battle text
  document.getElementById('battle-text').textContent = be.currentMessage;

  // Terrain indicator
  if (be.terrain !== 'none') {
    const terrainInfo = TERRAIN_EFFECTS[be.terrain];
    document.getElementById('terrain-indicator').classList.remove('hidden');
    document.getElementById('terrain-name').textContent = terrainInfo?.name || be.terrain;
    document.getElementById('terrain-turns').textContent = `${be.terrainTurns} turns`;
  } else {
    document.getElementById('terrain-indicator').classList.add('hidden');
  }

  // Draw chimera sprites on battle canvases
  drawBattleSprite('player-sprite-canvas', player.speciesId, game.battleSpriteFrame);
  drawBattleSprite('enemy-sprite-canvas', enemy.speciesId, game.battleSpriteFrame);
}

function drawBattleSprite(canvasId, speciesId, frame) {
  const cvs = document.getElementById(canvasId);
  const ctx = cvs.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const sprite = spriteCache[`chimera_${speciesId}`];
  if (sprite) {
    const srcX = (frame % 4) * 32;
    ctx.drawImage(sprite, srcX, 0, 32, 32, 16, 16, 96, 96);
  }
}

// Import xpForLevel for UI
import { xpForLevel } from './constants.js';

// ═══════════════════════════════════════════════════
// DIALOG SYSTEM
// ═══════════════════════════════════════════════════
function startDialog(lines, callback = null) {
  game.dialogQueue = lines;
  game.dialogIndex = 0;
  game.dialogCharIndex = 0;
  game.dialogTimer = 0;
  game.dialogCallback = callback;
  game.scene = game.scene === 'battle' ? 'battle' : 'dialog';

  showDialogLine();
  document.getElementById('dialog-box').classList.remove('hidden');
}

function showDialogLine() {
  const line = game.dialogQueue[game.dialogIndex];
  if (!line) return;

  document.getElementById('dialog-speaker').textContent = line.speaker || '';
  document.getElementById('dialog-text').textContent = '';
  game.dialogCharIndex = 0;
}

function updateDialog(dt) {
  const line = game.dialogQueue[game.dialogIndex];
  if (!line) return;

  // Typewriter effect
  game.dialogTimer += dt;
  if (game.dialogTimer >= 0.03) {
    game.dialogTimer -= 0.03;
    game.dialogCharIndex++;
    const text = line.text.substring(0, game.dialogCharIndex);
    document.getElementById('dialog-text').textContent = text;
  }

  // Advance dialog
  if (game.input.isPressed(KEYS.CONFIRM)) {
    if (game.dialogCharIndex < line.text.length) {
      // Show full text instantly
      game.dialogCharIndex = line.text.length;
      document.getElementById('dialog-text').textContent = line.text;
    } else {
      // Next line
      game.dialogIndex++;
      if (game.dialogIndex >= game.dialogQueue.length) {
        // Dialog complete
        document.getElementById('dialog-box').classList.add('hidden');
        if (game.dialogCallback) {
          game.dialogCallback();
          game.dialogCallback = null;
        } else {
          game.scene = 'overworld';
        }
      } else {
        showDialogLine();
      }
    }
    game.audio.playSFX('confirm');
  }
}

// ═══════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════

function renderMinimap() {
  const canvas = document.getElementById('minimap');
  if (!canvas || !game.currentMap) return;
  const ctx = canvas.getContext('2d');
  
  const mapData = game.currentMap;
  const mapW = mapData.width;
  const mapH = mapData.height;
  
  // Clear
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate scaling to fit
  const scaleX = canvas.width / mapW;
  const scaleY = canvas.height / mapH;
  const scale = Math.min(scaleX, scaleY);
  
  const offsetX = (canvas.width - (mapW * scale)) / 2;
  const offsetY = (canvas.height - (mapH * scale)) / 2;
  
  const groundLayer = mapData.layers.ground;
  const collisionLayer = mapData.layers.collision;
  
  for (let y = 0; y < mapH; y++) {
    for (let x = 0; x < mapW; x++) {
      const idx = y * mapW + x;
      const tile = groundLayer[idx];
      const isCollision = collisionLayer[idx] === 1;
      
      if (tile === 0) continue;
      
      // Basic color mapping
      if (isCollision) {
        ctx.fillStyle = '#444'; // Walls/obstacles
      } else if (tile >= 1 && tile <= 2) {
        ctx.fillStyle = '#2a5020'; // Grass
      } else if (tile === 3) {
        ctx.fillStyle = '#6b4e31'; // Dirt
      } else if (tile === 4) {
        ctx.fillStyle = '#666'; // Stone
      } else if (tile >= 5 && tile <= 8) {
        ctx.fillStyle = '#3a9bdc'; // Water
      } else if (tile === 12 || tile === 13) {
        ctx.fillStyle = '#332244'; // Rift / Cave floor
      } else if (tile === 14) {
        ctx.fillStyle = '#777'; // Cobblestone
      } else {
        ctx.fillStyle = '#888'; // Default
      }
      
      ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
    }
  }
  
  // Player blip
  const playerTX = Math.floor((game.playerX + TILE_SIZE / 2) / TILE_SIZE);
  const playerTY = Math.floor((game.playerY + TILE_SIZE / 2) / TILE_SIZE);
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(offsetX + playerTX * scale - 1, offsetY + playerTY * scale - 1, Math.max(2, scale), Math.max(2, scale));
}

// ═══════════════════════════════════════════════════
function showNotification(text) {
  const area = document.getElementById('notification-area');
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = text;
  area.appendChild(notif);
  setTimeout(() => notif.remove(), 3500);
}

function showLocationBanner(name) {
  const banner = document.getElementById('location-banner');
  document.getElementById('location-name').textContent = name;
  banner.classList.remove('hidden');
  // Remove and re-add to restart animation
  banner.style.animation = 'none';
  banner.offsetHeight; // Force reflow
  banner.style.animation = '';
  setTimeout(() => banner.classList.add('hidden'), 3500);
}

function updatePartyBar() {
  for (let i = 0; i < 6; i++) {
    const slot = document.getElementById(`party-slot-${i}`);
    if (i < game.party.length) {
      const chimera = game.party[i];
      slot.style.borderColor = ESSENCE_COLORS[chimera.species.essences[0]];
      slot.style.background = ESSENCE_COLORS[chimera.species.essences[0]] + '33';
      slot.classList.toggle('fainted', chimera.isFainted());
      slot.classList.toggle('active', i === 0);
      slot.title = `${chimera.nickname} Lv${chimera.level} HP:${chimera.currentHp}/${chimera.maxHp}`;
    } else {
      slot.style.borderColor = '#333';
      slot.style.background = '#121220';
      slot.title = 'Empty';
    }
  }
}

function saveGame() {
  SaveSystem.save({
    playerName: game.playerName,
    party: game.party,
    currentMap: game.currentMapId,
    playerX: game.playerX,
    playerY: game.playerY,
    storyFlags: game.storyFlags,
    codex: game.codex,
    items: game.items,
    money: game.money,
    playtime: game.playtime,
    defeatedTrainers: game.defeatedTrainers,
  });
}

// ═══════════════════════════════════════════════════
// MAIN UPDATE & RENDER
// ═══════════════════════════════════════════════════
function update(dt) {
  game.input.update();
  game.transition.update(dt);

  switch (game.scene) {
    case 'title':
      // Title screen is handled by HTML/CSS
      break;
    case 'starterSelect':
      updateStarterSelect(dt);
      break;
    case 'overworld':
      updateOverworld(dt);
      break;
    case 'battle':
      updateBattle(dt);
      break;
    case 'dialog':
      updateDialog(dt);
      break;
    case 'menu':
      updateMenu(dt);
      break;
  }
}

function render(alpha) {
  switch (game.scene) {
    case 'title':
      // Title screen is pure HTML/CSS
      game.canvas.clear('#0a0a12');
      break;
    case 'starterSelect':
      renderStarterSelect();
      break;
    case 'overworld':
      renderOverworld(game.canvas);
      break;
    case 'battle':
      // Battle rendering is mostly HTML UI
      game.canvas.clear('#1a1a2e');
      // Draw battle background based on terrain
      const ctx = game.canvas.getCtx();
      if (game.battleEngine.terrain !== 'none') {
        const tColor = TERRAIN_EFFECTS[game.battleEngine.terrain]?.color || '#1a1a2e';
        ctx.fillStyle = tColor + '22';
        ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
      }
      game.particles.render(game.canvas);
      game.transition.render(game.canvas);
      break;
    case 'dialog':
      // Dialog renders over whatever scene was active
      renderOverworld(game.canvas);
      break;
    case 'menu':
      // Menu renders over overworld
      renderOverworld(game.canvas);
      break;
  }
}

// ═══════════════════════════════════════════════════
// LAUNCH
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
