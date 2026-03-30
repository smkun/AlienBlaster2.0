import { Entity } from './Entity.js';
import { CONFIG } from '../config/gameConfig.js';

export class Alien extends Entity {
    constructor(type, wave) {
        const config = CONFIG.ALIEN_TYPES[type];
        const y = Math.random() * (CONFIG.CANVAS_HEIGHT - config.height);
        super(CONFIG.CANVAS_WIDTH, y, config.width, config.height);

        this.type = type;
        this.health = config.health;
        this.maxHealth = config.health;
        this.points = config.points;
        this.color = config.color;
        this.baseSpeed = config.speed;

        const speedMultiplier = 1 + (wave - 1) * CONFIG.WAVE_SPEED_MULTIPLIER;
        this.vx = -(this.baseSpeed * speedMultiplier);

        this.zigzagTime = 0;
        this.zigzagAmplitude = 80;
        this.zigzagFrequency = 3;
        this.baseY = this.y;

        this.flashTimer = 0;
    }

    update(dt) {
        super.update(dt);

        if (this.type === 'purple') {
            this.zigzagTime += dt;
            this.y = this.baseY + Math.sin(this.zigzagTime * this.zigzagFrequency) * this.zigzagAmplitude;
            this.y = Math.max(0, Math.min(this.y, CONFIG.CANVAS_HEIGHT - this.height));
        }

        if (this.flashTimer > 0) this.flashTimer -= dt;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.flashTimer = 0.08;
        return this.health <= 0;
    }

    passedLeftEdge() {
        return this.x + this.width < 0;
    }

    render(ctx) {
        if (this.flashTimer > 0) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.maxHealth > 2) {
            const barWidth = this.width;
            const barHeight = 4;
            const barX = this.x;
            const barY = this.y - 8;
            const healthPercent = this.health / this.maxHealth;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

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
}
