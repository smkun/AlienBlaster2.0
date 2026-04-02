import { Entity } from './Entity.js';
import { CONFIG } from '../config/gameConfig.js';

export class BossAlien extends Entity {
    constructor(wave) {
        const bossNumber = Math.floor(wave / CONFIG.BOSS_EVERY_N_WAVES);
        const health = CONFIG.BOSS_BASE_HEALTH + bossNumber * CONFIG.BOSS_HEALTH_PER_BOSS;
        super(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT / 2 - 50, 120, 100);

        this.bossNumber = bossNumber;
        this.health = health;
        this.maxHealth = health;
        this.points = 20 + bossNumber * 5;
        this.phase = 1;
        this.enterSpeed = 100;
        this.stopX = CONFIG.CANVAS_WIDTH * 0.7;
        this.entered = false;

        // Scale stats per boss appearance
        this.moveSpeed = 80 + bossNumber * 20;              // faster each time
        this.moveDirection = 1;
        this.shootInterval = Math.max(0.4, 1.5 - bossNumber * 0.2);  // shoots faster
        this.shootTimer = 0;
        this.spawnInterval = Math.max(1.0, 3.0 - bossNumber * 0.4);  // spawns minions faster
        this.spawnTimer = 0;
        this.projectileSpeed = -(300 + bossNumber * 50);     // bullets fly faster
        this.projectileDamage = 2 + bossNumber;              // hits harder

        // Phase 2 multipliers (applied on transition)
        this.phase2SpeedBoost = 1.6;
        this.phase2ShootBoost = 0.6; // multiplier on shoot interval

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
            this.moveSpeed *= this.phase2SpeedBoost;
            this.shootInterval *= this.phase2ShootBoost;
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
        this.flashTimer = 0.1;
        return this.health <= 0;
    }

    shouldSpawnMinion() {
        if (this.entered && this.spawnTimer >= this.spawnInterval) {
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

    getProjectileSpawn() {
        return {
            x: this.x,
            y: this.y + this.height / 2,
            speed: this.projectileSpeed,
            damage: this.projectileDamage,
        };
    }

    render(ctx, assets) {
        const img = assets?.getImage('alien-boss');

        if (img) {
            // Always draw the sprite
            ctx.drawImage(img, this.x, this.y, this.width, this.height);

            // Hit flash — white tint overlay on top of sprite
            if (this.flashTimer > 0) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.globalCompositeOperation = 'source-over';
            }
        } else {
            ctx.fillStyle = this.flashTimer > 0 ? '#fff' : this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // Phase 2 — red glow border
        if (this.phase === 2) {
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        }
    }

    renderHealthBar(ctx) {
        const barWidth = 400;
        const barHeight = 12;
        const barX = (CONFIG.CANVAS_WIDTH - barWidth) / 2;
        const barY = 15;
        const healthPercent = Math.max(0, this.health / this.maxHealth);

        // Label with boss number
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`BOSS #${this.bossNumber}`, CONFIG.CANVAS_WIDTH / 2, barY - 3);

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
