/* ═══════════════════════════════════════════════════
   AudioManager.js — Music + SFX via Web Audio API
   Procedural chiptune music generation
   ═══════════════════════════════════════════════════ */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this.initialized = false;
    this.muted = false;
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.3;

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = 0.4;

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.value = 0.6;

    this.initialized = true;
  }

  // Play a procedural chiptune note
  playNote(freq, duration = 0.1, type = 'square', gainNode = null) {
    if (!this.initialized || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(gainNode || this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // SFX presets
  playSFX(name) {
    if (!this.initialized || this.muted) return;
    const sfx = SFX_DEFS[name];
    if (!sfx) return;
    sfx(this);
  }

  // Play a melody sequence
  playMelody(notes, tempo = 120, type = 'square') {
    if (!this.initialized || this.muted) return;
    const beatDuration = 60 / tempo;
    let time = this.ctx.currentTime;

    for (const note of notes) {
      if (note.freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(note.freq, time);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + beatDuration * note.dur * 0.9);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + beatDuration * note.dur);
      }
      time += beatDuration * note.dur;
    }
  }

  // Play a looping background track
  startTrack(trackName) {
    this.stopTrack();
    const track = TRACKS[trackName];
    if (!track) return;
    
    this._loopTrack = true;
    this._playTrackLoop(track);
  }

  _playTrackLoop(track) {
    if (!this._loopTrack || !this.initialized || this.muted) return;
    this.playMelody(track.melody, track.tempo, track.wave || 'square');
    
    // Calculate track duration
    const beatDuration = 60 / track.tempo;
    const totalDuration = track.melody.reduce((sum, n) => sum + n.dur * beatDuration, 0);
    
    this._trackTimeout = setTimeout(() => {
      if (this._loopTrack) this._playTrackLoop(track);
    }, totalDuration * 1000);
  }

  stopTrack() {
    this._loopTrack = false;
    if (this._trackTimeout) {
      clearTimeout(this._trackTimeout);
      this._trackTimeout = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.3;
    }
  }
}

// ── Note frequency helper ──
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  REST: 0,
};

// ── SFX Definitions ──
const SFX_DEFS = {
  confirm: (am) => {
    am.playNote(NOTE.E5, 0.08);
    setTimeout(() => am.playNote(NOTE.A5, 0.12), 80);
  },
  cancel: (am) => {
    am.playNote(NOTE.A4, 0.08);
    setTimeout(() => am.playNote(NOTE.E4, 0.12), 80);
  },
  cursor: (am) => {
    am.playNote(NOTE.C5, 0.05, 'square');
  },
  hit: (am) => {
    am.playNote(80, 0.05, 'sawtooth');
    setTimeout(() => am.playNote(60, 0.08, 'sawtooth'), 50);
  },
  critical: (am) => {
    am.playNote(100, 0.03, 'sawtooth');
    setTimeout(() => am.playNote(200, 0.05, 'square'), 30);
    setTimeout(() => am.playNote(80, 0.1, 'sawtooth'), 60);
  },
  heal: (am) => {
    am.playNote(NOTE.C5, 0.1);
    setTimeout(() => am.playNote(NOTE.E5, 0.1), 100);
    setTimeout(() => am.playNote(NOTE.G5, 0.15), 200);
  },
  levelUp: (am) => {
    const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C5 * 2];
    notes.forEach((n, i) => setTimeout(() => am.playNote(n, 0.15), i * 120));
  },
  capture: (am) => {
    am.playNote(NOTE.G4, 0.1, 'triangle');
    setTimeout(() => am.playNote(NOTE.B4, 0.1, 'triangle'), 100);
    setTimeout(() => am.playNote(NOTE.D5, 0.15, 'triangle'), 200);
    setTimeout(() => am.playNote(NOTE.G5, 0.2, 'triangle'), 300);
  },
  encounter: (am) => {
    am.playNote(NOTE.E4, 0.06, 'sawtooth');
    setTimeout(() => am.playNote(NOTE.G4, 0.06, 'sawtooth'), 60);
    setTimeout(() => am.playNote(NOTE.B4, 0.06, 'sawtooth'), 120);
    setTimeout(() => am.playNote(NOTE.E5, 0.12, 'sawtooth'), 180);
  },
  fuse: (am) => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => am.playNote(200 + i * 100, 0.08, 'sawtooth'), i * 50);
    }
  },
  menuOpen: (am) => {
    am.playNote(NOTE.C4, 0.06, 'triangle');
    setTimeout(() => am.playNote(NOTE.G4, 0.08, 'triangle'), 60);
  },
};

// ── Music Tracks (Procedural Melodies) ──
const n = (freq, dur = 1) => ({ freq, dur });

const TRACKS = {
  title: {
    tempo: 100,
    wave: 'triangle',
    melody: [
      n(NOTE.E4, 2), n(NOTE.G4, 1), n(NOTE.A4, 1), n(NOTE.B4, 2), n(NOTE.REST, 1), n(NOTE.A4, 1),
      n(NOTE.G4, 2), n(NOTE.E4, 1), n(NOTE.D4, 1), n(NOTE.E4, 4),
      n(NOTE.REST, 2),
      n(NOTE.E4, 2), n(NOTE.G4, 1), n(NOTE.A4, 1), n(NOTE.B4, 2), n(NOTE.D5, 1), n(NOTE.C5, 1),
      n(NOTE.B4, 2), n(NOTE.A4, 1), n(NOTE.G4, 1), n(NOTE.A4, 4),
      n(NOTE.REST, 2),
    ],
  },
  overworld: {
    tempo: 130,
    wave: 'square',
    melody: [
      n(NOTE.C4, 1), n(NOTE.E4, 1), n(NOTE.G4, 1), n(NOTE.E4, 1),
      n(NOTE.A4, 2), n(NOTE.G4, 2),
      n(NOTE.F4, 1), n(NOTE.A4, 1), n(NOTE.G4, 1), n(NOTE.F4, 1),
      n(NOTE.E4, 2), n(NOTE.C4, 2),
      n(NOTE.D4, 1), n(NOTE.F4, 1), n(NOTE.A4, 1), n(NOTE.G4, 1),
      n(NOTE.E4, 2), n(NOTE.C4, 1), n(NOTE.D4, 1),
      n(NOTE.C4, 4),
      n(NOTE.REST, 2),
    ],
  },
  battle: {
    tempo: 160,
    wave: 'square',
    melody: [
      n(NOTE.E4, 0.5), n(NOTE.E4, 0.5), n(NOTE.REST, 0.5), n(NOTE.E4, 0.5),
      n(NOTE.REST, 0.5), n(NOTE.C4, 0.5), n(NOTE.E4, 1),
      n(NOTE.G4, 1), n(NOTE.REST, 1), n(NOTE.G3, 1), n(NOTE.REST, 1),
      n(NOTE.C4, 1), n(NOTE.REST, 0.5), n(NOTE.G3, 0.5), n(NOTE.REST, 0.5), n(NOTE.E3, 0.5),
      n(NOTE.A3, 1), n(NOTE.B3, 1), n(NOTE.A3, 0.5), n(NOTE.REST, 0.5),
      n(NOTE.G3, 0.75), n(NOTE.E4, 0.75), n(NOTE.G4, 0.75), n(NOTE.A4, 0.75),
      n(NOTE.F4, 0.5), n(NOTE.G4, 0.5), n(NOTE.REST, 0.5), n(NOTE.E4, 0.5),
      n(NOTE.C4, 0.5), n(NOTE.D4, 0.5), n(NOTE.B3, 1),
      n(NOTE.REST, 1),
    ],
  },
  town: {
    tempo: 90,
    wave: 'triangle',
    melody: [
      n(NOTE.G4, 2), n(NOTE.A4, 1), n(NOTE.B4, 1),
      n(NOTE.D5, 2), n(NOTE.C5, 1), n(NOTE.B4, 1),
      n(NOTE.A4, 2), n(NOTE.G4, 1), n(NOTE.A4, 1),
      n(NOTE.B4, 4),
      n(NOTE.REST, 1),
      n(NOTE.C5, 2), n(NOTE.B4, 1), n(NOTE.A4, 1),
      n(NOTE.G4, 2), n(NOTE.E4, 2),
      n(NOTE.D4, 1), n(NOTE.E4, 1), n(NOTE.G4, 2),
      n(NOTE.A4, 4),
      n(NOTE.REST, 2),
    ],
  },
  victory: {
    tempo: 140,
    wave: 'square',
    melody: [
      n(NOTE.C5, 0.5), n(NOTE.C5, 0.5), n(NOTE.C5, 0.5), n(NOTE.C5, 1.5),
      n(NOTE.A4, 0.5), n(NOTE.B4, 0.5), n(NOTE.C5, 1.5), n(NOTE.B4, 0.5), n(NOTE.C5, 2),
      n(NOTE.REST, 1),
    ],
  },
  boss: {
    tempo: 180,
    wave: 'sawtooth',
    melody: [
      n(NOTE.E3, 0.5), n(NOTE.E3, 0.5), n(NOTE.E4, 0.5), n(NOTE.E3, 0.5),
      n(NOTE.E3, 0.5), n(NOTE.D4, 0.5), n(NOTE.E3, 0.5), n(NOTE.E3, 0.5),
      n(NOTE.C4, 0.5), n(NOTE.E3, 0.5), n(NOTE.E3, 0.5), n(NOTE.B3, 0.5),
      n(NOTE.E3, 0.5), n(NOTE.E3, 0.5), n(NOTE.A3, 0.5), n(NOTE.B3, 0.5),
      n(NOTE.REST, 1),
    ],
  },
};

export const AUDIO_TRACKS = Object.keys(TRACKS);
