import { CONFIG } from '../config/gameConfig.js';

export class GameOverScreen {
    constructor() {
        this.playerName = '';
        this.submitted = false;
        this.cursorBlink = 0;
        this.maxNameLength = 10;
    }

    reset() {
        this.playerName = '';
        this.submitted = false;
        this.cursorBlink = 0;
    }

    handleInput(input) {
        if (this.submitted) {
            // After submission, Enter returns to menu
            return input.wasPressed('Enter') || input.wasPressed('Space');
        }

        // Name entry
        if (input.wasPressed('Backspace')) {
            this.playerName = this.playerName.slice(0, -1);
        } else if (input.wasPressed('Enter') && this.playerName.length > 0) {
            this.submitted = true;
            return false; // don't go to menu yet, show scores first
        }

        return false;
    }

    handleKeyPress(key) {
        if (this.submitted) return;
        if (this.playerName.length >= this.maxNameLength) return;
        // Only allow alphanumeric and space
        if (/^[a-zA-Z0-9 ]$/.test(key)) {
            this.playerName += key.toUpperCase();
        }
    }

    update(dt) {
        this.cursorBlink += dt;
    }

    render(ctx, assets, score, wave, highScores) {
        // Game over image or text
        const goImg = assets.getImage('gameover');
        if (goImg) {
            const w = 400;
            const h = 80;
            ctx.drawImage(goImg, (CONFIG.CANVAS_WIDTH - w) / 2, 120, w, h);
        } else {
            ctx.fillStyle = '#f44';
            ctx.font = '48px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CONFIG.CANVAS_WIDTH / 2, 170);
        }

        // Score summary
        ctx.font = '24px monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`Score: ${score}  |  Wave: ${wave}`, CONFIG.CANVAS_WIDTH / 2, 240);

        if (!this.submitted) {
            // Name entry
            ctx.font = '18px monospace';
            ctx.fillStyle = '#aaa';
            ctx.fillText('Enter your name:', CONFIG.CANVAS_WIDTH / 2, 300);

            // Name with blinking cursor
            const cursor = Math.floor(this.cursorBlink * 2) % 2 === 0 ? '_' : ' ';
            ctx.font = '28px monospace';
            ctx.fillStyle = '#4f4';
            ctx.fillText(this.playerName + cursor, CONFIG.CANVAS_WIDTH / 2, 340);

            ctx.font = '14px monospace';
            ctx.fillStyle = '#666';
            ctx.fillText('Press ENTER to submit', CONFIG.CANVAS_WIDTH / 2, 380);
        } else {
            // Show high scores
            ctx.font = '22px monospace';
            ctx.fillStyle = '#ff4';
            ctx.fillText('HIGH SCORES', CONFIG.CANVAS_WIDTH / 2, 300);

            // Column headers
            ctx.font = '12px monospace';
            ctx.fillStyle = '#888';
            ctx.fillText('NAME          WAVE   SCORE', CONFIG.CANVAS_WIDTH / 2, 320);

            ctx.font = '16px monospace';
            const scores = highScores || [];
            for (let i = 0; i < Math.min(scores.length, 10); i++) {
                const s = scores[i];
                const isCurrentScore = s.name === this.playerName && s.score === score;
                ctx.fillStyle = isCurrentScore ? '#4f4' : '#ccc';
                const rank = `${i + 1}.`.padStart(3);
                const name = s.name.padEnd(10);
                const wave = `W${s.wave}`.padStart(4);
                ctx.fillText(`${rank} ${name} ${wave}  ${s.score}`, CONFIG.CANVAS_WIDTH / 2, 345 + i * 24);
            }

            ctx.font = '18px monospace';
            ctx.fillStyle = '#aaa';
            ctx.fillText('Press ENTER to continue', CONFIG.CANVAS_WIDTH / 2, 590);
        }
    }
}
