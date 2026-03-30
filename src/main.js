import { Game } from './engine/Game.js';
import { InputManager } from './engine/InputManager.js';
import { AssetManager } from './engine/AssetManager.js';

const canvas = document.getElementById('gameCanvas');
const input = new InputManager();
const assets = new AssetManager();

const manifest = {
    images: {},
    audio: {},
};

const game = new Game(canvas, input, assets);
game.start();

assets.loadAll(manifest).then(() => {
    console.log('All assets loaded');
});
