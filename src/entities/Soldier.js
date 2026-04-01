import { Entity } from './Entity.js';
import { CONFIG } from '../config/gameConfig.js';

export class Soldier extends Entity {
    constructor() {
        super(
            CONFIG.SOLDIER_START_X,
            CONFIG.CANVAS_HEIGHT / 2 - CONFIG.SOLDIER_HEIGHT / 2,
            CONFIG.SOLDIER_WIDTH,
            CONFIG.SOLDIER_HEIGHT
        );
        this.health = CONFIG.SOLDIER_START_HEALTH;
        this.maxHealth = CONFIG.SOLDIER_START_HEALTH;
        this.invincibleTimer = 0;
        this.laserCooldown = 0;
        this.rocketCooldown = 0;
        this.ammo = CONFIG.ROCKET_START_AMMO;
        this.shieldHits = 0;
        this.activeUpgrade = null;
        this.upgradeTimer = 0;
    }

    update(dt, input) {
        this.vy = 0;
        if (input.isDown('ArrowUp')) {
            this.vy = -CONFIG.SOLDIER_SPEED;
        }
        if (input.isDown('ArrowDown')) {
            this.vy = CONFIG.SOLDIER_SPEED;
        }

        super.update(dt);

        this.y = Math.max(0, Math.min(this.y, CONFIG.CANVAS_HEIGHT - this.height));

        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
        if (this.laserCooldown > 0) this.laserCooldown -= dt;
        if (this.rocketCooldown > 0) this.rocketCooldown -= dt;
        if (this.upgradeTimer > 0) {
            this.upgradeTimer -= dt;
            if (this.upgradeTimer <= 0) {
                this.activeUpgrade = null;
            }
        }
    }

    canShootLaser() {
        return this.laserCooldown <= 0;
    }

    canShootRocket() {
        return this.rocketCooldown <= 0 && this.ammo > 0;
    }

    shootLaser() {
        this.laserCooldown = this.activeUpgrade === 'rapidfire'
            ? CONFIG.LASER_COOLDOWN / 2
            : CONFIG.LASER_COOLDOWN;
    }

    shootRocket() {
        this.rocketCooldown = CONFIG.ROCKET_COOLDOWN;
        this.ammo--;
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return false;
        if (this.shieldHits > 0) {
            this.shieldHits--;
            return false;
        }
        this.health -= amount;
        this.invincibleTimer = CONFIG.SOLDIER_INVINCIBILITY_TIME;
        return true;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    addAmmo(amount) {
        this.ammo += amount;
    }

    applyUpgrade(type) {
        if (type === 'shield') {
            this.shieldHits = 3;
        } else {
            this.activeUpgrade = type;
            this.upgradeTimer = CONFIG.UPGRADE_DURATION;
        }
    }

    render(ctx, assets) {
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
            return;
        }

        // Shield bubble
        if (this.shieldHits > 0) {
            const shieldImg = assets?.getImage('shield');
            if (shieldImg) {
                const size = Math.max(this.width, this.height) + 20;
                ctx.globalAlpha = 0.6;
                ctx.drawImage(shieldImg, this.x - 10, this.y - 10, size, size);
                ctx.globalAlpha = 1;
            } else {
                ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    Math.max(this.width, this.height) / 2 + 8,
                    0, Math.PI * 2
                );
                ctx.stroke();
            }
        }

        // Soldier sprite
        const img = assets?.getImage('soldier');
        if (img) {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#4488ff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#88bbff';
            ctx.fillRect(this.x + this.width - 10, this.y + this.height / 2 - 4, 10, 8);
        }

        // Small HP bar above soldier
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 8;
        const healthPercent = Math.max(0, this.health / this.maxHealth);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Fill with color transition
        if (healthPercent > 0.5) {
            ctx.fillStyle = '#4f4';
        } else if (healthPercent > 0.25) {
            ctx.fillStyle = '#ff4';
        } else {
            ctx.fillStyle = '#f44';
        }
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}
