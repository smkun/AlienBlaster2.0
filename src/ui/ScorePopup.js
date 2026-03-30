class Popup {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0; // seconds
        this.maxLife = 1.0;
        this.vy = -60; // float upward
    }

    update(dt) {
        this.y += this.vy * dt;
        this.life -= dt;
    }

    get alpha() {
        return Math.max(0, this.life / this.maxLife);
    }

    get dead() {
        return this.life <= 0;
    }
}

export class ScorePopupManager {
    constructor() {
        this.popups = [];
    }

    add(x, y, points, color) {
        this.popups.push(new Popup(x, y, `+${points}`, color || '#fff'));
    }

    update(dt) {
        for (let i = this.popups.length - 1; i >= 0; i--) {
            this.popups[i].update(dt);
            if (this.popups[i].dead) {
                this.popups.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        for (const p of this.popups) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
        }
        ctx.globalAlpha = 1;
    }

    clear() {
        this.popups = [];
    }
}
