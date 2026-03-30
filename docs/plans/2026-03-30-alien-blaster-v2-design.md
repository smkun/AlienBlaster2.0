# Alien Blaster v2.0 — Product Requirements Document

## Overview & Goals

**Project:** Refactor and modernize Alien Blaster from a DOM-based side-scrolling shooter into a Canvas 2D game with new assets, improved architecture, and expanded gameplay.

**Goals:**

- Rewrite rendering from DOM manipulation to HTML5 Canvas 2D with a proper game loop (deltaTime-based)
- Fix all existing bugs (post-splice crashes, interval leaks, stray code, deprecated APIs)
- Implement a modular, class-based architecture (ES modules, entity system, asset manager, audio manager)
- New vector/cartoon-style art assets: soldier, 3+ alien types, bosses, projectiles, power-ups, backgrounds, UI elements
- New and expanded sound design: more SFX variety, volume controls
- Add boss fights, weapon upgrades, particle effects, screen shake, parallax scrolling, pause/resume
- Slower difficulty scaling than current implementation
- Persistent high scores via localStorage
- Desktop browser target (keyboard controls), designed for future platform expansion

**Success Criteria:**

- Smooth 60fps gameplay on modern desktop browsers
- Zero crashes or interval leaks across full play sessions
- Difficulty feels challenging but fair through wave 15+
- Clean, maintainable codebase that's easy to extend

---

## Architecture & Technical Design

### Game Loop

- Single `requestAnimationFrame` loop with `deltaTime` calculation
- Fixed timestep for physics (entity movement, collision) to ensure consistent behavior regardless of frame rate
- Variable timestep for rendering (interpolation for smooth visuals)

### Module Structure

```
src/
  main.js              -- Entry point, initializes game
  engine/
    Game.js            -- Core game loop, state machine (menu/playing/paused/wave-complete/game-over)
    AssetManager.js    -- Preloads images, spritesheets, audio; provides loading screen
    AudioManager.js    -- Plays SFX and music, handles volume/mute, pooling for overlapping sounds
    InputManager.js    -- Keyboard state tracking (keydown/keyup maps), extensible for future touch
    ParticleSystem.js  -- Lightweight particle emitter for explosions, trails, muzzle flash
    Camera.js          -- Screen shake, future scrolling support
  entities/
    Entity.js          -- Base class (position, velocity, size, update, render, hitbox)
    Soldier.js         -- Player entity, movement, weapon state
    Alien.js           -- Base alien with type config (red, green, yellow, purple)
    BossAlien.js       -- Boss entity with phases, health bar, attack patterns
    Projectile.js      -- Laser and rocket with damage, speed, visual style
    PowerUp.js         -- Health pack, ammo crate, weapon upgrade pickups
  systems/
    CollisionSystem.js -- AABB detection, handles all entity-vs-entity interactions
    WaveManager.js     -- Wave progression, alien spawning patterns, boss triggers, difficulty scaling
    ScoreManager.js    -- Score tracking, localStorage persistence, high score table
    WeaponSystem.js    -- Weapon types, upgrades, fire rates, ammo management
  ui/
    HUD.js             -- Health, ammo, score, wave drawn on canvas overlay
    MenuScreen.js      -- Start screen, game over, pause overlay
    HealthBar.js       -- Floating health bars for bosses and tank aliens
  config/
    gameConfig.js      -- All tunable constants (speeds, health values, spawn rates, difficulty curves)
```

### Key Patterns

- All game constants in `gameConfig.js` -- no magic numbers scattered in code
- Entity base class with polymorphic `update(dt)` and `render(ctx)` methods
- Collision system runs once per frame over all entities -- no per-projectile `setInterval`
- State machine for game flow eliminates boolean flag soup

---

## Gameplay Features & Mechanics

### Weapons

| Weapon | Ammo | Damage | Fire Rate | Notes |
|--------|------|--------|-----------|-------|
| Laser | Unlimited | 1 | Fast | Thin red beam |
| Rocket | Limited (starts 20) | 5 | Slow | Trail particle effect |
| Spread Shot | Upgrade drop | 1 each | Fast | 3 lasers in fan, 10s duration |
| Rapid Fire | Upgrade drop | 1 | 2x rate | 10s duration |
| Shield | Upgrade drop | N/A | N/A | Absorbs 3 hits, bubble visual |

### Alien Types

| Type | Health | Speed | Points | Behavior |
|------|--------|-------|--------|----------|
| Green | 1 | Fast | 1 | Straight line, fodder |
| Red | 2 | Medium | 2 | Straight line, tougher |
| Yellow (Tank) | 8 | Slow | 4 | Straight line, health bar displayed |
| Purple (Zigzag) | 3 | Medium | 3 | Sine-wave movement pattern |
| Boss | 30+ (scales) | Slow | 20 | Every 5 waves, attack phases |

### Boss Fights

- Triggers at end of wave 5, 10, 15, etc.
- Boss enters from right, stops at 70% screen width
- Phase 1: Moves up/down, spawns mini-aliens
- Phase 2 (below 50% health): Faster movement, fires projectiles back at player
- Large health bar displayed at top of screen
- Drops guaranteed weapon upgrade on death

### Power-Up Drops

- Health pack: +3 health (cap at 50)
- Ammo crate: +5 rockets
- Spread shot: temporary weapon upgrade (10 seconds)
- Rapid fire: temporary fire rate boost (10 seconds)
- Shield: absorbs next 3 hits
- Spawn every 5 aliens killed, random selection weighted toward health/ammo

---

## Difficulty Scaling

The current game ramps too fast. New curve:

### Current Problems

- `waveIncreaseFactor = 0.1` increases alien count 10% per wave (compounds quickly)
- Alien speed is flat per type with no wave scaling
- Spawn interval is fixed at 1000ms regardless of wave

### New Difficulty Curve

- **Alien count per wave:** `base(15) + wave * 2` (linear, not exponential)
- **Alien speed multiplier:** `1.0 + (wave * 0.03)` (3% per wave, barely noticeable early)
- **Spawn interval:** starts at 1200ms, decreases by 30ms per wave, floor at 500ms
- **Type distribution shifts:** early waves favor green; by wave 10 more reds and yellows; purple aliens introduced at wave 6
- **Boss health scaling:** `30 + (bossNumber * 10)`
- **Power-up frequency increases** slightly in later waves to compensate

### Tuning

All values live in `gameConfig.js` for easy adjustment. Difficulty should feel:
- Waves 1-5: Learning curve, mostly green aliens, forgiving
- Waves 6-10: Challenge ramps, purple aliens appear, first boss at wave 5
- Waves 11-15: Demanding, requires weapon upgrades and ammo management
- Waves 15+: Endurance test, high density, frequent bosses

---

## Visual Effects & Polish

### Particle System

- **Explosions:** Burst of 10-20 particles on alien death, colored to match alien type
- **Projectile trails:** Small particles emitted behind rockets
- **Muzzle flash:** Brief white/yellow flash at soldier position on shoot
- **Power-up sparkle:** Glowing particles around uncollected power-ups
- **Boss death:** Large multi-stage explosion (30+ particles, screen shake)

### Screen Shake

- Light shake (2px, 100ms) on alien-soldier collision
- Medium shake (4px, 200ms) on rocket hit
- Heavy shake (8px, 400ms) on boss death

### Parallax Background

- 3 layers: deep stars (slow), nebula/dust (medium), foreground asteroids (fast)
- All scroll left continuously, creating depth
- Canvas-drawn or tiling sprite sheets

### Visual Feedback

- Aliens flash white for 1 frame on hit
- Health bar color transitions: green > yellow > red
- Score pop-up floats up from killed alien position (+1, +2, etc.)
- Soldier blinks on damage (invincibility frames, 1 second)
- Power-up icons pulse/glow before despawning

---

## Audio Design

### Sound Effects

- Laser fire (quick zap)
- Rocket fire (whoosh)
- Alien death (per type — splat, crunch, heavy explosion for tank)
- Boss death (large explosion, fanfare)
- Power-up collect (positive chime)
- Player hit (impact thud)
- Shield activate / shield break
- Wave complete (short jingle)
- Boss warning (alarm/siren before boss wave)

### Music

- Menu/title theme
- Gameplay background track (looping, energetic)
- Boss fight track (more intense)
- Game over sting

### Audio Manager

- Web Audio API for low-latency SFX
- Sound pooling for overlapping effects (multiple lasers)
- Master volume, SFX volume, music volume — separate sliders
- Mute toggle persisted to localStorage

---

## UI Design

### HUD (drawn on canvas)

- Top-left: Health bar (graphical, not just number)
- Top-left below health: Ammo count with rocket icon
- Top-right: Score and wave number
- Top-center: Boss health bar (only during boss fights)
- Bottom-center: Active power-up timers with icons

### Screens

- **Loading screen:** Progress bar while assets preload
- **Title screen:** Game logo, "Press ENTER to Start", high scores list
- **Pause overlay:** Semi-transparent overlay, "PAUSED" text, resume/quit options
- **Wave complete:** Brief overlay with wave stats (aliens killed, accuracy), "Next Wave" prompt
- **Game over:** Final score, high score entry (name input), high scores table, restart button

### Controls Display

- Small control reference in corner during first wave, fades after 10 seconds

---

## Asset Requirements

All assets in clean vector/cartoon style — bold outlines, bright colors, smooth shapes.

### Images (PNG or SVG, spritesheet preferred)

- Soldier: idle, moving up, moving down (or single sprite)
- Soldier with shield bubble overlay
- Green alien: idle + death frame
- Red alien: idle + death frame
- Yellow alien: idle + death frame
- Purple alien: idle + death frame
- Boss alien: idle, damaged, attack (multi-frame)
- Laser projectile
- Rocket projectile
- Health pack icon
- Ammo crate icon
- Spread shot power-up icon
- Rapid fire power-up icon
- Shield power-up icon
- Parallax background layers (stars, nebula, foreground)
- Title logo ("Alien Blaster")
- Game over graphic
- HUD frame/decorations

### Audio (MP3 + OGG for browser compatibility)

- See Sound Effects and Music sections above
- All SFX should be short (under 2 seconds)
- Music tracks should loop cleanly

### Fonts

- Keep "Robot" font or find a similar sci-fi/tech vector-style font
- Fallback to system monospace

---

## Known Bugs to Fix (from current codebase)

1. **game.js:222** — Stray `s;` statement causes ReferenceError when laser kills non-yellow alien
2. **game.js:225-228** — Accesses `aliens[i]` after splice; crashes if killed alien was not yellow
3. **game.js:283-288** — Same post-splice access bug in `shootRocket()`
4. **High scores not persisted** — Array resets on page refresh; needs localStorage
5. **Per-projectile setInterval** — Creates unbounded intervals, never cleaned up on game end
6. **Deprecated `event.keyCode`** — Should use `event.key` or `event.code`
7. **endGame() doesn't clean up projectile intervals** — Laser/rocket intervals keep running after game over
8. **No bounds checking on power-up spawns** — Can spawn partially off-screen

---

## Implementation Phases

### Phase 1: Foundation (Engine & Architecture)
- Project scaffolding (directory structure, HTML shell, module setup)
- Game loop with deltaTime and state machine
- AssetManager with loading screen
- InputManager (keyboard state map)
- Canvas rendering setup
- gameConfig.js with all constants

### Phase 2: Core Gameplay (Entities & Systems)
- Entity base class
- Soldier entity (movement, rendering)
- Projectile entity (laser, rocket)
- Alien entity (all 4 types with config-driven behavior)
- CollisionSystem (AABB, all interactions)
- WaveManager (spawning, wave progression, difficulty curve)
- WeaponSystem (laser, rocket, ammo management)

### Phase 3: Advanced Features
- BossAlien entity (phases, attack patterns, health bar)
- Power-up system (health, ammo, spread shot, rapid fire, shield)
- ParticleSystem (explosions, trails, muzzle flash)
- Camera system (screen shake)
- Parallax scrolling background

### Phase 4: UI & Audio
- AudioManager (Web Audio API, pooling, volume controls)
- All sound effects and music integration
- HUD rendering (health bar, ammo, score, wave, power-up timers)
- Menu screens (title, pause, wave complete, game over)
- ScoreManager with localStorage persistence
- High score table UI

### Phase 5: Art & Polish
- New vector/cartoon asset creation or sourcing
- Spritesheet integration
- Visual feedback (hit flash, score pop-ups, invincibility blink)
- Difficulty curve tuning and playtesting
- Performance optimization
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
