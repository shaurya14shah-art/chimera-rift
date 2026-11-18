/* ═══════════════════════════════════════════════════
   Transition.js — Screen transition effects
   Fade, swirl, pixelate, battle intro, etc.
   ═══════════════════════════════════════════════════ */

import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../constants.js';

export class TransitionManager {
  constructor() {
    this.active = false;
    this.type = 'fade';
    this.progress = 0;    // 0 → 1 → 0
    this.speed = 2;
    this.phase = 'in';    // 'in' (fading to black) or 'out' (fading from black)
    this.callback = null;  // Called at midpoint
    this.overlay = document.getElementById('transition-overlay');
  }

  /**
   * Start a transition. Callback fires at the midpoint (screen fully black).
   */
  start(type = 'fade', speed = 2, callback = null) {
    this.active = true;
    this.type = type;
    this.speed = speed;
    this.progress = 0;
    this.phase = 'in';
    this.callback = callback;
  }

  update(dt) {
    if (!this.active) return;

    if (this.phase === 'in') {
      this.progress += this.speed * dt;
      if (this.progress >= 1) {
        this.progress = 1;
        this.phase = 'out';
        if (this.callback) {
          this.callback();
          this.callback = null;
        }
      }
    } else if (this.phase === 'out') {
      this.progress -= this.speed * dt * 2; // Fade out faster
      if (this.progress <= 0) {
        this.progress = 0;
        this.active = false;
        this.phase = 'in';
      }
    }
  }

  render(canvas) {
    if (!this.active) return;

    const ctx = canvas.getCtx();
    const alpha = this.phase === 'in' ? this.progress : this.progress;

    switch (this.type) {
      case 'fade':
        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
        ctx.restore();
        break;

      case 'battle':
        this._renderBattleTransition(ctx, alpha);
        break;

      case 'pixelate':
        this._renderPixelate(ctx, alpha);
        break;

      case 'wipe':
        this._renderWipe(ctx, alpha);
        break;
    }
  }

  _renderBattleTransition(ctx, alpha) {
    // Dramatic battle intro: expanding diamonds
    ctx.save();
    ctx.fillStyle = '#000';

    const numStrips = 8;
    const stripH = NATIVE_HEIGHT / numStrips;

    for (let i = 0; i < numStrips; i++) {
      const delay = i * 0.05;
      const localAlpha = Math.max(0, Math.min(1, (alpha - delay) * 2));
      const w = NATIVE_WIDTH * localAlpha;

      if (i % 2 === 0) {
        ctx.fillRect(0, i * stripH, w, stripH);
      } else {
        ctx.fillRect(NATIVE_WIDTH - w, i * stripH, w, stripH);
      }
    }

    // Flash white at midpoint
    if (alpha > 0.8 && alpha < 1) {
      ctx.globalAlpha = (1 - Math.abs(alpha - 0.9) * 10) * 0.5;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
    }

    ctx.restore();
  }

  _renderPixelate(ctx, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.fillStyle = '#000';
    
    const blockSize = Math.max(1, Math.floor(alpha * 16));
    for (let y = 0; y < NATIVE_HEIGHT; y += blockSize) {
      for (let x = 0; x < NATIVE_WIDTH; x += blockSize) {
        if (Math.random() < alpha) {
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }
    }
    ctx.restore();
  }

  _renderWipe(ctx, alpha) {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, NATIVE_WIDTH * alpha, NATIVE_HEIGHT);
    ctx.restore();
  }

  isActive() {
    return this.active;
  }

  isMidpoint() {
    return this.phase === 'out' && this.progress >= 0.95;
  }
}
