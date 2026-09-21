/**
 * audio.js
 * Clean, lightweight highway sound manager using HTML5 Audio.
 * Plays /sounds/highway.mp3 in a continuous loop with state listeners.
 */

class SoundManager {
  constructor() {
    this.audio = new Audio('/sounds/highway.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.65;
    this.audio.preload = 'auto';
    this.playing = false;
    this.listeners = [];

    // Synchronize state with native audio element lifecycle
    this.audio.addEventListener('play', () => {
      if (!this.playing) {
        this.playing = true;
        this._notify();
      }
    });
    this.audio.addEventListener('pause', () => {
      if (this.playing) {
        this.playing = false;
        this._notify();
      }
    });
  }

  addListener(callback) {
    this.listeners.push(callback);
    callback(this.playing);
  }

  _notify() {
    for (const fn of this.listeners) {
      fn(this.playing);
    }
  }

  toggle() {
    if (this.playing) {
      this.audio.pause();
      this.playing = false;
      this._notify();
    } else {
      this.playing = true;
      this._notify();
      const promise = this.audio.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.warn('Audio play request failed or blocked by browser:', err);
          this.playing = false;
          this._notify();
        });
      }
    }
  }

  async honk() {
    // Load only on a user gesture; reuse one element to prevent overlapping horns.
    if (this.hornPending || (this.horn && !this.horn.paused)) return;
    this.hornPending = true;
    try {
      if (!this.horn) {
        this.horn = new Audio(import.meta.env.BASE_URL + 'sounds/truck-horn.mp3');
        this.horn.volume = 0.7;
      }
      if (this.horn.error) this.horn.load();
      this.horn.currentTime = 0;
      await this.horn.play();
    } catch (error) {
      console.warn('Horn unavailable. Add an MP3 at public/sounds/truck-horn.mp3.', error);
    } finally {
      this.hornPending = false;
    }
  }
}

export const soundManager = new SoundManager();
