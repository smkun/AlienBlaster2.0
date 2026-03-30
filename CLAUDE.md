# Alien Blaster v2.0

## Project Overview
Refactoring Alien Blaster from a DOM-based side-scroller into an HTML5 Canvas 2D game with new vector/cartoon-style assets, expanded gameplay, and clean modular architecture. Desktop browser first.

**Full PRD:** [docs/plans/2026-03-30-alien-blaster-v2-design.md](docs/plans/2026-03-30-alien-blaster-v2-design.md)
**Source reference:** [GitHub repo](https://github.com/smkun/alien-blaster-project.git) (current version with assets)
**Old prototype:** `Old/` folder (original canvas-based version)

## Tech Stack
- Vanilla JavaScript (ES modules, classes)
- HTML5 Canvas 2D
- Web Audio API for sound
- No frameworks or build tools (static files, served directly)

## Directory Structure
```
src/
  main.js, engine/, entities/, systems/, ui/, config/
assets/
  images/, sounds/, fonts/
index.html
```

## Key Conventions
- All tunable values in `src/config/gameConfig.js` — no magic numbers
- Entity base class pattern: every game object has `update(dt)` and `render(ctx)`
- State machine for game flow: menu | playing | paused | wave-complete | game-over
- deltaTime-based movement for frame-rate independence
- AABB collision detection in a centralized CollisionSystem (not per-entity intervals)

---

## Implementation Checklist

### Phase 1: Foundation (Engine & Architecture)
- [ ] Project scaffolding (directory structure, index.html, module setup)
- [ ] `gameConfig.js` — all constants (speeds, health, spawn rates, difficulty curve)
- [ ] `Game.js` — core game loop with deltaTime, state machine
- [ ] `AssetManager.js` — image/audio preloading with loading screen
- [ ] `InputManager.js` — keyboard state tracking via keydown/keyup maps
- [ ] Canvas rendering setup (proper sizing, context)
- [ ] Basic placeholder rendering to verify loop works

### Phase 2: Core Gameplay (Entities & Systems)
- [ ] `Entity.js` — base class (position, velocity, size, hitbox, update, render)
- [ ] `Soldier.js` — player movement, rendering, weapon state
- [ ] `Projectile.js` — laser and rocket with damage, speed, visuals
- [ ] `Alien.js` — config-driven types (green, red, yellow, purple/zigzag)
- [ ] `CollisionSystem.js` — AABB detection for all entity interactions
- [ ] `WaveManager.js` — spawning, wave progression, new difficulty curve
- [ ] `WeaponSystem.js` — laser, rocket, ammo tracking, fire rate control
- [ ] Alien-soldier collision (damage + removal)
- [ ] Projectile-alien collision (damage, health deduction, death)
- [ ] Aliens passing left edge reduce player health
- [ ] Wave completion detection and transition

### Phase 3: Advanced Features
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
- [ ] Parallax background (3 layers: stars, nebula, foreground)

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
- [ ] `MenuScreen.js` — title screen with logo, "Press ENTER to Start"
- [ ] Pause overlay (semi-transparent, resume/quit)
- [ ] Wave complete overlay (stats, next wave prompt)
- [ ] Game over screen (score, name input, high scores, restart)
- [ ] `ScoreManager.js` — localStorage persistence, high score table
- [ ] Controls hint display (fades after 10s on first wave)

### Phase 5: Art & Polish
- [ ] New vector/cartoon soldier sprite
- [ ] New alien sprites (green, red, yellow, purple) — idle + death frames
- [ ] Boss alien sprite (idle, damaged, attack frames)
- [ ] Projectile sprites (laser beam, rocket)
- [ ] Power-up icons (health, ammo, spread, rapid fire, shield)
- [ ] Parallax background layers (stars, nebula, foreground)
- [ ] Title logo and game over graphic
- [ ] HUD decorations/frame
- [ ] Spritesheet packing and integration
- [ ] Visual feedback: hit flash (white 1 frame), score pop-ups, invincibility blink
- [ ] Health bar color transitions (green > yellow > red)
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

## Bug Reference (from current codebase)
These are fixed by the rewrite but documented for context:
1. Stray `s;` on game.js:222
2. Post-splice array access in shootLaser() and shootRocket()
3. High scores not persisted to localStorage
4. Per-projectile setInterval never cleaned up
5. Deprecated event.keyCode usage
6. endGame() doesn't stop projectile intervals
