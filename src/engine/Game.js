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

export class Game {
    constructor(canvas, input, assets) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.input = input;
        this.assets = assets;
        this.state = CONFIG.STATES.LOADING;
        this.lastTime = 0;
        this.background = new Background();
        this.camera = new Camera();
        this.particleSystem = new ParticleSystem();
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
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
                break;
            case CONFIG.STATES.WAVE_COMPLETE:
                if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
                    this.startNextWave();
                }
                break;
            case CONFIG.STATES.GAME_OVER:
                // Keep particles updating for death explosion
                this.particleSystem.update(dt);
                if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
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
        }

        // Shooting — rocket
        if (this.input.wasPressed('KeyR') && this.soldier.canShootRocket()) {
            this.soldier.shootRocket();
            const sx = this.soldier.x + this.soldier.width;
            const sy = this.soldier.y + this.soldier.height / 2;
            this.projectiles.push(new Projectile(sx, sy, 'rocket'));
            this.particleSystem.emitFlash(sx, sy);
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

        // Particles
        this.particleSystem.update(dt);

        // Check soldier death
        if (this.soldier.health <= 0) {
            this.camera.shake(CONFIG.SHAKE_HEAVY.intensity, CONFIG.SHAKE_HEAVY.duration);
            this.setState(CONFIG.STATES.GAME_OVER);
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
        this.waveManager = new WaveManager();
        this.waveManager.startWave(this.wave);
        this.setState(CONFIG.STATES.PLAYING);
    }

    startNextWave() {
        this.wave++;
        this.enemyProjectiles = [];
        this.boss = null;
        this.waveManager.startWave(this.wave);
        this.setState(CONFIG.STATES.PLAYING);
    }

    spawnBoss() {
        this.boss = new BossAlien(this.wave);
    }

    onBossKilled() {
        // Particles
        this.particleSystem.emitBossExplosion(
            this.boss.x + this.boss.width / 2,
            this.boss.y + this.boss.height / 2
        );
        this.camera.shake(CONFIG.SHAKE_HEAVY.intensity, CONFIG.SHAKE_HEAVY.duration);
        this.score += this.boss.points;

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
        this.particleSystem.emitExplosion(
            powerUp.x + powerUp.width / 2,
            powerUp.y + powerUp.height / 2,
            powerUp.config.color,
            8
        );
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

        // Particles (on top of everything)
        this.particleSystem.render(ctx);

        // Reset camera transform before HUD
        this.camera.resetTransform(ctx);

        // Boss health bar (outside camera shake)
        if (this.boss) {
            this.boss.renderHealthBar(ctx);
        }

        // HUD
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Health: ${this.soldier?.health || 0}`, 10, 25);
        ctx.fillText(`Ammo: ${this.soldier?.ammo || 0}`, 10, 50);
        ctx.fillText(`Score: ${this.score}`, 10, 75);
        ctx.fillText(`Wave: ${this.wave}`, 10, 100);

        // Active upgrade indicator
        if (this.soldier?.activeUpgrade) {
            ctx.fillStyle = '#ff4';
            ctx.fillText(`[${this.soldier.activeUpgrade.toUpperCase()}] ${Math.ceil(this.soldier.upgradeTimer)}s`, 10, 125);
        }
        if (this.soldier?.shieldHits > 0) {
            ctx.fillStyle = '#4af';
            ctx.fillText(`Shield: ${this.soldier.shieldHits}`, 10, 150);
        }
    }

    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Press ESC to Resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
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

        const goImg = this.assets.getImage('gameover');
        if (goImg) {
            const w = 400;
            const h = 80;
            this.ctx.drawImage(goImg, (this.canvas.width - w) / 2, this.canvas.height / 2 - 60, w, h);
        } else {
            this.ctx.fillStyle = '#f44';
            this.ctx.font = '48px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
        }

        this.ctx.font = '24px monospace';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Score: ${this.score}  |  Wave: ${this.wave}`, this.canvas.width / 2, this.canvas.height / 2 + 20);

        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Press ENTER to Continue', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
}
