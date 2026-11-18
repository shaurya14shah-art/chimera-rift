/* ═══════════════════════════════════════════════════
   ParallaxLayer.js — Multi-layer parallax backgrounds
   Creates the 2.5D depth effect.
   ═══════════════════════════════════════════════════ */

import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../constants.js';

export class ParallaxLayer {
  constructor(canvas, color, speedFactor, elements = []) {
    this.speedFactor = speedFactor; // 0 = static, 1 = moves with camera
    this.color = color;
    this.elements = elements; // { type, x, y, w, h, color, ... }
    
    // Pre-render this layer to an offscreen canvas
    this.buffer = document.createElement('canvas');
    this.buffer.width = NATIVE_WIDTH * 2; // Wide enough for scrolling
    this.buffer.height = NATIVE_HEIGHT;
    this.bufferCtx = this.buffer.getContext('2d');
    this.bufferCtx.imageSmoothingEnabled = false;
    
    this._render();
  }

  _render() {
    const ctx = this.bufferCtx;
    const w = this.buffer.width;
    const h = this.buffer.height;

    // Fill background
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, w, h);

    // Draw elements
    for (const el of this.elements) {
      ctx.fillStyle = el.color || '#ffffff22';
      switch (el.type) {
        case 'mountain':
          this._drawMountain(ctx, el);
          break;
        case 'cloud':
          this._drawCloud(ctx, el);
          break;
        case 'tree':
          this._drawTree(ctx, el);
          break;
        case 'star':
          this._drawStar(ctx, el);
          break;
        case 'rect':
          ctx.fillRect(el.x, el.y, el.w, el.h);
          break;
      }
    }
  }

  _drawMountain(ctx, el) {
    ctx.beginPath();
    ctx.moveTo(el.x - el.w / 2, el.y + el.h);
    ctx.lineTo(el.x, el.y);
    ctx.lineTo(el.x + el.w / 2, el.y + el.h);
    ctx.closePath();
    ctx.fill();

    // Snow cap
    if (el.snow) {
      ctx.fillStyle = '#ffffff44';
      ctx.beginPath();
      ctx.moveTo(el.x - el.w * 0.15, el.y + el.h * 0.2);
      ctx.lineTo(el.x, el.y);
      ctx.lineTo(el.x + el.w * 0.15, el.y + el.h * 0.2);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawCloud(ctx, el) {
    const r = el.w / 4;
    ctx.beginPath();
    ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
    ctx.arc(el.x + r, el.y - r * 0.3, r * 0.8, 0, Math.PI * 2);
    ctx.arc(el.x + r * 2, el.y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawTree(ctx, el) {
    // Trunk
    ctx.fillStyle = el.trunkColor || '#3d2810';
    ctx.fillRect(el.x - 1, el.y, 3, el.h * 0.4);
    // Canopy
    ctx.fillStyle = el.color;
    ctx.beginPath();
    ctx.arc(el.x, el.y, el.w / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawStar(ctx, el) {
    ctx.fillRect(el.x, el.y, 1, 1);
  }

  render(canvas, cameraX, cameraY) {
    const ctx = canvas.getCtx();
    const offsetX = -Math.floor(cameraX * this.speedFactor) % this.buffer.width;
    
    // Draw the buffer, wrapping horizontally
    ctx.drawImage(this.buffer, offsetX, 0);
    if (offsetX < 0) {
      ctx.drawImage(this.buffer, offsetX + this.buffer.width, 0);
    }
  }
}

/**
 * Create a set of parallax layers for a given biome
 */
export function createParallaxLayers(biome = 'meadow') {
  const layers = [];

  switch (biome) {
    case 'meadow':
      // Sky gradient (static)
      layers.push(new ParallaxLayer(null, '#1a0a30', 0, [
        // Stars
        ...Array.from({ length: 40 }, () => ({
          type: 'star',
          x: Math.random() * 960,
          y: Math.random() * 120,
          color: `rgba(255,255,255,${0.3 + Math.random() * 0.5})`,
        })),
      ]));

      // Far mountains (very slow)
      layers.push(new ParallaxLayer(null, 'transparent', 0.05, [
        { type: 'mountain', x: 100, y: 180, w: 200, h: 100, color: '#1a1040', snow: true },
        { type: 'mountain', x: 300, y: 190, w: 160, h: 80, color: '#201050', snow: true },
        { type: 'mountain', x: 500, y: 175, w: 240, h: 110, color: '#1a1040', snow: true },
        { type: 'mountain', x: 750, y: 185, w: 180, h: 90, color: '#201050', snow: true },
      ]));

      // Mid hills (slow)
      layers.push(new ParallaxLayer(null, 'transparent', 0.15, [
        { type: 'mountain', x: 80, y: 230, w: 180, h: 60, color: '#203020' },
        { type: 'mountain', x: 280, y: 240, w: 140, h: 50, color: '#1a2818' },
        { type: 'mountain', x: 450, y: 225, w: 200, h: 65, color: '#203020' },
        { type: 'mountain', x: 680, y: 235, w: 160, h: 55, color: '#1a2818' },
        // Trees on hills
        ...Array.from({ length: 15 }, (_, i) => ({
          type: 'tree', x: 50 + i * 60 + Math.random() * 30, y: 210 + Math.random() * 20,
          w: 10, h: 12, color: '#2a4020', trunkColor: '#3d2810',
        })),
      ]));

      // Foreground grass hints (faster)
      layers.push(new ParallaxLayer(null, 'transparent', 0.4, [
        ...Array.from({ length: 20 }, (_, i) => ({
          type: 'rect', x: i * 48 + Math.random() * 20, y: 290 + Math.random() * 10,
          w: 3, h: 6 + Math.random() * 8, color: '#3aa84f33',
        })),
      ]));
      break;

    case 'cave':
      layers.push(new ParallaxLayer(null, '#080810', 0, []));
      layers.push(new ParallaxLayer(null, 'transparent', 0.1, [
        // Stalactites
        ...Array.from({ length: 12 }, (_, i) => ({
          type: 'mountain', x: i * 80 + Math.random() * 40, y: -10, w: 20, h: 40 + Math.random() * 30,
          color: '#151525',
        })),
      ]));
      break;

    case 'rift':
      layers.push(new ParallaxLayer(null, '#0a0018', 0, [
        ...Array.from({ length: 60 }, () => ({
          type: 'star',
          x: Math.random() * 960,
          y: Math.random() * 320,
          color: `rgba(${100 + Math.random() * 155}, ${Math.random() * 100}, ${200 + Math.random() * 55}, ${0.4 + Math.random() * 0.4})`,
        })),
      ]));
      break;

    case 'town':
      layers.push(new ParallaxLayer(null, '#1a2040', 0, [
        ...Array.from({ length: 30 }, () => ({
          type: 'star',
          x: Math.random() * 960,
          y: Math.random() * 100,
          color: `rgba(255,255,255,${0.2 + Math.random() * 0.4})`,
        })),
        { type: 'cloud', x: 200, y: 60, w: 40, color: '#ffffff10' },
        { type: 'cloud', x: 600, y: 40, w: 50, color: '#ffffff08' },
      ]));
      break;
  }

  return layers;
}
