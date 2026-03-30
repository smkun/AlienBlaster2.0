import { Entity } from './Entity.js';
import { CONFIG } from '../config/gameConfig.js';

export class Projectile extends Entity {
    constructor(x, y, type) {
        const isRocket = type === 'rocket';
        const width = isRocket ? CONFIG.ROCKET_WIDTH : CONFIG.LASER_WIDTH;
        const height = isRocket ? CONFIG.ROCKET_HEIGHT : CONFIG.LASER_HEIGHT;
        super(x, y - height / 2, width, height);

        this.type = type;
        this.damage = isRocket ? CONFIG.ROCKET_DAMAGE : CONFIG.LASER_DAMAGE;
        this.vx = isRocket ? CONFIG.ROCKET_SPEED : CONFIG.LASER_SPEED;
    }

    render(ctx, assets) {
        const img = assets?.getImage(this.type === 'rocket' ? 'rocket' : 'laser');
        if (img) {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else if (this.type === 'rocket') {
            ctx.fillStyle = '#00e5ff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
            ctx.fillRect(this.x - 8, this.y - 1, 8, this.height + 2);
        } else {
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
