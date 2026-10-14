export class Constants {
    static SERVER = {
        MAX_PAYLOAD: 8192, // bytes
        MAX_BUFFERED_AMOUNT: 4096, // bytes
        COMPRESSION: {
            threshold: 0,
            serverMaxWindowBits: 12,
            zlibDeflateOptions: {
                memLevel: 5
            }
        },
        MAX_CHAT_BODY_LENGTH: 255, // chatMessages.message in the schema is varchar(255).
        MAX_USER_CHAT_RECIPIENTS: 20,
        HANDSHAKE_DEADLINE: 1000 * 2, // ms
        MESSAGE_RATE_REFILL: 30, // messages / s
        MESSAGE_RATE_CAPACITY: 60, // max burst
        MESSAGE_DROP_DISCONNECT_THRESHOLD: 10,
        NEW_CONNECTION_RATE_REFILL: 1, // connections / s
        NEW_CONNECTION_RATE_CAPACITY: 10, // max burst
        IP_CONNECTION_BUCKET_PRUNE_INTERVAL: 1000 * 60, // ms
        ADMISSION_TOKEN_CLOCK_SKEW_SECONDS: 30, // s
        MAX_GAME_COUNT: 6,
        GAME_CONTROLLER_UPDATE_INTERVAL: 1000 / 30, // ms
        STATS_REPORT_INTERVAL: 1000 * 60,  // ms
        KEEPALIVE_INTERVAL: 1000 * 60, // ms
        VALIDATION_INTERVAL: 1000 * 30, // ms
        AI_CONTROLLER_UPDATE_INTERVAL: 1000 / 30, // ms
        GOLD_SPAWN_DURATION_MIN: 1000 * 20, // ms
        GOLD_SPAWN_DURATION_VARIANCE: 1000 * 20, // ms
        GOLD_SPAWN_DOUBLE_PROBABILITY: 0.06, // %
        GOLD_SPAWN_TRIPLE_PROBABILITY: 0.01, // %
        GOLD_SPAWN_MAX_PER_ROUND: 3,
        DIAMOND_SPAWN_DURATION_MIN: 1000 * 100, // ms
        DIAMOND_SPAWN_DURATION_VARIANCE: 1000 * 400, // ms
        DIAMOND_SPAWN_MAX_PER_ROUND: 1,
        ACHIEVEMENT_UPDATE_INTERVAL: 1000 * 2, // ms
        ACHIEVEMENT_TICK_INTERVAL: 250, // ms
        MAX_PLAYERS_PER_CONNECTION: 3,
        MAX_ACCEPTED_POSITION_DIFF_SQUARED: 3.5 * 3.5, // m^2
        MAX_ACCEPTED_ROTATION_DIFF: 1.0, // radians
        MAX_ACCEPTED_MAZE_DISTANCE: 1, // tiles
        MAX_INACTIVITY_TIME: 1000 * 60, //ms
        TRACKING_WINDOW_SIZE: 5,
        TRACKING_EMISSION_TOLERANCE: 0.96,
        TRACKING_SPEED_TOLERANCE: 1.04,
        TRACKING_VIOLATION_DURATION: 1000 * 60, // ms
        TRACKING_VIOLATION_THRESHOLD: 5,
        CHAT_COOLDOWN_TIME: 20, // s
        CHAT_COOLDOWN_PERIOD: 60 * 60 * 3, // s
        TEMP_BAN_CACHE_DURATION: 60, // s
        TANKSTATE_VIOLATION_REASONS: {
            EMISSION_TOO_OFTEN: 0,
            MOVED_TOO_FAST: 1,
            TURNED_TOO_FAST: 2
        }
    };

    static CLIENT = {
        TANKSTATE_EMISSION_INTERVAL: 0.5, // s
        MAX_PLAYERS: 3,
        RECONNECT_INTERVAL: 10000, // ms
        MAX_LATENCY_DIFFERENCE_TO_ACCEPT_FOR_POPULATED_SERVER: 35, // ms
        ADMISSION_TOKEN_REFRESH_THRESHOLD: 30 // s
    };

    static GAME = {
        MAX_ACTIVE_PLAYERS: 8,
        SYMMETRIC_MAX_ACTIVE_PLAYERS: 4,
        DEFAULT_ACTIVE_PLAYERS: 6,
        MAX_QUEUED_PLAYERS: 6
    };

    static PIXELS_PER_METER = 20.0;

    static METERS_PER_PIXEL = 0.05;

    static PATH_MIN_STEP_LENGTH = 0.01;

    static BULLET = {
        RADIUS: {
            px: 5,
            m: 5.0 / 20.0
        },
        SPEED: {
            px: 360,
            m: 360.0 / 20.0
        },
        OFFSET: {
            px: 50,
            m: 50.0 / 20.0
        }
    };

    static LASER = {
        RADIUS: {
            px: 0.0,
            m: 0.0 / 20.0
        },
        SPEED: {
            px: 3600,
            m: 3600.0 / 20.0
        },
        OFFSET: {
            px: 50,
            m: 50.0 / 20.0
        }
    };

    static DOUBLE_BARREL = {
        RADIUS: {
            px: 5,
            m: 5.0 / 20.0
        },
        SPEED: {
            px: 360,
            m: 360.0 / 20.0
        },
        OFFSET: {
            px: 45,
            m: 45.0 / 20.0
        },
        SPACE: {
            px: 9,
            m: 9.0 / 20.0
        }
    };

    static SHOTGUN = {
        RADIUS: {
            px: 2,
            m: 2.0 / 20.0
        },
        MIN_SPEED: {
            px: 600,
            m: 600.0 / 20.0
        },
        MAX_SPEED: {
            px: 700,
            m: 700.0 / 20.0
        },
        OFFSET: {
            px: 49,
            m: 49.0 / 20.0
        },
        SPACE: {
            px: 8,
            m: 8.0 / 20.0
        }
    };

    static GATLING_GUN = {
        RADIUS: {
            px: 2,
            m: 2.0 / 20.0
        },
        MIN_SPEED: {
            px: 500,
            m: 500.0 / 20.0
        },
        MAX_SPEED: {
            px: 600,
            m: 600.0 / 20.0
        },
        OFFSET: {
            px: 60,
            m: 60.0 / 20.0
        },
        SPACE: {
            px: 8,
            m: 8.0 / 20.0
        }
    };

    static HOMING_MISSILE = {
        RADIUS: {
            px: 4,
            m: 4.0 / 20.0
        },
        SPEED: {
            px: 360,
            m: 360.0 / 20.0
        },
        OFFSET: {
            px: 50,
            m: 50.0 / 20.0
        },
        ACCELERATION: 40.0 // m / s^2
    };

    static MINE = {
        RADIUS: {
            px: 16,
            m: 16.0 / 20.0
        },
        LAUNCH_SPEED: {
            px: 250,
            m: 250 / 20.0
        },
        MIN_SPEED: {
            px: 500,
            m: 500.0 / 20.0
        },
        MAX_SPEED: {
            px: 700,
            m: 700.0 / 20.0
        },
        OFFSET: {
            px: -29,
            m: -29.0 / 20.0
        },
        ACCELERATION: 40.0 // m / s^2
    };

    static COLLECTIBLE_TYPES = {
        CRATE_LASER: 0, // This value must correspond to WEAPON_TYPES.LASER
        CRATE_DOUBLE_BARREL: 1, // This value must correspond to WEAPON_TYPES.DOUBLE_BARREL
        CRATE_SHOTGUN: 2, // This value must correspond to WEAPON_TYPES.SHOTGUN
        CRATE_HOMING_MISSILE: 3, // This value must correspond to WEAPON_TYPES.HOMING_MISSILE
        CRATE_MINE: 4, // This value must correspond to WEAPON_TYPES.MINE
        CRATE_GATLING_GUN: 5, // This value must correspond to WEAPON_TYPES.GATLING_GUN
        WEAPON_CRATE_COUNT: 6,
        CRATE_SHIELD: 6, // This value must correspond to UPGRADE_TYPES.SHIELD - COLLECTIBLE_TYPES.COLLECTIBLE_TO_UPGRADE_OFFSET
        CRATE_AIMER: 7,
        CRATE_SPEED_BOOST: 8,
        UPGRADE_CRATE_COUNT: 9,
        CRATE_COUNT: 9,
        GOLD: 9,
        DIAMOND: 10,
        FLAG: 11,
        COLLECTIBLE_TO_UPGRADE_OFFSET: -4
    };

    static CRATE = {
        WIDTH: {
            px: 64,
            m: 64.0 / 20.0
        },
        HEIGHT: {
            px: 64,
            m: 64.0 / 20.0
        }
    };

    static GOLD = {
        RADIUS: {
            px: 35,
            m: 35.0 / 20.0
        }
    };

    static DIAMOND = {
        WIDTH: {
            px: 44,
            m: 44.0 / 20.0
        },
        HEIGHT: {
            px: 76,
            m: 76.0 / 20.0
        },
        MIDDLE_HEIGHT: {
            px: 38,
            m: 38.0 / 20.0
        }
    };

    static SHIELD = {
        RADIUS: {
            px: 86,
            m: 86.0 / 20.0
        }
    };

    static WEAPON_TYPES = {
        BULLET: -1,
        LASER: 0,
        DOUBLE_BARREL: 1,
        SHOTGUN: 2,
        HOMING_MISSILE: 3,
        MINE: 4,
        GATLING_GUN: 5
    };

    static PROJECTILE_BOUNCE_TIMEOUT_WINDOW = 35;

    static PROJECTILE_BOUNCE_TIMEOUT_COUNT = 5;

    static BULLET_AMMO_COUNT = 5;

    static BULLET_MAX_LIFETIME = 10.0;

    static LASER_LOCK_TIME = 0.2;

    static LASER_MAX_LIFETIME = 0.8;

    static DOUBLE_BARREL_AMMO_COUNT = 10;

    static DOUBLE_BARREL_RELOAD_TIME = 1.0;

    static DOUBLE_BARREL_MAX_LIFETIME = 6.0;

    static SHOTGUN_AMMO_COUNT = 3;

    static SHOTGUN_BUCKSHOT_COUNT = 20;

    static SHOTGUN_BUCKSHOT_SPREAD = 0.3;

    static SHOTGUN_RELOAD_TIME = 1.0;

    static SHOTGUN_LIFETIME_AFTER_MAZE_HIT = 0.7;

    static SHOTGUN_MAX_LIFETIME = 2.0;

    static HOMING_MISSILE_ACTIVATION_TIME = 2.0;

    static HOMING_MISSILE_MAX_LIFETIME = 10.0;

    static MINE_AMMO_COUNT = 3;

    static MINE_ACTIVATION_DELAY = 0.5;

    static MINE_DETONATION_DELAY = 0.4;

    static MINE_SHRAPNEL_COUNT = 30;

    static MINE_SHRAPNEL_RADIUS = 2.0 / 20.0;

    static GATLING_GUN_AMMO_COUNT = 20;

    static GATLING_GUN_BULLET_SPREAD = 0.1;

    static GATLING_GUN_CHARGE_TIME = 0.5;

    static GATLING_GUN_FIRE_RATE = 0.12;

    static GATLING_GUN_DISCHARGE_TIME = 1.5;

    static GATLING_GUN_MAX_LIFETIME = 2.0;

    static CRATE_SPAWN_DURATION_MIN = 3.0;

    static CRATE_SPAWN_DURATION_VARIANCE = 5.0;

    static CRATE_MINIMUM_TILES_TO_TANKS = 4;

    static GOLD_MINIMUM_TILES_TO_TANKS = 5;

    static DIAMOND_MINIMUM_TILES_TO_TANKS = 6;

    static MAX_CRATES = 3;

    static MAX_GOLDS = 3;

    static MAX_DIAMONDS = 1;

    static MAX_WEAPON_QUEUE = 3;

    static UPGRADE_TYPES = {
        LASER_AIMER: 0,
        SPAWN_SHIELD: 1,
        SHIELD: 2, // This value must correspond to COLLECTIBLE_TYPES.CRATE_SHIELD + COLLECTIBLE_TYPES.COLLECTIBLE_TO_UPGRADE_OFFSET
        AIMER: 3,
        SPEED_BOOST: 4
    };

    static LASER_AIMER_LENGTH = 60.0;

    static SPAWN_SHIELD_LIFETIME = 10.0;

    static SPAWN_SHIELD_WEAKEN_TIME = 2.0;

    static AIMER_LENGTH = 60.0;

    static AIMER_LIFETIME = 10.0;

    static SHIELD_LIFETIME = 6.0;

    static SHIELD_WEAKEN_TIME = 2.0;

    static SPEED_BOOST_LIFETIME = 10.0;

    static SPEED_BOOST_EFFECT = 0.3;

    static MODIFIER_TYPES = {
        SPEED: 0
    };

    static MODIFIER_INFO = [
        // Speed.
        {
            DEFAULT: 1.0
        }
    ];

    static SCORE_TYPES = {
        KILL: 0,
        VICTORY: 1
    };

    static EMBLEM_TYPES = {
        TERMINATOR: 0,
        DOMINATOR: 1
    };

    static COUNTER_TYPES = {
        TIMER_COUNTDOWN: 0,
        OVERTIME_COUNT_UP: 1,
        TIMER_COUNT_UP: 2,
        PIE_COUNTDOWN: 3
    };

    static ZONE_TYPES = {
        SPAWN: 0,
        HILL: 1,
        BASE: 2,
        STORM: 3
    };

    static SPAWN_ZONE_MINIMUM_TILES_TO_TANKS = 1;

    static SPAWN_ZONE_LIFETIME = 4.0;

    static SPAWN_ZONE_START_GROW_TIME = 2.4;

    static SPAWN_ZONE_END_GROW_TIME = 2.3;

    static SPAWN_ZONE_START_RADIUS = 0.3;

    static SPAWN_ZONE_END_RADIUS = 3.7;

    static STORM_ZONE_EXPANSION_TIME = 10.0;

    static STORM_ZONE_START_GROW_TIME = 5.0;

    static MAX_DELTA_TIME = 1.0 / 10.0;

    static BETWEEN_ROUNDS_DURATION = 1.0;

    static CELEBRATION_DURATION = 7.0;

    static COUNTDOWN_START_VALUE = 3;

    static COUNTDOWN_DURATION = 0.5;

    static ROUND_FINISHING_DURATION = 3.0;

    static JOIN_PRIORITY_START_GAME_WEIGHT = 1000;

    static JOIN_PRIORITY_DEATHMATCH_MIN_SECONDS_TO_PENALISE = 10;

    static JOIN_PRIORITY_DEATHMATCH_MAX_SECONDS_TO_PENALISE = 30;

    static JOIN_PRIORITY_DEATHMATCH_TIME_WEIGHT = 10;

    static STATISTICS = {
        SLIDING_WINDOW_SIZE: 10,
        MINIMUM_VICTORIES_FOR_DOMINATOR: 3,
        MINIMUM_KILLS_FOR_TERMINATOR: 3,
        MINIMUM_KILLS_FOR_KILL_STREAK: 3
    };

    static ACHIEVEMENT = {
        FOLLOW_THE_RED_PENGUIN: {
            MAX_ACCEPTED_ANGLE_DIFFERENCE_FOR_CLEARING_TURN_STEP: 0.25, // radians
            MAX_ACCEPTED_ROTATION_DURING_DRIVE_STEP: 1.0, // radians
            MAX_ACCEPTED_ROTATION_DURING_SHOOT_STEP: 0.5, // radians
            MAX_ACCEPTED_ROTATION_DURING_WAIT_STEP: 0.5  // radians
        },
        RED_INFILTRATION: {
            MAX_ACCEPTED_ANGLE_DIFFERENCE_FOR_CLEARING_TURN_STEP: 0.25, // radians
            MAX_ACCEPTED_ROTATION_DURING_DRIVE_STEP: 1.0, // radians
            MAX_ACCEPTED_ROTATION_DURING_SHOOT_STEP: 0.5, // radians
            MAX_ACCEPTED_ROTATION_DURING_WAIT_STEP: 0.5  // radians
        },
        WAKKA_WAKKA_WAKKA: {
            STEP_SIZE: 2.0      // m
        },
        MEMORY_LIKE_A_GOLDFISH: {
            TIME_TO_SURVIVE: 3.0    // s
        }
    };

    static TANK = {
        WIDTH: {
            px: 60,
            m: 60.0 / 20.0
        },
        HEIGHT: {
            px: 80,
            m: 80.0 / 20.0
        },
        ROTATION_SPEED: 5.0, // radians / second
        FORWARD_SPEED: {     // px / second
            px: 319,
            m: 319.0 / 20.0
        },
        BACK_SPEED: {        // px / second
            px: 256,
            m: 256.0 / 20.0
        }
    };

    static BULLET_TURRET = {
        WIDTH: {
            px: 14,
            m: 14.0 / 20.0
        },
        HEIGHT: {
            px: 28,
            m: 28.0 / 20.0
        },
        OFFSET_X: {
            px: 0,
            m: 0.0
        },
        OFFSET_Y: {
            px: -40,
            m: -40.0 / 20.0
        }
    };

    static LASER_TURRET = {
        ANTENNA_WIDTH: {
            px: 2,
            m: 2.0 / 20.0
        },
        ANTENNA_HEIGHT: {
            px: 28,
            m: 28.0 / 20.0
        },
        ANTENNA_OFFSET_X: {
            px: 0,
            m: 0.0
        },
        ANTENNA_OFFSET_Y: {
            px: -40,
            m: -40.0 / 20.0
        },
        DISH_WIDTH: {
            px: 40,
            m: 40.0 / 20.0
        },
        DISH_HEIGHT: {
            px: 10,
            m: 10.0 / 20.0
        },
        DISH_OFFSET_X: {
            px: 0,
            m: 0.0
        },
        DISH_OFFSET_Y: {
            px: -37,
            m: -37.0 / 20.0
        }
    };

    static DOUBLE_BARREL_TURRET = {
        WIDTH: {
            px: 32,
            m: 32.0 / 20.0
        },
        HEIGHT: {
            px: 22,
            m: 22.0 / 20.0
        },
        OFFSET_X: {
            px: 0,
            m: 0.0
        },
        OFFSET_Y: {
            px: -35,
            m: -35.0 / 20.0
        }
    };

    static SHOTGUN_TURRET = {
        WIDTH: {
            px: 28,
            m: 28.0 / 20.0
        },
        HEIGHT: {
            px: 27,
            m: 27.0 / 20.0
        },
        OFFSET_X: {
            px: 0,
            m: 0.0
        },
        OFFSET_Y: {
            px: -39,
            m: -39.0 / 20.0
        }
    };

    static MISSILE_TURRET = {
        WIDTH: {
            px: 6,
            m: 6.0 / 20.0
        },
        CENTRE_HEIGHT: {
            px: 28,
            m: 28.0 / 20.0
        },
        SIDE_HEIGHT: {
            px: 8,
            m: 8.0 / 20.0
        },
        OFFSET_X: {
            px: 0,
            m: 0.0
        },
        OFFSET_Y: {
            px: -39,
            m: -39.0 / 20.0
        }
    };

    static GATLING_GUN_TURRET = {
        WIDTH: {
            px: 28,
            m: 28.0 / 20.0
        },
        HEIGHT: {
            px: 27,
            m: 27.0 / 20.0
        },
        OFFSET_X: {
            px: 0,
            m: 0.0
        },
        OFFSET_Y: {
            px: -39,
            m: -39.0 / 20.0
        }
    };

    static MAZE = {
        BASE_WIDTH: 2,                                      // tiles
        WIDTH_FOR_PLAYERS: [0, 2, 4, 6, 8, 9, 10, 11, 12],  // tiles
        MAX_RANDOM_WIDTH_MULTIPLIER: 1.5,
        MAX_WIDTH: 16,                                      // tiles
        BASE_HEIGHT: 2,                                     // tiles
        HEIGHT_FOR_PLAYERS: [0, 1, 2, 3, 4, 5, 5, 6, 6],    // tiles
        MAX_RANDOM_HEIGHT_MULTIPLIER: 1.5,
        MAX_HEIGHT: 10,                                     // tiles
        TILE_PROBABILITIES: [0.5, 0.7, 0.9, 0.9, 1.0], // 0 -> no tiles; 1 -> all tiles
        WALL_PROBABILITIES: [0.5, 0.8, 0.9, 1.0, 1.0]  // 0 -> no walls; 1 -> no open spaces
    };

    static MAZE_TILE_SIZE = {
        px: 200,
        m: 200.0 / 20.0
    };

    static MAZE_WALL_WIDTH = {
        px: 16,
        m: 16.0 / 20.0
    };

    static MAZE_MINIMUM_TILES_PER_TANK = 5;

    static MAZE_MINIMUM_TILES_BETWEEN_TANKS = 4;

    static MAZE_MINIMUM_REACHABLE_RATIO = 1.0;

    static MAZE_MAX_DEAD_END_PENALTY = 5;

    static MAZE_THEMES = {
        STANDARD: 0,
        HALLOWEEN: 1,
        CHRISTMAS: 2,
        COUNT: 3,
        RANDOM: 4
    };

    static MAZE_THEME_INFO = [
        // Standard.
        {
            BORDER_CONFIG: [],
            FLOOR_CONFIG: [
                { required: 0, missing: 0, weight: 1.0 },
                { required: 0, missing: 0, weight: 1.0 }
            ],
            SPACE_CONFIG: [],
            WALL_CONFIG: [
                { flipX: true, flipY: true, weight: 1.0 }
            ],
            WALL_DECORATION_CONFIG: [],
            WALL_DECORATION_PROBABILITY: 0.0
        },
        // Halloween.
        {
            ACTIVE_DURATION_START: new Date("2017-10-01"),
            ACTIVE_DURATION_END: new Date("2017-11-01T12:00:00Z"),
            BORDER_CONFIG: [
                { flip: true, weight: 2.0 },
                { flip: true, weight: 2.0 },
                { flip: true, weight: 1.0 },
                { flip: true, weight: 1.0 }
            ],
            FLOOR_CONFIG: [
                { required: 0, missing: 0, weight: 2.0 },
                { required: 0, missing: 0, weight: 2.0 },
                { required: 0, missing: 0, weight: 1.0 },
                { required: 0, missing: 0, weight: 1.0 },
                { required: 5, missing: 0, weight: 1.0 },
                { required: 3, missing: 0, weight: 2.0 }
            ],
            SPACE_CONFIG: [
                { required: 0, missing: 0, weight: 1.0 },
                { required: 0, missing: 0, weight: 1.0 },
                { required: 15, missing: 0, weight: 1.0 }
            ],
            WALL_DECORATION_CONFIG: [
                { required: 10, missing: 0, weight: 1.0 },
                { required: 10, missing: 0, weight: 1.0 },
                { required: 10, missing: 5, weight: 1.0 },
                { required: 12, missing: 0, weight: 2.0 },
                { required: 14, missing: 0, weight: 1.0 }
            ],
            WALL_CONFIG: [
                { flipX: true, flipY: true, weight: 1.0 },
                { flipX: true, flipY: true, weight: 1.0 },
                { flipX: true, flipY: true, weight: 1.0 }
            ],
            WALL_DECORATION_PROBABILITY: 0.2
        },
        // Christmas.
        {
            ACTIVE_DURATION_START: new Date("2017-12-01"),
            ACTIVE_DURATION_END: new Date("2017-12-31T23:59:59Z"),
            BORDER_CONFIG: [
                { flip: true, weight: 3.0 },
                { flip: true, weight: 1.0 },
                { flip: true, weight: 1.0 },
                { flip: true, weight: 1.0 },
                { flip: true, weight: 1.0 },
                { flip: true, weight: 1.0 }
            ],
            FLOOR_CONFIG: [
                { required: 0, missing: 0, weight: 2.0 },
                { required: 0, missing: 0, weight: 2.0 },
                { required: 0, missing: 0, weight: 0.5 },
                { required: 0, missing: 0, weight: 1.0 },
                { required: 0, missing: 0, weight: 1.0 },
                { required: 1, missing: 0, weight: 3.0 },
                { required: 1, missing: 0, weight: 3.0 },
                { required: 5, missing: 0, weight: 3.0 },
                { required: 3, missing: 0, weight: 3.0 },
                { required: 11, missing: 0, weight: 3.0 }
            ],
            SPACE_CONFIG: [
                { required: 0, missing: 0, weight: 1.0 },
                { required: 0, missing: 0, weight: 1.0 },
                { required: 1, missing: 0, weight: 1.0 },
                { required: 3, missing: 0, weight: 1.0 },
                { required: 15, missing: 0, weight: 1.0 },
                { required: 3, missing: 0, weight: 1.0 }
            ],
            WALL_DECORATION_CONFIG: [
                { required: 5, missing: 0, weight: 1.0 },
                { required: 5, missing: 0, weight: 1.0 },
                { required: 3, missing: 0, weight: 1.0 }
            ],
            WALL_CONFIG: [
                { flipX: true, flipY: true, weight: 1.0 },
                { flipX: true, flipY: true, weight: 1.0 },
                { flipX: true, flipY: true, weight: 1.0 },
                { flipX: true, flipY: true, weight: 1.0 }
            ],
            WALL_DECORATION_PROBABILITY: 0.2
        }
    ];

    static GAME_MODES = {
        CURRENT: -1,
        CLASSIC: 0,
        BOOT_CAMP: 1,
        DEATHMATCH: 2,
        TEAM_CLASSIC: 3,
        TEAM_DEATHMATCH: 4,
        CAPTURE_THE_FLAG: 5,
        COUNT: 3
    };

    static GAME_MODE_INFO = [
        // Classic.
        {
            AVAILABLE_ONLINE: true,
            ACTIVE_HOURS: [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22],
            HAS_CELEBRATION: false,
            MIN_PLAYERS: 2,
            DEFAULT_AVAILABLE_CRATES: [0, 1, 2, 3, 4, 5, 6] // Must correspond to COLLECTIBLE_TYPES for crates.
        },
        // Boot camp.
        {
            AVAILABLE_ONLINE: false,
            HAS_CELEBRATION: false,
            MIN_PLAYERS: 2,
            DEFAULT_AVAILABLE_CRATES: [0, 1, 2, 3, 4, 5, 6] // Must correspond to COLLECTIBLE_TYPES for crates.
        },
        // Deathmatch.
        {
            AVAILABLE_ONLINE: true,
            ACTIVE_HOURS: [3, 7, 11, 15, 19, 23],
            HAS_CELEBRATION: true,
            MIN_PLAYERS: 3,
            DEFAULT_AVAILABLE_CRATES: [0, 1, 2, 3, 4, 5, 6] // Must correspond to COLLECTIBLE_TYPES for crates.
        }
    ];

    static CLASSIC_STORM_APPEAR_DURATION = 60;

    static DEATHMATCH_ROUND_DURATION = 60;

    static DEATHMATCH_RESPAWN_DURATION = 1;

    static DEATHMATCH_STORM_APPEAR_DURATION = 30;

    static TEAMS = {
        NO_TEAM: 0,
        TEAM_RED: 1,
        TEAM_BLUE: 2
    };

    static COLLISION_CATEGORIES = {
        TANK: 0x1,
        MAZE: 0x1 << 1,
        PROJECTILE: 0x1 << 2,
        TRAP: 0x1 << 3,
        COLLECTIBLE: 0x1 << 4,
        SHIELD: 0x1 << 5,
        ZONE: 0x1 << 6
    };

    static AI = {
        PATH_STEP_SIZE: 0.1,                       // tiles
        MIN_PROJECTILE_DISTANCE_TO_CONSIDER: 4,     // tiles
        MAX_PROJECTILE_DISTANCE_TO_CONSIDER: 10,    // tiles
        MIN_PROJECTILE_PATH_LENGTH: 4,              // tiles
        MAX_PROJECTILE_PATH_LENGTH: 10,             // tiles
        PROJECTILE_THREAT_TIME_FALLOFF: 0.25,       // threat / s
        PROJECTILE_THREAT_WEIGHT: 0.5,
        MIN_TRAP_THREAT_DISTANCE_TO_CONSIDER: 8,    // tiles
        MAX_TRAP_THREAT_DISTANCE_TO_CONSIDER: 16,   // tiles
        TRAP_THREAT_WEIGHT: 10,
        MINE_INITIAL_THREAT_WEIGHT: 10,
        MINE_THREAT_MIN_TIME_FALLOFF: 0.1,          // threat / s
        MINE_THREAT_MAX_TIME_FALLOFF: 1.0,          // threat / s
        OWN_MINE_THREAT_MAX_TIME_MODIFIER: 0.8,
        OWN_MINE_THREAT_MIN_TIME_MODIFIER: 0.2,
        MIN_TANK_THREAT_DISTANCE_TO_CONSIDER: 8,    // tiles
        MAX_TANK_THREAT_DISTANCE_TO_CONSIDER: 16,   // tiles
        MIN_FIRING_THREAT_PATH_BOUNCES: 2,
        MAX_FIRING_THREAT_PATH_BOUNCES: 5,
        MIN_FIRING_THREAT_PATH_LENGTH: 2,           // tiles
        MAX_FIRING_THREAT_PATH_LENGTH: 10,          // tiles
        FIRING_PATH_THREAT_WEIGHT: 0.25,
        TANK_THREAT_WEIGHT: 2,
        LASER_AIMER_THREAT_WEIGHT: 0.5,
        SPAWN_ZONE_THREAT_WEIGHT: 10,
        STORM_ZONE_THREAT_WEIGHT: 10,
        MIN_AGGRESSIVENESS_GROWTH: 0.0,             // trait / ms
        MAX_AGGRESSIVENESS_GROWTH: 0.0003,          // trait / ms
        AGGRESSIVENESS_SHOOT_AFTER_SHRINKAGE: 0.3,  // trait
        AGGRESSIVENESS_RETALIATE_SHRINKAGE: 0.2,    // trait
        AGGRESSIVENESS_LAY_TRAP_SHRINKAGE: 0.5,     // trait
        MIN_GREEDINESS_GROWTH: 0.0,                 // trait / ms
        MAX_GREEDINESS_GROWTH: 0.0003,              // trait / ms
        GREEDINESS_PICK_UP_COLLECTIBLE_SHRINKAGE: 0.5, // trait
        MIN_CRATE_DISTANCE_TO_CONSIDER: 4,          // tiles
        MAX_CRATE_DISTANCE_TO_CONSIDER: 10,         // tiles
        MIN_CRATE_DISTANCE_FALLOFF: 0.01,           // priority / tile
        MAX_CRATE_DISTANCE_FALLOFF: 0.25,           // priority / tile
        MIN_CRATE_PRIORITY_OFFSET: 0.5,
        MAX_CRATE_PRIORITY_OFFSET: 1.0,
        MIN_CURRENCY_DISTANCE_TO_CONSIDER: 6,       // tiles
        MAX_CURRENCY_DISTANCE_TO_CONSIDER: 20,      // tiles
        MIN_CURRENCY_DISTANCE_FALLOFF: 0.01,        // priority / tile
        MAX_CURRENCY_DISTANCE_FALLOFF: 0.25,        // priority / tile
        MIN_GOLD_PRIORITY_OFFSET: 0.0,
        MAX_GOLD_PRIORITY_OFFSET: 0.5,
        MIN_DIAMOND_PRIORITY_OFFSET: 0.1,
        MAX_DIAMOND_PRIORITY_OFFSET: 1.0,
        MIN_PRIORITY_DECREASE: 0.0001,              // priority / ms
        MAX_PRIORITY_DECREASE: 0.001,               // priority / ms
        MIN_GOAL_PERIOD: 100,                       // ms
        MAX_GOAL_PERIOD: 800,                       // ms
        GET_UNSTUCK_GOAL_PERIOD: 30,                // ms
        GET_UNSTUCK_DISTANCE: 2.5,                  // m
        MAX_HUNT_PRIORITY: 0.2,
        IDLE_PRIORITY: 0.01,
        MIN_IDLE_DURATION: 100,                     // ms
        MAX_IDLE_DURATION: 500,                     // ms
        MIN_IDLE_DISTANCE: 2,
        KILLS_TO_REMEMBER: 10,
        DRIVE_TO_TILE_DISTANCE_SQUARED: 4.0 * 4.0,     // m^2
        DRIVE_TO_POSITION_DISTANCE_SQUARED: 1.0 * 1.0, // m^2
        TURN_TO_DIFFERENCE: 0.1,                       // radian
        MAX_ROTATION_IMPRECISION: 0.3,                 // radian
        MIN_PROJECTILE_BOUNCES: 1,
        MAX_PROJECTILE_BOUNCES: 5,
        MIN_SCARY_PROJECTILE_DISTANCE: 3.0,              // m
        MAX_SCARY_PROJECTILE_DISTANCE: 15.0,             // m
        MIN_DODGE_PROJECTILE_DISTANCE: 4.0,              // m
        MAX_DODGE_PROJECTILE_DISTANCE: 12.0,             // m
        MIN_ESCAPE_PATH_LENGTH: 1,
        MAX_ESCAPE_PATH_LENGTH: 7,
        TIME_TO_DODGE: 1.0,                      // s
        DISTANCE_TO_DODGE: 8.0,                  // m
        AMOUNT_TO_DODGE: 4.0,                    // m
        DODGE_PRIORITY_OFFSET: 1.5,
        MIN_TANK_TARGET_DISTANCE_TO_CONSIDER: 3,  // tiles
        MAX_TANK_TARGET_DISTANCE_TO_CONSIDER: 8,  // tiles
        MIN_SHOOT_AFTER_PRIORITY_OFFSET: 0.0,
        MAX_SHOOT_AFTER_PRIORITY_OFFSET: 1.5,
        MIN_LAY_TRAP_PRIORITY_OFFSET: 0.0,
        MAX_LAY_TRAP_PRIORITY_OFFSET: 1.0,
        LAY_TRAP_DRIVE_FORWARD_DISTANCE: 0.33,    // tiles
        OWN_TRAP_MIN_DISTANCE: 2,                 // tiles
        MIN_KILLS_TO_BE_BLINDED_BY_REVENGE: 1,
        MAX_KILLS_TO_BE_BLINDED_BY_REVENGE: 5,
        MIN_REVENGE_PRIORITY: 0.2,
        MAX_REVENGE_PRIORITY: 0.8,
        MIN_WIN_PRIORITY: 0.1,
        MAX_WIN_PRIORITY: 0.7,
        MAX_FIRE_DELAY: 300,                     // ms
        MIN_FIRING_PATH_BOUNCES: 1,
        MAX_FIRING_PATH_BOUNCES: 6,
        MIN_FIRING_PATH_LENGTH: 2,               // tiles
        MAX_FIRING_PATH_LENGTH: 8,               // tiles
        MIN_FIRING_PATH_COUNT: 1,
        MAX_FIRING_PATH_COUNT: 5,
        MIN_FIRING_PATH_SPREAD: 1.04,               // radian (~60 degrees)
        MAX_FIRING_PATH_SPREAD: 2.09,               // radian (~120 degrees)
        FIRING_PATH_RANDOM_OFFSET: 0.35,            // radian (~20 degrees)
        MIN_PREFERRED_CLOSEST_DISTANCE_OFFSET: 3.0, // m
        MAX_PREFERRED_CLOSEST_DISTANCE_OFFSET: 8.0, // m
        MIN_DISTANCE_TO_FIRE: 8.0,                  // m
        MAX_DISTANCE_TO_FIRE: 20.0,                 // m
        MIN_FIRST_SEGMENT_TO_FIRE: 4.0,             // m
        MIN_DISTANCE_TO_RETALIATE: 4.0,             // m
        MAX_DISTANCE_TO_RETALIATE: 10.0,            // m
        MAX_RETALIATE_DELAY: 100,                   // ms
        MIN_TURN_AROUND_ANGLE: 1.04,                // radian (~60 degrees)
        MAX_TURN_AROUND_ANGLE: 2.09,                // radian (~120 degrees)
        MAX_STUCK_TIME: 100.0,                      // ms
        MIN_TANK_HUNT_DISTANCE_TO_CONSIDER: 6,      // tiles
        MAX_TANK_HUNT_DISTANCE_TO_CONSIDER: 20,     // tiles
        MIN_RUN_AWAY_DISTANCE_TO_CONSIDER: 6,       // tiles
        MAX_RUN_AWAY_DISTANCE_TO_CONSIDER: 20,      // tiles
        MIN_RUN_AWAY_PRIORITY_OFFSET: 0.2,
        MAX_RUN_AWAY_PRIORITY_OFFSET: 1.0,
        MIN_LASER_AIMER_DISTANCE: 3.0,              // m
        MAX_LASER_AIMER_DISTANCE: 12.0,             // m
        POSITION_DEAD_DISTANCE: 1,                  // m - Cannot be larger than DRIVE_TO_POSITION_DISTANCE_SQUARED
        POSITION_DEAD_ANGLE: 1.13,                  // radian (~65 degrees)
        ROTATION_DEAD_ANGLE: 0.1,                   // radian - Cannot be larger than TURN_TO_DIFFERENCE
        MAX_PATH_LENGTH_TO_REVERSE: 1,
        MIN_PATH_DEAD_END_WEIGHT: 0.2,
        MAX_PATH_DEAD_END_WEIGHT: 1,
        MIN_PATH_THREAT_WEIGHT: 0.1,
        MAX_PATH_THREAT_WEIGHT: 1
    };

    static MODE_CLIENT_ONLINE = "client online";

    static MODE_CLIENT_LOCAL = "client local";

    static MODE_SERVER = "server";

    static CHAT_SEND_RECEIPT = {
        SUCCESS: "success",
        RETRY: "retry",
        FAIL: "fail"
    };

    /**
     * Determines whether we are in server or client (local or online) mode
     */
    static mode = Constants.MODE_CLIENT_LOCAL;

    static setMode(mode) {
        Constants.mode = mode;
    }

    static getMode() {
        return Constants.mode;
    }
}
