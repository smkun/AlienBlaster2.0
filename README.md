# Alien Blaster 2.0

A side-scrolling space shooter built with HTML5 Canvas, vanilla JavaScript, and zero frameworks. Defend against waves of aliens, fight bosses, collect power-ups, and climb the global leaderboard.

**[Play it here](https://32gamers.com/AlienBlaster/)**

## Gameplay

You control a space soldier on the left side of the screen. Aliens spawn from the right in waves of increasing difficulty. Shoot them before they reach you.

### Controls

| Key | Action |
|-----|--------|
| Arrow Up / Down | Move soldier |
| Space | Fire laser (1 damage, unlimited) |
| R | Fire rocket (5 damage, limited ammo) |
| ESC / P | Pause |
| Q | Quit game (when paused) |
| M | Mute / Unmute |
| Enter | Start game, advance waves, submit score |

### Alien Types

| Alien | HP | Speed | Points | Behavior |
|-------|----|-------|--------|----------|
| Green | 1 | Fast | 1 | Straight line, fodder |
| Red | 2 | Medium | 2 | Straight line, tougher |
| Yellow | 8 | Slow | 4 | Tank with health bar |
| Purple | 3 | Medium | 3 | Sine-wave zigzag pattern |
| Blue | 2 | Variable | 3 | Hovers, then charges at high speed |
| Boss | 45+ | Slow | 20+ | Every 5 waves, 2 attack phases |

### Power-Ups

Power-ups spawn every 5 kills and drop from defeated bosses.

| Power-Up | Effect |
|----------|--------|
| Health Pack | +3 HP (max 50) |
| Ammo Crate | +5 rockets |
| Spread Shot | 3 lasers in a fan (10s) |
| Rapid Fire | 2x fire rate (10s) |
| Shield | Absorbs 3 hits |
| Speed Boost | 1.8x movement speed (6.5s) |

### Boss Fights

A boss appears at the end of every 5th wave. Each boss is harder than the last:

- **Phase 1:** Bounces vertically, spawns minion aliens
- **Phase 2** (below 50% HP): Faster movement, fires projectiles at the player
- Bosses scale in health, speed, fire rate, and damage with each appearance
- Defeating a boss drops a guaranteed weapon upgrade

### Difficulty Scaling

The game gets progressively harder each wave:

- More aliens per wave (12 base + 3 per wave)
- Aliens move 4% faster each wave
- Spawn rate tightens (1.4s down to 0.35s between spawns)
- Alien composition shifts from mostly greens to tanks, zigzags, and chargers
- Purple aliens at wave 6, blue chargers at wave 8

## Tech Stack

- **Rendering:** HTML5 Canvas 2D (1200x800)
- **Language:** Vanilla JavaScript with ES modules and classes
- **Audio:** Web Audio API with procedurally generated retro sound effects
- **Art:** 21 SVG sprites in clean vector/cartoon style
- **Backend:** PHP + MySQL for global high scores
- **Hosting:** Static files on iFastNet, no build tools required

## Architecture

The codebase follows an entity-component pattern with centralized systems:

```
src/
  main.js                  Entry point, asset manifest, audio init
  config/
    gameConfig.js          All tunable constants (no magic numbers)
  engine/
    Game.js                Core loop, state machine, system orchestration
    AssetManager.js        SVG/audio preloading with loading screen
    AudioManager.js        Web Audio API, volume/mute with localStorage persistence
    Background.js          3-layer parallax scrolling starfield
    Camera.js              Screen shake with intensity decay
    InputManager.js        Keyboard state tracking (held keys + single-frame presses)
    ParticleSystem.js      Particle emitter (explosions, trails, flash, sparkle)
    SoundGenerator.js      Procedural retro SFX via oscillator synthesis
  entities/
    Entity.js              Base class: position, velocity, hitbox, update(dt), render(ctx)
    Soldier.js             Player: movement, weapons, shields, upgrades, HP bar
    Alien.js               5 types with config-driven stats and unique behaviors
    BossAlien.js           2-phase boss with scaling difficulty per appearance
    Projectile.js          Laser and rocket with damage and speed from config
    PowerUp.js             6 types with weighted random spawning and bobbing animation
  systems/
    CollisionSystem.js     AABB detection: projectile/alien, alien/soldier, powerup/soldier
    WaveManager.js         Wave progression, spawn timing, alien type distribution
    ScoreManager.js        Fetch/submit scores via PHP API, localStorage fallback
  ui/
    HUD.js                 Canvas overlay: upgrade timers, controls hint
    ScorePopup.js          Floating "+N" text on kills
    GameOverScreen.js      Name entry with blinking cursor, high scores table

api/
  scores.php               REST API: GET top 20 / POST score (upsert if higher)
  config.php               Database credentials (gitignored)
  config.example.php       Template for deployment

assets/images/             21 SVG sprites (aliens, soldier, projectiles, power-ups, backgrounds, UI)
index.html                 Page layout with stats bar, side panels, game container
styles.css                 Sci-fi theme (Orbitron font, dark gradients, glow effects)
```

### Key Design Decisions

**deltaTime-based movement:** All entity movement multiplies velocity by `dt` (seconds since last frame). This makes the game run at consistent speed regardless of frame rate.

**State machine:** The game has 6 states (loading, menu, playing, paused, wave-complete, game-over). Each state has its own update and render logic, eliminating boolean flag soup.

**Centralized collision:** Instead of per-entity interval-based collision checks (the old codebase's approach, which caused bugs), a single `CollisionSystem.processCollisions()` runs once per frame using reverse-iteration with splice to avoid index corruption.

**Config-driven entities:** All alien types, weapon stats, difficulty curves, and timing values live in `gameConfig.js`. Tuning the game means changing numbers in one file.

**Procedural audio:** No audio files needed. `SoundGenerator` creates 10 retro sound effects (laser, rocket, explosions, power-up chimes, shield, boss alarm) by rendering oscillator waveforms directly into AudioBuffers.

**Asset fallbacks:** Every entity's `render()` method checks if the SVG sprite loaded. If not, it draws a colored rectangle. The game is fully playable without any images.

**Global leaderboard:** `ScoreManager` talks to a PHP API backed by MySQL. Scores are cached in localStorage so the game works offline. The `UNIQUE` constraint on player name means duplicate names update the existing score (only if higher).

## Setup

### Local Development

1. Clone the repo
2. Open `index.html` with a local server (e.g., VS Code Live Server)
3. No build step, no `npm install` — it just works

### Deployment (iFastNet or any PHP host)

1. Upload all files to your web host
2. Copy `api/config.example.php` to `api/config.php`
3. Fill in your MySQL credentials in `config.php`
4. Create the database table:

```sql
CREATE TABLE high_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL UNIQUE,
    score INT NOT NULL DEFAULT 0,
    wave INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

If no database is available, the game still works — scores save to localStorage instead.

## Credits

Built with [Claude Code](https://claude.ai/claude-code) by Anthropic.

Original concept: [Alien Blaster v1](https://github.com/smkun/alien-blaster-project)
