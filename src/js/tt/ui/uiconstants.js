import { Constants } from "../constants.js";
import { cubicBezier } from "animejs";

export class UIConstants {
    static SCORE_CATEGORIES = {
        EMBLEM: 0,
        SCORE: 1,
        SEPARATOR: 2,
        TEAM: 3
    };

    static ASSET_PIXEL_RATIO = 2;
    static CANVAS_PIXEL_RATIO = Math.max(devicePixelRatio, UIConstants.ASSET_PIXEL_RATIO);
    static ASSET_SCALE = UIConstants.CANVAS_PIXEL_RATIO / UIConstants.ASSET_PIXEL_RATIO;
    static SPINE_SCALE = Math.sqrt(UIConstants.CANVAS_PIXEL_RATIO);
    static MAX_CLICK_LENGTH = 200;
    static MOUSE_INPUT = {
        MAX_REVERSE_DISTANCE: 200,               // screen px
        POSITION_DEAD_DISTANCE: 100,             // screen px
        POSITION_DEAD_ANGLE: 0.78,               // radian (~45 degrees)
        ROTATION_DEAD_ANGLE: 0.1                 // radian
    };

    static SIGNUP_TYPING_SOUND_COUNT = 3;
    static SIGNUP_TYPING_PAUSE = 500;
    static SIGNUP_RANDOM_OPTIONS = 6;
    static TANK_ICON_SIZES = {
        SMALL: "small",
        MEDIUM: "medium",
        LARGE: "large"
    };

    static TANK_ICON_WIDTHS = {
        small: 280,                      // px
        medium: 400,                     // px
        large: 640                       // px
    };

    static TANK_ICON_HEIGHTS = {
        small: 168,                      // px
        medium: 240,                     // px
        large: 384                       // px
    };

    static TANK_ICON_TINT_PARTS = {
        TURRET: "turret",
        TREAD: "tread",
        BASE: "base"
    };

    static TANK_ICON_PARTS = {
        TURRET: "turret",
        BARREL: "barrel",
        LEFT_TREAD: "leftTread",
        RIGHT_TREAD: "rightTread",
        BASE: "base",
        TURRET_SHADE: "turretShade",
        BARREL_SHADE: "barrelShade",
        LEFT_TREAD_SHADE: "leftTreadShade",
        RIGHT_TREAD_SHADE: "rightTreadShade",
        BASE_SHADE: "baseShade"
    };

    static TANK_ICON_ACCESSORY_PARTS = {
        TURRET: "turret",
        BARREL: "barrel",
        FRONT: "front",
        BACK: "back",
        TREAD: "tread",
        BACKGROUND: "background",
        BADGE: "badge"
    };

    static TANK_UNAVAILABLE_COLOUR = { type: "numeric", rawValue: "0x888888", numericValue: "0x888888", imageValue: "" };
    static GAME_ICON_POOL_SIZE = 5;
    static GAME_ICON_TANK_COUNT = 4;
    static TANK_AVATAR_POOL_SIZE = 10;
    static TANK_ICON_POOL_SIZE = 10;
    static REFRESH_GAME_LIST_INTERVAL = 10000;
    static INITIAL_SERVER_STATS_DELAY = 2000;
    static REFRESH_SERVER_STATS_INTERVAL = 60000;
    static ELEMENT_POP_IN_TIME = 300;
    static ELEMENT_GLIDE_OUT_TIME = 200;
    static EASE_DEFAULT = cubicBezier(0.25, 0.1, 0.25, 1);
    static ELEMENT_MOVE_TIME = 300;
    static ELEMENT_SELECTION_TIME = 200;
    static ELEMENT_DESELECTION_TIME = 200;
    static GAME_ICON_COUNT = 3;
    static GAME_ICON_WIDTH = 160;
    static GAME_ICON_HEIGHT = 120;
    static GAME_ICON_MARGIN = 120;
    static GAME_ICON_Y = 100;
    static LOGIN_BACKGROUND_TOP_MARGIN = 20;
    static LOGIN_BACKGROUND_SIDE_MARGIN = 40;
    static LOGIN_BACKGROUND_BOTTOM_MARGIN = 70;
    static BUTTON_SIZES = {
        SMALL: "small",
        MEDIUM: "medium",
        LARGE: "large"
    };

    static BUTTON_RESOLUTIONS = {
        small: 24,                        // screen px
        medium: 34,                       // screen px
        large: 52                         // screen px
    };

    static BUTTON_HEIGHTS = {
        small: 24,                        // canvas px
        medium: 34,                       // canvas px
        large: 52                         // canvas px
    };

    static BUTTON_FONT_SIZES = {
        small: 12.6,                      // canvas px
        medium: 16.8,                     // canvas px
        large: 28                         // canvas px
    };

    static BUTTON_MARGINS = {
        small: 5,                         // canvas px
        medium: 10,                       // canvas px
        large: 20                         // canvas px
    };

    static BUTTON_SHADOW_WIDTH = 6;
    static BUTTON_SHADOW_HEIGHT_TOP = 3;
    static BUTTON_SHADOW_HEIGHT_BOTTOM = 9;
    static BUTTON_ACTIVE_OFFSET = 2;
    static BUTTON_FONT_BASELINE_FRACTION = 170 / 1000;
    static OVERLAY_FADE_TIME = 200;
    static MENU_BACKGROUND_MIN_TOP_MARGIN = 10;
    static MENU_BACKGROUND_HEIGHT_RATIO = 0.81;
    static MENU_BACKGROUND_Y_RATIO = 0.43;
    static MENU_BUTTON_WIDTHS = {
        small: 80,                        // canvas px
        medium: 120,                      // canvas px
        large: 200                        // canvas px
    };

    static MENU_BUTTON_SPACINGS = {
        small: 10,                        // canvas px
        medium: 15,                       // canvas px
        large: 25                         // canvas px
    };

    static MENU_BUTTON_BACKGROUND_Y_RATIO = 0.93;
    static MENU_LAIKA_X = -148;
    static MENU_LAIKA_MIN_EVENT_DELAY = 15;
    static MENU_LAIKA_MAX_EVENT_DELAY = 30;
    static MENU_LAIKA_Y = 16;
    static MENU_LAIKA_GROWL_TIME = 2000;
    static MENU_LAIKA_HOWL_TIME = 2500;
    static MENU_DIMITRI_X = 98;
    static MENU_DIMITRI_Y = -33;
    static MENU_DIMITRI_MIN_EVENT_DELAY = 15;
    static MENU_DIMITRI_MAX_EVENT_DELAY = 30;
    static MENU_DIMITRI_SCOWL_TIME = 3000;
    static BUTTON_INFO_FONT_SIZE = 14;
    static DISCONNECTED_ICON_Y = 110;
    static DISCONNECTED_HEADER_Y = -74;
    static DISCONNECTED_MESSAGE_Y = 64;
    static DISCONNECTED_HEADER_FONT_SIZE = 24;
    static DISCONNECTED_HEADER_STROKE_WIDTH = 4;
    static DISCONNECTED_MESSAGE_FONT_SIZE = 16;
    static DISCONNECTED_MESSAGE_STROKE_WIDTH = 4;
    static DISCONNECTED_MESSAGE_UPDATE_TIME = 2800;
    static DISCONNECTED_DELAY_TIME = 100;
    static CONNECTING_MESSAGES = [
        "Establishing communications",
        "Making contact",
        "Calling for backup",
        "Awaiting signal",
        "Wiring telegram",
        "Telegraphing code",
        "Negotiating terms",
        "Preparing nukes",
        "Reloading turrets",
        "Reheating the Cold War",
        "Cleaning the pipes",
        "Broadcasting propaganda"
    ];

    static USERNAME_FONT_SIZE = 24;
    static USERNAME_STROKE_WIDTH = 4;
    static TANK_NAME_FONT_SIZE = 32;
    static TANK_NAME_STROKE_WIDTH = 8;
    static TANK_NAME_MARGIN = 5;
    static JOIN_GAME_BUTTON_INFO_Y = 31;
    static JOIN_GAME_BUTTON_Y = 218;
    static RANDOM_GAME_BUTTON_INFO_Y = 40;
    static CREATE_GAME_BUTTON_INFO_Y = 40;
    static TANK_ICON_PLACEMENTS = // px
        [
            { x: -140, y: 70, flipped: false },
            { x: 140, y: 70, flipped: true },
            { x: -140, y: -120, flipped: false },
            { x: 140, y: -120, flipped: true }
        ];

    static TANK_NAME_PLACEMENTS = // px
        [
            { x: -140, y: 150 },
            { x: 140, y: 150 },
            { x: -140, y: -40 },
            { x: 140, y: -40 }
        ];

    static AVATAR_LAIKA_X = 190;
    static AVATAR_LAIKA_Y = 40;
    static AVATAR_LAIKA_SCALE = 0.3;
    static AVATAR_LAIKA_GROWL_TIME = 1500;
    static AVATAR_LAIKA_WHIMPER_TIME = 2000;
    static AVATAR_LAIKA_GASP_TIME = 1500;
    static AVATAR_LAIKA_GLOAT_CHANCE = 0.3;
    static AVATAR_LAIKA_HOWL_TIME = 2000;
    static AVATAR_DIMITRI_X = 100;
    static AVATAR_DIMITRI_Y = 40;
    static AVATAR_DIMITRI_SCALE = 0.4;
    static AVATAR_DIMITRI_GASP_CHANCE = 0.4;
    static AVATAR_DIMITRI_GASP_TIME = 1500;
    static AVATAR_DIMITRI_GLOAT_CHANCE = 0.4;
    static AVATAR_DIMITRI_SCOWL_TIME = 2000;
    static TANK_ICON_OUTLINE_WIDTH = 1;
    static CONTROL_SELECTED_WAIT_TIME = 500;
    static WEAPON_ICON_WIDTH = 72;
    static WEAPON_ICON_MAX_SCALE = 0.8;
    static WEAPON_ICON_SCALE_STEP = 0.1;
    static FAVOURITE_ICON_WIDTH = 40;
    static FAVOURITE_ICON_HEIGHT = 40;
    static LEAVE_GAME_BUTTON_WIDTH = 35;
    static LEAVE_GAME_MESSAGE_FONT_SIZE = 16;
    static LEAVE_GAME_MESSAGE_STROKE_WIDTH = 4;
    static LEAVE_GAME_MESSAGE_DELAY = 200;
    static LEAVE_GAME_MARGIN = 28;
    static RANK_ICON_WIDTH = 44;
    static RANK_ICON_HEIGHT = 48;
    static GUEST_ICON_WIDTH = 28;
    static GUEST_ICON_HEIGHT = 48;
    static WAITING_ICON_WIDTH = 199;
    static WAITING_ICON_HEIGHT = 210;
    static WAITING_HEADER_Y = -128;
    static WAITING_MESSAGE_Y = 128;
    static WAITING_MAX_DOTS = 3;
    static WAITING_UPDATE_TIME = 200;
    static WAITING_HEADER_FONT_SIZE = 24;
    static WAITING_HEADER_STROKE_WIDTH = 4;
    static WAITING_MESSAGE_FONT_SIZE = 16;
    static WAITING_MESSAGE_STROKE_WIDTH = 4;
    static WAITING_FOR_ROUND_TITLE_TIME = 1000;
    static WAITING_FOR_MAZE_REMOVAL_TIME = 1000;
    static WAITING_FOR_PLAYERS_DELAY_TIME = 1500;
    static WAITING_FOR_CELEBRATION_TIME = 7000;
    static CELEBRATION_TROPHY_LIFETIME = 1.0;
    static CELEBRATION_TANK_LIFETIME = 5.5;
    static CELEBRATION_PRIZE_HANDOUT_TIME = 3.5;
    static CELEBRATION_HEADER_Y = -128;
    static CELEBRATION_HEADER_FONT_SIZE = 24;
    static CELEBRATION_HEADER_STROKE_WIDTH = 4;
    static CELEBRATION_TIE_Y = 64;
    static TROPHY_EXPLOSION_Y = 55;
    static TROPHY_EXPLOSION_MIN_X_SPEED = -80;
    static TROPHY_EXPLOSION_MAX_X_SPEED = 80;
    static TROPHY_EXPLOSION_MIN_Y_SPEED = -110;
    static TROPHY_EXPLOSION_MAX_Y_SPEED = 30;
    static TROPHY_EXPLOSION_DRAG_X = 25;
    static TROPHY_EXPLOSION_DRAG_Y = 37;
    static TROPHY_EXPLOSION_FLOOR_Y = 90;
    static TROPHY_FRAGMENT_MIN_SPEED = 170;
    static TROPHY_FRAGMENT_MAX_SPEED = 270;
    static TROPHY_FRAGMENT_MAX_ROTATION_SPEED = 30.0;
    static TROPHY_FRAGMENT_MIN_ANGLE = -1.0367;
    static TROPHY_FRAGMENT_MAX_ANGLE = -2.0734;
    static TROPHY_FRAGMENT_GRAVITY = 250;
    static TROPHY_FRAGMENT_POOL_SIZE = 12;
    static TROPHY_BASE_FRAGMENT_POOL_SIZE = 4;
    static TROPHY_BASE_FRAGMENT_EXPLOSION_OFFSET = 30;
    static CONFETTI_COLOURS = [0x0a3bdb, 0xe14041, 0x17a01a, 0xf7ef5c, 0xdc771e, 0xbb169f];
    static CONFETTI_MIN_X_SPEED = -300;
    static CONFETTI_MAX_X_SPEED = 300;
    static CONFETTI_MIN_Y_SPEED = -430;
    static CONFETTI_MAX_Y_SPEED = 50;
    static CONFETTI_DRAG = 200;
    static CONFETTI_GRAVITY = 250;
    static CONFETTI_WOBBLE_KICK_IN_SPEED = 1.5;
    static CONFETTI_WOBBLE_MIN_FREQUENCY = 2.5;
    static CONFETTI_WOBBLE_MAX_FREQUENCY = 7.5;
    static CONFETTI_WOBBLE_AMPLITUDE = 5;
    static CONFETTI_Y_VARIATION = 20;
    static STREAMER_MIN_SPEED = 250;
    static STREAMER_MAX_SPEED = 300;
    static STREAMER_MIN_ANGLE = -0.785398;
    static STREAMER_MAX_ANGLE = -2.35619;
    static STREAMER_LIFETIME = 2.5;
    static STREAMER_WIDTH = 6;
    static STREAMER_FREQUENCY = 0.1;
    static STREAMER_AMPLITUDE_X = 10;
    static STREAMER_AMPLITUDE_Y = 8.5;
    static TANK_PANEL_MAX_WIDTH = 800;
    static TANK_PANEL_MAX_HEIGHT = 180;
    static TANK_PANEL_SIDE_MARGIN = 30;
    static TANK_PANEL_MIN_WIDTH_PER_ICON = 137;
    static TANK_PANEL_MAX_ICONS_BEFORE_INTERLEAVING = 3;
    static TANK_PANEL_ICON_INTERLEAVE_SCALE = 0.9;
    static TANK_PANEL_INTERLEAVE_HEIGHT = 20;
    static TANK_PANEL_INTERLEAVE_OFFSET = 8;
    static TANK_PANEL_ICON_BOTTOM_MARGIN = 50;
    static TANK_PANEL_NAME_BOTTOM_MARGIN = 54;
    static TANK_PANEL_SCORE_BOTTOM_MARGIN = 30;
    static RANK_LEVEL_UP_SPARKLE_POOL_SIZE = 12;
    static RANK_LEVEL_DOWN_SHAKE_OFFSET = 1.5;
    static RANK_LEVEL_DOWN_TEAR_MIN_OFFSET = 7.5;
    static RANK_LEVEL_DOWN_TEAR_RANDOM_OFFSET = 10;
    static RANK_LEVEL_DOWN_TEAR_Y_OFFSET = 2.5;
    static SCORE_EXPLOSION_Y = 9;
    static SCORE_EXPLOSION_MIN_X_SPEED = -60;
    static SCORE_EXPLOSION_MAX_X_SPEED = 60;
    static SCORE_EXPLOSION_MIN_Y_SPEED = -110;
    static SCORE_EXPLOSION_MAX_Y_SPEED = -40;
    static SCORE_EXPLOSION_DRAG = 50;
    static SCORE_FRAGMENT_MIN_SPEED = 50;
    static SCORE_FRAGMENT_MAX_SPEED = 150;
    static SCORE_FRAGMENT_MAX_ROTATION_SPEED = 30.0;
    static SCORE_FRAGMENT_MIN_ANGLE = -1.0367;
    static SCORE_FRAGMENT_MAX_ANGLE = -2.0734;
    static SCORE_FRAGMENT_POOL_SIZE = 30;
    static MAX_SCORE_FRAGMENTS_PER_EXPLOSION = 15;
    static MIN_SCORE_FRAGMENTS_PER_LETTER = 5;
    static SCORE_FONT_SIZE = 20;
    static SCORE_STROKE_WIDTH = 4;
    static PLAYER_PANEL_GRAVITY = 175;
    static GAME_MODE_NAME_INFO = [
        // Classic.
        {
            NAME: "Last Tank Standing",
            ICON: -1
        },
        // Boot camp.
        {
            NAME: "Boot Camp",
            ICON: -1
        },
        // Deathmatch.
        {
            NAME: "Deathmatch",
            ICON: 0
        }
    ];

    static GAME_MODE_SCORE_ITEM_INFO = [
        // Classic.
        {
            ITEM_CONFIG: [
                { category: UIConstants.SCORE_CATEGORIES.EMBLEM, type: Constants.EMBLEM_TYPES.TERMINATOR, anchorX: 0.5 },
                { category: UIConstants.SCORE_CATEGORIES.SCORE, type: Constants.SCORE_TYPES.KILL, anchorX: 1.0 },
                { category: UIConstants.SCORE_CATEGORIES.SEPARATOR, type: null, anchorX: 0.5 },
                { category: UIConstants.SCORE_CATEGORIES.SCORE, type: Constants.SCORE_TYPES.VICTORY, anchorX: 0.0 },
                { category: UIConstants.SCORE_CATEGORIES.EMBLEM, type: Constants.EMBLEM_TYPES.DOMINATOR, anchorX: 0.5 }
            ],
            CENTRE_ITEM: 2
        },
        // Boot camp.
        {
            ITEM_CONFIG: [
                { category: UIConstants.SCORE_CATEGORIES.SCORE, type: Constants.SCORE_TYPES.KILL, anchorX: 1.0 },
                { category: UIConstants.SCORE_CATEGORIES.SEPARATOR, type: null, anchorX: 0.5 },
                { category: UIConstants.SCORE_CATEGORIES.SCORE, type: Constants.SCORE_TYPES.VICTORY, anchorX: 0.0 }
            ],
            CENTRE_ITEM: 1
        },
        // Deathmatch.
        {
            ITEM_CONFIG: [
                { category: UIConstants.SCORE_CATEGORIES.EMBLEM, type: Constants.EMBLEM_TYPES.TERMINATOR, anchorX: 0.5 },
                { category: UIConstants.SCORE_CATEGORIES.SCORE, type: Constants.SCORE_TYPES.KILL, anchorX: 0.5 }
            ],
            CENTRE_ITEM: 1
        }
    ];

    static SCORE_ITEM_INFO = [
        // Emblem
        { paddingX: 10, offsetY: -8 }, // px
        // Score
        { paddingX: 0, offsetY: 0 },  // px
        // Separator
        { paddingX: 3, offsetY: -2 }  // px
    ];

    static THEME_MUSIC = [
        // Standard.
        "audio/music/PanzerPolka.m4a",
        // Halloween.
        "audio/music/SpooktacularOClock.m4a",
        // Christmas.
        "audio/music/BalalaikaBlowout.m4a"
    ];

    static ERROR_WIDTH = 280;
    static TANK_INFO_WIDTH = 218;
    static TANK_INFO_MAX_NUMBER_WIDTH = 58;
    static RANK_TITLES = [
        "Dog Food",
        "Lab Rat",
        "Intern",
        "Scavenger",
        "Cadet",
        "Sergeant",
        "Captain",
        "Commander",
        "Jr. Scientist",
        "Scientist",
        "Lead Scientist",
        "Mad Scientist"
    ];

    static RANK_LEVELS = [
        5,
        10,
        25,
        50,
        100,
        150,
        250,
        500,
        1000,
        1500,
        2000   // Remember to change backend value when adding more rank levels.
    ];

    static XP_LEVELS = [
        1000,
        3000,
        6000,
        10000,
        15000,
        21000,
        28000,
        36000,
        45000,
        55000,
        66000,
        78000,
        91000,
        105000,
        120000,
        136000,
        153000,
        171000,
        190000   // Remember to change backend value when adding more xp levels.
    ];

    static SETTINGS_WIDTH = 250;
    static SETTINGS_SERVER_SELECT_HEIGHT = 30;
    static SETTINGS_SERVER_MAX_OPTION_HEIGHT = 280;
    static SETTINGS_QUALITY_SELECT_HEIGHT = 30;
    static SETTINGS_QUALITY_MAX_OPTION_HEIGHT = 100;
    static SETTINGS_QUALITY_FPS_AVG_WEIGHT = 0.15;
    static SETTINGS_QUALITY_FPS_MIN_SAMPLES = 300;
    static SETTINGS_QUALITY_FPS_CHANGE_TO_LOW = 30;
    static SETTINGS_QUALITY_FPS_SAMPLE_UPDATE_INTERVAL = 120;
    static MAXIMUM_GOOD_LATENCY = 150;
    static MAXIMUM_AVERAGE_LATENCY = 300;
    static MINIMUM_GOOD_FPS = 55;
    static MINIMUM_AVERAGE_FPS = 45;
    static SELECT_USER_WIDTH_PER_USER = 114;
    static REQUEST_MAZE_INTERVAL = 1000;
    static COUNT_DOWN_POOL_SIZE = 3;
    static TANK_POOL_SIZE = 8;
    static TANK_NAME_POOL_SIZE = 8;
    static CRATE_POOL_SIZE = 3;
    static GOLD_POOL_SIZE = 3;
    static DIAMOND_SHINE_POOL_SIZE = 1;
    static DIAMOND_POOL_SIZE = 1;
    static SPARKLE_POOL_SIZE = 12;
    static PROJECTILE_POOL_SIZE = 40;
    static SHRAPNEL_POOL_SIZE = 240;
    static MISSILE_POOL_SIZE = 8;
    static LASER_POOL_SIZE = 8;
    static MINE_POOL_SIZE = 24;
    static AIMER_POOL_SIZE = 8;
    static SPAWN_ZONE_POOL_SIZE = 8;
    static SHIELD_POOL_SIZE = 8;
    static TANK_FEATHER_POOL_SIZE = 50;
    static TANK_EXPLOSION_POOL_SIZE = 8;
    static EXPLOSION_POOL_SIZE = 12;
    static BULLET_PUFF_POOL_SIZE = 100;
    static MISSILE_LAUNCH_SMOKE_POOL_SIZE = 80;
    static CHAT_SYMBOL_POOL_SIZE = 8;
    static WEAPON_SYMBOL_POOL_SIZE = 8;
    static ROUND_TITLE_FONT_SIZE = 48;
    static ROUND_TITLE_STROKE_WIDTH = 4;
    static ROUND_RANKED_FONT_SIZE = 24;
    static ROUND_TITLE_SPACING = 40;
    static ROUND_TITLE_OFFSET = -100;
    static ROUND_TITLE_DISPLAY_TIME = 2000;
    static COUNT_DOWN_DISPLAY_TIME = 500;
    static TANK_NAME_DISPLAY_TIME = 2.5;
    static CHAT_SYMBOL_DISPLAY_TIME = 3.0;
    static TANK_LOCAL_SMOOTHING = 1;
    static TANK_ONLINE_SMOOTHING = 3;
    static TANK_LEFT_TREAD_X = -26;
    static TANK_RIGHT_TREAD_X = 26;
    static TANK_TURRET_Y = -16;
    static TANK_TREAD_FORWARD_SPEED = 0.108;
    static TANK_TREAD_INNER_FORWARD_SPEED = 0.024;
    static TANK_TREAD_BACK_SPEED = 0.084;
    static TANK_TREAD_INNER_BACK_SPEED = 0.012;
    static TANK_TREAD_TURN_SPEED = 0.069;
    static COUNT_DOWN_AUDIO_COUNT = 4;
    static EMPTY_BARREL_AUDIO_COUNT = 4;
    static FIRE_BULLET_AUDIO_COUNT = 2;
    static BULLET_BOUNCE_AUDIO_COUNT = 12;
    static SHIELD_IMPACT_AUDIO_COUNT = 3;
    static BULLET_PUFF_AUDIO_COUNT = 3;
    static SHRAPNEL_HIT_AUDIO_COUNT = 7;
    static MINE_EXPLOSION_AUDIO_COUNT = 3;
    static MISSILE_TARGETING_AUDIO_COUNT = 11;
    static TANK_EXPLOSION_AUDIO_COUNT = 3;
    static LAIKA_HOWL_AUDIO_COUNT = 2;
    static LASER_RETRACTION_TIME = 0.05;
    static LASER_WIDTH = 4;
    static MINE_EXPLOSION_CAMERA_SHAKE = 5;
    static MINE_SHRAPNEL_MIN_ROTATION_SPEED = 3.14;
    static MINE_SHRAPNEL_MAX_ROTATION_SPEED = 9.42;
    static MISSILE_LAUNCH_MIN_SPEED = 70;
    static MISSILE_LAUNCH_MAX_SPEED = 90;
    static MISSILE_SMOKE_COLOUR = 0x000000;
    static MISSILE_TARGETING_SOUND_INTERVAL_PER_TILE = 0.2;
    static GATLING_GUN_MIN_ANIMATION_SPEED = 12;
    static GATLING_GUN_ANIMATION_SPEED_RANGE = 36;
    static AIMER_WIDTH = 4;
    static AIMER_OFFSET = 50;
    static AIMER_MIN_STEP_LENGTH = 0.01;
    static SHIELD_SPARK_BOLT_POOL_SIZE = 10;
    static SHIELD_SPARK_SPEED = 150;
    static SHIELD_SPARK_RANDOM_SPEED = 75;
    static SHIELD_SPAWN_TIME = 300;
    static SHIELD_LAYER_1_ROTATION_SPEED = 0.4;
    static SHIELD_LAYER_2_ROTATION_SPEED = -0.25;
    static SHIELD_BOLT_COUNT = 5;
    static SHIELD_BOLT_MIN_ROTATION_SPEED = 0.3;
    static SHIELD_BOLT_MAX_ROTATION_SPEED = 0.6;
    static SHIELD_BREAK_TIME = 200;
    static INVERSE_SHIELD_WEAKENED_FLICKER_PROBABILITY = 0.5;
    static SHIELD_WEAKENED_FLICKER_ALPHA_MIN = 0.2;
    static SHIELD_WEAKENED_FLICKER_ALPHA_MAX = 0.7;
    static INVERSE_SHIELD_SPARK_PROBABILITY_IN_COLLISION = 0.85;
    static COUNTER_TIMER_POOL_SIZE = 2;
    static TIMER_TOP_MARGIN = 20;
    static TIMER_SPACING = 6;
    static TIMER_FONT_SIZE = 24;
    static TIMER_STROKE_WIDTH = 4;
    static TIMER_COUNT_SCALE = 1.3;
    static TIMER_EMPHASISE_SCALE = 1.5;
    static OVERTIME_BLINK_SPEED = 10;
    static OVERTIME_BLINK_COLOURS = [0xff0000, 0xffff00];
    static OVERTIME_SCALE_TIME = 500;
    static OVERTIME_SCALE = 1.2;
    static SPAWN_ZONE_SPAWN_TIME = 300;
    static SPAWN_ZONE_BOLT_COUNT = 5;
    static SPAWN_ZONE_HOLE_EXPANSION_TIME = 0.5;
    static SPAWN_ZONE_HOLE_EXPANSION_SIZE = 5;
    static SPAWN_ZONE_SPARK_SPEED = 150;
    static SPAWN_ZONE_SPARK_RANDOM_SPEED = 25;
    static SPAWN_ZONE_HOLE_1_ROTATION_SPEED = 0.5;
    static SPAWN_ZONE_HOLE_2_ROTATION_SPEED = -0.25;
    static SPAWN_ZONE_SWIRL_1_ROTATION_SPEED = 1.0;
    static SPAWN_ZONE_SWIRL_2_ROTATION_SPEED = -1.2;
    static INVERSE_SPAWN_ZONE_STABLE_BOLT_PROBABILITY = 0.99;
    static INVERSE_SPAWN_ZONE_UNSTABLE_BOLT_PROBABILITY = 0.97;
    static SPAWN_ZONE_UNSTABLE_SHAKE = 2;
    static SPAWN_ZONE_UNSTABLE_BOLT_OFFSET = 10;
    static SPAWN_ZONE_UNSTABLE_PARTICLE_OFFSET = 50;
    static SPAWN_ZONE_UNSTABLE_PARTICLE_SPEED = -1.5;
    static SPAWN_ZONE_COLLAPSE_MIN_PARTICLE_SPEED = 0.7;
    static SPAWN_ZONE_COLLAPSE_MAX_PARTICLE_SPEED = 1.2;
    static SPAWN_ZONE_BREAK_DELAY = 300;
    static SPAWN_ZONE_BREAK_TIME = 200;
    static STORM_ZONE_TILE_SPRITE_RESOLUTION = 256;
    static STORM_ZONE_TILE_SPRITE_RANDOM_OFFSET = 100.0;
    static STORM_ZONE_TILE_SPRITE_SCROLL_SPEED = 1.0;
    static STORM_ZONE_LIGHTNING_COUNT = 20;
    static STORM_ZONE_MIN_STORM_PARTICLE_LIFETIME = 2.0;
    static STORM_ZONE_MAX_STORM_PARTICLE_LIFETIME = 3.0;
    static STORM_ZONE_FIRST_STORM_PARTICLE_RADIUS_MULTIPLIER = 0.1;
    static STORM_ZONE_STORM_PARTICLE_RADIUS_MULTIPLIER = 1.0;
    static STORM_ZONE_MIN_STORM_PARTICLE_RADIUS = 30;
    static STORM_ZONE_MAX_STORM_PARTICLE_RADIUS = 50;
    static STORM_ZONE_EXPANSION_STORM_PARTICLE_RADIUS_MULTIPLIER = 1.5;
    static STORM_ZONE_EXPANSION_STORM_PARTICLE_LIFETIME_MULTIPLIER = 0.5;
    static STORM_ZONE_STORM_PARTICLE_RANDOM_SPEED = 150;
    static STORM_ZONE_STORM_PARTICLE_MIN_SPEED_CLAMP_MULTIPLIER = 0.1;
    static STORM_ZONE_STRIKE_TANK_RANDOM_ANGLE = 1.25;
    static STORM_ZONE_STRIKE_TANK_MAX_RANDOM_OFFSET = 2.5;
    static TANK_FEATHER_COUNT = 30;
    static CRATE_SPAWN_TIME = 500;
    static GOLD_SPAWN_TIME = 500;
    static GOLD_MIN_ROTATION_SPEED = 18.0;
    static GOLD_MAX_ROTATION_SPEED = 22.0;
    static GOLD_SPARKLE_MIN_INTERVAL_TIME = 500;
    static GOLD_SPARKLE_MAX_INTERVAL_TIME = 1500;
    static DIAMOND_SPAWN_TIME = 500;
    static DIAMOND_GLOW_SCALE_CYCLE_SPEED = 2.0;
    static DIAMOND_FIRST_RAY_OPACITY_CYCLE_SPEED = 2.0;
    static DIAMOND_FIRST_RAY_ROTATION_SPEED = 0.5;
    static DIAMOND_SECOND_RAY_OPACITY_CYCLE_SPEED = 3.0;
    static DIAMOND_SECOND_RAY_OPACITY_CYCLE_PHASE = 1.0;
    static DIAMOND_SECOND_RAY_ROTATION_SPEED = 0.5;
    static DIAMOND_SPARKLE_MIN_INTERVAL_TIME = 500;
    static DIAMOND_SPARKLE_MAX_INTERVAL_TIME = 1500;
    static SPARKLE_ANIMATION_TIME = 500;
    static EXPLOSION_FRAGMENT_COUNT = 15;
    static EXPLOSION_FRAGMENT_COLLISION_TIME = 0.1;
    static EXPLOSION_FRAGMENT_MIN_LIFETIME = 2.0;
    static EXPLOSION_FRAGMENT_MAX_LIFETIME = 3.0;
    static EXPLOSION_FRAGMENT_MIN_SPEED = 50;
    static EXPLOSION_FRAGMENT_MAX_SPEED = 300;
    static EXPLOSION_FRAGMENT_MAX_ROTATION_SPEED = 30.0;
    static RUBBLE_FRAGMENT_POOL_SIZE = 25;
    static INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_THE_OPEN = 0.99;
    static INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_COLLISION = 0.83;
    static RUBBLE_FRAGMENT_MIN_LIFETIME = 0.5;
    static RUBBLE_FRAGMENT_MAX_LIFETIME = 0.8;
    static RUBBLE_FRAGMENT_SPEED_SCALE = 25;
    static RUBBLE_FRAGMENT_RANDOM_SPEED = 120;
    static RUBBLE_FRAGMENT_MAX_ROTATION_SPEED = 40.0;
    static RUBBLE_SMOKE_SPEED_SCALE = 15;
    static RUBBLE_SMOKE_RANDOM_SPEED = 65;
    static RUBBLE_TREAD_OFFSET = 26;
    static MAZE_SIDE_MARGIN = 20;
    static MAZE_TOP_MARGIN = 10;
    static MAZE_BOTTOM_MARGIN = 140;
    static TANK_EXPLOSION_CAMERA_SHAKE = 15;
    static MAX_CAMERA_SHAKE = 25;
    static CAMERA_SHAKE_FADE = 0.5;
    static LAIKA = {
        TRACKS: {
            TORSO: 0,
            HEAD: 1,
            EYES: 2,
            MOUTH: 3,
            HOWL: 4,
            EARS: 5,
            TOES: 6,
            CHAIN: 7
        },
        DEFAULT_MIX_TIME: 0.4,                  // s
        HOWL_MIX_TIME: 0.2,                     // s
        MIN_TOE_ROLL_DELAY: 3,                  // s
        MAX_TOE_ROLL_DELAY: 15,                 // s
        MIN_BLINK_DELAY: 5,                     // s
        MAX_BLINK_DELAY: 8,                     // s
        BLINK_TIME: 0.2,                        // s
        LASER_BLINK_TIME: 0.1,                  // s
        LASER_BLINK_PROBABILITY: 0.1,
        LASER_BLINK_COUNT: 3,
        LASER_TIME: 3,                          // s
        HOWL_COUNT: 3,
        MIN_HOWL_TIME: 0.3,                     // s
        MAX_HOWL_TIME: 0.5,                     // s
        CHAIN_RATTLE_DELAY: 200                 // ms
    };

    static DIMITRI = {
        TRACKS: {
            TORSO: 0,
            HEAD: 1,
            EYES: 2,
            MOUTH: 3,
            SCHNURRBART: 4,
            HANDS: 5,
            HIP: 6,
            FOOT: 7
        },
        DEFAULT_MIX_TIME: 0.4,                  // s
        FOOT_TAP_MIX_TIME: 0.1,                 // s
        MIN_LEGS_DELAY: 7,                      // s
        MAX_LEGS_DELAY: 13,                     // s
        MIN_WIGGLE_DELAY: 5,                    // s
        MAX_WIGGLE_DELAY: 11,                   // s
        SCHNURRBART_WIGGLE_COUNT: 2,
        HIP_BOUNCE_PROBABILITY: 0.33,
        HIP_BOUNCE_COUNT: 3,
        FOOT_SCRATCH_PROBABILITY: 0.33,
        FOOT_SCRATCH_COUNT: 5,
        FOOT_TAP_COUNT: 3
    };

    static CONNECTION_ERROR_MESSAGE_OFFSET = 30;
    static CONNECTION_ERROR_MESSAGE_FONT_SIZE = 16;
    static CONNECTION_ERROR_MESSAGE_STROKE_WIDTH = 4;
    static GARAGE_TANK_ICON_MARGIN = 115;
    static SPRAY_CAN_POOL_SIZE = 30;
    static PER_SPRAY_CAN_SPAWN_DELAY = 90;
    static SPRAY_CAN_WIDTH = 80;
    static SPRAY_CAN_DRAG_MARGIN = 5;
    static GARAGE_SPRAY_ZONE_TURRET_Y = 0.05;
    static GARAGE_SPRAY_ZONE_TREAD_X = 0.015;
    static GARAGE_SPRAY_ZONE_OUTSIDE_MIN_Y = -0.22;
    static GARAGE_SPRAY_ZONE_OUTSIDE_MAX_Y = 0.45;
    static GARAGE_SPRAY_ZONE_OUTSIDE_X = 0.3;
    static GARAGE_SPRAY_START_X = 0.32;
    static GARAGE_SPRAY_TURRET_END_X = -0.21;
    static GARAGE_SPRAY_TREAD_END_X = -0.35;
    static GARAGE_SPRAY_BASE_END_X = -0.31;
    static GARAGE_SPRAY_TURRET_Y = 0.1;
    static GARAGE_SPRAY_TREAD_Y = 0.4;
    static GARAGE_SPRAY_BASE_Y = 0.38;
    static GARAGE_SPRAY_SHAKE_PROBABILITY = 0.15;
    static GARAGE_SPRAY_SHAKE_TIME = 80;
    static GARAGE_SPRAY_SHAKE_COUNT = 6;
    static GARAGE_SPRAY_SHAKE_OFFSET = 25;
    static GARAGE_SPRAY_SHAKE_MAX_ROTATION = 0.2;
    static GARAGE_SPRAY_TIME = 800;
    static GARAGE_SPRAY_PARTICLE_TIME = 1500;
    static GARAGE_SPRAY_OFFSET_X = 0.0;
    static GARAGE_SPRAY_OFFSET_Y = -0.43;
    static SPRAY_MIN_X_SPEED = -120;
    static SPRAY_MAX_X_SPEED = 60;
    static SPRAY_MIN_Y_SPEED = -70;
    static SPRAY_MAX_Y_SPEED = 70;
    static SPRAY_DRAG = 25;
    static SPRAY_RADIUS = 16;
    static SPRAY_INNER_RADIUS = 2;
    static ACCESSORIES_PER_ROW = 8;
    static PER_ACCESSORY_SPAWN_DELAY = 90;
    static ACCESSORY_FLY_OUT_TIME = 600;
    static ACCESSORY_WIDTH = 130;
    static ACCESSORY_HEIGHT = 130;
    static GARAGE_MAX_DRAG_SPEED = 850;
    static GARAGE_SNAP_DISTANCE_TO_SPEED_SCALE = 8.0;
    static GARAGE_TANK_ICON_SCROLL_SPEED = 600;
    static GARAGE_BOX_SCROLL_SPEED = 400;
    static GARAGE_ACCESSORY_SCROLL_SPEED = 400;
    static GARAGE_BUTTON_SCROLL_OFFSET = 50;
    static GARAGE_SCROLL_DRAG = 0.9;
    static WELDER_SAMPLE_CELL_SIZE = 10;
    static WELDER_SAMPLE_JITTER_SIZE = 10;
    static GARAGE_WELD_SMOKE_TIME = 700;
    static GARAGE_WELD_PARTICLE_TIME = 1500;
    static WELDER_SMOKE_MIN_X_SPEED = -30;
    static WELDER_SMOKE_MAX_X_SPEED = 30;
    static WELDER_SMOKE_MIN_Y_SPEED = -20;
    static WELDER_SMOKE_MAX_Y_SPEED = 30;
    static WELDER_SMOKE_INNER_RADIUS = 8;
    static WELDER_SMOKE_RADIUS = 16;
    static GARAGE_WELD_SPARK_TIME = 1300;
    static WELDER_SPARK_MIN_X_SPEED = -150;
    static WELDER_SPARK_MAX_X_SPEED = 150;
    static WELDER_SPARK_MIN_Y_SPEED = -130;
    static WELDER_SPARK_MAX_Y_SPEED = 50;
    static WELDER_SPARK_LENGTH = 8;
    static WELDER_SPARK_WIDTH = 2;
    static GARAGE_BOX_WIDTH = 280;
    static GARAGE_BOX_HEIGHT = 280;
    static BOXES_PER_ROW = 4;
    static BASE_BOX_SPAWN_DELAY = 250;
    static PER_BOX_SPAWN_DELAY = 90;
    static SCRAPYARD_PLATE_WIDTH = 11;
    static SCRAPYARD_PLATE_HEIGHT = 22;
    static SCRAPYARD_PLATE_SPACING = 1;
    static SCRAPYARD_FLIP_DELAY = 100;
    static SCRAPYARD_FLIP_TIME = 630;
    static SCRAPYARD_FIRST_UPDATE = 60000;
    static SCRAPYARD_FOLLOWING_UPDATES = 300000;
    static FORUM_THREAD_REFRESH_INTERVAL = 30;
    static FORUM_REPLY_REFRESH_INTERVAL = 10;
    static FORUM_MAX_PAGES_AROUND_CURRENT = 3;
    static FORUM_BACK_BUTTON_WIDTH = 77;
    static FORUM_OLDEST_PAGE_BUTTON_WIDTH = 51;
    static FORUM_NEWEST_PAGE_BUTTON_WIDTH = 51;
    static FORUM_PAGE_ELLIPSIS_WIDTH = 36;
    static FORUM_PAGE_BUTTON_WIDTHS = // screen px
        [
            37,
            41,
            37,
            39,
            32,
            40
        ];

    static FORUM_PAGE_BUTTON_HEIGHT = 45;
    static FORUM_PAGE_BUTTON_ANIMATION_BOTTOM = 15;
    static FORUM_PAGE_ELLIPSIS_ANIMATION_BOTTOM = 9;
    static ADMIN_LEVEL_ACCEPT_GUIDELINES = 0;
    static ADMIN_LEVEL_DASHBOARD = 1;
    static ADMIN_LEVEL_MODERATE_PLAYER_NAME = 1;
    static ADMIN_LEVEL_PLAYER_LOOKUP = 1;
    static ADMIN_LEVEL_APPROVE_THREAD_OR_REPLY = 1;
    static ADMIN_LEVEL_DELETE_THREAD_OR_REPLY = 1;
    static ADMIN_LEVEL_CHAT_LOG = 1;
    static ADMIN_LEVEL_READ_MESSAGES = 1;
    static ADMIN_LEVEL_VIEW_STATISTICS = 1;
    static ADMIN_LEVEL_VIEW_LOG = 1;
    static ADMIN_LEVEL_RESOLVE_CHAT_MESSAGE_REPORT = 2;
    static ADMIN_LEVEL_LOCK_THREAD = 2;
    static ADMIN_LEVEL_PIN_THREAD = 3;
    static ADMIN_LEVEL_BAN_THREAD_OR_REPLY = 3;
    static ADMIN_LEVEL_BAN_USER = 3;
    static ADMIN_LEVEL_VIEW_SENSITIVE_PLAYER_DETAILS = 6;
    static ADMIN_LEVEL_SET_PLAYER_ADMIN_LEVEL = 6;
    static ADMIN_LEVEL_PURCHASE_GOLD_SHOP_ITEM = 6;
    static ADMIN_LEVEL_PURCHASE_VIRTUAL_SHOP_ITEM = 6;
    static ADMIN_LEVEL_NEWS = 9;
    static ADMIN_LEVEL_SERVER_LOG = 9;
    static ADMIN_LEVEL_PURCHASE_SHOP_ITEM = 9;
    static ADMIN_LEVEL_EDIT_SHOP_ITEM = 9;
    static ADMIN_ROLE_WRITE_MESSAGES = "writeMessages";
    static ADMIN_LOG = {
        ACTION_APPROVE_USERNAME: 0,
        ACTION_REJECT_USERNAME: 1,
        ACTION_UNDO_USERNAME_MODERATION: 2,
        ACTION_BAN_PLAYER: 3,
        ACTION_REMOVE_PLAYER_BAN: 4,
        ACTION_RECOMMEND_PLAYER_PROMOTION: 5,
        ACTION_PROMOTE_PLAYER_FROM_RECOMMENDATIONS: 6,
        ACTION_PROMOTE_PLAYER: 7,
        ACTION_DEMOTE_PLAYER: 8,
        ACTION_APPROVE_CHAT_MESSAGE: 9,
        ACTION_BAN_CHAT_MESSAGE: 10,
        ACTION_CREATE_NEWS_POST: 11,
        ACTION_EDIT_NEWS_POST: 12,
        ACTION_DELETE_NEWS_POST: 13,
        ACTION_ACCEPT_ADMIN_GUIDELINES: 14,
        ACTION_REJECT_ADMIN_GUIDELINES: 15,
        ACTION_RETIRE_ADMIN: 16,
        ACTION_EDIT_MESSAGE_CONTENT: 17,
        ACTION_REVERT_ACCOUNT_CHANGE: 18,
        ACTION_RESET_ACCOUNT_PASSWORD: 19,
        ACTION_RESEND_VERIFICATION_EMAIL: 20,
        ACTION_PURCHASE_VIRTUAL_SHOP_ITEM: 21,
        ACTION_REFUND_VIRTUAL_SHOP_ITEM: 22,
        ACTION_APPROVE_FORUM_THREAD: 23,
        ACTION_UNAPPROVE_FORUM_THREAD: 24,
        ACTION_LOCK_FORUM_THREAD: 25,
        ACTION_UNLOCK_FORUM_THREAD: 26,
        ACTION_PIN_FORUM_THREAD: 27,
        ACTION_UNPIN_FORUM_THREAD: 28,
        ACTION_DELETE_FORUM_THREAD: 29,
        ACTION_UNDELETE_FORUM_THREAD: 30,
        ACTION_BAN_FORUM_THREAD: 31,
        ACTION_UNBAN_FORUM_THREAD: 32,
        ACTION_APPROVE_FORUM_REPLY: 33,
        ACTION_UNAPPROVE_FORUM_REPLY: 34,
        ACTION_DELETE_FORUM_REPLY: 35,
        ACTION_UNDELETE_FORUM_REPLY: 36,
        ACTION_BAN_FORUM_REPLY: 37,
        ACTION_UNBAN_FORUM_REPLY: 38,
        ACTION_DELETE_ACCOUNT: 39,
        ACTION_PURCHASE_GOLD_SHOP_ITEM: 40,
        ACTION_REFUND_GOLD_SHOP_ITEM: 41,
        ACTION_PURCHASE_SHOP_ITEM: 42,
        ACTION_REFUND_SHOP_ITEM: 43,
        ACTION_EDIT_EMAIL: 44,
        ACTION_DELETE_EMAIL: 45,
        ACTION_EDIT_SHOP_ITEM: 46,
        ACTION_REMOVE_ACCOUNT_DELETION: 47,
        ACTION_KICK_CHEATING_PLAYER: 48
    };

    static CHAT_BOX_MAX_MESSAGE_COUNT = 30;
    static AD_RELIEF_TIME = 600000;
    static NAG_RELIEF_TIME = 1800000;

    static scaleForPixelRatio() {
        // Scale to account for actual increase in canvas size.
        this.GAME_ICON_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.GAME_ICON_HEIGHT *= this.CANVAS_PIXEL_RATIO;
        this.GAME_ICON_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.GAME_ICON_Y *= this.CANVAS_PIXEL_RATIO;
        this.LOGIN_BACKGROUND_TOP_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.LOGIN_BACKGROUND_SIDE_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.LOGIN_BACKGROUND_BOTTOM_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_HEIGHTS[this.BUTTON_SIZES.SMALL] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_HEIGHTS[this.BUTTON_SIZES.MEDIUM] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_HEIGHTS[this.BUTTON_SIZES.LARGE] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_MARGINS[this.BUTTON_SIZES.SMALL] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_MARGINS[this.BUTTON_SIZES.MEDIUM] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_MARGINS[this.BUTTON_SIZES.LARGE] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_SHADOW_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_SHADOW_HEIGHT_TOP *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_SHADOW_HEIGHT_BOTTOM *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_ACTIVE_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.MENU_BACKGROUND_MIN_TOP_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.MENU_BUTTON_WIDTHS[this.BUTTON_SIZES.SMALL] *= this.CANVAS_PIXEL_RATIO;
        this.MENU_BUTTON_WIDTHS[this.BUTTON_SIZES.MEDIUM] *= this.CANVAS_PIXEL_RATIO;
        this.MENU_BUTTON_WIDTHS[this.BUTTON_SIZES.LARGE] *= this.CANVAS_PIXEL_RATIO;
        this.MENU_BUTTON_SPACINGS[this.BUTTON_SIZES.SMALL] *= this.CANVAS_PIXEL_RATIO;
        this.MENU_BUTTON_SPACINGS[this.BUTTON_SIZES.MEDIUM] *= this.CANVAS_PIXEL_RATIO;
        this.MENU_BUTTON_SPACINGS[this.BUTTON_SIZES.LARGE] *= this.CANVAS_PIXEL_RATIO;
        this.MENU_LAIKA_X *= this.CANVAS_PIXEL_RATIO;
        this.MENU_LAIKA_Y *= this.CANVAS_PIXEL_RATIO;
        this.MENU_DIMITRI_X *= this.CANVAS_PIXEL_RATIO;
        this.MENU_DIMITRI_Y *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_FONT_SIZES[this.BUTTON_SIZES.SMALL] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_FONT_SIZES[this.BUTTON_SIZES.MEDIUM] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_FONT_SIZES[this.BUTTON_SIZES.LARGE] *= this.CANVAS_PIXEL_RATIO;
        this.BUTTON_INFO_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.DISCONNECTED_ICON_Y *= this.CANVAS_PIXEL_RATIO;
        this.DISCONNECTED_HEADER_Y *= this.CANVAS_PIXEL_RATIO;
        this.DISCONNECTED_HEADER_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.DISCONNECTED_HEADER_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.DISCONNECTED_MESSAGE_Y *= this.CANVAS_PIXEL_RATIO;
        this.DISCONNECTED_MESSAGE_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.DISCONNECTED_MESSAGE_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.USERNAME_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.USERNAME_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.TANK_NAME_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.JOIN_GAME_BUTTON_INFO_Y *= this.CANVAS_PIXEL_RATIO;
        this.JOIN_GAME_BUTTON_Y *= this.CANVAS_PIXEL_RATIO;
        this.RANDOM_GAME_BUTTON_INFO_Y *= this.CANVAS_PIXEL_RATIO;
        this.CREATE_GAME_BUTTON_INFO_Y *= this.CANVAS_PIXEL_RATIO;
        this.AVATAR_LAIKA_X *= this.CANVAS_PIXEL_RATIO;
        this.AVATAR_LAIKA_Y *= this.CANVAS_PIXEL_RATIO;
        this.AVATAR_DIMITRI_X *= this.CANVAS_PIXEL_RATIO;
        this.AVATAR_DIMITRI_Y *= this.CANVAS_PIXEL_RATIO;
        this.TANK_ICON_OUTLINE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.LEAVE_GAME_BUTTON_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.LEAVE_GAME_MESSAGE_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.LEAVE_GAME_MESSAGE_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.LEAVE_GAME_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.WAITING_ICON_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.WAITING_ICON_HEIGHT *= this.CANVAS_PIXEL_RATIO;
        this.WAITING_HEADER_Y *= this.CANVAS_PIXEL_RATIO;
        this.WAITING_HEADER_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.WAITING_HEADER_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.WAITING_MESSAGE_Y *= this.CANVAS_PIXEL_RATIO;
        this.WAITING_MESSAGE_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.WAITING_MESSAGE_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.CELEBRATION_HEADER_Y *= this.CANVAS_PIXEL_RATIO;
        this.CELEBRATION_HEADER_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.CELEBRATION_HEADER_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.CELEBRATION_TIE_Y *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_EXPLOSION_Y *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_EXPLOSION_MIN_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_EXPLOSION_MAX_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_EXPLOSION_MIN_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_EXPLOSION_MAX_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_EXPLOSION_DRAG_X *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_EXPLOSION_DRAG_Y *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_EXPLOSION_FLOOR_Y *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_FRAGMENT_MIN_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_FRAGMENT_MAX_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_FRAGMENT_GRAVITY *= this.CANVAS_PIXEL_RATIO;
        this.TROPHY_BASE_FRAGMENT_EXPLOSION_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_MIN_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_MAX_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_MIN_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_MAX_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_DRAG *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_GRAVITY *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_WOBBLE_AMPLITUDE *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_WOBBLE_KICK_IN_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.CONFETTI_Y_VARIATION *= this.CANVAS_PIXEL_RATIO;
        this.STREAMER_MIN_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.STREAMER_MAX_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.STREAMER_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.STREAMER_AMPLITUDE_X *= this.CANVAS_PIXEL_RATIO;
        this.STREAMER_AMPLITUDE_Y *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_MAX_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_MAX_HEIGHT *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_SIDE_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_MIN_WIDTH_PER_ICON *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_INTERLEAVE_HEIGHT *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_INTERLEAVE_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_ICON_BOTTOM_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_NAME_BOTTOM_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.TANK_PANEL_SCORE_BOTTOM_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.RANK_LEVEL_DOWN_SHAKE_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.RANK_LEVEL_DOWN_TEAR_MIN_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.RANK_LEVEL_DOWN_TEAR_RANDOM_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.RANK_LEVEL_DOWN_TEAR_Y_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_EXPLOSION_Y *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_EXPLOSION_MIN_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_EXPLOSION_MAX_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_EXPLOSION_MIN_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_EXPLOSION_MAX_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_EXPLOSION_DRAG *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_FRAGMENT_MIN_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_FRAGMENT_MAX_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.SCORE_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.PLAYER_PANEL_GRAVITY *= this.CANVAS_PIXEL_RATIO;
        this.ROUND_TITLE_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.ROUND_TITLE_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.ROUND_RANKED_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.ROUND_TITLE_SPACING *= this.CANVAS_PIXEL_RATIO;
        this.ROUND_TITLE_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.TIMER_TOP_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.TIMER_SPACING *= this.CANVAS_PIXEL_RATIO;
        this.TIMER_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.TIMER_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.STORM_ZONE_TILE_SPRITE_RESOLUTION *= this.CANVAS_PIXEL_RATIO;
        this.STORM_ZONE_TILE_SPRITE_RANDOM_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.STORM_ZONE_TILE_SPRITE_SCROLL_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.MAZE_SIDE_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.MAZE_TOP_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.MAZE_BOTTOM_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.TANK_EXPLOSION_CAMERA_SHAKE *= this.CANVAS_PIXEL_RATIO;
        this.MAX_CAMERA_SHAKE *= this.CANVAS_PIXEL_RATIO;
        this.CAMERA_SHAKE_FADE *= this.CANVAS_PIXEL_RATIO;
        this.CONNECTION_ERROR_MESSAGE_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.CONNECTION_ERROR_MESSAGE_FONT_SIZE *= this.CANVAS_PIXEL_RATIO;
        this.CONNECTION_ERROR_MESSAGE_STROKE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.GARAGE_TANK_ICON_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.SPRAY_CAN_DRAG_MARGIN *= this.CANVAS_PIXEL_RATIO;
        this.GARAGE_SPRAY_SHAKE_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.SPRAY_MIN_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SPRAY_MAX_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SPRAY_MIN_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SPRAY_MAX_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.SPRAY_DRAG *= this.CANVAS_PIXEL_RATIO;
        this.SPRAY_RADIUS *= this.CANVAS_PIXEL_RATIO;
        this.SPRAY_INNER_RADIUS *= this.CANVAS_PIXEL_RATIO;
        this.GARAGE_MAX_DRAG_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.GARAGE_TANK_ICON_SCROLL_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.GARAGE_BOX_SCROLL_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.GARAGE_ACCESSORY_SCROLL_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.GARAGE_BUTTON_SCROLL_OFFSET *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SMOKE_MIN_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SMOKE_MAX_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SMOKE_MIN_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SMOKE_MAX_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SMOKE_INNER_RADIUS *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SMOKE_RADIUS *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SPARK_MIN_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SPARK_MAX_X_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SPARK_MIN_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SPARK_MAX_Y_SPEED *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SPARK_LENGTH *= this.CANVAS_PIXEL_RATIO;
        this.WELDER_SPARK_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.SCRAPYARD_PLATE_WIDTH *= this.CANVAS_PIXEL_RATIO;
        this.SCRAPYARD_PLATE_HEIGHT *= this.CANVAS_PIXEL_RATIO;
        this.SCRAPYARD_PLATE_SPACING *= this.CANVAS_PIXEL_RATIO;
    }
}
