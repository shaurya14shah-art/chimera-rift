/* ═══════════════════════════════════════════════════
   SceneManager.js — Scene state machine
   Manages transitions between game scenes (title, overworld, battle, etc.)
   ═══════════════════════════════════════════════════ */

export class SceneManager {
  constructor() {
    this.scenes = {};
    this.activeScene = null;
    this.activeSceneId = null;
    this.overlayScene = null; // For dialog/menu overlays on top
    this.overlaySceneId = null;
    this.transitioning = false;
    this.transitionAlpha = 0;
    this.transitionCallback = null;
    this.transitionSpeed = 2; // alpha per second
  }

  // Register a scene
  register(id, scene) {
    this.scenes[id] = scene;
  }

  // Switch to a scene (with optional fade transition)
  switchTo(id, data = {}, fade = true) {
    if (this.transitioning) return;
    
    if (!this.scenes[id]) {
      console.error(`Scene "${id}" not registered!`);
      return;
    }

    if (!fade || !this.activeScene) {
      // Instant switch
      this._doSwitch(id, data);
      return;
    }

    // Fade transition
    this.transitioning = true;
    this.transitionAlpha = 0;
    this.transitionCallback = () => {
      this._doSwitch(id, data);
    };
  }

  _doSwitch(id, data) {
    if (this.activeScene && this.activeScene.exit) {
      this.activeScene.exit();
    }
    this.activeScene = this.scenes[id];
    this.activeSceneId = id;
    if (this.activeScene.enter) {
      this.activeScene.enter(data);
    }
  }

  // Push an overlay scene (dialog, menu) on top of current
  pushOverlay(id, data = {}) {
    if (!this.scenes[id]) return;
    this.overlayScene = this.scenes[id];
    this.overlaySceneId = id;
    if (this.overlayScene.enter) {
      this.overlayScene.enter(data);
    }
  }

  // Pop the overlay scene
  popOverlay() {
    if (this.overlayScene && this.overlayScene.exit) {
      this.overlayScene.exit();
    }
    this.overlayScene = null;
    this.overlaySceneId = null;
  }

  update(dt) {
    // Handle fade transition
    if (this.transitioning) {
      if (this.transitionAlpha < 1 && this.transitionCallback) {
        this.transitionAlpha = Math.min(1, this.transitionAlpha + this.transitionSpeed * dt);
        if (this.transitionAlpha >= 1) {
          this.transitionCallback();
          this.transitionCallback = null;
        }
      } else if (!this.transitionCallback) {
        this.transitionAlpha = Math.max(0, this.transitionAlpha - this.transitionSpeed * dt);
        if (this.transitionAlpha <= 0) {
          this.transitioning = false;
        }
      }
    }

    // Update active scene
    if (this.activeScene && this.activeScene.update) {
      this.activeScene.update(dt);
    }

    // Update overlay if present
    if (this.overlayScene && this.overlayScene.update) {
      this.overlayScene.update(dt);
    }
  }

  render(canvas, alpha) {
    // Render active scene
    if (this.activeScene && this.activeScene.render) {
      this.activeScene.render(canvas, alpha);
    }

    // Render overlay on top
    if (this.overlayScene && this.overlayScene.render) {
      this.overlayScene.render(canvas, alpha);
    }

    // Render fade transition
    if (this.transitioning && this.transitionAlpha > 0) {
      canvas.save();
      canvas.setAlpha(this.transitionAlpha);
      canvas.fillRect(0, 0, canvas.canvas.width, canvas.canvas.height, '#000');
      canvas.resetAlpha();
      canvas.restore();
    }
  }

  isActive(id) {
    return this.activeSceneId === id;
  }
}
