import { CONFIG } from '../config/gameConfig.js';

class Particle {
    constructor(x, y, vx, vy, life, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        // Shrink as particle dies
        this.size *= (1 - dt * 2);
        if (this.size < 0.5) this.size = 0.5;
    }

    get alpha() {
        return Math.max(0, this.life / this.maxLife);
    }

    get dead() {
        return this.life <= 0;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }

    // Burst of particles in all directions — used for alien death
    emitExplosion(x, y, color, count) {
        count = count || CONFIG.PARTICLE_EXPLOSION_COUNT;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 200;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.3 + Math.random() * 0.5;
            const size = 2 + Math.random() * 5;
            this.particles.push(new Particle(x, y, vx, vy, life, color, size));
        }
    }

    // Large multi-stage explosion — used for boss death
    emitBossExplosion(x, y) {
        const colors = ['#ff4444', '#ff8800', '#ffff44', '#ffffff'];
        const count = CONFIG.PARTICLE_BOSS_EXPLOSION_COUNT;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 300;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.5 + Math.random() * 1.0;
            const size = 3 + Math.random() * 8;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(x, y, vx, vy, life, color, size));
        }
    }

    // Small directional trail — used for rocket trails
    emitTrail(x, y, color) {
        const vx = -30 - Math.random() * 50;
        const vy = (Math.random() - 0.5) * 40;
        const life = 0.1 + Math.random() * 0.2;
        const size = 2 + Math.random() * 3;
        this.particles.push(new Particle(x, y, vx, vy, life, color, size));
    }

    // Brief flash — used for muzzle flash
    emitFlash(x, y) {
        for (let i = 0; i < 3; i++) {
            const vx = 50 + Math.random() * 100;
            const vy = (Math.random() - 0.5) * 60;
            const life = 0.05 + Math.random() * 0.08;
            const size = 3 + Math.random() * 4;
            this.particles.push(new Particle(x, y, vx, vy, life, '#ffff88', size));
        }
    }

    // Gentle sparkle — used for power-up glow
    emitSparkle(x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 30;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const life = 0.3 + Math.random() * 0.4;
        const size = 1 + Math.random() * 3;
        this.particles.push(new Particle(x, y, vx, vy, life, color, size));
    }

    clear() {
        this.particles = [];
    }
}
