/**
 * Cozy 8-bit synthesizer sound effects using Web Audio API
 */

class RetroAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, gainVal: number = 0.1) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy catch
    }
  }

  playHug() {
    // Warm arpeggio chord
    this.playTone(330, 'triangle', 0.2, 0.15);
    setTimeout(() => this.playTone(440, 'triangle', 0.25, 0.15), 100);
    setTimeout(() => this.playTone(554.37, 'sine', 0.35, 0.2), 200);
  }

  playPoke() {
    // Quick boing chirp
    this.playTone(493.88, 'square', 0.1, 0.1);
    setTimeout(() => this.playTone(659.25, 'square', 0.15, 0.12), 60);
  }

  playNote() {
    // Soft postal ding
    this.playTone(587.33, 'sine', 0.2, 0.15);
    setTimeout(() => this.playTone(880, 'sine', 0.3, 0.12), 120);
  }

  playShutter() {
    // Camera click
    this.playTone(800, 'square', 0.05, 0.1);
    setTimeout(() => this.playTone(400, 'triangle', 0.1, 0.15), 60);
  }

  playSuccess() {
    // Retro level-up fanfare
    this.playTone(440, 'square', 0.1, 0.1);
    setTimeout(() => this.playTone(554.37, 'square', 0.1, 0.1), 100);
    setTimeout(() => this.playTone(659.25, 'square', 0.1, 0.1), 200);
    setTimeout(() => this.playTone(880, 'square', 0.25, 0.15), 300);
  }

  playClick() {
    // Gentle tactile click
    this.playTone(600, 'triangle', 0.04, 0.08);
  }

  playJukebox() {
    // Sweet cozy lo-fi chiptune melody (C4, E4, G4, B4, C5)
    this.playTone(261.63, 'triangle', 0.18, 0.14);
    setTimeout(() => this.playTone(329.63, 'triangle', 0.18, 0.14), 110);
    setTimeout(() => this.playTone(392.0, 'triangle', 0.18, 0.14), 220);
    setTimeout(() => this.playTone(493.88, 'sine', 0.22, 0.16), 330);
    setTimeout(() => this.playTone(523.25, 'sine', 0.35, 0.18), 440);
  }

  playZoomies() {
    // High energy joyful sprint chirps
    this.playTone(523.25, 'triangle', 0.07, 0.12);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.07, 0.12), 70);
    setTimeout(() => this.playTone(783.99, 'sine', 0.1, 0.14), 140);
    setTimeout(() => this.playTone(1046.5, 'sine', 0.15, 0.16), 210);
  }

  playLampClick() {
    // Soft toggle switch click
    this.playTone(350, 'square', 0.03, 0.06);
    setTimeout(() => this.playTone(700, 'triangle', 0.05, 0.08), 35);
  }
}

export const retroAudio = new RetroAudio();
