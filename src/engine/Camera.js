/* ═══════════════════════════════════════════════════
   Camera.js — 2D camera with smooth follow + screen shake
   ═══════════════════════════════════════════════════ */

import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../constants.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothing = 0.1;    // Lower = smoother
    this.deadzone = 16;       // Pixels before camera starts following

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // Map bounds (prevents camera from showing beyond map edges)
    this.bounds = null; // { width, height } in pixels
  }

  // Follow a target entity (usually the player)
  follow(target) {
    this.targetX = target.x - NATIVE_WIDTH / 2 + (target.width || 16) / 2;
    this.targetY = target.y - NATIVE_HEIGHT / 2 + (target.height || 16) / 2;
  }

  // Snap instantly to target (no smoothing)
  snapTo(x, y) {
    this.x = x - NATIVE_WIDTH / 2;
    this.y = y - NATIVE_HEIGHT / 2;
    this.targetX = this.x;
    this.targetY = this.y;
    this._clampBounds();
  }

  // Set map bounds
  setBounds(widthPx, heightPx) {
    this.bounds = { width: widthPx, height: heightPx };
  }

  // Trigger screen shake
  shake(intensity = 4, duration = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  update(dt) {
    // Smooth follow with deadzone
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;

    if (Math.abs(dx) > this.deadzone) {
      this.x += dx * this.smoothing;
    }
    if (Math.abs(dy) > this.deadzone) {
      this.y += dy * this.smoothing;
    }

    // Clamp to map bounds
    this._clampBounds();

    // Update screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const intensity = this.shakeIntensity * (this.shakeTimer / this.shakeDuration);
      this.shakeOffsetX = (Math.random() * 2 - 1) * intensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * intensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  _clampBounds() {
    if (!this.bounds) return;
    this.x = Math.max(0, Math.min(this.x, this.bounds.width - NATIVE_WIDTH));
    this.y = Math.max(0, Math.min(this.y, this.bounds.height - NATIVE_HEIGHT));
  }

  // Get the render offset (includes shake)
  get renderX() { return Math.floor(this.x + this.shakeOffsetX); }
  get renderY() { return Math.floor(this.y + this.shakeOffsetY); }

  // Check if a world position is visible on screen
  isVisible(x, y, w = 16, h = 16) {
    return (
      x + w > this.x &&
      x < this.x + NATIVE_WIDTH &&
      y + h > this.y &&
      y < this.y + NATIVE_HEIGHT
    );
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(wx, wy) {
    return {
      x: wx - this.renderX,
      y: wy - this.renderY,
    };
  }
}
