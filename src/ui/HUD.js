import { CONFIG } from '../config/gameConfig.js';

export class HUD {
    constructor() {
        this.controlsHintTimer = 10;
        this.controlsShown = false;
    }

    update(dt) {
        if (this.controlsHintTimer > 0) {
            this.controlsHintTimer -= dt;
        }
    }

    resetControlsHint() {
        if (!this.controlsShown) {
            this.controlsHintTimer = 10;
            this.controlsShown = true;
        }
    }

    render(ctx, game) {
        const soldier = game.soldier;
        if (!soldier) return;

        // Active power-up timers (bottom center of canvas)
        this.renderUpgrades(ctx, soldier);

        // Controls hint (first wave only, fades out)
        if (this.controlsHintTimer > 0) {
            this.renderControlsHint(ctx);
        }
    }

    renderUpgrades(ctx, soldier) {
        const y = CONFIG.CANVAS_HEIGHT - 30;

        if (soldier.activeUpgrade) {
            const timeLeft = Math.ceil(soldier.upgradeTimer);
            let color;
            let label;
            switch (soldier.activeUpgrade) {
                case 'spreadshot':
                    color = '#ffaa44';
                    label = 'SPREAD';
                    break;
                case 'rapidfire':
                    color = '#ffff44';
                    label = 'RAPID';
                    break;
                case 'speed':
                    color = '#ff8844';
                    label = 'SPEED';
                    break;
                default:
                    color = '#fff';
                    label = soldier.activeUpgrade.toUpperCase();
            }
            ctx.fillStyle = color;
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${label} ${timeLeft}s`, CONFIG.CANVAS_WIDTH / 2, y);
        }

        if (soldier.shieldHits > 0) {
            ctx.fillStyle = '#44aaff';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`SHIELD x${soldier.shieldHits}`, CONFIG.CANVAS_WIDTH / 2, y + 18);
        }
    }

    renderControlsHint(ctx) {
        const alpha = this.controlsHintTimer < 2 ? this.controlsHintTimer / 2 : 1;
        ctx.globalAlpha = alpha * 0.7;

        const y = CONFIG.CANVAS_HEIGHT - 80;
        ctx.fillStyle = '#aaa';
        ctx.font = '13px monospace';
        ctx.textAlign = 'center';
        const cx = CONFIG.CANVAS_WIDTH / 2;
        ctx.fillText('ARROWS: Move  |  SPACE: Laser  |  R: Rocket  |  ESC: Pause  |  M: Mute', cx, y);

        ctx.globalAlpha = 1;
    }
}
