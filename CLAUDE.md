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
    Game.js            — Core loop, state machine, rendering
    AssetManager.js    — Image/audio preloading, loading screen
    InputManager.js    — Keyboard state tracking
  entities/
    Entity.js          — Base class (position, velocity, hitbox)
    Soldier.js         — Player entity
    Projectile.js      — Laser and rocket
    Alien.js           — 4 alien types (green, red, yellow, purple)
  systems/
    CollisionSystem.js — AABB collision detection
    WaveManager.js     — Wave progression, difficulty scaling
    ScoreManager.js    — High scores with localStorage
  ui/                  — (Phase 4: HUD, menus)
assets/
  images/              — 19 SVG sprites (soldier, aliens, projectiles, power-ups, backgrounds, UI)
  sounds/              — (Phase 4: SFX and music)
  fonts/               — (Phase 4: custom fonts)
index.html
```

## Key Conventions
- All tunable values in `src/config/gameConfig.js` — no magic numbers
- Entity base class pattern: every game object has `update(dt)` and `render(ctx, assets)`
- State machine for game flow: loading | menu | playing | paused | wave-complete | game-over
- deltaTime-based movement for frame-rate independence
- AABB collision detection in centralized CollisionSystem (reverse iteration with splice)
- Assets passed through render calls — entities have rectangle fallbacks if images aren't loaded
- SVG assets in clean vector/cartoon style with bold outlines

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

### Phase 3: Advanced Features — IN PROGRESS
- [ ] `BossAlien.js` — boss entity with 2 phases, health scaling
- [ ] Boss spawns every 5 waves, stops at 70% screen width
- [ ] Boss Phase 1: up/down movement, spawns mini-aliens
- [ ] Boss Phase 2: faster movement, fires projectiles at player
- [ ] Boss health bar at top of screen
- [ ] Boss drops guaranteed weapon upgrade on death
- [ ] `PowerUp.js` — health pack, ammo crate, spread shot, rapid fire, shield
- [ ] Power-up spawning (every 5 kills, weighted random)
- [ ] Spread shot (3 lasers in fan, 10s duration)
- [ ] Rapid fire (2x fire rate, 10s duration)
- [ ] Shield (absorbs 3 hits, bubble visual)
- [ ] `ParticleSystem.js` — emitter with configurable lifetime, color, velocity
- [ ] Explosion particles on alien death (colored per type)
- [ ] Rocket trail particles
- [ ] Muzzle flash on shoot
- [ ] Power-up sparkle/glow
- [ ] Boss death multi-stage explosion
- [ ] `Camera.js` — screen shake (light/medium/heavy per event)
- [ ] Parallax scrolling background (3 layers with continuous scroll)

### Phase 4: UI & Audio
- [ ] `AudioManager.js` — Web Audio API, sound pooling, volume control
- [ ] SFX: laser fire, rocket fire, alien death (per type), boss death
- [ ] SFX: power-up collect, player hit, shield activate/break
- [ ] SFX: wave complete jingle, boss warning alarm
- [ ] Music: menu theme, gameplay loop, boss fight track, game over sting
- [ ] Master / SFX / music volume sliders
- [ ] Mute toggle (persisted to localStorage)
- [ ] `HUD.js` — health bar (graphical), ammo count, score, wave number
- [ ] Boss health bar (shown only during boss fights)
- [ ] Active power-up timers with icons
- [ ] `MenuScreen.js` — title screen with high scores list
- [ ] Pause overlay (semi-transparent, resume/quit)
- [ ] Wave complete overlay (stats, next wave prompt)
- [ ] Game over screen (score, name input, high scores, restart)
- [ ] Controls hint display (fades after 10s on first wave)

### Phase 5: Polish & Testing
- [ ] Visual feedback: score pop-ups float from killed aliens
- [ ] Difficulty curve tuning and playtesting
- [ ] Performance profiling and optimization
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Difficulty Scaling (Key Values)
- Alien count per wave: `base(15) + wave * 2` (linear growth)
- Alien speed multiplier: `1.0 + (wave * 0.03)` (3% per wave)
- Spawn interval: starts 1200ms, -30ms/wave, floor 500ms
- Purple aliens introduced at wave 6
- Bosses every 5 waves, health: `30 + (bossNumber * 10)`
