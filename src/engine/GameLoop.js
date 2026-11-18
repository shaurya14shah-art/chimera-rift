/* ═══════════════════════════════════════════════════
   GameLoop.js — Fixed-timestep RAF game loop
   ═══════════════════════════════════════════════════ */

import { FPS, FRAME_TIME } from '../constants.js';

export class GameLoop {
  constructor(updateFn, renderFn) {
    this.update = updateFn;
    this.render = renderFn;
    this.running = false;
    this.rafId = null;
    this.lastTime = 0;
    this.accumulator = 0;
    this.frameCount = 0;
    this.fpsDisplay = 0;
    this.fpsTimer = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this._tick = this._tick.bind(this);
    this.rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _tick(timestamp) {
    if (!this.running) return;

    let delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Clamp delta to prevent spiral of death (e.g., tab was inactive)
    if (delta > 200) delta = FRAME_TIME;

    this.accumulator += delta;

    // Fixed timestep updates
    while (this.accumulator >= FRAME_TIME) {
      this.update(FRAME_TIME / 1000); // pass dt in seconds
      this.accumulator -= FRAME_TIME;
    }

    // Render with interpolation factor
    const alpha = this.accumulator / FRAME_TIME;
    this.render(alpha);

    // FPS counter
    this.frameCount++;
    this.fpsTimer += delta;
    if (this.fpsTimer >= 1000) {
      this.fpsDisplay = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1000;
    }

    this.rafId = requestAnimationFrame(this._tick);
  }

  getFPS() {
    return this.fpsDisplay;
  }
}
