# Alien Blaster v2.0

## Project Overview
Complete rewrite of Alien Blaster as an HTML5 Canvas 2D space shooter with modular architecture, vector/cartoon SVG assets, and expanded gameplay. Desktop browser first.

**Full PRD:** [docs/plans/2026-03-30-alien-blaster-v2-design.md](docs/plans/2026-03-30-alien-blaster-v2-design.md)
**Implementation Plan:** [docs/plans/2026-03-30-alien-blaster-v2-implementation.md](docs/plans/2026-03-30-alien-blaster-v2-implementation.md)
**Repo:** https://github.com/smkun/AlienBlaster2.0
**Original reference:** https://github.com/smkun/alien-blaster-project.git

## Tech Stack
- Vanilla JavaScript (ES modules, classes)
- HTML5 Canvas 2D
- Web Audio API for sound
- No frameworks or build tools (static files, served via VS Code Live Server)

## Directory Structure
```
src/
  main.js              — Entry point, asset manifest, game init
  config/
    gameConfig.js      — All tunable constants
  engine/
    Game.js            — Core loop, state machine, rendering, HTML stats sync
    AssetManager.js    — Image/audio preloading, loading screen
    AudioManager.js    — Web Audio API, SFX playback, volume/mute persistence
    Background.js      — 3-layer parallax scrolling
    Camera.js          — Screen shake system
    InputManager.js    — Keyboard state tracking
    ParticleSystem.js  — Particle emitter (explosions, trails, flash, sparkle)
    SoundGenerator.js  — Procedural retro SFX generation
  entities/
    Entity.js          — Base class (position, velocity, hitbox)
    Soldier.js         — Player entity
    Projectile.js      — Laser and rocket
    Alien.js           — 4 alien types (green, red, yellow, purple)
    BossAlien.js       — Boss with 2 phases, health bar, attacks
    PowerUp.js         — 5 power-up types
  systems/
    CollisionSystem.js — AABB collision detection
    WaveManager.js     — Wave progression, difficulty scaling
    ScoreManager.js    — High scores with localStorage
  ui/
    HUD.js             — Canvas HUD overlay (health, ammo, score, upgrades)
    ScorePopup.js      — Floating score text on kills
    GameOverScreen.js  — Name entry, high scores display
assets/
  images/              — 19 SVG sprites (soldier, aliens, projectiles, power-ups, backgrounds, UI)
  sounds/              — (procedural via SoundGenerator, no files needed)
  fonts/               — (using Google Fonts Orbitron)
index.html             — Full page layout with side panels, stats bar
styles.css             — Sci-fi themed CSS (Orbitron font, dark blue gradients, glow effects)
```

## Key Conventions
- All tunable values in `src/config/gameConfig.js` — no magic numbers
- Entity base class pattern: every game object has `update(dt)` and `render(ctx, assets)`
- State machine for game flow: loading | menu | playing | paused | wave-complete | game-over
- deltaTime-based movement for frame-rate independence
- AABB collision detection in centralized CollisionSystem (reverse iteration with splice)
- Assets passed through render calls — entities have rectangle fallbacks if images aren't loaded
- SVG assets in clean vector/cartoon style with bold outlines
- HTML page chrome (stats bar, side panels) synced to game state each frame via `syncHTMLStats()`
- Procedural audio — no audio files, all SFX generated via Web Audio API oscillators

---

## Implementation Checklist

### Phase 1: Foundation (Engine & Architecture) — COMPLETE
- [x] Project scaffolding (directory structure, index.html, module setup)
- [x] `gameConfig.js` — all constants (speeds, health, spawn rates, difficulty curve)
- [x] `Game.js` — core game loop with deltaTime, state machine (6 states)
- [x] `AssetManager.js` — image/audio preloading with loading screen
- [x] `InputManager.js` — keyboard state tracking via keydown/keyup maps
- [x] Canvas rendering setup (1200x800, proper context)

### Phase 2: Core Gameplay (Entities & Systems) — COMPLETE
- [x] `Entity.js` — base class (position, velocity, size, hitbox, update, render)
- [x] `Soldier.js` — player movement, cooldowns, shield, upgrades, invincibility blink
- [x] `Projectile.js` — laser and rocket with damage, speed, sprite rendering
- [x] `Alien.js` — config-driven types (green, red, yellow, purple/zigzag)
- [x] `CollisionSystem.js` — AABB detection for all entity interactions
- [x] `WaveManager.js` — spawning, wave progression, difficulty curve, type distribution
- [x] `ScoreManager.js` — localStorage persistence, top 10 high scores
- [x] Full game loop wired: shooting, collisions, wave transitions, game over

### Asset Integration — COMPLETE
- [x] 19 SVG assets created (vector/cartoon style)
- [x] Asset manifest in main.js loads all images
- [x] Entity render methods use sprites with rectangle fallbacks
- [x] Starfield + nebula backgrounds on menu and gameplay
- [x] Title and game over SVG graphics

### Phase 3: Advanced Features — COMPLETE
- [x] `BossAlien.js` — 2 phases, health scaling, minion spawning, projectile attacks
- [x] Boss spawns every 5 waves, health bar at top of screen
- [x] Boss drops guaranteed weapon upgrade on death
- [x] `PowerUp.js` — 5 types (health, ammo, spreadshot, rapidfire, shield) with weighted random
- [x] Power-up spawning every 5 kills, boss drops upgrades
- [x] `ParticleSystem.js` — explosions, rocket trails, muzzle flash, sparkle, boss death
- [x] `Camera.js` — screen shake (light/medium/heavy per event)
- [x] `Background.js` — 3-layer parallax scrolling (stars, nebula, foreground)

### Phase 4: UI & Audio — COMPLETE
- [x] `AudioManager.js` — Web Audio API, volume/mute persistence to localStorage
- [x] `SoundGenerator.js` — 10 procedural retro SFX (laser, rocket, explosions, power-up, shield, jingles)
- [x] SFX wired to all game events (shoot, kill, power-up, boss, wave, damage)
- [x] Mute toggle with M key
- [x] `HUD.js` — graphical health bar, rocket count, score/wave, upgrade timers
- [x] Boss health bar (shown only during boss fights)
- [x] Controls hint display (fades after 10s on first wave)
- [x] Menu screen with title SVG, game over screen with score summary

### Phase 5: Polish & Testing — COMPLETE
- [x] Score pop-ups float from killed aliens (colored per type, fade upward)
- [x] Game over screen with name entry, high score submission
- [x] High scores displayed on menu (top 5) and game over (top 10)
- [x] ScoreManager with localStorage persistence wired into game flow
- [x] Difficulty curve tuned: gentler ramp (12 base aliens, 2% speed/wave, 1.4s spawn start)

### Page Chrome & Styling — COMPLETE
- [x] Full page layout: title banner, stats bar, game container, side panels, footer
- [x] `styles.css` — Orbitron font, dark blue gradients, glow effects, sci-fi theme
- [x] Stats bar with live HP bar (color transitions), ammo, score, wave, mute button
- [x] Left panel: high scores list synced from ScoreManager/localStorage
- [x] Right panel: controls guide, alien legend with SVG icons, power-up descriptions
- [x] Game container with corner decorations and blue glow border
- [x] Responsive: panels hide on screens < 1100px
- [x] `Game.js` syncs HTML stats bar each frame via `syncHTMLStats()` and `syncHighScoresHTML()`

---

## Difficulty Scaling (Key Values)
- Alien count per wave: `base(12) + wave * 2` (linear growth)
- Alien speed multiplier: `1.0 + (wave * 0.02)` (2% per wave)
- Spawn interval: starts 1400ms, -25ms/wave, floor 500ms
- Purple aliens introduced at wave 6
- Bosses every 5 waves, health: `30 + (bossNumber * 10)`

## Controls
- **Arrow Up/Down** — Move soldier
- **Space** — Fire laser (1 damage, unlimited)
- **R** — Fire rocket (5 damage, limited ammo)
- **ESC / P** — Pause
- **M** — Mute/unmute
- **Enter** — Start game, advance waves, submit score

## File Counts
- 22 source files in `src/`
- 19 SVG assets in `assets/images/`
- 1 HTML file, 1 CSS file
- 2 planning docs in `docs/plans/`
