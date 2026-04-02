export const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,

    // Soldier
    SOLDIER_SPEED: 300,
    SOLDIER_WIDTH: 60,
    SOLDIER_HEIGHT: 60,
    SOLDIER_START_X: 40,
    SOLDIER_START_HEALTH: 50,
    SOLDIER_INVINCIBILITY_TIME: 1.0,

    // Weapons
    LASER_SPEED: 600,
    LASER_DAMAGE: 1,
    LASER_WIDTH: 20,
    LASER_HEIGHT: 4,
    LASER_COOLDOWN: 0.15,
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
    WAVE_BASE_ALIENS: 12,
    WAVE_ALIENS_PER_WAVE: 3,           // 3 more aliens per wave (was 2)
    WAVE_SPEED_MULTIPLIER: 0.04,       // 4% faster per wave (noticeable by wave 10+)
    WAVE_SPAWN_INTERVAL_START: 1.4,
    WAVE_SPAWN_INTERVAL_DECREASE: 0.04, // spawn rate tightens faster (was 0.025)
    WAVE_SPAWN_INTERVAL_FLOOR: 0.35,    // can get very dense late game (was 0.5)
    WAVE_PURPLE_INTRO: 6,
    BOSS_EVERY_N_WAVES: 5,
    BOSS_BASE_HEALTH: 30,
    BOSS_HEALTH_PER_BOSS: 15,           // bosses get much tougher (was 10)

    // Power-ups
    POWERUP_SPAWN_EVERY_N_KILLS: 5,
    POWERUP_SPEED: 80,
    POWERUP_SIZE: 40,
    HEALTH_PACK_AMOUNT: 3,
    AMMO_PACK_AMOUNT: 5,
    UPGRADE_DURATION: 10,

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
