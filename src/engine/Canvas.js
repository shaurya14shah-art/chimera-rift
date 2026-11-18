/* ═══════════════════════════════════════════════════
   Canvas.js — Pixel-perfect canvas manager
   Handles scaling, rendering context, and viewport.
   ═══════════════════════════════════════════════════ */

import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../constants.js';

export class Canvas {
  constructor(canvasId = 'game-canvas') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Set native resolution
    this.canvas.width = NATIVE_WIDTH;
    this.canvas.height = NATIVE_HEIGHT;
    
    // Pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    
    // Scale factor
    this.scale = 1;
    
    // Handle resize
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;

    // Calculate integer scale that fits the viewport
    const scaleX = ww / NATIVE_WIDTH;
    const scaleY = wh / NATIVE_HEIGHT;
    this.scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));

    // If integer scale is too small, use fractional
    if (this.scale * NATIVE_WIDTH < ww * 0.5) {
      this.scale = Math.min(scaleX, scaleY);
    }

    const displayW = Math.floor(NATIVE_WIDTH * this.scale);
    const displayH = Math.floor(NATIVE_HEIGHT * this.scale);

    this.canvas.style.width = `${displayW}px`;
    this.canvas.style.height = `${displayH}px`;
  }

  clear(color = '#0a0a12') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
  }

  // Draw a sprite from a source canvas/image
  drawSprite(source, sx, sy, sw, sh, dx, dy, dw, dh) {
    this.ctx.drawImage(source, sx, sy, sw, sh, Math.floor(dx), Math.floor(dy), dw || sw, dh || sh);
  }

  // Draw a filled rectangle
  fillRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  // Draw pixel text
  drawText(text, x, y, { color = '#fff', size = 8, align = 'left', font = null } = {}) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px ${font || "'Press Start 2P', monospace"}`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, Math.floor(x), Math.floor(y));
  }

  // Draw stroked text
  drawTextOutline(text, x, y, { color = '#fff', outlineColor = '#000', size = 8, align = 'left', lineWidth = 2 } = {}) {
    this.ctx.font = `${size}px "Press Start 2P", monospace`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = outlineColor;
    this.ctx.strokeText(text, Math.floor(x), Math.floor(y));
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, Math.floor(x), Math.floor(y));
  }

  // Get the rendering context directly for advanced operations
  getCtx() {
    return this.ctx;
  }

  // Convert screen coordinates to canvas coordinates
  screenToCanvas(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left) / this.scale,
      y: (screenY - rect.top) / this.scale,
    };
  }

  // Save/restore context state
  save() { this.ctx.save(); }
  restore() { this.ctx.restore(); }

  // Set global alpha
  setAlpha(a) { this.ctx.globalAlpha = a; }
  resetAlpha() { this.ctx.globalAlpha = 1; }
}
