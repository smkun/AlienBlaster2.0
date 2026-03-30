import { CONFIG } from '../config/gameConfig.js';

export class HUD {
    constructor() {
        this.controlsHintTimer = 10; // seconds to show controls
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

        // Health bar
        this.renderHealthBar(ctx, soldier);

        // Ammo
        this.renderAmmo(ctx, soldier);

        // Score and wave
        this.renderScore(ctx, game);

        // Active power-up timers
        this.renderUpgrades(ctx, soldier);

        // Controls hint (first wave only, fades out)
        if (this.controlsHintTimer > 0) {
            this.renderControlsHint(ctx);
        }
    }

    renderHealthBar(ctx, soldier) {
        const x = 10;
        const y = 12;
        const barWidth = 150;
        const barHeight = 16;
        const healthPercent = Math.max(0, soldier.health / soldier.maxHealth);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('HP', x, y + 12);

        // Background
        const barX = x + 25;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, y, barWidth, barHeight);

        // Fill with color transition
        if (healthPercent > 0.5) {
            ctx.fillStyle = '#4f4';
        } else if (healthPercent > 0.25) {
            ctx.fillStyle = '#ff4';
        } else {
            ctx.fillStyle = '#f44';
        }
        ctx.fillRect(barX, y, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, y, barWidth, barHeight);

        // Health text inside bar
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${soldier.health}/${soldier.maxHealth}`, barX + barWidth / 2, y + 12);
    }

    renderAmmo(ctx, soldier) {
        const x = 10;
        const y = 36;

        ctx.fillStyle = '#0cf';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`ROCKETS: ${soldier.ammo}`, x, y + 12);
    }

    renderScore(ctx, game) {
        const x = CONFIG.CANVAS_WIDTH - 10;
        const y = 12;

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`SCORE: ${game.score}`, x, y + 14);
        ctx.fillText(`WAVE: ${game.wave}`, x, y + 34);
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
