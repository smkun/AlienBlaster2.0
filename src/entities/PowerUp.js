import { Entity } from './Entity.js';
import { CONFIG } from '../config/gameConfig.js';

const POWERUP_TYPES = {
    health:     { color: '#44ff44', assetKey: 'powerup-health' },
    ammo:       { color: '#aa8844', assetKey: 'powerup-ammo' },
    spreadshot: { color: '#ffaa44', assetKey: 'powerup-spreadshot' },
    rapidfire:  { color: '#ffff44', assetKey: 'powerup-rapidfire' },
    shield:     { color: '#44aaff', assetKey: 'powerup-shield' },
    speed:      { color: '#ff8844', assetKey: 'powerup-speed' },
};

export class PowerUp extends Entity {
    constructor(x, y, type) {
        super(x, y, CONFIG.POWERUP_SIZE, CONFIG.POWERUP_SIZE);
        this.type = type;
        this.vx = -CONFIG.POWERUP_SPEED;
        this.config = POWERUP_TYPES[type];
        this.bobTime = 0;
        this.baseY = y;
    }

    update(dt) {
        super.update(dt);
        // Gentle bob up and down
        this.bobTime += dt;
        this.y = this.baseY + Math.sin(this.bobTime * 3) * 5;
    }

    apply(soldier) {
        switch (this.type) {
            case 'health':
                soldier.heal(CONFIG.HEALTH_PACK_AMOUNT);
                break;
            case 'ammo':
                soldier.addAmmo(CONFIG.AMMO_PACK_AMOUNT);
                break;
            case 'spreadshot':
                soldier.applyUpgrade('spreadshot');
                break;
            case 'rapidfire':
                soldier.applyUpgrade('rapidfire');
                break;
            case 'shield':
                soldier.applyUpgrade('shield');
                break;
            case 'speed':
                soldier.applyUpgrade('speed');
                break;
        }
    }

    render(ctx, assets) {
        const img = assets?.getImage(this.config.assetKey);
        if (img) {
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.config.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Type indicator
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.type[0].toUpperCase(), this.x + this.width / 2, this.y + this.height / 2 + 3);
        }
    }

    static randomType() {
        // Weighted: health and ammo more common
        const roll = Math.random();
        if (roll < 0.25) return 'health';
        if (roll < 0.50) return 'ammo';
        if (roll < 0.65) return 'spreadshot';
        if (roll < 0.78) return 'rapidfire';
        if (roll < 0.90) return 'speed';
        return 'shield';
    }

    static randomUpgradeType() {
        // For boss drops — only weapon/shield/speed upgrades
        const types = ['spreadshot', 'rapidfire', 'shield', 'speed'];
        return types[Math.floor(Math.random() * types.length)];
    }
}
