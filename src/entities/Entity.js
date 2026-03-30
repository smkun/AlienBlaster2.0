export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.active = true;
    }

    get hitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    render(ctx) {
        ctx.fillStyle = '#f0f';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen(canvasWidth, canvasHeight) {
        return (
            this.x + this.width < 0 ||
            this.x > canvasWidth ||
            this.y + this.height < 0 ||
            this.y > canvasHeight
        );
    }
}
