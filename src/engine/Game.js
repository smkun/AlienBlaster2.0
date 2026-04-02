import { CONFIG } from '../config/gameConfig.js';
import { Soldier } from '../entities/Soldier.js';
import { Projectile } from '../entities/Projectile.js';
import { Alien } from '../entities/Alien.js';
import { BossAlien } from '../entities/BossAlien.js';
import { PowerUp } from '../entities/PowerUp.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { WaveManager } from '../systems/WaveManager.js';
import { ParticleSystem } from './ParticleSystem.js';
import { Camera } from './Camera.js';
import { Background } from './Background.js';
import { HUD } from '../ui/HUD.js';
import { ScorePopupManager } from '../ui/ScorePopup.js';
import { GameOverScreen } from '../ui/GameOverScreen.js';
import { ScoreManager } from '../systems/ScoreManager.js';

export class Game {
    constructor(canvas, input, assets, audio) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.input = input;
        this.assets = assets;
        this.audio = audio;
        this.state = CONFIG.STATES.LOADING;
        this.lastTime = 0;
        this.background = new Background();
        this.camera = new Camera();
        this.particleSystem = new ParticleSystem();
        this.hud = new HUD();
        this.scorePopups = new ScorePopupManager();
        this.gameOverScreen = new GameOverScreen();
        this.scoreManager = new ScoreManager();
        this.keyListener = null;
    }

    start() {
        this.lastTime = performance.now();
        this.initHTMLBindings();
        this.syncHighScoresHTML();
        requestAnimationFrame((time) => this.loop(time));
    }

    initHTMLBindings() {
        this.htmlHP = document.getElementById('hp-bar');
        this.htmlHPText = document.getElementById('hp-text');
        this.htmlAmmo = document.getElementById('ammo-text');
        this.htmlScore = document.getElementById('score-text');
        this.htmlWave = document.getElementById('wave-text');
        this.htmlMuteBtn = document.getElementById('mute-btn');
        this.htmlHighScores = document.getElementById('high-scores-list');

        if (this.htmlMuteBtn) {
            this.htmlMuteBtn.addEventListener('click', () => {
                this.audio.init();
                const muted = this.audio.toggleMute();
                this.htmlMuteBtn.textContent = muted ? 'UNMUTE' : 'MUTE';
            });
        }
    }

    syncHTMLStats() {
        if (!this.soldier) return;
        const pct = Math.max(0, this.soldier.health / this.soldier.maxHealth);
        if (this.htmlHP) {
            this.htmlHP.style.width = `${pct * 100}%`;
            if (pct > 0.5) {
                this.htmlHP.style.background = 'linear-gradient(90deg, #4f4, #2d2)';
                this.htmlHP.style.boxShadow = '0 0 6px rgba(50,255,50,0.4)';
            } else if (pct > 0.25) {
                this.htmlHP.style.background = 'linear-gradient(90deg, #ff4, #cc2)';
                this.htmlHP.style.boxShadow = '0 0 6px rgba(255,255,50,0.4)';
            } else {
                this.htmlHP.style.background = 'linear-gradient(90deg, #f44, #c22)';
                this.htmlHP.style.boxShadow = '0 0 6px rgba(255,50,50,0.4)';
            }
        }
        if (this.htmlHPText) this.htmlHPText.textContent = this.soldier.health;
        if (this.htmlAmmo) this.htmlAmmo.textContent = this.soldier.ammo;
        if (this.htmlScore) this.htmlScore.textContent = this.score;
        if (this.htmlWave) this.htmlWave.textContent = this.wave;
    }

    syncHighScoresHTML() {
        if (!this.htmlHighScores) return;
        const scores = this.scoreManager.getScores();
        if (scores.length === 0) {
            this.htmlHighScores.innerHTML = '<li class="empty">No scores yet</li>';
            return;
        }
        this.htmlHighScores.innerHTML = scores.slice(0, 10).map((s, i) =>
            `<li><span class="rank">${i + 1}.</span><span class="name">${s.name}</span><span class="wave">W${s.wave}</span><span class="score">${s.score}</span></li>`
        ).join('');
    }

    setState(newState) {
        this.state = newState;
    }

    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        const cappedDt = Math.min(dt, 0.1);

        this.update(cappedDt);
        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        // Background always scrolls
        this.background.update(dt);
        this.camera.update(dt);

        switch (this.state) {
            case CONFIG.STATES.LOADING:
                if (this.assets.progress >= 1) {
                    this.setState(CONFIG.STATES.MENU);
                }
                break;
            case CONFIG.STATES.MENU:
                if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
                    this.audio.init(); // AudioContext requires user gesture
                    this.startNewGame();
                }
                break;
            case CONFIG.STATES.PLAYING:
                this.updatePlaying(dt);
                break;
            case CONFIG.STATES.PAUSED:
                if (this.input.wasPressed('Escape') || this.input.wasPressed('KeyP')) {
                    this.setState(CONFIG.STATES.PLAYING);
                }
                if (this.input.wasPressed('KeyQ')) {
                    this.enterGameOver();
                }
                break;
            case CONFIG.STATES.WAVE_COMPLETE:
                if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
                    this.startNextWave();
                }
                break;
            case CONFIG.STATES.GAME_OVER:
                this.particleSystem.update(dt);
                this.gameOverScreen.update(dt);
                if (this.gameOverScreen.handleInput(this.input)) {
                    this.removeKeyListener();
                    this.syncHighScoresHTML();
                    this.setState(CONFIG.STATES.MENU);
                }
                break;
        }
        this.input.endFrame();
    }

    updatePlaying(dt) {
        if (this.input.wasPressed('Escape') || this.input.wasPressed('KeyP')) {
            this.setState(CONFIG.STATES.PAUSED);
            return;
        }

        if (this.input.wasPressed('KeyM')) {
            this.audio.toggleMute();
        }

        // Soldier
        this.soldier.update(dt, this.input);

        // Shooting — laser
        if (this.input.isDown('Space') && this.soldier.canShootLaser()) {
            this.soldier.shootLaser();
            const sx = this.soldier.x + this.soldier.width;
            const sy = this.soldier.y + this.soldier.height / 2;
            if (this.soldier.activeUpgrade === 'spreadshot') {
                this.projectiles.push(new Projectile(sx, sy, 'laser'));
                this.projectiles.push(new Projectile(sx, sy - 15, 'laser'));
                this.projectiles.push(new Projectile(sx, sy + 15, 'laser'));
            } else {
                this.projectiles.push(new Projectile(sx, sy, 'laser'));
            }
            this.particleSystem.emitFlash(sx, sy);
            this.audio.playSFX('laser', 0.6);
        }

        // Shooting — rocket
        if (this.input.wasPressed('KeyR') && this.soldier.canShootRocket()) {
            this.soldier.shootRocket();
            const sx = this.soldier.x + this.soldier.width;
            const sy = this.soldier.y + this.soldier.height / 2;
            this.projectiles.push(new Projectile(sx, sy, 'rocket'));
            this.particleSystem.emitFlash(sx, sy);
            this.audio.playSFX('rocket', 0.8);
        }

        // Update projectiles + rocket trails
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(dt);
            if (proj.type === 'rocket') {
                this.particleSystem.emitTrail(proj.x, proj.y + proj.height / 2, '#00e5ff');
            }
            if (proj.isOffScreen(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)) {
                this.projectiles.splice(i, 1);
            }
        }

        // Update aliens
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            this.aliens[i].update(dt);
            if (this.aliens[i].passedLeftEdge()) {
                this.soldier.takeDamage(1);
                this.aliens.splice(i, 1);
                this.camera.shake(CONFIG.SHAKE_LIGHT.intensity, CONFIG.SHAKE_LIGHT.duration);
                this.audio.playSFX('hit', 0.4);
            }
        }

        // Update boss
        if (this.boss) {
            this.boss.update(dt);

            // Boss spawns minions (phase 1)
            if (this.boss.shouldSpawnMinion()) {
                const minion = new Alien('green', this.wave);
                minion.x = this.boss.x;
                minion.y = this.boss.y + this.boss.height / 2;
                this.aliens.push(minion);
            }

            // Boss shoots (phase 2)
            if (this.boss.shouldShoot()) {
                const spawn = this.boss.getProjectileSpawn();
                const bossProj = new Projectile(spawn.x, spawn.y, 'laser');
                bossProj.vx = spawn.speed; // override to go left
                bossProj.damage = spawn.damage;
                this.enemyProjectiles.push(bossProj);
            }
        }

        // Update enemy projectiles (from boss)
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            this.enemyProjectiles[i].update(dt);
            const ep = this.enemyProjectiles[i];
            if (ep.isOffScreen(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)) {
                this.enemyProjectiles.splice(i, 1);
            } else if (CollisionSystem.checkAABB(ep, this.soldier)) {
                this.soldier.takeDamage(ep.damage);
                this.enemyProjectiles.splice(i, 1);
                this.camera.shake(CONFIG.SHAKE_LIGHT.intensity, CONFIG.SHAKE_LIGHT.duration);
            }
        }

        // Update power-ups + sparkle
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update(dt);
            if (Math.random() < 0.1) {
                const pu = this.powerUps[i];
                this.particleSystem.emitSparkle(
                    pu.x + pu.width / 2,
                    pu.y + pu.height / 2,
                    pu.config.color
                );
            }
            if (this.powerUps[i].isOffScreen(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)) {
                this.powerUps.splice(i, 1);
            }
        }

        // Collisions (projectile vs alien, alien vs soldier, powerup vs soldier)
        CollisionSystem.processCollisions(this);

        // Boss collision with player projectiles
        if (this.boss) {
            for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
                if (CollisionSystem.checkAABB(this.projectiles[pi], this.boss)) {
                    const killed = this.boss.takeDamage(this.projectiles[pi].damage);
                    this.projectiles.splice(pi, 1);
                    this.camera.shake(CONFIG.SHAKE_MEDIUM.intensity, CONFIG.SHAKE_MEDIUM.duration);
                    if (killed) {
                        this.onBossKilled();
                    }
                    break;
                }
            }
        }

        // Particles, popups, HUD
        this.particleSystem.update(dt);
        this.scorePopups.update(dt);
        this.hud.update(dt);

        // Check soldier death
        if (this.soldier.health <= 0) {
            this.camera.shake(CONFIG.SHAKE_HEAVY.intensity, CONFIG.SHAKE_HEAVY.duration);
            this.enterGameOver();
            return;
        }

        // Boss defeated — wave complete
        if (this.bossDefeated) {
            this.bossDefeated = false;
            this.setState(CONFIG.STATES.WAVE_COMPLETE);
            return;
        }

        // Wave spawning (only if no boss active)
        if (!this.boss) {
            const spawnResult = this.waveManager.update(dt, this.aliens);
            if (spawnResult === 'wave-complete') {
                if (this.waveManager.isBossWave(this.wave)) {
                    this.spawnBoss();
                } else {
                    this.setState(CONFIG.STATES.WAVE_COMPLETE);
                }
            } else if (spawnResult instanceof Object) {
                this.aliens.push(spawnResult);
            }
        }
    }

    startNewGame() {
        this.soldier = new Soldier();
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.aliens = [];
        this.powerUps = [];
        this.boss = null;
        this.bossDefeated = false;
        this.score = 0;
        this.wave = 1;
        this.killsSinceLastPowerUp = 0;
        this.particleSystem.clear();
        this.scorePopups.clear();
        this.hud = new HUD();
        this.hud.resetControlsHint();
        this.waveManager = new WaveManager();
        this.waveManager.startWave(this.wave);
        this.setState(CONFIG.STATES.PLAYING);
    }

    startNextWave() {
        this.audio.playSFX('waveComplete');
        this.wave++;
        this.enemyProjectiles = [];
        this.boss = null;
        this.waveManager.startWave(this.wave);
        this.setState(CONFIG.STATES.PLAYING);
    }

    enterGameOver() {
        this.gameOverScreen.reset();
        // Listen for typed characters for name entry
        this.keyListener = (e) => {
            if (e.key === 'Backspace') return; // handled by InputManager
            this.gameOverScreen.handleKeyPress(e.key);
            // Submit score when name is entered
            if (e.key === 'Enter' && this.gameOverScreen.playerName.length > 0 && !this.gameOverScreen.submitted) {
                this.gameOverScreen.submitted = true;
                this.scoreManager.addScore(this.gameOverScreen.playerName, this.score, this.wave).then(() => {
                    this.syncHighScoresHTML();
                });
            }
        };
        window.addEventListener('keydown', this.keyListener);
        this.setState(CONFIG.STATES.GAME_OVER);
    }

    removeKeyListener() {
        if (this.keyListener) {
            window.removeEventListener('keydown', this.keyListener);
            this.keyListener = null;
        }
    }

    spawnBoss() {
        this.boss = new BossAlien(this.wave);
        this.audio.playSFX('bossWarning');
    }

    onBossKilled() {
        this.particleSystem.emitBossExplosion(
            this.boss.x + this.boss.width / 2,
            this.boss.y + this.boss.height / 2
        );
        this.camera.shake(CONFIG.SHAKE_HEAVY.intensity, CONFIG.SHAKE_HEAVY.duration);
        this.audio.playSFX('bossExplosion');
        this.score += this.boss.points;
        this.scorePopups.add(this.boss.x + this.boss.width / 2, this.boss.y, this.boss.points, '#ff4');

        // Drop guaranteed upgrade
        const upgradeType = PowerUp.randomUpgradeType();
        const pu = new PowerUp(this.boss.x, this.boss.y + this.boss.height / 2, upgradeType);
        this.powerUps.push(pu);

        this.boss = null;
        this.bossDefeated = true;
    }

    onAlienKilled(alien) {
        this.score += alien.points;
        this.killsSinceLastPowerUp++;
        this.audio.playSFX('explosion', 0.5);
        this.scorePopups.add(alien.x + alien.width / 2, alien.y, alien.points, alien.color);

        // Explosion particles colored to alien type
        this.particleSystem.emitExplosion(
            alien.x + alien.width / 2,
            alien.y + alien.height / 2,
            alien.color
        );
        this.camera.shake(CONFIG.SHAKE_LIGHT.intensity, CONFIG.SHAKE_LIGHT.duration);

        // Spawn power-up every N kills
        if (this.killsSinceLastPowerUp >= CONFIG.POWERUP_SPAWN_EVERY_N_KILLS) {
            this.killsSinceLastPowerUp = 0;
            const type = PowerUp.randomType();
            const y = Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.POWERUP_SIZE);
            this.powerUps.push(new PowerUp(CONFIG.CANVAS_WIDTH, y, type));
        }
    }

    onPowerUpCollected(powerUp) {
        powerUp.apply(this.soldier);
        if (powerUp.type === 'shield') {
            this.audio.playSFX('shieldUp');
        } else {
            this.audio.playSFX('powerup');
        }
        this.particleSystem.emitExplosion(
            powerUp.x + powerUp.width / 2,
            powerUp.y + powerUp.height / 2,
            powerUp.config.color,
            8
        );
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.syncHTMLStats();

        switch (this.state) {
            case CONFIG.STATES.LOADING:
                this.assets.renderLoadingScreen(this.ctx, this.canvas.width, this.canvas.height);
                break;
            case CONFIG.STATES.MENU:
                this.renderMenu();
                break;
            case CONFIG.STATES.PLAYING:
                this.renderGame();
                break;
            case CONFIG.STATES.PAUSED:
                this.renderGame();
                this.renderPauseOverlay();
                break;
            case CONFIG.STATES.WAVE_COMPLETE:
                this.renderGame();
                this.renderWaveComplete();
                break;
            case CONFIG.STATES.GAME_OVER:
                this.renderGameOver();
                break;
        }
    }

    renderMenu() {
        this.background.render(this.ctx, this.assets);

        const titleImg = this.assets.getImage('title');
        if (titleImg) {
            const w = 500;
            const h = 100;
            this.ctx.drawImage(titleImg, (this.canvas.width - w) / 2, this.canvas.height / 2 - 100, w, h);
        } else {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('ALIEN BLASTER', this.canvas.width / 2, this.canvas.height / 2 - 40);
        }

        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press ENTER to Start', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    renderGame() {
        const ctx = this.ctx;
        const assets = this.assets;

        // Camera shake transform
        this.camera.applyTransform(ctx);

        // Parallax background
        this.background.render(ctx, assets);

        // Power-ups (behind entities)
        for (const pu of this.powerUps) {
            pu.render(ctx, assets);
        }

        // Projectiles
        for (const p of this.projectiles) {
            p.render(ctx, assets);
        }

        // Enemy projectiles
        if (this.enemyProjectiles) {
            for (const ep of this.enemyProjectiles) {
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(ep.x, ep.y, ep.width, ep.height);
            }
        }

        // Aliens
        for (const a of this.aliens) {
            a.render(ctx, assets);
        }

        // Boss
        if (this.boss) {
            this.boss.render(ctx, assets);
        }

        // Soldier
        if (this.soldier) {
            this.soldier.render(ctx, assets);
        }

        // Particles and score popups (on top of everything)
        this.particleSystem.render(ctx);
        this.scorePopups.render(ctx);

        // Reset camera transform before HUD
        this.camera.resetTransform(ctx);

        // Boss health bar (outside camera shake)
        if (this.boss) {
            this.boss.renderHealthBar(ctx);
        }

        // HUD
        this.hud.render(ctx, this);
    }

    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2 - 10);
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Press ESC to Resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.fillStyle = '#f66';
        this.ctx.fillText('Press Q to End Game', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    renderWaveComplete() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#4f4';
        this.ctx.font = '36px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('WAVE COMPLETE', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Press ENTER for Next Wave', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    renderGameOver() {
        this.background.render(this.ctx, this.assets);
        this.particleSystem.render(this.ctx);
        this.gameOverScreen.render(
            this.ctx, this.assets, this.score, this.wave,
            this.scoreManager.getScores()
        );
    }
}
