/* ═══════════════════════════════════════════════════
   Particles.js — Lightweight particle effects system
   Used for battle move effects, essence auras, etc.
   ═══════════════════════════════════════════════════ */

export class Particle {
  constructor(x, y, vx, vy, life, color, size = 2) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Emit a burst of particles
  emit(x, y, count, config = {}) {
    const {
      color = '#fff',
      speed = 50,
      spread = Math.PI * 2,
      angle = -Math.PI / 2,
      life = 1,
      lifeVar = 0.3,
      size = 2,
      sizeVar = 1,
      gravity = 0,
    } = config;

    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const s = speed * (0.5 + Math.random() * 0.5);
      const l = life + (Math.random() - 0.5) * lifeVar * 2;
      const sz = Math.max(1, size + (Math.random() - 0.5) * sizeVar * 2);
      
      const p = new Particle(
        x + (Math.random() - 0.5) * 4,
        y + (Math.random() - 0.5) * 4,
        Math.cos(a) * s,
        Math.sin(a) * s + (gravity || 0),
        l,
        Array.isArray(color) ? color[Math.floor(Math.random() * color.length)] : color,
        sz
      );
      
      if (gravity) {
        p._gravity = gravity;
      }
      
      this.particles.push(p);
    }
  }

  // Continuously spawn particles (call each frame)
  trail(x, y, config = {}) {
    if (Math.random() < (config.rate || 0.3)) {
      this.emit(x, y, 1, config);
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p._gravity) {
        p.vy += p._gravity * dt;
      }
      p.update(dt);
      if (p.dead) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(canvas) {
    const ctx = canvas.getCtx();
    for (const p of this.particles) {
      p.render(ctx);
    }
  }

  clear() {
    this.particles = [];
  }

  get count() {
    return this.particles.length;
  }
}

// ── Preset particle effects ──
export const PARTICLE_PRESETS = {
  ember: {
    color: ['#d94f30', '#ff6633', '#f0d060', '#ff4400'],
    speed: 40,
    spread: Math.PI,
    angle: -Math.PI / 2,
    life: 0.8,
    size: 2,
    gravity: -20,
  },
  tide: {
    color: ['#1a9e8f', '#3ac0b0', '#60e0d0', '#80ffef'],
    speed: 30,
    spread: Math.PI * 1.5,
    life: 0.6,
    size: 2,
  },
  bloom: {
    color: ['#3aa84f', '#60d060', '#90ff90', '#c0ffc0'],
    speed: 20,
    spread: Math.PI * 2,
    life: 1.2,
    size: 2,
    gravity: 10,
  },
  flux: {
    color: ['#3a9bdc', '#60b0ff', '#90d0ff', '#ffffff'],
    speed: 60,
    spread: Math.PI * 0.5,
    life: 0.4,
    size: 1,
  },
  void: {
    color: ['#1a1a2e', '#2a1a3e', '#3a1a4e', '#4a1a5e'],
    speed: 15,
    spread: Math.PI * 2,
    life: 1.5,
    size: 3,
  },
  lumen: {
    color: ['#f0d060', '#ffe080', '#fff0a0', '#ffffff'],
    speed: 35,
    spread: Math.PI * 2,
    life: 0.7,
    size: 1,
  },
  levelUp: {
    color: ['#f0d060', '#ffffff', '#ffe080'],
    speed: 80,
    spread: Math.PI * 2,
    life: 1.0,
    size: 2,
  },
  capture: {
    color: ['#ff4444', '#ffffff', '#ff8888'],
    speed: 60,
    spread: Math.PI * 2,
    life: 0.5,
    size: 2,
  },
};
