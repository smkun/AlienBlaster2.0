import { Game } from './engine/Game.js';
import { InputManager } from './engine/InputManager.js';
import { AssetManager } from './engine/AssetManager.js';

const canvas = document.getElementById('gameCanvas');
const input = new InputManager();
const assets = new AssetManager();

const manifest = {
    images: {
        soldier: 'assets/images/soldier.svg',
        laser: 'assets/images/laser.svg',
        rocket: 'assets/images/rocket.svg',
        shield: 'assets/images/shield.svg',
        'alien-green': 'assets/images/alien-green.svg',
        'alien-red': 'assets/images/alien-red.svg',
        'alien-yellow': 'assets/images/alien-yellow.svg',
        'alien-purple': 'assets/images/alien-purple.svg',
        'alien-boss': 'assets/images/alien-boss.svg',
        'powerup-health': 'assets/images/powerup-health.svg',
        'powerup-ammo': 'assets/images/powerup-ammo.svg',
        'powerup-spreadshot': 'assets/images/powerup-spreadshot.svg',
        'powerup-rapidfire': 'assets/images/powerup-rapidfire.svg',
        'powerup-shield': 'assets/images/powerup-shield.svg',
        title: 'assets/images/title.svg',
        gameover: 'assets/images/gameover.svg',
        'bg-stars': 'assets/images/bg-stars.svg',
        'bg-nebula': 'assets/images/bg-nebula.svg',
        'bg-foreground': 'assets/images/bg-foreground.svg',
    },
    audio: {},
};

const game = new Game(canvas, input, assets);
game.start();

assets.loadAll(manifest).then(() => {
    console.log('All assets loaded');
});
