export class AssetManager {
    constructor() {
        this.images = {};
        this.audio = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    get progress() {
        return this.totalAssets === 0 ? 1 : this.loadedAssets / this.totalAssets;
    }

    addImage(key, src) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                this.loadedAssets++;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    addAudio(key, src) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.audio[key] = audio;
                this.loadedAssets++;
                resolve(audio);
            };
            audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
            audio.src = src;
        });
    }

    getImage(key) {
        return this.images[key] || null;
    }

    getAudio(key) {
        return this.audio[key] || null;
    }

    async loadAll(manifest) {
        const promises = [];
        if (manifest.images) {
            for (const [key, src] of Object.entries(manifest.images)) {
                promises.push(this.addImage(key, src));
            }
        }
        if (manifest.audio) {
            for (const [key, src] of Object.entries(manifest.audio)) {
                promises.push(this.addAudio(key, src));
            }
        }
        await Promise.all(promises);
    }

    renderLoadingScreen(ctx, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#fff';
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ALIEN BLASTER', canvasWidth / 2, canvasHeight / 2 - 40);

        const barWidth = 400;
        const barHeight = 20;
        const barX = (canvasWidth - barWidth) / 2;
        const barY = canvasHeight / 2;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#4488ff';
        ctx.fillRect(barX, barY, barWidth * this.progress, barHeight);

        ctx.fillStyle = '#aaa';
        ctx.font = '16px monospace';
        ctx.fillText(
            `Loading... ${Math.floor(this.progress * 100)}%`,
            canvasWidth / 2,
            barY + barHeight + 30
        );
    }
}
