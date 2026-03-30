const STORAGE_KEY = 'alienBlasterAudioSettings';

export class AudioManager {
    constructor() {
        this.ctx = null; // AudioContext, created on first user interaction
        this.sounds = {};      // key -> AudioBuffer
        this.musicElement = null;
        this.sfxVolume = 0.5;
        this.musicVolume = 0.3;
        this.muted = false;
        this.initialized = false;
        this.loadSettings();
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.ctx.destination);
        this.sfxGain.gain.value = this.muted ? 0 : this.sfxVolume;
        this.initialized = true;
    }

    loadSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const settings = JSON.parse(data);
                this.sfxVolume = settings.sfxVolume ?? 0.5;
                this.musicVolume = settings.musicVolume ?? 0.3;
                this.muted = settings.muted ?? false;
            }
        } catch {}
    }

    saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                sfxVolume: this.sfxVolume,
                musicVolume: this.musicVolume,
                muted: this.muted,
            }));
        } catch {}
    }

    async loadSound(key, url) {
        if (!this.initialized) this.init();
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.sounds[key] = audioBuffer;
        } catch (err) {
            console.warn(`Failed to load sound: ${key} from ${url}`, err);
        }
    }

    playSFX(key, volume) {
        if (!this.initialized || this.muted) return;
        const buffer = this.sounds[key];
        if (!buffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = (volume ?? 1) * this.sfxVolume;
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start(0);
    }

    setMusicElement(audioElement) {
        this.musicElement = audioElement;
        this.musicElement.volume = this.muted ? 0 : this.musicVolume;
        this.musicElement.loop = true;
    }

    playMusic() {
        if (!this.musicElement) return;
        this.musicElement.volume = this.muted ? 0 : this.musicVolume;
        this.musicElement.play().catch(() => {});
    }

    stopMusic() {
        if (!this.musicElement) return;
        this.musicElement.pause();
        this.musicElement.currentTime = 0;
    }

    setSFXVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.muted ? 0 : this.sfxVolume;
        }
        this.saveSettings();
    }

    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        if (this.musicElement) {
            this.musicElement.volume = this.muted ? 0 : this.musicVolume;
        }
        this.saveSettings();
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.muted ? 0 : this.sfxVolume;
        }
        if (this.musicElement) {
            this.musicElement.volume = this.muted ? 0 : this.musicVolume;
        }
        this.saveSettings();
        return this.muted;
    }
}
