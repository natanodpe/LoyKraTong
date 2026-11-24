// Procedural Web Audio API synthesizer for Authentic Thai Loy Krathong Melody & Ambient River Soundscape

class LoyKrathongAudioSystem {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.volume = 0.6;
    this.masterGain = null;
    this.ambientGain = null;
    this.melodyGain = null;
    this.intervalId = null;
    this.step = 0;
    this.noiseNode = null;
    this.listeners = new Set();

    // Notes mapping (Hz)
    this.notes = {
      'D4': 293.66,
      'F4': 349.23,
      'G4': 392.00,
      'A4': 440.00,
      'C5': 523.25,
      'D5': 587.33,
      'F5': 698.46,
      'G5': 783.99,
      'rest': 0
    };

    // Authentic Thai Loy Krathong melody sheet (note, duration in beats)
    // Tempo: ~100 BPM
    this.melody = [
      // วันเพ็ญ เดือนสิบสอง
      { note: 'C5', dur: 1 }, { note: 'C5', dur: 1 }, { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 2 },
      // น้ำนอง เต็มตลิ่ง
      { note: 'C5', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 2 },
      // เราทั้งหลาย ชายหญิง
      { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 1 }, { note: 'C5', dur: 1 }, { note: 'A4', dur: 2 },
      // สนุกกันจริง วันลอยกระทง
      { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'D4', dur: 0.5 }, { note: 'F4', dur: 1.5 },

      // ลอย ลอยกระทง
      { note: 'C5', dur: 1 }, { note: 'C5', dur: 1 }, { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 1.5 },
      // ลอย ลอยกระทง
      { note: 'A4', dur: 1 }, { note: 'A4', dur: 1 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 1.5 },

      // ลอยกระทงกันแล้ว
      { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 2 },
      // ขอเชิญน้องแก้ว ออกมารำวง
      { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'F4', dur: 1.5 },

      // รำวงวันลอยกระทง
      { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 2 },
      // รำวงวันลอยกระทง
      { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'D4', dur: 2 },

      // บุญจะส่ง ให้เราสุขใจ
      { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 2 },
      // บุญจะส่ง ให้เราสุขใจ
      { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'D4', dur: 0.5 }, { note: 'F4', dur: 2.5 },

      { note: 'rest', dur: 1 }
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    this.melodyGain = this.ctx.createGain();
    this.melodyGain.gain.setValueAtTime(0.38, this.ctx.currentTime);
    this.melodyGain.connect(this.masterGain);

    this.startRiverAmbient();
  }

  // Generates gentle soothing river water ripple sound using pink noise + low-pass sweep
  startRiverAmbient() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    // LFO for wave modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // gentle wave every 5s
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);

    whiteNoise.start();
    lfo.start();
    this.noiseNode = whiteNoise;
  }

  // Synthesizes authentic warm Thai acoustic instrument tone (Ranat / Bell chime)
  playNote(frequency, durationSec) {
    if (!this.ctx || frequency <= 0) return;
    const now = this.ctx.currentTime;

    // Primary bell tone (Sine)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);

    // Warm marimba/ranat wooden harmonic (Triangle + gentle frequency detune)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2, now); // second harmonic

    // Gentle metallic sparkle (low volume)
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(frequency * 3.01, now);

    const noteGain = this.ctx.createGain();
    // Soft attack, warm sustain, natural bell decay
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.5, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 1.6);

    const osc3Gain = this.ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.08, now);
    osc3.connect(osc3Gain);
    osc3Gain.connect(noteGain);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.melodyGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    const stopTime = now + durationSec * 1.7;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);
  }

  startMelodyLoop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.step = 0;
    const beatMs = 520; // ~115 BPM comfortable Thai folk tempo

    const nextStep = () => {
      if (!this.isPlaying) return;
      const item = this.melody[this.step];
      const freq = this.notes[item.note] || 0;
      const durSec = item.dur * (beatMs / 1000);

      if (freq > 0) {
        this.playNote(freq, durSec);
      }

      this.step = (this.step + 1) % this.melody.length;
      this.intervalId = setTimeout(nextStep, item.dur * beatMs);
    };

    nextStep();
  }

  play() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.startMelodyLoop();
    this.notify();
  }

  pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.notify();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(cb => cb({
      isPlaying: this.isPlaying,
      volume: this.volume
    }));
  }
}

export const audioSystem = new LoyKrathongAudioSystem();
