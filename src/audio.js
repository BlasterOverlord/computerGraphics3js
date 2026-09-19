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

  removeListener(callback) {
    this.listeners = this.listeners.filter((fn) => fn !== callback);
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
    return this.playing;
  }

  isPlaying() {
    return this.playing;
  }
}

export const soundManager = new SoundManager();
