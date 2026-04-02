import { CONFIG } from '../config/gameConfig.js';
import { Alien } from '../entities/Alien.js';

export class WaveManager {
    constructor() {
        this.wave = 1;
        this.aliensSpawned = 0;
        this.aliensPerWave = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 0;
        this.waveActive = false;
    }

    startWave(wave) {
        this.wave = wave;
        this.aliensSpawned = 0;
        this.aliensPerWave = CONFIG.WAVE_BASE_ALIENS + wave * CONFIG.WAVE_ALIENS_PER_WAVE;
        this.spawnInterval = Math.max(
            CONFIG.WAVE_SPAWN_INTERVAL_FLOOR,
            CONFIG.WAVE_SPAWN_INTERVAL_START - (wave - 1) * CONFIG.WAVE_SPAWN_INTERVAL_DECREASE
        );
        this.spawnTimer = 0;
        this.waveActive = true;
    }

    update(dt, aliens) {
        if (!this.waveActive) return null;
        if (this.aliensSpawned >= this.aliensPerWave) {
            if (aliens.length === 0) {
                this.waveActive = false;
                return 'wave-complete';
            }
            return null;
        }

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnInterval;
            this.aliensSpawned++;
            return this.createAlien();
        }

        return null;
    }

    createAlien() {
        const type = this.pickAlienType();
        return new Alien(type, this.wave);
    }

    pickAlienType() {
        const roll = Math.random();
        const wave = this.wave;

        const hasPurple = wave >= CONFIG.WAVE_PURPLE_INTRO;

        if (hasPurple && roll < 0.15) return 'purple';
        if (wave < 3) {
            // Waves 1-2: mostly green, learning curve
            if (roll < 0.70) return 'green';
            if (roll < 0.90) return 'red';
            return 'yellow';
        } else if (wave < 8) {
            // Waves 3-7: mixed
            if (roll < 0.40) return 'green';
            if (roll < 0.70) return 'red';
            if (roll < 0.85) return 'yellow';
            return hasPurple ? 'purple' : 'green';
        } else if (wave < 15) {
            // Waves 8-14: fewer greens, more heavies
            if (roll < 0.15) return 'green';
            if (roll < 0.45) return 'red';
            if (roll < 0.75) return 'yellow';
            return hasPurple ? 'purple' : 'red';
        } else {
            // Waves 15+: brutal — mostly tanks and zigzags
            if (roll < 0.10) return 'green';
            if (roll < 0.30) return 'red';
            if (roll < 0.65) return 'yellow';
            return hasPurple ? 'purple' : 'yellow';
        }
    }

    isBossWave(wave) {
        return wave > 0 && wave % CONFIG.BOSS_EVERY_N_WAVES === 0;
    }

    getBossHealth(wave) {
        const bossNumber = wave / CONFIG.BOSS_EVERY_N_WAVES;
        return CONFIG.BOSS_BASE_HEALTH + bossNumber * CONFIG.BOSS_HEALTH_PER_BOSS;
    }
}
