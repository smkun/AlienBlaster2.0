import { Entity } from './Entity.js';
import { CONFIG } from '../config/gameConfig.js';

export class BossAlien extends Entity {
    constructor(wave) {
        const bossNumber = wave / CONFIG.BOSS_EVERY_N_WAVES;
        const health = CONFIG.BOSS_BASE_HEALTH + bossNumber * CONFIG.BOSS_HEALTH_PER_BOSS;
        super(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT / 2 - 50, 120, 100);

        this.health = health;
        this.maxHealth = health;
        this.points = 20;
        this.phase = 1;
        this.enterSpeed = 100; // pixels/sec while entering
        this.stopX = CONFIG.CANVAS_WIDTH * 0.7;
        this.entered = false;

        // Movement
        this.moveSpeed = 80;
        this.moveDirection = 1;

        // Phase 2 shooting
        this.shootTimer = 0;
        this.shootInterval = 1.5; // seconds between shots

        // Mini-alien spawning (phase 1)
        this.spawnTimer = 0;
        this.spawnInterval = 3.0;

        // Visual
        this.flashTimer = 0;
        this.color = '#881111';
    }

    update(dt) {
        // Enter from right
        if (!this.entered) {
            this.x -= this.enterSpeed * dt;
            if (this.x <= this.stopX) {
                this.x = this.stopX;
                this.entered = true;
            }
            return;
        }

        // Check phase transition
        if (this.phase === 1 && this.health <= this.maxHealth * 0.5) {
            this.phase = 2;
            this.moveSpeed = 130;
            this.shootInterval = 1.0;
        }

        // Vertical movement (bounce)
        this.y += this.moveSpeed * this.moveDirection * dt;
        if (this.y <= 10) {
            this.y = 10;
            this.moveDirection = 1;
        }
        if (this.y + this.height >= CONFIG.CANVAS_HEIGHT - 10) {
            this.y = CONFIG.CANVAS_HEIGHT - this.height - 10;
            this.moveDirection = -1;
        }

        // Timers
        if (this.flashTimer > 0) this.flashTimer -= dt;
        this.spawnTimer += dt;
        this.shootTimer += dt;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.flashTimer = 0.08;
        return this.health <= 0;
    }

    shouldSpawnMinion() {
        if (this.phase === 1 && this.entered && this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            return true;
        }
        return false;
    }

    shouldShoot() {
        if (this.phase === 2 && this.entered && this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            return true;
        }
        return false;
    }

    // Returns projectile config for Game.js to create
    getProjectileSpawn() {
        return {
            x: this.x,
            y: this.y + this.height / 2,
            speed: -300, // moves left toward player
            damage: 2,
        };
    }

    render(ctx, assets) {
        // Hit flash
        if (this.flashTimer > 0) {
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;
        }

        // Boss sprite
        const img = assets?.getImage('alien-boss');
        if (img && this.flashTimer <= 0) {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else if (!img) {
            ctx.fillStyle = this.flashTimer > 0 ? '#fff' : this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Phase indicator
        if (this.phase === 2) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        }
    }

    renderHealthBar(ctx) {
        // Large health bar at top of screen
        const barWidth = 400;
        const barHeight = 12;
        const barX = (CONFIG.CANVAS_WIDTH - barWidth) / 2;
        const barY = 15;
        const healthPercent = Math.max(0, this.health / this.maxHealth);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', CONFIG.CANVAS_WIDTH / 2, barY - 3);

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health fill
        if (healthPercent > 0.5) {
            ctx.fillStyle = '#f44';
        } else if (healthPercent > 0.25) {
            ctx.fillStyle = '#f80';
        } else {
            ctx.fillStyle = '#ff0';
        }
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}
