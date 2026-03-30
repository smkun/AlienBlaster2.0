import { CONFIG } from '../config/gameConfig.js';
import { Soldier } from '../entities/Soldier.js';
import { Projectile } from '../entities/Projectile.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { WaveManager } from '../systems/WaveManager.js';

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

        // Shooting
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
        }
        if (this.input.wasPressed('KeyR') && this.soldier.canShootRocket()) {
            this.soldier.shootRocket();
            const sx = this.soldier.x + this.soldier.width;
            const sy = this.soldier.y + this.soldier.height / 2;
            this.projectiles.push(new Projectile(sx, sy, 'rocket'));
        }

        // Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(dt);
            if (this.projectiles[i].isOffScreen(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)) {
                this.projectiles.splice(i, 1);
            }
        }

        // Aliens
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            this.aliens[i].update(dt);
            if (this.aliens[i].passedLeftEdge()) {
                this.soldier.takeDamage(1);
                this.aliens.splice(i, 1);
            }
        }

        // Collisions
        CollisionSystem.processCollisions(this);

        // Check soldier death
        if (this.soldier.health <= 0) {
            this.setState(CONFIG.STATES.GAME_OVER);
            return;
        }

        // Wave spawning
        const spawnResult = this.waveManager.update(dt, this.aliens);
        if (spawnResult === 'wave-complete') {
            this.setState(CONFIG.STATES.WAVE_COMPLETE);
        } else if (spawnResult instanceof Object) {
            this.aliens.push(spawnResult);
        }
    }

    startNewGame() {
        this.soldier = new Soldier();
        this.projectiles = [];
        this.aliens = [];
        this.powerUps = [];
        this.particles = [];
        this.score = 0;
        this.wave = 1;
        this.killsSinceLastPowerUp = 0;
        this.waveManager = new WaveManager();
        this.waveManager.startWave(this.wave);
        this.setState(CONFIG.STATES.PLAYING);
    }

    startNextWave() {
        this.wave++;
        this.waveManager.startWave(this.wave);
        this.setState(CONFIG.STATES.PLAYING);
    }

    onAlienKilled(alien) {
        this.score += alien.points;
        this.killsSinceLastPowerUp++;
    }

    onPowerUpCollected(powerUp) {
        // Will be implemented with PowerUp entity in Phase 3
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

    renderBackground() {
        const ctx = this.ctx;
        const bgStars = this.assets.getImage('bg-stars');
        if (bgStars) {
            ctx.drawImage(bgStars, 0, 0, this.canvas.width, this.canvas.height);
        }
        const bgNebula = this.assets.getImage('bg-nebula');
        if (bgNebula) {
            ctx.drawImage(bgNebula, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    renderMenu() {
        this.renderBackground();

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

        // Background layers
        this.renderBackground();
        const bgFg = assets.getImage('bg-foreground');
        if (bgFg) {
            ctx.drawImage(bgFg, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Projectiles
        for (const p of this.projectiles) {
            p.render(ctx, assets);
        }

        // Aliens
        for (const a of this.aliens) {
            a.render(ctx, assets);
        }

        // Soldier
        if (this.soldier) {
            this.soldier.render(ctx, assets);
        }

        // HUD
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Health: ${this.soldier?.health || 0}`, 10, 25);
        ctx.fillText(`Ammo: ${this.soldier?.ammo || 0}`, 10, 50);
        ctx.fillText(`Score: ${this.score}`, 10, 75);
        ctx.fillText(`Wave: ${this.wave}`, 10, 100);
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
        this.renderBackground();

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
