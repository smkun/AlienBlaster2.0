# Alien Blaster v2.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Alien Blaster as a modular HTML5 Canvas 2D game with proper game loop, entity system, and clean architecture.

**Architecture:** ES module classes loaded via a single entry point. A `Game` class owns the loop and state machine. All entities extend a base `Entity` class with `update(dt)` and `render(ctx)`. Systems (collision, waves, weapons, score) are standalone classes composed into Game. All constants centralized in `gameConfig.js`.

**Tech Stack:** Vanilla JS (ES modules), HTML5 Canvas 2D, Web Audio API. No build tools — served as static files.

---

## Phase 1: Foundation

### Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/config/gameConfig.js`
- Create: `src/engine/Game.js`
- Create: `assets/images/.gitkeep`
- Create: `assets/sounds/.gitkeep`
- Create: `assets/fonts/.gitkeep`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p src/engine src/entities src/systems src/ui src/config assets/images assets/sounds assets/fonts
```

**Step 2: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alien Blaster</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
        }
        canvas {
            border: 2px solid #333;
            background: #111;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script type="module" src="src/main.js"></script>
</body>
</html>
```

**Step 3: Create gameConfig.js**

```javascript
export const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,

    // Soldier
    SOLDIER_SPEED: 300,         // pixels per second
    SOLDIER_WIDTH: 60,
    SOLDIER_HEIGHT: 60,
    SOLDIER_START_X: 40,
    SOLDIER_START_HEALTH: 50,
    SOLDIER_INVINCIBILITY_TIME: 1.0,  // seconds after taking damage

    // Weapons
    LASER_SPEED: 600,           // pixels per second
    LASER_DAMAGE: 1,
    LASER_WIDTH: 20,
    LASER_HEIGHT: 4,
    LASER_COOLDOWN: 0.15,       // seconds between shots
    ROCKET_SPEED: 400,
    ROCKET_DAMAGE: 5,
    ROCKET_WIDTH: 16,
    ROCKET_HEIGHT: 6,
    ROCKET_COOLDOWN: 0.4,
    ROCKET_START_AMMO: 20,

    // Aliens
    ALIEN_TYPES: {
        green:  { health: 1, speed: 180, points: 1, width: 60, height: 60, color: '#44ff44' },
        red:    { health: 2, speed: 120, points: 2, width: 60, height: 60, color: '#ff4444' },
        yellow: { health: 8, speed: 60,  points: 4, width: 80, height: 60, color: '#ffff44' },
        purple: { health: 3, speed: 130, points: 3, width: 60, height: 60, color: '#aa44ff' },
    },

    // Difficulty scaling
    WAVE_BASE_ALIENS: 15,
    WAVE_ALIENS_PER_WAVE: 2,       // linear increase
    WAVE_SPEED_MULTIPLIER: 0.03,   // 3% faster per wave
    WAVE_SPAWN_INTERVAL_START: 1.2, // seconds
    WAVE_SPAWN_INTERVAL_DECREASE: 0.03, // seconds per wave
    WAVE_SPAWN_INTERVAL_FLOOR: 0.5,
    WAVE_PURPLE_INTRO: 6,          // wave number purple aliens appear
    BOSS_EVERY_N_WAVES: 5,
    BOSS_BASE_HEALTH: 30,
    BOSS_HEALTH_PER_BOSS: 10,

    // Power-ups
    POWERUP_SPAWN_EVERY_N_KILLS: 5,
    POWERUP_SPEED: 80,
    POWERUP_SIZE: 40,
    HEALTH_PACK_AMOUNT: 3,
    AMMO_PACK_AMOUNT: 5,
    UPGRADE_DURATION: 10,       // seconds

    // Particles
    PARTICLE_EXPLOSION_COUNT: 15,
    PARTICLE_BOSS_EXPLOSION_COUNT: 40,

    // Screen shake
    SHAKE_LIGHT: { intensity: 2, duration: 0.1 },
    SHAKE_MEDIUM: { intensity: 4, duration: 0.2 },
    SHAKE_HEAVY: { intensity: 8, duration: 0.4 },

    // Game states
    STATES: {
        LOADING: 'loading',
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        WAVE_COMPLETE: 'wave-complete',
        BOSS_WARNING: 'boss-warning',
        GAME_OVER: 'game-over',
    },
};
```

**Step 4: Create stub Game.js**

```javascript
import { CONFIG } from '../config/gameConfig.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.state = CONFIG.STATES.MENU;
        this.lastTime = 0;
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 1000; // seconds
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        // Will be filled in as systems are added
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Placeholder: draw state text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `State: ${this.state} — Alien Blaster v2.0`,
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }
}
```

**Step 5: Create main.js**

```javascript
import { Game } from './engine/Game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);
game.start();
```

**Step 6: Verify it works**

Run: Open `index.html` in browser (or use a local server: `python3 -m http.server 8080`)
Expected: Black canvas with white text "State: menu — Alien Blaster v2.0"

**Step 7: Commit**

```bash
git add index.html src/ assets/
git commit -m "feat: project scaffolding with game loop and config"
```

---

### Task 2: InputManager

**Files:**
- Create: `src/engine/InputManager.js`
- Modify: `src/engine/Game.js`
- Modify: `src/main.js`

**Step 1: Create InputManager.js**

```javascript
export class InputManager {
    constructor() {
        this.keys = {};
        this.justPressed = {};

        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            // Prevent scrolling with arrow keys / space
            if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    wasPressed(code) {
        return !!this.justPressed[code];
    }

    endFrame() {
        this.justPressed = {};
    }
}
```

**Step 2: Wire InputManager into Game.js**

Add to `Game` constructor:
```javascript
this.input = input;
```

Update `Game` constructor signature to `constructor(canvas, input)`.

Add at end of `update(dt)`:
```javascript
this.input.endFrame();
```

Update `render()` to show pressed keys as debug:
```javascript
// After existing render code:
this.ctx.fillStyle = '#666';
this.ctx.font = '14px monospace';
this.ctx.textAlign = 'left';
const pressed = Object.entries(this.input.keys).filter(([k, v]) => v).map(([k]) => k);
this.ctx.fillText(`Keys: ${pressed.join(', ')}`, 10, this.canvas.height - 10);
```

**Step 3: Update main.js**

```javascript
import { Game } from './engine/Game.js';
import { InputManager } from './engine/InputManager.js';

const canvas = document.getElementById('gameCanvas');
const input = new InputManager();
const game = new Game(canvas, input);
game.start();
```

**Step 4: Verify**

Open in browser, press arrow keys. Should see key codes displayed at bottom of canvas.

**Step 5: Commit**

```bash
git add src/engine/InputManager.js src/engine/Game.js src/main.js
git commit -m "feat: add InputManager with keydown/keyup tracking"
```

---

### Task 3: AssetManager with Loading Screen

**Files:**
- Create: `src/engine/AssetManager.js`
- Modify: `src/engine/Game.js`
- Modify: `src/main.js`

**Step 1: Create AssetManager.js**

```javascript
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

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ALIEN BLASTER', canvasWidth / 2, canvasHeight / 2 - 40);

        // Progress bar background
        const barWidth = 400;
        const barHeight = 20;
        const barX = (canvasWidth - barWidth) / 2;
        const barY = canvasHeight / 2;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress bar fill
        ctx.fillStyle = '#4488ff';
        ctx.fillRect(barX, barY, barWidth * this.progress, barHeight);

        // Percentage text
        ctx.fillStyle = '#aaa';
        ctx.font = '16px monospace';
        ctx.fillText(
            `Loading... ${Math.floor(this.progress * 100)}%`,
            canvasWidth / 2,
            barY + barHeight + 30
        );
    }
}
```

**Step 2: Update Game.js to use AssetManager and state machine**

```javascript
import { CONFIG } from '../config/gameConfig.js';

export class Game {
    constructor(canvas, input, assets) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        this.input = input;
        this.assets = assets;
        this.state = CONFIG.STATES.LOADING;
        this.lastTime = 0;
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    setState(newState) {
        this.state = newState;
    }

    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        // Cap dt to prevent spiral of death on tab-away
        const cappedDt = Math.min(dt, 0.1);

        this.update(cappedDt);
        this.render();

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        switch (this.state) {
            case CONFIG.STATES.LOADING:
                if (this.assets.progress >= 1) {
                    this.setState(CONFIG.STATES.MENU);
                }
                break;
            case CONFIG.STATES.MENU:
                if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
                    this.startNewGame();
                }
                break;
            case CONFIG.STATES.PLAYING:
                this.updatePlaying(dt);
                break;
            case CONFIG.STATES.PAUSED:
                if (this.input.wasPressed('Escape') || this.input.wasPressed('KeyP')) {
                    this.setState(CONFIG.STATES.PLAYING);
                }
                break;
            case CONFIG.STATES.WAVE_COMPLETE:
                if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
                    this.startNextWave();
                }
                break;
            case CONFIG.STATES.GAME_OVER:
                if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
                    this.setState(CONFIG.STATES.MENU);
                }
                break;
        }
        this.input.endFrame();
    }

    updatePlaying(dt) {
        if (this.input.wasPressed('Escape') || this.input.wasPressed('KeyP')) {
            this.setState(CONFIG.STATES.PAUSED);
            return;
        }
        // Entity updates will go here
    }

    startNewGame() {
        this.setState(CONFIG.STATES.PLAYING);
        // Game initialization will go here
    }

    startNextWave() {
        this.setState(CONFIG.STATES.PLAYING);
        // Wave start logic will go here
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.state) {
            case CONFIG.STATES.LOADING:
                this.assets.renderLoadingScreen(this.ctx, this.canvas.width, this.canvas.height);
                break;
            case CONFIG.STATES.MENU:
                this.renderMenu();
                break;
            case CONFIG.STATES.PLAYING:
                this.renderGame();
                break;
            case CONFIG.STATES.PAUSED:
                this.renderGame();
                this.renderPauseOverlay();
                break;
            case CONFIG.STATES.WAVE_COMPLETE:
                this.renderGame();
                this.renderWaveComplete();
                break;
            case CONFIG.STATES.GAME_OVER:
                this.renderGameOver();
                break;
        }
    }

    renderMenu() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ALIEN BLASTER', this.canvas.width / 2, this.canvas.height / 2 - 40);
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Press ENTER to Start', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }

    renderGame() {
        // Placeholder — entities will render here
        this.ctx.fillStyle = '#666';
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Game running...', 10, 20);
    }

    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Press ESC to Resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    renderWaveComplete() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#4f4';
        this.ctx.font = '36px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('WAVE COMPLETE', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Press ENTER for Next Wave', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    renderGameOver() {
        this.ctx.fillStyle = '#f44';
        this.ctx.font = '48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText('Press ENTER to Continue', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
}
```

**Step 3: Update main.js**

```javascript
import { Game } from './engine/Game.js';
import { InputManager } from './engine/InputManager.js';
import { AssetManager } from './engine/AssetManager.js';

const canvas = document.getElementById('gameCanvas');
const input = new InputManager();
const assets = new AssetManager();

// Asset manifest — empty for now, will be populated as art is added
const manifest = {
    images: {},
    audio: {},
};

const game = new Game(canvas, input, assets);
game.start();

// Load assets (game loop is already running, shows loading screen)
assets.loadAll(manifest).then(() => {
    console.log('All assets loaded');
});
```

**Step 4: Verify**

Open in browser. Should briefly show loading screen (instant since no assets), then menu. Press ENTER — should transition to "Game running...". Press ESC — should show pause overlay. Press ESC again — back to game.

**Step 5: Commit**

```bash
git add src/engine/AssetManager.js src/engine/Game.js src/main.js
git commit -m "feat: add AssetManager with loading screen and full state machine"
```

---

## Phase 2: Core Gameplay

### Task 4: Entity Base Class

**Files:**
- Create: `src/entities/Entity.js`

**Step 1: Create Entity.js**

```javascript
export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.active = true;  // set false to mark for removal
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
        // Override in subclasses — default draws a debug rect
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
```

**Step 2: Commit**

```bash
git add src/entities/Entity.js
git commit -m "feat: add Entity base class with position, velocity, hitbox"
```

---

### Task 5: Soldier Entity

**Files:**
- Create: `src/entities/Soldier.js`
- Modify: `src/engine/Game.js`

**Step 1: Create Soldier.js**

```javascript
import { Entity } from './Entity.js';
import { CONFIG } from '../config/gameConfig.js';

export class Soldier extends Entity {
    constructor() {
        super(
            CONFIG.SOLDIER_START_X,
            CONFIG.CANVAS_HEIGHT / 2 - CONFIG.SOLDIER_HEIGHT / 2,
            CONFIG.SOLDIER_WIDTH,
            CONFIG.SOLDIER_HEIGHT
        );
        this.health = CONFIG.SOLDIER_START_HEALTH;
        this.maxHealth = CONFIG.SOLDIER_START_HEALTH;
        this.invincibleTimer = 0;
        this.laserCooldown = 0;
        this.rocketCooldown = 0;
        this.ammo = CONFIG.ROCKET_START_AMMO;
        this.shieldHits = 0;
        this.activeUpgrade = null;
        this.upgradeTimer = 0;
    }

    update(dt, input) {
        // Movement
        this.vy = 0;
        if (input.isDown('ArrowUp')) {
            this.vy = -CONFIG.SOLDIER_SPEED;
        }
        if (input.isDown('ArrowDown')) {
            this.vy = CONFIG.SOLDIER_SPEED;
        }

        super.update(dt);

        // Clamp to canvas bounds
        this.y = Math.max(0, Math.min(this.y, CONFIG.CANVAS_HEIGHT - this.height));

        // Timers
        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
        if (this.laserCooldown > 0) this.laserCooldown -= dt;
        if (this.rocketCooldown > 0) this.rocketCooldown -= dt;
        if (this.upgradeTimer > 0) {
            this.upgradeTimer -= dt;
            if (this.upgradeTimer <= 0) {
                this.activeUpgrade = null;
            }
        }
    }

    canShootLaser() {
        return this.laserCooldown <= 0;
    }

    canShootRocket() {
        return this.rocketCooldown <= 0 && this.ammo > 0;
    }

    shootLaser() {
        this.laserCooldown = this.activeUpgrade === 'rapidfire'
            ? CONFIG.LASER_COOLDOWN / 2
            : CONFIG.LASER_COOLDOWN;
    }

    shootRocket() {
        this.rocketCooldown = CONFIG.ROCKET_COOLDOWN;
        this.ammo--;
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return false;
        if (this.shieldHits > 0) {
            this.shieldHits--;
            return false;
        }
        this.health -= amount;
        this.invincibleTimer = CONFIG.SOLDIER_INVINCIBILITY_TIME;
        return true;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    addAmmo(amount) {
        this.ammo += amount;
    }

    applyUpgrade(type) {
        if (type === 'shield') {
            this.shieldHits = 3;
        } else {
            this.activeUpgrade = type;
            this.upgradeTimer = CONFIG.UPGRADE_DURATION;
        }
    }

    render(ctx) {
        // Blink when invincible
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
            return;
        }

        // Shield bubble
        if (this.shieldHits > 0) {
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                Math.max(this.width, this.height) / 2 + 8,
                0, Math.PI * 2
            );
            ctx.stroke();
        }

        // Placeholder soldier rectangle (will be sprite later)
        ctx.fillStyle = '#4488ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Direction indicator
        ctx.fillStyle = '#88bbff';
        ctx.fillRect(this.x + this.width - 10, this.y + this.height / 2 - 4, 10, 8);
    }
}
```

**Step 2: Wire Soldier into Game.js**

Add import at top of Game.js:
```javascript
import { Soldier } from '../entities/Soldier.js';
```

Add to `startNewGame()`:
```javascript
startNewGame() {
    this.soldier = new Soldier();
    this.projectiles = [];
    this.aliens = [];
    this.powerUps = [];
    this.particles = [];
    this.wave = 1;
    this.score = 0;
    this.killsSinceLastPowerUp = 0;
    this.setState(CONFIG.STATES.PLAYING);
}
```

Update `updatePlaying(dt)`:
```javascript
updatePlaying(dt) {
    if (this.input.wasPressed('Escape') || this.input.wasPressed('KeyP')) {
        this.setState(CONFIG.STATES.PAUSED);
        return;
    }
    this.soldier.update(dt, this.input);
}
```

Update `renderGame()`:
```javascript
renderGame() {
    if (this.soldier) {
        this.soldier.render(this.ctx);
    }
}
```

**Step 3: Verify**

Open browser, press ENTER, use arrow keys to move the blue soldier up/down.

**Step 4: Commit**

```bash
git add src/entities/Soldier.js src/engine/Game.js
git commit -m "feat: add Soldier entity with movement, cooldowns, shield, upgrades"
```

---

### Task 6: Projectile Entity

**Files:**
- Create: `src/entities/Projectile.js`
- Modify: `src/engine/Game.js`

**Step 1: Create Projectile.js**

```javascript
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

    render(ctx) {
        if (this.type === 'rocket') {
            ctx.fillStyle = '#00e5ff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Trail glow
            ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
            ctx.fillRect(this.x - 8, this.y - 1, 8, this.height + 2);
        } else {
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
```

**Step 2: Add shooting to Game.js**

Add import:
```javascript
import { Projectile } from '../entities/Projectile.js';
```

Update `updatePlaying(dt)`:
```javascript
updatePlaying(dt) {
    if (this.input.wasPressed('Escape') || this.input.wasPressed('KeyP')) {
        this.setState(CONFIG.STATES.PAUSED);
        return;
    }

    this.soldier.update(dt, this.input);

    // Shooting
    if (this.input.isDown('Space') && this.soldier.canShootLaser()) {
        this.soldier.shootLaser();
        const spawnX = this.soldier.x + this.soldier.width;
        const spawnY = this.soldier.y + this.soldier.height / 2;

        if (this.soldier.activeUpgrade === 'spreadshot') {
            this.projectiles.push(new Projectile(spawnX, spawnY, 'laser'));
            this.projectiles.push(new Projectile(spawnX, spawnY - 15, 'laser'));
            this.projectiles.push(new Projectile(spawnX, spawnY + 15, 'laser'));
        } else {
            this.projectiles.push(new Projectile(spawnX, spawnY, 'laser'));
        }
    }

    if (this.input.wasPressed('KeyR') && this.soldier.canShootRocket()) {
        this.soldier.shootRocket();
        const spawnX = this.soldier.x + this.soldier.width;
        const spawnY = this.soldier.y + this.soldier.height / 2;
        this.projectiles.push(new Projectile(spawnX, spawnY, 'rocket'));
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        this.projectiles[i].update(dt);
        if (this.projectiles[i].isOffScreen(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)) {
            this.projectiles.splice(i, 1);
        }
    }
}
```

Update `renderGame()`:
```javascript
renderGame() {
    // Projectiles behind soldier
    for (const p of this.projectiles) {
        p.render(this.ctx);
    }
    if (this.soldier) {
        this.soldier.render(this.ctx);
    }
}
```

**Step 3: Verify**

Press ENTER, move with arrows, press SPACE to shoot lasers, R for rockets. Projectiles should fly right and disappear off screen.

**Step 4: Commit**

```bash
git add src/entities/Projectile.js src/engine/Game.js
git commit -m "feat: add Projectile entity with laser and rocket types, spread shot"
```

---

### Task 7: Alien Entity

**Files:**
- Create: `src/entities/Alien.js`

**Step 1: Create Alien.js**

```javascript
import { Entity } from './Entity.js';
import { CONFIG } from '../config/gameConfig.js';

export class Alien extends Entity {
    constructor(type, wave) {
        const config = CONFIG.ALIEN_TYPES[type];
        const y = Math.random() * (CONFIG.CANVAS_HEIGHT - config.height);
        super(CONFIG.CANVAS_WIDTH, y, config.width, config.height);

        this.type = type;
        this.health = config.health;
        this.maxHealth = config.health;
        this.points = config.points;
        this.color = config.color;
        this.baseSpeed = config.speed;

        // Apply wave speed multiplier
        const speedMultiplier = 1 + (wave - 1) * CONFIG.WAVE_SPEED_MULTIPLIER;
        this.vx = -(this.baseSpeed * speedMultiplier);

        // Zigzag state for purple aliens
        this.zigzagTime = 0;
        this.zigzagAmplitude = 80;
        this.zigzagFrequency = 3;
        this.baseY = this.y;

        // Hit flash
        this.flashTimer = 0;
    }

    update(dt) {
        super.update(dt);

        if (this.type === 'purple') {
            this.zigzagTime += dt;
            this.y = this.baseY + Math.sin(this.zigzagTime * this.zigzagFrequency) * this.zigzagAmplitude;
            // Clamp
            this.y = Math.max(0, Math.min(this.y, CONFIG.CANVAS_HEIGHT - this.height));
        }

        if (this.flashTimer > 0) this.flashTimer -= dt;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.flashTimer = 0.08; // flash for 2-3 frames
        return this.health <= 0;
    }

    passedLeftEdge() {
        return this.x + this.width < 0;
    }

    render(ctx) {
        // Hit flash
        if (this.flashTimer > 0) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Health bar for yellow (tank) and any alien with health > 2
        if (this.maxHealth > 2) {
            const barWidth = this.width;
            const barHeight = 4;
            const barX = this.x;
            const barY = this.y - 8;
            const healthPercent = this.health / this.maxHealth;

            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Health fill with color transition
            if (healthPercent > 0.5) {
                ctx.fillStyle = '#4f4';
            } else if (healthPercent > 0.25) {
                ctx.fillStyle = '#ff4';
            } else {
                ctx.fillStyle = '#f44';
            }
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    }
}
```

**Step 2: Commit**

```bash
git add src/entities/Alien.js
git commit -m "feat: add Alien entity with types, zigzag movement, health bars"
```

---

### Task 8: CollisionSystem

**Files:**
- Create: `src/systems/CollisionSystem.js`

**Step 1: Create CollisionSystem.js**

```javascript
export class CollisionSystem {
    static checkAABB(a, b) {
        const ha = a.hitbox;
        const hb = b.hitbox;
        return (
            ha.x < hb.x + hb.width &&
            ha.x + ha.width > hb.x &&
            ha.y < hb.y + hb.height &&
            ha.y + ha.height > hb.y
        );
    }

    static processCollisions(game) {
        const { soldier, projectiles, aliens, powerUps } = game;

        // Projectile vs Alien
        for (let pi = projectiles.length - 1; pi >= 0; pi--) {
            const proj = projectiles[pi];
            for (let ai = aliens.length - 1; ai >= 0; ai--) {
                const alien = aliens[ai];
                if (CollisionSystem.checkAABB(proj, alien)) {
                    const killed = alien.takeDamage(proj.damage);
                    projectiles.splice(pi, 1);

                    if (killed) {
                        game.onAlienKilled(alien);
                        aliens.splice(ai, 1);
                    }
                    break; // projectile is consumed
                }
            }
        }

        // Alien vs Soldier
        for (let ai = aliens.length - 1; ai >= 0; ai--) {
            const alien = aliens[ai];
            if (CollisionSystem.checkAABB(alien, soldier)) {
                soldier.takeDamage(1);
                aliens.splice(ai, 1);
                if (soldier.health <= 0) {
                    game.setState(game.constructor.name === 'Game' ? 'game-over' : 'game-over');
                }
            }
        }

        // PowerUp vs Soldier
        if (powerUps) {
            for (let pi = powerUps.length - 1; pi >= 0; pi--) {
                const pu = powerUps[pi];
                if (CollisionSystem.checkAABB(pu, soldier)) {
                    game.onPowerUpCollected(pu);
                    powerUps.splice(pi, 1);
                }
            }
        }
    }
}
```

**Step 2: Commit**

```bash
git add src/systems/CollisionSystem.js
git commit -m "feat: add CollisionSystem with AABB detection for all entity types"
```

---

### Task 9: WaveManager

**Files:**
- Create: `src/systems/WaveManager.js`

**Step 1: Create WaveManager.js**

```javascript
import { CONFIG } from '../config/gameConfig.js';
import { Alien } from '../entities/Alien.js';

export class WaveManager {
    constructor() {
        this.wave = 1;
        this.aliensSpawned = 0;
        this.aliensPerWave = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 0;
        this.waveActive = false;
    }

    startWave(wave) {
        this.wave = wave;
        this.aliensSpawned = 0;
        this.aliensPerWave = CONFIG.WAVE_BASE_ALIENS + wave * CONFIG.WAVE_ALIENS_PER_WAVE;
        this.spawnInterval = Math.max(
            CONFIG.WAVE_SPAWN_INTERVAL_FLOOR,
            CONFIG.WAVE_SPAWN_INTERVAL_START - (wave - 1) * CONFIG.WAVE_SPAWN_INTERVAL_DECREASE
        );
        this.spawnTimer = 0; // spawn first alien immediately
        this.waveActive = true;
    }

    update(dt, aliens) {
        if (!this.waveActive) return null;
        if (this.aliensSpawned >= this.aliensPerWave) {
            // All spawned — check if wave is cleared
            if (aliens.length === 0) {
                this.waveActive = false;
                return 'wave-complete';
            }
            return null;
        }

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnInterval;
            this.aliensSpawned++;
            return this.createAlien();
        }

        return null;
    }

    createAlien() {
        const type = this.pickAlienType();
        return new Alien(type, this.wave);
    }

    pickAlienType() {
        const roll = Math.random();
        const wave = this.wave;

        // Purple aliens only after wave threshold
        const hasPurple = wave >= CONFIG.WAVE_PURPLE_INTRO;

        // Distribution shifts with waves
        // Early: mostly green
        // Mid: mix of all
        // Late: fewer greens, more reds/yellows
        if (hasPurple && roll < 0.15) return 'purple';
        if (wave < 3) {
            // Waves 1-2: 70% green, 20% red, 10% yellow
            if (roll < 0.70) return 'green';
            if (roll < 0.90) return 'red';
            return 'yellow';
        } else if (wave < 8) {
            // Waves 3-7: 40% green, 30% red, 15% yellow (15% purple if unlocked)
            if (roll < 0.40) return 'green';
            if (roll < 0.70) return 'red';
            if (roll < 0.85) return 'yellow';
            return hasPurple ? 'purple' : 'green';
        } else {
            // Waves 8+: 25% green, 35% red, 25% yellow (15% purple)
            if (roll < 0.25) return 'green';
            if (roll < 0.60) return 'red';
            if (roll < 0.85) return 'yellow';
            return hasPurple ? 'purple' : 'red';
        }
    }

    isBossWave(wave) {
        return wave > 0 && wave % CONFIG.BOSS_EVERY_N_WAVES === 0;
    }

    getBossHealth(wave) {
        const bossNumber = wave / CONFIG.BOSS_EVERY_N_WAVES;
        return CONFIG.BOSS_BASE_HEALTH + bossNumber * CONFIG.BOSS_HEALTH_PER_BOSS;
    }
}
```

**Step 2: Commit**

```bash
git add src/systems/WaveManager.js
git commit -m "feat: add WaveManager with difficulty scaling and alien type distribution"
```

---

### Task 10: Wire Everything Together — Playable Game Loop

**Files:**
- Modify: `src/engine/Game.js`

This is the integration task. Update Game.js to use all the entities and systems together.

**Step 1: Update Game.js imports and startNewGame**

Add imports:
```javascript
import { Soldier } from '../entities/Soldier.js';
import { Projectile } from '../entities/Projectile.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { WaveManager } from '../systems/WaveManager.js';
```

Replace `startNewGame()`:
```javascript
startNewGame() {
    this.soldier = new Soldier();
    this.projectiles = [];
    this.aliens = [];
    this.powerUps = [];
    this.particles = [];
    this.score = 0;
    this.wave = 1;
    this.killsSinceLastPowerUp = 0;
    this.waveManager = new WaveManager();
    this.waveManager.startWave(this.wave);
    this.setState(CONFIG.STATES.PLAYING);
}
```

**Step 2: Update updatePlaying**

```javascript
updatePlaying(dt) {
    if (this.input.wasPressed('Escape') || this.input.wasPressed('KeyP')) {
        this.setState(CONFIG.STATES.PAUSED);
        return;
    }

    // Soldier
    this.soldier.update(dt, this.input);

    // Shooting
    if (this.input.isDown('Space') && this.soldier.canShootLaser()) {
        this.soldier.shootLaser();
        const sx = this.soldier.x + this.soldier.width;
        const sy = this.soldier.y + this.soldier.height / 2;
        if (this.soldier.activeUpgrade === 'spreadshot') {
            this.projectiles.push(new Projectile(sx, sy, 'laser'));
            this.projectiles.push(new Projectile(sx, sy - 15, 'laser'));
            this.projectiles.push(new Projectile(sx, sy + 15, 'laser'));
        } else {
            this.projectiles.push(new Projectile(sx, sy, 'laser'));
        }
    }
    if (this.input.wasPressed('KeyR') && this.soldier.canShootRocket()) {
        this.soldier.shootRocket();
        const sx = this.soldier.x + this.soldier.width;
        const sy = this.soldier.y + this.soldier.height / 2;
        this.projectiles.push(new Projectile(sx, sy, 'rocket'));
    }

    // Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        this.projectiles[i].update(dt);
        if (this.projectiles[i].isOffScreen(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)) {
            this.projectiles.splice(i, 1);
        }
    }

    // Aliens
    for (let i = this.aliens.length - 1; i >= 0; i--) {
        this.aliens[i].update(dt);
        if (this.aliens[i].passedLeftEdge()) {
            this.soldier.takeDamage(1);
            this.aliens.splice(i, 1);
        }
    }

    // Collisions
    CollisionSystem.processCollisions(this);

    // Check soldier death
    if (this.soldier.health <= 0) {
        this.setState(CONFIG.STATES.GAME_OVER);
        return;
    }

    // Wave spawning
    const spawnResult = this.waveManager.update(dt, this.aliens);
    if (spawnResult === 'wave-complete') {
        this.setState(CONFIG.STATES.WAVE_COMPLETE);
    } else if (spawnResult instanceof Object) {
        // It's a new alien
        this.aliens.push(spawnResult);
    }
}
```

**Step 3: Add callback methods**

```javascript
onAlienKilled(alien) {
    this.score += alien.points;
    this.killsSinceLastPowerUp++;
}

onPowerUpCollected(powerUp) {
    // Will be implemented with PowerUp entity
}
```

**Step 4: Update startNextWave**

```javascript
startNextWave() {
    this.wave++;
    this.waveManager.startWave(this.wave);
    this.setState(CONFIG.STATES.PLAYING);
}
```

**Step 5: Update renderGame to show all entities and HUD**

```javascript
renderGame() {
    const ctx = this.ctx;

    // Projectiles
    for (const p of this.projectiles) {
        p.render(ctx);
    }

    // Aliens
    for (const a of this.aliens) {
        a.render(ctx);
    }

    // Soldier
    if (this.soldier) {
        this.soldier.render(ctx);
    }

    // Temporary HUD
    ctx.fillStyle = '#fff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Health: ${this.soldier?.health || 0}`, 10, 25);
    ctx.fillText(`Ammo: ${this.soldier?.ammo || 0}`, 10, 50);
    ctx.fillText(`Score: ${this.score}`, 10, 75);
    ctx.fillText(`Wave: ${this.wave}`, 10, 100);
}
```

**Step 6: Verify**

Full gameplay loop: menu -> start -> move soldier -> shoot aliens -> aliens spawn in waves -> wave complete -> next wave -> die -> game over -> menu.

**Step 7: Commit**

```bash
git add src/engine/Game.js
git commit -m "feat: wire entities and systems into playable game loop"
```

---

### Task 11: ScoreManager with localStorage

**Files:**
- Create: `src/systems/ScoreManager.js`

**Step 1: Create ScoreManager.js**

```javascript
const STORAGE_KEY = 'alienBlasterHighScores';
const MAX_SCORES = 10;

export class ScoreManager {
    constructor() {
        this.scores = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
        } catch {
            // localStorage unavailable, scores persist only in memory
        }
    }

    addScore(name, score, wave) {
        this.scores.push({ name, score, wave, date: Date.now() });
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, MAX_SCORES);
        this.save();
    }

    isHighScore(score) {
        return this.scores.length < MAX_SCORES || score > (this.scores[this.scores.length - 1]?.score || 0);
    }

    getScores() {
        return this.scores;
    }
}
```

**Step 2: Commit**

```bash
git add src/systems/ScoreManager.js
git commit -m "feat: add ScoreManager with localStorage persistence"
```

---

That covers Phase 1 (Tasks 1-3) and the core of Phase 2 (Tasks 4-11). These 11 tasks give us a **fully playable game** with:
- Proper game loop with deltaTime
- State machine (menu/playing/paused/wave-complete/game-over)
- Soldier with movement, shooting, shields, invincibility
- Lasers and rockets with cooldowns
- 4 alien types with difficulty scaling
- Centralized collision system
- Wave progression with balanced difficulty curve
- Persistent high scores

Phase 3 (boss, power-ups, particles, camera, parallax) and Phase 4 (audio, HUD, menus) will be planned in a follow-up document once this foundation is built and verified.
