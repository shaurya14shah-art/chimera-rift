/* ═══════════════════════════════════════════════════
   TileMap.js — Tile-based map renderer
   Supports multi-layer rendering, animated tiles,
   and collision detection.
   ═══════════════════════════════════════════════════ */

import { TILE_SIZE } from '../constants.js';

export class TileMap {
  constructor() {
    this.currentMap = null;
    this.tileset = null;         // Offscreen canvas with tiles
    this.tilesetCols = 0;
    this.animTimer = 0;
    this.animFrame = 0;
  }

  /**
   * Load a map definition.
   * Map format:
   * {
   *   name: string,
   *   width: number (in tiles),
   *   height: number (in tiles),
   *   layers: {
   *     ground: number[][],
   *     decoration: number[][],
   *     collision: number[][],   // 0 = passable, 1 = blocked
   *     above: number[][],       // Rendered above player
   *   },
   *   encounters: { zones: [...], rate: number },
   *   npcs: [...],
   *   warps: [...],
   * }
   */
  loadMap(mapData, tileset) {
    this.currentMap = mapData;
    this.tileset = tileset;
    if (tileset) {
      this.tilesetCols = Math.floor(tileset.width / TILE_SIZE);
    }
  }

  // Get tile ID at a given layer and position (in tile coords)
  getTile(layer, tx, ty) {
    if (!this.currentMap || !this.currentMap.layers[layer]) return 0;
    if (tx < 0 || ty < 0 || tx >= this.currentMap.width || ty >= this.currentMap.height) return 0;
    return this.currentMap.layers[layer][ty * this.currentMap.width + tx];
  }

  // Check collision at tile coordinates
  isBlocked(tx, ty) {
    return this.getTile('collision', tx, ty) === 1;
  }

  // Check collision at pixel coordinates (for an entity with given size)
  isBlockedAtPixel(px, py, w = TILE_SIZE, h = TILE_SIZE) {
    // Check all four corners
    const tiles = [
      { tx: Math.floor(px / TILE_SIZE), ty: Math.floor(py / TILE_SIZE) },
      { tx: Math.floor((px + w - 1) / TILE_SIZE), ty: Math.floor(py / TILE_SIZE) },
      { tx: Math.floor(px / TILE_SIZE), ty: Math.floor((py + h - 1) / TILE_SIZE) },
      { tx: Math.floor((px + w - 1) / TILE_SIZE), ty: Math.floor((py + h - 1) / TILE_SIZE) },
    ];
    return tiles.some(t => this.isBlocked(t.tx, t.ty));
  }

  // Check if a position is in a grass/encounter zone
  isEncounterZone(px, py) {
    if (!this.currentMap || !this.currentMap.layers.encounter) return false;
    const tx = Math.floor(px / TILE_SIZE);
    const ty = Math.floor(py / TILE_SIZE);
    return this.getTileFromLayer('encounter', tx, ty) > 0;
  }

  getTileFromLayer(layerName, tx, ty) {
    if (!this.currentMap || !this.currentMap.layers[layerName]) return 0;
    if (tx < 0 || ty < 0 || tx >= this.currentMap.width || ty >= this.currentMap.height) return 0;
    return this.currentMap.layers[layerName][ty * this.currentMap.width + tx];
  }

  update(dt) {
    // Animate tiles (water, flowers, etc.)
    this.animTimer += dt;
    if (this.animTimer >= 0.5) { // 2 fps tile animation
      this.animTimer -= 0.5;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  // Render a specific layer
  renderLayer(canvas, camera, layerName) {
    if (!this.currentMap || !this.tileset) return;
    const layer = this.currentMap.layers[layerName];
    if (!layer) return;

    const ctx = canvas.getCtx();
    const startTX = Math.floor(camera.renderX / TILE_SIZE);
    const startTY = Math.floor(camera.renderY / TILE_SIZE);
    const endTX = startTX + Math.ceil(canvas.canvas.width / TILE_SIZE) + 1;
    const endTY = startTY + Math.ceil(canvas.canvas.height / TILE_SIZE) + 1;

    for (let ty = startTY; ty <= endTY; ty++) {
      for (let tx = startTX; tx <= endTX; tx++) {
        let tileId = this.getTileFromLayer(layerName, tx, ty);
        if (tileId <= 0) continue;

        // Handle animated tiles (IDs 200+ are animated)
        if (tileId >= 200) {
          tileId = tileId + this.animFrame;
        }

        // Convert tile ID to tileset coordinates
        const srcX = ((tileId - 1) % this.tilesetCols) * TILE_SIZE;
        const srcY = Math.floor((tileId - 1) / this.tilesetCols) * TILE_SIZE;

        const screenX = tx * TILE_SIZE - camera.renderX;
        const screenY = ty * TILE_SIZE - camera.renderY;

        ctx.drawImage(
          this.tileset,
          srcX, srcY, TILE_SIZE, TILE_SIZE,
          Math.floor(screenX), Math.floor(screenY), TILE_SIZE, TILE_SIZE
        );
      }
    }
  }

  // Render ground + decoration layers
  renderBelow(canvas, camera) {
    this.renderLayer(canvas, camera, 'ground');
    this.renderLayer(canvas, camera, 'decoration');
    this.renderLayer(canvas, camera, 'encounter');
  }

  // Render above-player layer
  renderAbove(canvas, camera) {
    this.renderLayer(canvas, camera, 'above');
  }

  // Get map dimensions in pixels
  getWidthPx() {
    return this.currentMap ? this.currentMap.width * TILE_SIZE : 0;
  }

  getHeightPx() {
    return this.currentMap ? this.currentMap.height * TILE_SIZE : 0;
  }

  // Get warps at a position
  getWarpAt(px, py) {
    if (!this.currentMap || !this.currentMap.warps) return null;
    const tx = Math.floor(px / TILE_SIZE);
    const ty = Math.floor(py / TILE_SIZE);
    return this.currentMap.warps.find(w => w.x === tx && w.y === ty) || null;
  }
}
