/* ═══════════════════════════════════════════════════
   Input.js — Keyboard input manager
   Tracks key states, supports buffered press detection.
   ═══════════════════════════════════════════════════ */

export class Input {
  constructor() {
    this.keys = {};           // Currently held keys
    this.justPressed = {};    // Keys pressed this frame
    this.justReleased = {};   // Keys released this frame
    this._pendingPress = {};
    this._pendingRelease = {};

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown(e) {
    if (!this.keys[e.key]) {
      this._pendingPress[e.key] = true;
    }
    this.keys[e.key] = true;
    
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this.keys[e.key] = false;
    this._pendingRelease[e.key] = true;
  }

  // Call once per frame to flush press/release buffers
  update() {
    this.justPressed = { ...this._pendingPress };
    this.justReleased = { ...this._pendingRelease };
    this._pendingPress = {};
    this._pendingRelease = {};
  }

  // Check if a key is currently held
  isDown(key) {
    if (Array.isArray(key)) return key.some(k => this.keys[k]);
    return !!this.keys[key];
  }

  // Check if a key was just pressed this frame
  isPressed(key) {
    if (Array.isArray(key)) return key.some(k => this.justPressed[k]);
    return !!this.justPressed[key];
  }

  // Check if a key was just released this frame
  isReleased(key) {
    if (Array.isArray(key)) return key.some(k => this.justReleased[k]);
    return !!this.justReleased[key];
  }

  // Directional helpers
  getDirection() {
    let dx = 0, dy = 0;
    if (this.isDown(['ArrowLeft', 'a', 'A'])) dx -= 1;
    if (this.isDown(['ArrowRight', 'd', 'D'])) dx += 1;
    if (this.isDown(['ArrowUp', 'w', 'W'])) dy -= 1;
    if (this.isDown(['ArrowDown', 's', 'S'])) dy += 1;
    return { dx, dy };
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
