export class SoundGenerator {
    static async generateAll(audioCtx) {
        const sounds = {};
        sounds.laser = await SoundGenerator.generateLaser(audioCtx);
        sounds.rocket = await SoundGenerator.generateRocket(audioCtx);
        sounds.explosion = await SoundGenerator.generateExplosion(audioCtx);
        sounds.bossExplosion = await SoundGenerator.generateBossExplosion(audioCtx);
        sounds.powerup = await SoundGenerator.generatePowerup(audioCtx);
        sounds.hit = await SoundGenerator.generateHit(audioCtx);
        sounds.shieldUp = await SoundGenerator.generateShieldUp(audioCtx);
        sounds.shieldBreak = await SoundGenerator.generateShieldBreak(audioCtx);
        sounds.waveComplete = await SoundGenerator.generateWaveComplete(audioCtx);
        sounds.bossWarning = await SoundGenerator.generateBossWarning(audioCtx);
        return sounds;
    }

    static renderToBuffer(audioCtx, duration, renderFn) {
        const sampleRate = audioCtx.sampleRate;
        const length = Math.floor(sampleRate * duration);
        const buffer = audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        renderFn(data, sampleRate, length);
        return buffer;
    }

    static generateLaser(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.15, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                const freq = 880 - t * 3000; // descending pitch
                data[i] = Math.sin(2 * Math.PI * freq * t) * (1 - t / 0.15) * 0.3;
            }
        });
    }

    static generateRocket(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.4, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                const noise = Math.random() * 2 - 1;
                const tone = Math.sin(2 * Math.PI * 120 * t);
                const env = Math.exp(-t * 3);
                data[i] = (noise * 0.4 + tone * 0.6) * env * 0.3;
            }
        });
    }

    static generateExplosion(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.3, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                const noise = Math.random() * 2 - 1;
                const env = Math.exp(-t * 8);
                data[i] = noise * env * 0.4;
            }
        });
    }

    static generateBossExplosion(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 1.0, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                const noise = Math.random() * 2 - 1;
                const bass = Math.sin(2 * Math.PI * 50 * t);
                const env = Math.exp(-t * 2);
                data[i] = (noise * 0.5 + bass * 0.5) * env * 0.5;
            }
        });
    }

    static generatePowerup(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.3, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                const freq = 400 + t * 1200; // ascending pitch
                const env = 1 - t / 0.3;
                data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.25;
            }
        });
    }

    static generateHit(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.1, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                const noise = Math.random() * 2 - 1;
                const env = Math.exp(-t * 30);
                data[i] = noise * env * 0.3;
            }
        });
    }

    static generateShieldUp(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.4, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                const freq = 300 + t * 800;
                const env = Math.sin(Math.PI * t / 0.4);
                data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.2;
            }
        });
    }

    static generateShieldBreak(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.3, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                const freq = 600 - t * 1500;
                const noise = Math.random() * 2 - 1;
                const env = Math.exp(-t * 6);
                data[i] = (Math.sin(2 * Math.PI * freq * t) * 0.5 + noise * 0.5) * env * 0.3;
            }
        });
    }

    static generateWaveComplete(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.6, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                // Quick ascending arpeggio
                let freq;
                if (t < 0.15) freq = 523; // C5
                else if (t < 0.3) freq = 659; // E5
                else if (t < 0.45) freq = 784; // G5
                else freq = 1047; // C6
                const env = 1 - t / 0.6;
                data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.2;
            }
        });
    }

    static generateBossWarning(audioCtx) {
        return SoundGenerator.renderToBuffer(audioCtx, 0.8, (data, rate, len) => {
            for (let i = 0; i < len; i++) {
                const t = i / rate;
                // Two-tone alarm
                const freq = t % 0.4 < 0.2 ? 440 : 330;
                const env = 0.8;
                data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.25;
            }
        });
    }
}
