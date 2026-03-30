import { CONFIG } from '../config/gameConfig.js';

class BackgroundLayer {
    constructor(assetKey, speed) {
        this.assetKey = assetKey;
        this.speed = speed; // pixels per second
        this.x = 0;
    }

    update(dt) {
        this.x -= this.speed * dt;
        // Wrap when one full width has scrolled past
        if (this.x <= -CONFIG.CANVAS_WIDTH) {
            this.x += CONFIG.CANVAS_WIDTH;
        }
    }

    render(ctx, assets) {
        const img = assets?.getImage(this.assetKey);
        if (!img) return;

        // Draw two copies for seamless scrolling
        ctx.drawImage(img, this.x, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        ctx.drawImage(img, this.x + CONFIG.CANVAS_WIDTH, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }
}

export class Background {
    constructor() {
        this.layers = [
            new BackgroundLayer('bg-stars', 15),      // Slow — deep space
            new BackgroundLayer('bg-nebula', 30),      // Medium — nebula clouds
            new BackgroundLayer('bg-foreground', 60),   // Fast — foreground debris
        ];
    }

    update(dt) {
        for (const layer of this.layers) {
            layer.update(dt);
        }
    }

    render(ctx, assets) {
        for (const layer of this.layers) {
            layer.render(ctx, assets);
        }
    }
}
