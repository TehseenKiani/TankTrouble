import { AIs } from "../../ais.js";
import { Box2D } from "../../box2d.js";
import { Constants } from "../../constants.js";
import { Game } from "./game.js";
import { GameModel } from "../../gamemodel.js";
import { RoundModel } from "../../roundmodel.js";
import { TTClient } from "../../ttclient.js";
import { TankTrouble } from "../../../tanktrouble.js";
import { Upgrade } from "../../upgrade.js";
import { Weapon } from "../../weapon.js";
import { Zone } from "../../zone.js";
import { ClientManager } from "../../../clientmanager.js";
import { GameManager } from "../../../gamemanager.js";
import { GameSession } from "../../../gamesession.js";
import { IFrameManager } from "../../../iframemanager.js";
import { Images } from "../../../images.js";
import { Inputs } from "../../../inputs.js";
import { Log } from "../../log.js";
import { OverlayManager } from "../../../overlaymanager.js";
import { QualityManager } from "../../../qualitymanager.js";
import { UIAimerGraphics } from "./uiaimergraphics.js";
import { UIButtonGroup } from "../uibuttongroup.js";
import { UICelebrationTrophyGroup } from "./uicelebrationtrophygroup.js";
import { UIChatSymbolImage } from "./uichatsymbolimage.js";
import { UIColouredSmokeEmitter } from "./uicolouredsmokeemitter.js";
import { UIConstants } from "../uiconstants.js";
import { UICountDownImage } from "./uicountdownimage.js";
import { UICounterOvertimeGroup } from "./uicounterovertimegroup.js";
import { UICounterTimerGroup } from "./uicountertimergroup.js";
import { UICrateSprite } from "./uicratesprite.js";
import { UIDiamondShineGroup } from "./uidiamondshinegroup.js";
import { UIDiamondSprite } from "./uidiamondsprite.js";
import { UIDustEmitter } from "./uidustemitter.js";
import { UIExplosionGroup } from "./uiexplosiongroup.js";
import { UIGoldSprite } from "./uigoldsprite.js";
import { UILaserGraphics } from "./uilasergraphics.js";
import { UILeaveGameButtonGroup } from "./uileavegamebuttongroup.js";
import { UIMineSprite } from "./uiminesprite.js";
import { UIMissileImage } from "./uimissileimage.js";
import { UIMissileLaunchEmitter } from "./uimissilelaunchemitter.js";
import { UIPlayerPanel } from "../playerpanel/uiplayerpanel.js";
import { UIProjectileImage } from "./uiprojectileimage.js";
import { UIPuffSprite } from "./uipuffsprite.js";
import { UIRoundTitleGroup } from "./uiroundtitlegroup.js";
import { UIRubbleGroup } from "./uirubblegroup.js";
import { UIShieldSparkGroup } from "./uishieldsparkgroup.js";
import { UIShieldSprite } from "./uishieldsprite.js";
import { UIShrapnelImage } from "./uishrapnelimage.js";
import { UISparkleImage } from "./uisparkleimage.js";
import { UISpawnZoneSprite } from "./uispawnzonesprite.js";
import { UIStormZoneGroup } from "./uistormzonegroup.js";
import { UITankExplosionGroup } from "./uitankexplosiongroup.js";
import { UITankFeatherSprite } from "./uitankfeathersprite.js";
import { UITankNameGroup } from "./uitanknamegroup.js";
import { UITankSprite } from "./uitanksprite.js";
import { UIUtils } from "../uiutils.js";
import { UIWaitingIconGroup } from "../uiwaitingicongroup.js";
import { UIWeaponSymbolGroup } from "./uiweaponsymbolgroup.js";
import { Users } from "../../../users.js";

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - input - a reference to the Phaser.Input input manager
 *
*/
class UIGameState {
    gameController = null;
    gameGroup = null;
    mazeFloorGroup = null;
    spawnZoneGroup = null;
    rubbleGroup = null;
    dustGroup = null;
    crateGroup = null;
    mineGroup = null;
    goldGroup = null;
    diamondShineGroup = null;
    diamondGroup = null;
    sparkleGroup = null;
    projectileGroup = null;
    shrapnelGroup = null;
    missileGroup = null;
    missileSmokeGroup = null;
    aimerGroup = null;
    laserGroup = null;
    tankGroup = null;
    mazeWallGroup = null;
    tankExplosionGroup = null;
    tankFeatherGroup = null;
    bulletPuffGroup = null;
    missileLaunchGroup = null;
    explosionGroup = null;
    mazeWallDecorationGroup = null;
    shieldGroup = null;
    shieldSparkGroup = null;
    stormZoneGroup = null;
    tankSprites = {};
    collectibles = {};
    projectiles = {};
    traps = {};
    upgrades = {};
    counters = {};
    zones = {};
    overlayGroup = null;
    overtimeGroup = null;
    counterTimerGroup = null;
    countDownGroup = null;
    tankNameGroup = null;
    chatSymbolGroup = null;
    weaponSymbolGroup = null;
    leaveGameGroup = null;
    chatSymbolSprites = {};
    weaponSymbolGroups = {};
    countDownSounds = new Array(UIConstants.COUNT_DOWN_AUDIO_COUNT);
    emptyBarrelSounds = new Array(UIConstants.EMPTY_BARREL_AUDIO_COUNT);
    fireBulletSounds = new Array(UIConstants.FIRE_BULLET_AUDIO_COUNT);
    bulletBounceSounds = new Array(UIConstants.BULLET_BOUNCE_AUDIO_COUNT);
    shieldImpactSounds = new Array(UIConstants.SHIELD_IMPACT_AUDIO_COUNT);
    fireLaserSound = null;
    fireShotgunSound = null;
    fireMissileSound = null;
    homingMissileTargetChangeSound = null;
    homingMissileTargetingSounds = new Array(UIConstants.MISSILE_TARGETING_AUDIO_COUNT);
    fireMineSound = null;
    chargeGatlingGunSounds = new Array(UIConstants.TANK_POOL_SIZE);
    holdGatlingGunSounds = new Array(UIConstants.TANK_POOL_SIZE);
    dischargeGatlingGunSounds = new Array(UIConstants.TANK_POOL_SIZE);
    mineActivateSound = null;
    mineTripSound = null;
    mineDetonateSound = null;
    mineExplosionSounds = new Array(UIConstants.MINE_EXPLOSION_AUDIO_COUNT);
    shrapnelHitSounds = new Array(UIConstants.SHRAPNEL_HIT_AUDIO_COUNT);
    laserPickupSound = null;
    doubleBarrelPickupSound = null;
    shotgunPickupSound = null;
    missilePickupSound = null;
    minePickupSound = null;
    gatlingGunPickupSound = null;
    shieldPickupSound = null;
    weaponLoadSound = null;
    tankExplosionSounds = new Array(UIConstants.TANK_EXPLOSION_AUDIO_COUNT);
    bulletPuffSounds = new Array(UIConstants.BULLET_PUFF_AUDIO_COUNT);
    chickenOutSound = null;
    shieldActivateSound = null;
    shieldWeakenedSound = null;
    shieldEndSound = null;
    spawnZoneTearingSound = null;
    spawnZoneOpenSound = null;
    spawnZoneUnstableSound = null;
    spawnZoneCollapseSound = null;
    winnerCelebrationSound = null;
    maze = null;
    roundEnded = false;
    celebrationDuration = 0.0;
    roundTitleDelayDuration = 0.0;
    roundTitleShown = false;
    nextVictoryAward = null;
    waitingIconGroup = null;
    waitingTime = 0;
    roundTitleGroup = null;
    betweenRoundsDuration = 0;
    celebrationTrophyGroup = null;
    cameraShake = 0;
    log = null;

    init(gameController) {
        this.gameController = gameController;
    }

    preload() {
        // Trigger load of images used for "breaking out" of Phaser canvas.
        // This prevents a one-frame flicker when breaking out first time.
        const goldImage = $(`<img class='hidden' ${Images.attributes("atlases/game/gold.png")}>`);
        const diamondImage = $(`<img class='hidden' ${Images.attributes("atlases/game/diamond.png")}>`);
        const diamondGlowImage = $(`<img class='hidden' ${Images.attributes("atlases/game/diamondGlow.png")}>`);
        const diamondRayImage = $(`<img class='hidden' ${Images.attributes("atlases/game/diamondRays.png")}>`);
        $("body").append(goldImage).append(diamondImage).append(diamondGlowImage).append(diamondRayImage);
    }

    create() {
        // Create log.
        this.log = new Log("UIGameState");

        // Initialise physics system for UI elements
        UIUtils.initUIGamePhysics(this.game);

        // Create sounds.
        for (let i = 0; i < UIConstants.COUNT_DOWN_AUDIO_COUNT; ++i) {
            this.countDownSounds[i] = this.game.add.audio(`countDown${i}`);
        }
        for (let i = 0; i < UIConstants.EMPTY_BARREL_AUDIO_COUNT; ++i) {
            this.emptyBarrelSounds[i] = this.game.add.audio(`emptyBarrel${i}`);
        }
        for (let i = 0; i < UIConstants.FIRE_BULLET_AUDIO_COUNT; ++i) {
            this.fireBulletSounds[i] = this.game.add.audio(`fireBullet${i}`);
        }
        for (let i = 0; i < UIConstants.BULLET_BOUNCE_AUDIO_COUNT; ++i) {
            this.bulletBounceSounds[i] = this.game.add.audio(`bulletBounce${i}`);
        }
        for (let i = 0; i < UIConstants.SHIELD_IMPACT_AUDIO_COUNT; ++i) {
            this.shieldImpactSounds[i] = this.game.add.audio(`shieldImpact${i}`);
        }
        this.fireLaserSound = this.game.add.audio("fireLaser", 0.5);
        this.fireShotgunSound = this.game.add.audio("fireShotgun");
        this.fireMissileSound = this.game.add.audio("fireMissile");
        for (let i = 0; i < UIConstants.TANK_POOL_SIZE; ++i) {
            this.chargeGatlingGunSounds[i] = this.game.add.audio("chargeGatlingGun");
            this.holdGatlingGunSounds[i] = this.game.add.audio("holdGatlingGun");
            this.dischargeGatlingGunSounds[i] = this.game.add.audio("dischargeGatlingGun");
        }
        this.homingMissileTargetChangeSound = this.game.add.audio("homingMissileTargetChange");
        for (let i = 0; i < UIConstants.MISSILE_TARGETING_AUDIO_COUNT; ++i) {
            this.homingMissileTargetingSounds[i] = this.game.add.audio(`homingMissileTargeting${i}`);
        }
        this.fireMineSound = this.game.add.audio("fireMine");
        this.mineActivateSound = this.game.add.audio("mineActivate");
        this.mineTripSound = this.game.add.audio("mineTrip");
        this.mineDetonateSound = this.game.add.audio("mineDetonate");
        for (let i = 0; i < UIConstants.MINE_EXPLOSION_AUDIO_COUNT; ++i) {
            this.mineExplosionSounds[i] = this.game.add.audio(`mineExplosion${i}`);
        }
        for (let i = 0; i < UIConstants.SHRAPNEL_HIT_AUDIO_COUNT; ++i) {
            this.shrapnelHitSounds[i] = this.game.add.audio(`shrapnelHit${i}`);
        }
        this.laserPickupSound = this.game.add.audio("laserPickup");
        this.doubleBarrelPickupSound = this.game.add.audio("doubleBarrelPickup");
        this.shotgunPickupSound = this.game.add.audio("shotgunPickup");
        this.missilePickupSound = this.game.add.audio("missilePickup");
        this.minePickupSound = this.game.add.audio("minePickup");
        this.gatlingGunPickupSound = this.game.add.audio("gatlingGunPickup");
        this.shieldPickupSound = this.game.add.audio("shieldPickup");
        this.weaponLoadSound = this.game.add.audio("weaponLoad");
        for (let i = 0; i < UIConstants.TANK_EXPLOSION_AUDIO_COUNT; ++i) {
            this.tankExplosionSounds[i] = this.game.add.audio(`tankExplosion${i}`);
        }
        for (let i = 0; i < UIConstants.BULLET_PUFF_AUDIO_COUNT; ++i) {
            this.bulletPuffSounds[i] = this.game.add.audio(`bulletPuff${i}`);
        }
        this.chickenOutSound = this.game.add.audio("chickenOut");
        this.shieldActivateSound = this.game.add.audio("shieldActivate");
        this.shieldWeakenedSound = this.game.add.audio("shieldWeakened");
        this.shieldEndSound = this.game.add.audio("shieldEnd");
        this.spawnZoneTearingSound = this.game.add.audio("spawnZoneTear");
        this.spawnZoneOpenSound = this.game.add.audio("spawnZoneOpen");
        this.spawnZoneUnstableSound = this.game.add.audio("spawnZoneUnstable");
        this.spawnZoneCollapseSound = this.game.add.audio("spawnZoneCollapse");
        this.winnerCelebrationSound = this.game.add.audio("winnerCelebration");
        this.tieSound = this.game.add.audio("poop");

        // Create waiting icon.
        this.waitingIconGroup = this.game.add.existing(new UIWaitingIconGroup(this.game));

        // Create game group to hold all things in the game.
        this.gameGroup = this.game.add.group();

        // Create overlay group to hold all UI which should be above game.
        this.overlayGroup = this.game.add.group();
        this.overlayGroup.fixedToCamera = true;

        // Create overtime counter group.
        this.overtimeGroup = this.overlayGroup.add(new UICounterOvertimeGroup(this.game));

        // Create counter timer group.
        this.counterTimerGroup = this.game.add.group(this.overlayGroup);

        // Add pool of counter timer groups.
        for (let i = 0; i < UIConstants.COUNTER_TIMER_POOL_SIZE; ++i) {
            this.counterTimerGroup.add(new UICounterTimerGroup(this.game, this.gameController));
        }

        // Create round title group.
        this.roundTitleGroup = this.overlayGroup.add(new UIRoundTitleGroup(this.game));

        // Create count down group.
        this.countDownGroup = this.game.add.group(this.overlayGroup);

        // Add pool of count down images.
        for (let i = 0; i < UIConstants.COUNT_DOWN_POOL_SIZE; ++i) {
            this.countDownGroup.add(new UICountDownImage(this.game));
        }

        if (Constants.getMode() === Constants.MODE_CLIENT_ONLINE) {
            // Create delayed leave game sprite if online client.
            this.leaveGameGroup = this.overlayGroup.add(new UILeaveGameButtonGroup(this.game, this.game.width - UIConstants.LEAVE_GAME_MARGIN, UIConstants.LEAVE_GAME_MARGIN, this.gameController));
            this.leaveGameGroup.spawn();
        } else if (Constants.getMode() === Constants.MODE_CLIENT_LOCAL) {
            // Create immediate leave game sprite if local client.
            this.leaveGameGroup = this.overlayGroup.add(new UIButtonGroup(this.game, this.game.width - UIConstants.LEAVE_GAME_MARGIN, UIConstants.LEAVE_GAME_MARGIN, "Warning", UIConstants.BUTTON_SIZES.MEDIUM, "X", () => { this.gameController.endGame(); }, this, 0, Phaser.Keyboard.ESC));
            this.leaveGameGroup.spawn();
        }

        // Create celebration icons.
        this.celebrationTrophyGroup = this.game.add.existing(new UICelebrationTrophyGroup(this.game, this.winnerCelebrationSound, this.tieSound));

        // Create the groups in the order they should sort:

        // Create maze floor group.
        this.mazeFloorGroup = this.game.add.group(this.gameGroup);

        // Create spawn zone group.
        this.spawnZoneGroup = this.game.add.group(this.gameGroup);

        // Create rubble group.
        this.rubbleGroup = this.gameGroup.add(new UIRubbleGroup(this.game));

        // Create dust group.
        this.dustGroup = this.game.add.group(this.gameGroup);

        // Create crate group.
        this.crateGroup = this.game.add.group(this.gameGroup);

        // Create mine group.
        this.mineGroup = this.game.add.group(this.gameGroup);

        // Create tank group.
        this.tankGroup = this.game.add.group(this.gameGroup);

        // Create gold group.
        this.goldGroup = this.game.add.group(this.gameGroup);

        // Create diamond shine group.
        this.diamondShineGroup = this.game.add.group(this.gameGroup);

        // Create diamond group.
        this.diamondGroup = this.game.add.group(this.gameGroup);

        // Create sparkle group.
        this.sparkleGroup = this.game.add.group(this.gameGroup);

        // Create projectile group.
        this.projectileGroup = this.game.add.group(this.gameGroup);

        // Create shrapnel group.
        this.shrapnelGroup = this.game.add.group(this.gameGroup);

        // Create missile smoke group.
        this.missileSmokeGroup = this.game.add.group(this.gameGroup);

        // Create missile group.
        this.missileGroup = this.game.add.group(this.gameGroup);

        // Create aimer group.
        this.aimerGroup = this.game.add.group(this.gameGroup);

        // Create laser group.
        this.laserGroup = this.game.add.group(this.gameGroup);

        // Create maze wall group.
        this.mazeWallGroup = this.game.add.group(this.gameGroup);

        // Create tank explosion group.
        this.tankExplosionGroup = this.game.add.group(this.gameGroup);

        // Create bullet puff group.
        this.bulletPuffGroup = this.game.add.group(this.gameGroup);

        // Create missile launch group.
        this.missileLaunchGroup = this.game.add.group(this.gameGroup);

        // Create explosion group.
        this.explosionGroup = this.game.add.group(this.gameGroup);

        // Create tank feather group.
        this.tankFeatherGroup = this.game.add.group(this.gameGroup);

        // Create maze wall decoration group.
        this.mazeWallDecorationGroup = this.game.add.group(this.gameGroup);

        // Create shield group.
        this.shieldGroup = this.game.add.group(this.gameGroup);

        // Create shield spark group.
        this.shieldSparkGroup = this.gameGroup.add(new UIShieldSparkGroup(this.game));

        // Create storm zone group.
        this.stormZoneGroup = this.gameGroup.add(new UIStormZoneGroup(this.game, this.gameController));

        // Create tank name group.
        this.tankNameGroup = this.game.add.group(this.gameGroup);

        // Create chat symbol group.
        this.chatSymbolGroup = this.game.add.group(this.gameGroup);

        // Create weapon symbol group.
        this.weaponSymbolGroup = this.game.add.group(this.gameGroup);

        // Add dust.
        const dustEmitter = this.dustGroup.add(new UIDustEmitter(this.game));

        // Add missile launch smoke.
        const missileLaunchEmitter = this.missileLaunchGroup.add(new UIMissileLaunchEmitter(this.game));

        // Add pool of spawn zone sprites.
        for (let i = 0; i < UIConstants.SPAWN_ZONE_POOL_SIZE; ++i) {
            this.spawnZoneGroup.add(new UISpawnZoneSprite(this.game, this.gameController, this.spawnZoneTearingSound, this.spawnZoneOpenSound, this.spawnZoneUnstableSound, this.spawnZoneCollapseSound));
        }

        // Add pool of crates.
        for (let i = 0; i < UIConstants.CRATE_POOL_SIZE; ++i) {
            this.crateGroup.add(new UICrateSprite(this.game, this.gameController, dustEmitter));
        }

        // Add pool of golds.
        for (let i = 0; i < UIConstants.GOLD_POOL_SIZE; ++i) {
            this.goldGroup.add(new UIGoldSprite(this.game, this.gameController, this.sparkleGroup));
        }

        // Add pool of diamond shine effects.
        for (let i = 0; i < UIConstants.DIAMOND_SHINE_POOL_SIZE; ++i) {
            this.diamondShineGroup.add(new UIDiamondShineGroup(this.game));
        }

        // Add pool of diamonds.
        for (let i = 0; i < UIConstants.DIAMOND_POOL_SIZE; ++i) {
            this.diamondGroup.add(new UIDiamondSprite(this.game, this.gameController, this.diamondShineGroup, this.sparkleGroup));
        }

        // Add pool of sparkles.
        for (let i = 0; i < UIConstants.SPARKLE_POOL_SIZE; ++i) {
            this.sparkleGroup.add(new UISparkleImage(this.game));
        }

        // Add pool of projectiles
        for (let i = 0; i < UIConstants.PROJECTILE_POOL_SIZE; ++i) {
            this.projectileGroup.add(new UIProjectileImage(this.game, this.gameController));
        }

        // Add pool of shrapnel
        for (let i = 0; i < UIConstants.SHRAPNEL_POOL_SIZE; ++i) {
            this.shrapnelGroup.add(new UIShrapnelImage(this.game, this.gameController));
        }

        // Add pool of missiles and missile smoke
        for (let i = 0; i < UIConstants.MISSILE_POOL_SIZE; ++i) {
            const missile = this.missileGroup.add(new UIMissileImage(this.game, this.gameController, this.homingMissileTargetingSounds));
            const missileSmokeEmitter = this.missileSmokeGroup.add(new UIColouredSmokeEmitter(this.game, missile, UIConstants.MISSILE_SMOKE_COLOUR));
            missile.setSmokeEmitter(missileSmokeEmitter);
        }

        // Add pool of mines
        for (let i = 0; i < UIConstants.MINE_POOL_SIZE; ++i) {
            this.mineGroup.add(new UIMineSprite(this.game, this.gameController, this.mineActivateSound, this.mineTripSound, this.mineDetonateSound));
        }

        // Add pool of aimers
        for (let i = 0; i < UIConstants.AIMER_POOL_SIZE; ++i) {
            this.aimerGroup.add(new UIAimerGraphics(this.game, this.gameController));
        }

        // Add pool of lasers
        for (let i = 0; i < UIConstants.LASER_POOL_SIZE; ++i) {
            this.laserGroup.add(new UILaserGraphics(this.game, this.gameController));
        }

        // Add pool of tanks.
        for (let i = 0; i < UIConstants.TANK_POOL_SIZE; ++i) {
            this.tankGroup.add(new UITankSprite(this.game, this.gameController, this.emptyBarrelSounds, this.fireBulletSounds, this.fireLaserSound, this.fireShotgunSound, this.fireMissileSound, this.fireMineSound, this.chargeGatlingGunSounds[i], this.holdGatlingGunSounds[i], this.dischargeGatlingGunSounds[i],
                this.laserPickupSound, this.doubleBarrelPickupSound, this.shotgunPickupSound, this.missilePickupSound, this.minePickupSound, this.gatlingGunPickupSound, this.shieldPickupSound, this.weaponLoadSound, dustEmitter, missileLaunchEmitter));
        }

        // Add pool of tank explosions.
        for (let i = 0; i < UIConstants.TANK_EXPLOSION_POOL_SIZE; ++i) {
            this.tankExplosionGroup.add(new UITankExplosionGroup(this.game, this.tankExplosionSounds));
        }

        // Add pool of bullet puffs.
        for (let i = 0; i < UIConstants.BULLET_PUFF_POOL_SIZE; ++i) {
            this.bulletPuffGroup.add(new UIPuffSprite(this.game));
        }

        // Add pool of explosions.
        for (let i = 0; i < UIConstants.EXPLOSION_POOL_SIZE; ++i) {
            this.explosionGroup.add(new UIExplosionGroup(this.game));
        }

        // Add pool of tank feathers.
        for (let i = 0; i < UIConstants.TANK_FEATHER_POOL_SIZE; ++i) {
            this.tankFeatherGroup.add(new UITankFeatherSprite(this.game));
        }

        // Add pool of shield sprites.
        for (let i = 0; i < UIConstants.SHIELD_POOL_SIZE; ++i) {
            this.shieldGroup.add(new UIShieldSprite(this.game, this.gameController, this.shieldActivateSound, this.shieldWeakenedSound, this.shieldEndSound));
        }

        // Add pool of tank names.
        for (let i = 0; i < UIConstants.TANK_NAME_POOL_SIZE; ++i) {
            this.tankNameGroup.add(new UITankNameGroup(this.game, this.gameController));
        }

        // Add pool of chat symbol sprites.
        for (let i = 0; i < UIConstants.CHAT_SYMBOL_POOL_SIZE; ++i) {
            this.chatSymbolGroup.add(new UIChatSymbolImage(this.game, this.gameController));
        }

        // Add pool of weapon symbol stacks.
        for (let i = 0; i < UIConstants.WEAPON_SYMBOL_POOL_SIZE; ++i) {
            this.weaponSymbolGroup.add(new UIWeaponSymbolGroup(this.game, this.gameController));
        }

        // Create debug graphics.
        this.debugGraphics = this.game.add.graphics(0, 0, this.gameGroup);

        // Reset QualityManager.
        QualityManager.reset();

        // Register game controller with GameManager.
        GameSession.setGameController(this.gameController);

        // Add event listeners.
        this.gameController.addGameEventListener(this._gameEventHandler, this);
        this.gameController.addRoundEventListener(this._roundEventHandler, this);

        ClientManager.getClient().addEventListener(this._clientEventHandler, this);

        if (Constants.getMode() === Constants.MODE_CLIENT_ONLINE) {
            // Only set up client state listener if online client.
            ClientManager.getClient().addStateChangeListener(this._clientStateChangeHandler, this);

            // Try and request first maze. It might not be ready at this point if the game is newly created.
            ClientManager.getClient().requestMaze();

            // Try and set up game state and expanded round state.
            const gameState = ClientManager.getClient().getGameState();
            if (gameState) {
                this.gameController.setGameState(gameState);
            }
            const expandedRoundState = ClientManager.getClient().getExpandedRoundState();
            if (expandedRoundState) {
                this.gameController.setRoundState(expandedRoundState);
            }
        } else if (Constants.getMode() === Constants.MODE_CLIENT_LOCAL) {
            // Only set up users listener if local client.
            Users.addEventListener(this._authenticationEventHandler, this);
        }

        this.game.onFocus.add(this._onFocusHandler, this);
        this.game.onBlur.add(this._onBlurHandler, this);

        this.scale.onSizeChange.add(this._onSizeChangeHandler, this);

        // State.
        this.waitingTime = 0;
        this.betweenRoundsDuration = 0;
        this.roundEnded = false;
        this.celebrationDuration = UIConstants.WAITING_FOR_CELEBRATION_TIME;
        this.roundTitleDelayDuration = 0;
        this.roundTitleShown = false;
        this.nextVictoryAward = null;
        this.cameraShake = 0;
    }

    shutdown() {
        // Retire the UI.
        this._retireUI();

        // Remove event listeners.
        this.gameController.removeGameEventListener(this._gameEventHandler, this);
        this.gameController.removeRoundEventListener(this._roundEventHandler, this);

        ClientManager.getClient().removeEventListener(this._clientEventHandler, this);

        if (Constants.getMode() === Constants.MODE_CLIENT_ONLINE) {
            // Only take down client state listener if online client.
            ClientManager.getClient().removeStateChangeListener(this._clientStateChangeHandler, this);
        } else if (Constants.getMode() === Constants.MODE_CLIENT_LOCAL) {
            // Only take down users listener if local client.
            Users.removeEventListener(this._authenticationEventHandler, this);
            // Only remove all AI managers if local client.
            AIs.removeAllAIManagers();
        }

        this.game.onFocus.remove(this._onFocusHandler, this);
        this.game.onBlur.remove(this._onBlurHandler, this);

        this.scale.onSizeChange.remove(this._onSizeChangeHandler, this);
    }

    _onFocusHandler(event) {
        this.log.debug("FOCUS!");
        // Remove focus from other UI elements that might grab it upon refocusing of the page.
        // FIXME Perhaps pass a general UI object to which has its own blur method so the gamestate does need to know each UI component.
        setTimeout(() => {
            TankTrouble.ChatBox.blur();
        }, 100);
    }

    _onBlurHandler(event) {
        this.log.debug("BLUR!");
    }

    _onSizeChangeHandler() {
        this.log.debug("SIZE CHANGE!");
        const localBounds = this.gameGroup.getLocalBounds();
        const unscaledMazeWidth = localBounds.width;
        const unscaledMazeHeight = localBounds.height;
        const unscaledMazeOffsetX = -localBounds.x;
        const unscaledMazeOffsetY = -localBounds.y;

        // Leave a small gap on the sides, and a larger one at the bottom.
        // Mobile fills its arena; desktop retains the original maximum scale.
        let gameScale = Math.min(document.body.classList.contains("touch-mode") ? Infinity : 2.0, Math.min((this.game.width - UIConstants.MAZE_SIDE_MARGIN) / unscaledMazeWidth, (this.game.height - (document.body.classList.contains("touch-mode") ? UIConstants.MAZE_TOP_MARGIN : UIConstants.MAZE_BOTTOM_MARGIN) - UIConstants.MAZE_TOP_MARGIN) / unscaledMazeHeight));
        // Round the scale to a whole percent.
        gameScale = Math.floor(gameScale * 100.0) / 100.0;
        this.gameGroup.scale.set(gameScale, gameScale);
        // FIXME: Do the rest of the adaptive layout.
        // Place the maze at a whole pixel.
        this.gameGroup.position.set(Math.ceil(((this.game.width - this.gameGroup.width) * 0.5) + (unscaledMazeOffsetX * gameScale)), Math.ceil(UIConstants.MAZE_TOP_MARGIN + (unscaledMazeOffsetY * gameScale)));

        this.overtimeGroup.position.x = this.game.width / 2.0;

        this.counterTimerGroup.position.x = this.game.width / 2.0;

        this.roundTitleGroup.position.set(this.game.width / 2.0, (this.game.height / 2.0) + UIConstants.ROUND_TITLE_OFFSET);

        this.countDownGroup.position.set(this.game.width / 2.0, this.game.height / 2.0);

        this.leaveGameGroup.position.x = this.game.width - UIConstants.LEAVE_GAME_MARGIN;

        this.waitingIconGroup.position.set(this.game.width / 2.0, this.game.height / 3.0);

        this.celebrationTrophyGroup.position.set(this.game.width / 2.0, this.game.height / 2.0);
    }

    update() {
        // Handle online client specific things.
        if (Constants.getMode() === Constants.MODE_CLIENT_ONLINE) {
            this.celebrationDuration += this.game.time.delta;

            // Show round title if it has not been shown within delay, indicating that the player joined mid-round.
            if (!this.roundTitleShown && !this.roundEnded && this.maze) {
                this.roundTitleDelayDuration += this.game.time.delta;
                if (this.roundTitleDelayDuration > UIConstants.WAITING_FOR_ROUND_TITLE_TIME) {
                    this._spawnRoundTitle(UIConstants.GAME_MODE_NAME_INFO[this.gameController.getMode()].NAME, this.gameController.getRanked());
                }
            }

            // Clean up the maze if staying between rounds for too long, indicating that no other players are ready for battle.
            if (this.roundEnded && this.maze) {
                this.betweenRoundsDuration += this.game.time.delta;
                if (this.betweenRoundsDuration > UIConstants.WAITING_FOR_MAZE_REMOVAL_TIME) {
                    this._cleanUp();
                }
            } else {
                this.betweenRoundsDuration = 0;
            }

            // If no maze is showing for a while, show waiting icon.
            if (!this.maze && this.celebrationDuration > UIConstants.WAITING_FOR_CELEBRATION_TIME) {
                this.waitingTime += this.game.time.delta;
                if (this.waitingTime >= UIConstants.WAITING_FOR_PLAYERS_DELAY_TIME && !this.waitingIconGroup.exists) {
                    // Clean up any potential celebrations.
                    this._cleanUp();

                    let message;
                    const header = UIConstants.GAME_MODE_NAME_INFO[this.gameController.getMode()].NAME;
                    const iconFrame = UIConstants.GAME_MODE_NAME_INFO[this.gameController.getMode()].ICON;
                    const premium = this.gameController.getPremium();
                    if (this.gameController.getTotalPlayerCount() < Constants.GAME_MODE_INFO[this.gameController.getMode()].MIN_PLAYERS) {
                        message = "Waiting for more players";
                    } else {
                        message = "Waiting for next round";
                    }
                    this.waitingIconGroup.spawn(this.game.width / 2.0, this.game.height / 3.0, true, message, header, iconFrame, premium);
                }
            } else {
                this.waitingTime = 0;
                if (this.waitingIconGroup.exists) {
                    this.waitingIconGroup.remove();
                }
            }
        }

        QualityManager.update();
        Inputs.update();
        AIs.update(this.game.time.delta);
        this.gameController.update();

        if (this.cameraShake >= 0) {
            const shakeX = (Math.random() * this.cameraShake) - (this.cameraShake / 2.0);
            const shakeY = (Math.random() * this.cameraShake) - (this.cameraShake / 2.0);

            this.game.world.setBounds(shakeX, shakeY, this.game.width + shakeX, this.game.height + shakeY);
            this.cameraShake -= UIConstants.CAMERA_SHAKE_FADE;
        }

        const tanks = this.gameController.getTanks();
        for (const tank in tanks) {
            if (Math.random() > UIConstants.INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_THE_OPEN) {
                this._spawnRubble(tanks[tank]);
            }
        }

        //this._debugDrawB2DWorld(this.gameController.getB2DWorld());
        //this._debugDrawWorld(this.game.world);
        // FIXME Wrap the following in _debugDrawAI
        /*if (this.gameController.getMaze()) {
            var position = null;
            for (var tank in tanks) {
                position = {x: Math.floor(tanks[tank].getX()/Constants.MAZE_TILE_SIZE.m), y: Math.floor(tanks[tank].getY()/Constants.MAZE_TILE_SIZE.m)};
                break;
            }
            if (position !== null) {
                var distances = this.gameController.getMaze().getDistancesFromPosition(position);
                if (distances) {
                    this._debugDrawMazeMap(distances, 0, 18, 0x00ff00, 0xff0000, 0.8);
                }
            }
        }*/
        /*if (this.gameController.getMaze()) {
            this._debugDrawMazeMap(this.gameController.getMaze().getDeadEndPenalties(), 0, Constants.MAZE_MAX_DEAD_END_PENALTY, 0xff0000, 0x00ff00, 0.8);
        }*/
        /*if (this.gameController.getMaze()) {
            var startPosition = null;
            var endPosition = null;
            for (var tank in tanks) {
                if (startPosition === null) {
                    startPosition = {x: Math.floor(tanks[tank].getX()/Constants.MAZE_TILE_SIZE.m), y: Math.floor(tanks[tank].getY()/Constants.MAZE_TILE_SIZE.m)};
                }
                else if (endPosition === null) {
                    endPosition = {x: Math.floor(tanks[tank].getX()/Constants.MAZE_TILE_SIZE.m), y: Math.floor(tanks[tank].getY()/Constants.MAZE_TILE_SIZE.m)};
                }
            }

            if (startPosition !== null && endPosition !== null) {
                this._debugDrawMazePath(this.gameController.getMaze().getShortestPathWithGraph(startPosition, endPosition, undefined, 1.0), 8, 0x00ff00, 0xff0000);
            }
        }*/
        /*if (this.gameController.getMaze()) {
            var startPosition = null;
            var fromPosition = null;
            for (var tank in tanks) {
                if (startPosition === null) {
                    startPosition = {x: Math.floor(tanks[tank].getX()/Constants.MAZE_TILE_SIZE.m), y: Math.floor(tanks[tank].getY()/Constants.MAZE_TILE_SIZE.m)};
                }
                else if (fromPosition === null) {
                    fromPosition = {x: Math.floor(tanks[tank].getX()/Constants.MAZE_TILE_SIZE.m), y: Math.floor(tanks[tank].getY()/Constants.MAZE_TILE_SIZE.m)};
                }
            }

            if (startPosition !== null && fromPosition !== null) {
                this._debugDrawMazePath(this.gameController.getMaze().getPathAwayFrom(startPosition, fromPosition, 10, 1), 8, 0x00ff00, 0xff0000);
            }
        }*/
        /*if (this.gameController.getMaze()) {
            var projectiles = this.gameController.getProjectiles();
            for (var projectile in projectiles) {
                // FIXME Take remaining lifetime into account? Probably do it from the caller.
                // remainingLength = Math.min(maxLength, currentDirection.Length() * (projectile.lifetime - projectile.getTimeAlive()));
                this._debugDrawPath(B2DUtils.calculateProjectilePath(this.gameController.getB2DWorld(), projectiles[projectile], 8, Constants.MAZE_TILE_SIZE.m * 10, false).path, 5, 0xffff00, 0xdddd00);
                break;
            }
        }*/
        /*if (this.gameController.getMaze()) {
            var selectedTank = null;
            var endPosition = null;
            for (var tank in tanks) {
                selectedTank = tanks[tank];
                break;
            }
            if (selectedTank !== null) {
                var position = {x: Math.floor(selectedTank.getX()/Constants.MAZE_TILE_SIZE.m), y: Math.floor(selectedTank.getY()/Constants.MAZE_TILE_SIZE.m)};

                var maze = this.gameController.getMaze();
                var threatMap = new MazeMap(maze.getWidth(), maze.getHeight(), 0);
                var projectiles = this.gameController.getProjectiles();
                for (var projectile in projectiles) {
                    var projectilePath = B2DUtils.calculateProjectilePath(this.gameController.getB2DWorld(), projectiles[projectile], 8, Constants.MAZE_TILE_SIZE.m * 10, false);
                    B2DUtils.splatPathUntoMazeMap(threatMap, projectilePath, Constants.MAZE_TILE_SIZE.m * 0.1, function (tile, length, stepSize) {
                        var distance = maze.getDistanceBetweenPositions(tile, position);
                        if (distance === false) {
                            return 0;
                        }

                        var projectileTimeToHere = length / new Phaser.Point(projectiles[projectile].getSpeedX(), projectiles[projectile].getSpeedY()).getMagnitude();
                        var tankTimeToHere = distance * Constants.MAZE_TILE_SIZE.m / Constants.TANK.FORWARD_SPEED.m;

                        return Math.min(1, Math.max(0, 1 - Math.abs(projectileTimeToHere - tankTimeToHere) * 0.25)) * 0.2 * stepSize;
                    });
                }
                for (var tank in tanks) {
                    if (tanks[tank] !== selectedTank) {
                        var firingPath = B2DUtils.calculateFiringPath(this.gameController.getB2DWorld(), tanks[tank], 0, 4, Constants.MAZE_TILE_SIZE.m * 4, false);
                        B2DUtils.splatPathUntoMazeMap(threatMap, firingPath, Constants.MAZE_TILE_SIZE.m * 0.1, function (tile, length, stepSize) {
                            return (1.0 - length / (Constants.MAZE_TILE_SIZE.m * 4)) * 0.2 * stepSize;
                        });
                        if (endPosition === null) {
                            endPosition = {x: Math.floor(tanks[tank].getX()/Constants.MAZE_TILE_SIZE.m), y: Math.floor(tanks[tank].getY()/Constants.MAZE_TILE_SIZE.m)};
                        }
                    }
                }
                this._debugDrawMazeMap(threatMap.data(), 0, 6, 0x00ff00, 0xff0000, 0.8);
                if (endPosition !== null) {
                    this._debugDrawMazePath(this.gameController.getMaze().getShortestPathWithGraph(position, endPosition, threatMap.data(), 0.1), 8, 0x00ff00, 0xff0000, false);
                }
            }
        }*/
        /*if (this.gameController.getMaze()) {
            for (var tank in tanks) {
                this._debugDrawPath(B2DUtils.calculateFiringPath(this.gameController.getB2DWorld(), tanks[tank], 0, 4, Constants.MAZE_TILE_SIZE.m * 10, false).path, 5, 0x00ff00, 0x00aa00);
                break;
            }
        }*/
    }

    render() {
        if (this.game.debug.text) {
            this.game.debug.text(this.game.time.fps, 2, 14, "#000000");
        }
    }

    getTankSprite(playerId) {
        return this.tankSprites[playerId];
    }

    _getTankPosition(playerId) {
        if (playerId in this.tankSprites) {
            const tank = this.tankSprites[playerId];

            const gameBounds = this.game.scale.bounds;
            const position = tank.toGlobal(new Phaser.Point(0, 0));

            // Scale from game canvas position to pixel position.
            Phaser.Point.divide(position, this.game.scale.scaleFactor, position);

            return { x: gameBounds.x + position.x, y: gameBounds.y + position.y };
        }
    }

    _getCollectiblePositionAngleAndScale(collectibleId) {
        if (collectibleId in this.collectibles) {
            const collectible = this.collectibles[collectibleId];

            const gameBounds = this.game.scale.bounds;
            const position = collectible.toGlobal(new Phaser.Point(0, 0));

            // Scale from game canvas position to pixel position.
            Phaser.Point.divide(position, this.game.scale.scaleFactor, position);

            const extraInfo = collectible.getExtraPositionInfo();
            const scale = collectible.worldScale.x;
            return { x: gameBounds.x + position.x, y: gameBounds.y + position.y, angle: collectible.angle, scale, extraInfo };
        }
    }

    _retireUI() {
        // Retire leave game group.
        this.leaveGameGroup.retire();

        // Clean up remaining UI.
        this._cleanUp();
        // FIXME: Finish retirement.
    }

    _gameEventHandler(self, id, evt, data) {
        self.log.debug(`Game ${id}: ${evt}: ${data}`);
        switch (evt) {
            case GameModel._EVENTS.COUNT_DOWN:
            {
                if (data === Constants.COUNTDOWN_START_VALUE) {
                    self._spawnRoundTitle(UIConstants.GAME_MODE_NAME_INFO[self.gameController.getMode()].NAME, self.gameController.getRanked());
                }

                self._spawnCountDown(data);
                break;
            }
            case GameModel._EVENTS.GAME_ENDED:
            {
                self._leaveState();
                break;
            }
        }
    }

    _roundEventHandler(self, id, evt, data) {
        self.log.debug(`Round ${id}: ${evt}: ${data}`);
        switch (evt) {
            case RoundModel._EVENTS.CELEBRATION_STARTED:
            {
                // Clean up any previous round.
                self._cleanUp();

                // Joining the game after ROUND_ENDED and before CELEBRATION_STARTED causes nextVictoryAward to be null.
                if (self.nextVictoryAward) {
                    // Reset celebration duration.
                    self.celebrationDuration = 0.0;

                    // Create celebration.
                    self._spawnCelebration(UIConstants.GAME_MODE_NAME_INFO[self.gameController.getMode()].NAME, self.nextVictoryAward);
                }

                break;
            }
            case RoundModel._EVENTS.ROUND_CREATED:
            {
                // Clean up any previous round or celebration.
                self._cleanUp();

                // Reset round ended.
                self.roundEnded = false;

                // Reset next victory award.
                self.nextVictoryAward = null;

                break;
            }
            case RoundModel._EVENTS.ROUND_STARTED:
            {
                Inputs.reset();
                AIs.reset();
                self._spawnCountDown(0);
                break;
            }
            case RoundModel._EVENTS.ROUND_ENDED:
            {
                // Mark round as ended.
                self.roundEnded = true;

                // If game mode has celebration ceremony, store award for later. Otherwise, hand it out right away.
                if (Constants.GAME_MODE_INFO[self.gameController.getMode()].HAS_CELEBRATION) {
                    self.nextVictoryAward = data;
                } else {
                    for (let i = 0; i < data.getPlayerIds().length; ++i) {
                        const playerId = data.getPlayerIds()[i];
                        GameManager.sendVictoryGoldToTank(playerId, data.getGoldAmountPerWinner(), self._getTankPosition(playerId));
                        GameManager.showXPChange(data.getExperiencePerWinner(), UIPlayerPanel.getLocalTankIconPosition(playerId), self.gameController.getRanked() ? 1200 : 0);
                    }

                    UIPlayerPanel.showRankChanges(data.getRankChanges());
                }

                // Freeze all UI specific animations such as smoke, puffs and explosions (and particles).
                self.game.physics.arcade.isPaused = true;
                // Freeze all UI p2 physics.
                self.game.physics.p2.paused = true;
                // Freeze all currently running tweens.
                self.game.tweens.removeAll();
                // Stop all playing sounds.
                self.game.sound.stopAll();
                // FIXME Freeze all currently running animations.

                if (IFrameManager.shouldNag()) {
                    // Show iframe overlay.
                    OverlayManager.enqueueOverlay(
                        TankTrouble.MessageOverlay,
                        {
                            headline: "Embedding detected",
                            message: `We hope you are enjoying TankTrouble!<br/><br/>This site has embedded the game without permission, thereby stealing our revenue, which pays for the development and servers.<br/>Please go to the original site to show your support and enjoy the game as it was intended.<br/><button class="medium" type="button" command="--open-url" data-url="${window.self.location}">Go to TankTrouble.com</button><br/>Thanks for playing!`,
                            canCancel: false
                        }
                    );

                    IFrameManager.updateLastNagTime();
                }

                break;
            }
            case RoundModel._EVENTS.MAZE_SET:
            {
                if (!self.maze) {
                    self.maze = data;
                    self._createMaze(data);
                    self._updateTheme(data.getTheme());
                    self._mazeLocalBoundsUpdated();
                    // Scale the maze correctly.
                    // FIXME Is this the cool way to handle this?
                    self._onSizeChangeHandler();
                } else {
                    self.log.debug("Attempt to set new maze when maze was already set.");
                }
                break;
            }
            case RoundModel._EVENTS.TANK_CHANGED:
            {
                if (Constants.getMode() === Constants.MODE_CLIENT_ONLINE) {
                    ClientManager.getClient().setTankState(data);
                }
                break;
            }
            case RoundModel._EVENTS.TANK_CREATED:
            {
                const smoothing = Users.isAnyUser(data.getPlayerId()) || Constants.getMode() === Constants.MODE_CLIENT_LOCAL ? UIConstants.TANK_LOCAL_SMOOTHING : UIConstants.TANK_ONLINE_SMOOTHING;
                self._createTank(data, self.gameController.getInitialRoundStateReceived(), smoothing);
                break;
            }
            case RoundModel._EVENTS.TANK_DESTROYED:
            {
                if (self._removeTank(data)) {
                    self._spawnTankExplosion(data);
                    self._addCameraShake(UIConstants.TANK_EXPLOSION_CAMERA_SHAKE);
                }
                break;
            }
            case RoundModel._EVENTS.TANK_KILLED:
            {
                if (self._removeTank(data.getVictimPlayerId())) {
                    self._spawnTankExplosion(data.getVictimPlayerId());
                    self._addCameraShake(UIConstants.TANK_EXPLOSION_CAMERA_SHAKE);
                    GameManager.showXPChange(data.getExperience(), UIPlayerPanel.getLocalTankIconPosition(data.getKillerPlayerId()), 0);
                }
                break;
            }
            case RoundModel._EVENTS.TANK_CHICKENED_OUT:
            {
                const tankPosition = self._getTankPosition(data.getPlayerId());

                if (self._removeTank(data.getPlayerId())) {
                    self._spawnTankFeathers(data.getPlayerId(), tankPosition);
                }

                const projectileIds = data.getProjectileIds();
                for (let i = 0; i < projectileIds.length; ++i) {
                    self._removeProjectile(projectileIds[i]);
                }

                const trapIds = data.getTrapIds();
                for (let i = 0; i < trapIds.length; ++i) {
                    self._removeTrap(trapIds[i]);
                }

                // FIXME Remove all other active weapons of this tank.
                break;
            }
            case RoundModel._EVENTS.PROJECTILE_CREATED:
            {
                self._createProjectile(data);
                break;
            }
            case RoundModel._EVENTS.PROJECTILE_DESTROYED:
            {
                self._removeProjectile(data);
                break;
            }
            case RoundModel._EVENTS.PROJECTILE_TIMEOUT:
            {
                self._removeProjectile(data);
                self._spawnProjectilePuffs(data);
                break;
            }
            case RoundModel._EVENTS.TRAP_CREATED:
            {
                self._createTrap(data);
                break;
            }
            case RoundModel._EVENTS.TRAP_DESTROYED:
            {
                const trap = self.gameController.getTrap(data);
                if (trap) {
                    if (trap.released()) {
                        self._releaseTrap(trap);
                    }
                }
                self._removeTrap(data);
                break;
            }
            case RoundModel._EVENTS.COLLECTIBLE_CREATED:
            {
                // Only play animation and sound if collectible is new. Otherwise, it will also play when someone joins in the middle of a battle.
                self._createCollectible(data, self.gameController.getInitialRoundStateReceived());
                break;
            }
            case RoundModel._EVENTS.COLLECTIBLE_DESTROYED:
            {
                self._startCollectibleAnimation(data);
                self._removeCollectible(data.getCollectibleId());
                break;
            }
            case RoundModel._EVENTS.TANK_SHIELD_COLLISION:
            {
                const shieldedTank = self.gameController.getTank(data.shieldA.getPlayerId());
                if (shieldedTank) {
                    if (Math.random() > UIConstants.INVERSE_SHIELD_SPARK_PROBABILITY_IN_COLLISION) {
                        self._bounceTankOnShield(data.tankA, shieldedTank, data.collisionPoint, true);
                    }
                    if (Math.random() > UIConstants.INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_COLLISION) {
                        self._spawnRubble(data.tankA);
                    }
                }
                break;
            }
            case RoundModel._EVENTS.PROJECTILE_SHIELD_COLLISION:
            {
                const shieldedTank = self.gameController.getTank(data.shieldA.getPlayerId());
                if (shieldedTank) {
                    self._bounceProjectileOnShield(data.projectile, shieldedTank, data.collisionPoint);
                }
                break;
            }
            case RoundModel._EVENTS.PROJECTILE_ZONE_COLLISION:
            {
                // FIXME: Handle.
                break;
            }
            case RoundModel._EVENTS.SHIELD_SHIELD_COLLISION:
            {
                const shieldedTankA = self.gameController.getTank(data.shieldA.getPlayerId());
                const shieldedTankB = self.gameController.getTank(data.shieldB.getPlayerId());
                if (shieldedTankA && shieldedTankB) {
                    if (Math.random() > UIConstants.INVERSE_SHIELD_SPARK_PROBABILITY_IN_COLLISION) {
                        if (Math.random() > 0.5) {
                            self._bounceTankOnShield(shieldedTankA, shieldedTankB, data.collisionPoint, false);
                        } else {
                            self._bounceTankOnShield(shieldedTankB, shieldedTankA, data.collisionPoint, false);
                        }
                    }
                    if (Math.random() > UIConstants.INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_COLLISION) {
                        self._spawnRubble(shieldedTankA);
                        self._spawnRubble(shieldedTankB);
                    }
                }
                break;
            }
            case RoundModel._EVENTS.SHIELD_ZONE_COLLISION:
            {
                // FIXME: Handle.
                break;
            }
            case RoundModel._EVENTS.PROJECTILE_MAZE_COLLISION:
            {
                self._bounceProjectileOnMaze(data.projectile, data.collisionPoint);
                break;
            }
            case RoundModel._EVENTS.TANK_MAZE_COLLISION:
            {
                if (Math.random() > UIConstants.INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_COLLISION) {
                    self._spawnRubble(data.tankA);
                }
                break;
            }
            case RoundModel._EVENTS.TANK_TANK_COLLISION:
            {
                if (Math.random() > UIConstants.INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_COLLISION) {
                    self._spawnRubble(data.tankA);
                    self._spawnRubble(data.tankB);
                }
                break;
            }
            case RoundModel._EVENTS.TANK_ZONE_COLLISION:
            {
                // FIXME Handle.
                break;
            }
            case RoundModel._EVENTS.WEAPON_CREATED:
            {
                // Only play animation and sound if weapon is new. Otherwise, it will also play when someone joins in the middle of a battle.
                self._createWeapon(data, self.gameController.getInitialRoundStateReceived());
                self._showWeaponSymbol(data.getPlayerId());
                break;
            }
            case RoundModel._EVENTS.WEAPON_DESTROYED:
            {
                self._removeWeapon(data.getPlayerId());
                self._showWeaponSymbol(data.getPlayerId());
                break;
            }
            case RoundModel._EVENTS.UPGRADE_CREATED:
            {
                // Only play animation and sound if upgrade is new. Otherwise, it will also play when someone joins in the middle of a battle.
                self._createUpgrade(data, self.gameController.getInitialRoundStateReceived());
                break;
            }
            case RoundModel._EVENTS.UPGRADE_DESTROYED:
            {
                self._removeUpgrade(data.getUpgradeId());
                break;
            }
            case RoundModel._EVENTS.COUNTER_CREATED:
            {
                // Only play animation and sound if upgrade is new. Otherwise, it will also play when someone joins in the middle of a battle.
                self._createCounter(data, self.gameController.getInitialRoundStateReceived());
                break;
            }
            case RoundModel._EVENTS.COUNTER_DESTROYED:
            {
                self._removeCounter(data);
                break;
            }
            case RoundModel._EVENTS.ZONE_CREATED:
            {
                // Only play animation and sound if zone is new. Otherwise, it will also play when someone joins in the middle of a battle.
                self._createZone(data, self.gameController.getInitialRoundStateReceived());
                break;
            }
            case RoundModel._EVENTS.ZONE_DESTROYED:
            {
                self._removeZone(data);
                break;
            }
            case Weapon._EVENTS.WEAPON_FIRED:
            {
                self._fireWeapon(data.getPlayerId());
                break;
            }
            case Weapon._EVENTS.WEAPON_DELAYED_FIRE:
            {
                self._fireWeapon(data);
                break;
            }
            case Weapon._EVENTS.WEAPON_EMPTY:
            {
                self._emptyWeapon(data.getPlayerId());
                break;
            }
            case Weapon._EVENTS.HOMING_MISSILE_TARGET_CHANGED: // FIXME Maybe create generic PROJECTILE_UPDATED ?
            {
                self._updateHomingMissileTarget(data.getProjectileId(), data.getTargetId());
                break;
            }
            case Weapon._EVENTS.MINE_ACTIVATED:
            {
                self._activateMine(data);
                break;
            }
            case Weapon._EVENTS.MINE_TRIPPED:
            {
                self._tripMine(data);
                break;
            }
            case Weapon._EVENTS.MINE_DETONATED:
            {
                self._detonateMine(data);
                break;
            }
            case Upgrade._EVENTS.UPGRADE_ACTIVATED:
            {
                self._activateUpgrade(data);
                break;
            }
            case Upgrade._EVENTS.UPGRADE_WEAKENED:
            {
                self._weakenUpgrade(data);
                break;
            }
            case Upgrade._EVENTS.UPGRADE_STRENGTHENED:
            {
                self._strengthenUpgrade(data);
                break;
            }
            case Zone._EVENTS.ZONE_ENTERED:
            case Zone._EVENTS.ZONE_LEFT:
            {
                // FIXME Handle.
                break;
            }
            case Zone._EVENTS.ZONE_DESTABILISED:
            {
                self._destabiliseZone(data);
                break;
            }
        }
    }

    _cleanUp() {
        // Clean up previous maze.
        this.mazeFloorGroup.removeAll(true);
        this.mazeWallGroup.removeAll(true);
        this.mazeWallDecorationGroup.removeAll(true);
        this.maze = null;

        // Clean up previous tanks.
        this.tankGroup.callAll("retire");
        this.tankSprites = {};

        // Clean up previous projectiles.
        this.projectiles = {};
        this.projectileGroup.callAll("retire");
        this.shrapnelGroup.callAll("retire");
        this.missileGroup.callAll("retire");
        this.missileSmokeGroup.callAll("retire");
        this.laserGroup.callAll("retire");

        // Clean up previous traps.
        this.traps = {};
        this.mineGroup.callAll("retire");

        // Clean up previous rubble.
        this.rubbleGroup.retire();

        // Clean up previous dust.
        this.dustGroup.callAll("retire");

        // Clean up previous collectibles.
        this.collectibles = {};
        this.crateGroup.callAll("retire");
        this.goldGroup.callAll("retire");
        this.diamondGroup.callAll("retire");

        // Clean up previous upgrades.
        this.upgrades = {};
        this.aimerGroup.callAll("retire");
        this.shieldGroup.callAll("retire");

        // Clean up previous counters.
        this.counters = {};
        this.overtimeGroup.retire();
        this.counterTimerGroup.callAll("retire");

        // Clean up previous zones.
        this.zones = {};
        this.spawnZoneGroup.callAll("retire");

        // Clean up previous shines and sparkles.
        this.diamondShineGroup.callAll("retire");
        this.sparkleGroup.callAll("retire");

        // Clean up previous explosions.
        this.tankExplosionGroup.callAll("retire");
        this.explosionGroup.callAll("retire");

        // Clean up previous feathers.
        this.tankFeatherGroup.callAll("retire");

        // Clean up previous bullet puffs.
        this.bulletPuffGroup.callAll("retire");

        // Clean up previous missile launch smoke.
        this.missileLaunchGroup.callAll("retire");

        // Clean up previous shield sparks.
        this.shieldSparkGroup.retire();

        // Clean up previous storm zone.
        this.stormZoneGroup.retire();

        // Clean up overlay UI.
        this.roundTitleGroup.retire();
        this.countDownGroup.callAll("retire");
        this.tankNameGroup.callAll("retire");
        this.chatSymbolGroup.callAll("retire");
        this.chatSymbolSprites = {};
        this.weaponSymbolGroup.callAll("retire");
        this.weaponSymbolGroups = {};

        // Clean up celebration UI.
        this.celebrationTrophyGroup.retire();

        // Clean up UI physics.
        // NOT necessary as killing the associated sprites removes the bodies from the world!
        // EXCEPT! The maze bodies do NOT have associated sprites, so they need to be removed manually!
        const bodies = this.game.physics.p2.getBodies();
        for (let i = 0; i < bodies.length; ++i) {
            if (bodies[i]) {
                this.game.physics.p2.removeBody(bodies[i]);
            }
        }
        // Unpause UI physics.
        this.game.physics.arcade.isPaused = false;
        this.game.physics.p2.paused = false;

        // Do NOT use clear as it removes contact materials, contact handlers, etc.!
        //this.game.physics.p2.clear();
        // Reinitialise stuff that was cleared (contact materials, contact handlers, etc.)
        //UIUtils.initUIPhysics(this.game);
    }

    _createMaze(maze) {
        //FIXME Wrap maze in uimazegroup.js

        // Create graphics.
        const theme = maze.getTheme();
        const borders = maze.getBorders();
        const floors = maze.getFloors();
        const spaces = maze.getSpaces();
        const walls = maze.getWalls();
        const wallDecorations = maze.getWallDecorations();

        for (let i = 0; i < borders.length; ++i) {
            const border = borders[i];

            const borderImage = `border${theme}-${border.number}`;
            const sprite = this.mazeFloorGroup.create((border.x + 0.5 - (0.5 * (border.orientation % 2))) * Constants.MAZE_TILE_SIZE.px, (border.y + 0.5 - (0.5 * ((border.orientation - 1) % 2))) * Constants.MAZE_TILE_SIZE.px, "game", borderImage);
            sprite.scale.setTo(border.flip ? -1 : 1, 1.0);
            sprite.anchor.setTo(0.5, 1.0);
            sprite.rotation = (border.orientation * Math.PI) / 2;
        }

        for (let i = 0; i < floors.length; ++i) {
            const floor = floors[i];

            const floorImage = `floor${theme}-${floor.number}`;

            const sprite = this.mazeFloorGroup.create((floor.x + 0.5) * Constants.MAZE_TILE_SIZE.px, (floor.y + 0.5) * Constants.MAZE_TILE_SIZE.px, "game", floorImage);
            sprite.anchor.setTo(0.5, 0.5);
            sprite.rotation = (floor.orientation * Math.PI) / 2;
        }

        for (let i = 0; i < wallDecorations.length; ++i) {
            const wallDecoration = wallDecorations[i];

            const wallDecorationImage = `wallDecoration${theme}-${wallDecoration.number}`;

            const sprite = this.mazeWallDecorationGroup.create((wallDecoration.x + 0.5) * Constants.MAZE_TILE_SIZE.px, (wallDecoration.y + 0.5) * Constants.MAZE_TILE_SIZE.px, "game", wallDecorationImage);
            sprite.anchor.setTo(0.5, 0.5);
            sprite.rotation = (wallDecoration.orientation * Math.PI) / 2;
        }

        for (let i = 0; i < spaces.length; ++i) {
            const space = spaces[i];

            const spaceImage = `space${theme}-${space.number}`;

            const sprite = this.mazeFloorGroup.create((space.x + 0.5) * Constants.MAZE_TILE_SIZE.px, (space.y + 0.5) * Constants.MAZE_TILE_SIZE.px, "game", spaceImage);
            sprite.anchor.setTo(0.5, 0.5);
            sprite.rotation = (space.orientation * Math.PI) / 2;
        }

        for (let i = 0; i < walls.length; ++i) {
            const wall = walls[i];

            const wallImage = `wall${theme}-${wall.number}`;

            const sprite = this.mazeWallGroup.create((wall.x + 0.5 - (0.5 * (wall.rotate ? 1 : 0))) * Constants.MAZE_TILE_SIZE.px, (wall.y + 0.5 - (0.5 * (wall.rotate ? 0 : 1))) * Constants.MAZE_TILE_SIZE.px, "game", wallImage);
            sprite.anchor.setTo(0.5, 0.5);
            sprite.scale.setTo(wall.flipX ? -1 : 1, wall.flipY ? -1 : 1);
            sprite.rotation = wall.rotate ? Math.PI / 2 : 0;

            // Set up UI Physics body.
            const wallBody = new Phaser.Physics.P2.Body(this.game, null, (wall.x + 0.5 - (0.5 * (wall.rotate ? 1 : 0))) * Constants.MAZE_TILE_SIZE.px, (wall.y + 0.5 - (0.5 * (wall.rotate ? 0 : 1))) * Constants.MAZE_TILE_SIZE.px);
            wallBody.setRectangle(Constants.MAZE_TILE_SIZE.px + Constants.MAZE_WALL_WIDTH.px, Constants.MAZE_WALL_WIDTH.px, 0.0, 0.0, wall.rotate ? Math.PI / 2 : 0);
            wallBody.dynamic = false;
            wallBody.setMaterial(UIUtils.wallMaterial);
            wallBody.setCollisionGroup(UIUtils.wallCollisionGroup);
            wallBody.collides([UIUtils.fragmentCollisionGroup, UIUtils.puffCollisionGroup, UIUtils.rayCollisionGroup]);
            this.game.physics.p2.addBody(wallBody);
        }
    }

    _updateTheme(theme) {
        this.weaponSymbolGroup.callAll("setTheme", null, theme);
        this.crateGroup.callAll("setTheme", null, theme);
    }

    _mazeLocalBoundsUpdated() {
        const mazeLocalBounds = this._getMazeLocalBounds();
        this.stormZoneGroup.setMazeLocalBounds(mazeLocalBounds);
    }

    _getMazeLocalBounds() {
        const mazeLocalBounds = Phaser.Rectangle.union(this.mazeFloorGroup.getLocalBounds(), this.mazeWallGroup.getLocalBounds());
        // Make sure to never return an empty rectangle.
        if (mazeLocalBounds.empty) {
            mazeLocalBounds.inflate(0.01, 0.01);
        }

        return mazeLocalBounds;
    }

    _spawnRoundTitle(name, ranked) {
        this.roundTitleShown = true;
        let subtitle = "";
        if (ranked) {
            subtitle = "Ranked";
        } else if (this.gameController.getMode() === Constants.GAME_MODES.BOOT_CAMP) {
            subtitle = "No achievements";
        }
        this.roundTitleGroup.spawn(name, subtitle);
    }

    _spawnCountDown(value) {
        const countDownSprite = this.countDownGroup.getFirstExists(false);
        if (countDownSprite) {
            countDownSprite.spawn(value);
            this.countDownSounds[value].play();
        } else {
            this.log.error("Could not create count down sprite. No sprite available.");
        }
    }

    _createTank(tank, playSpawnAnimation, smoothing) {
        const tankSprite = this.tankGroup.getFirstExists(false);
        if (tankSprite) {
            this.tankSprites[tank.getPlayerId()] = tankSprite;
            tankSprite.spawn(UIUtils.mpx(tank.getX()), UIUtils.mpx(tank.getY()), tank.getRotation(), tank.getPlayerId(), playSpawnAnimation, smoothing);

            const tankNameSprite = this.tankNameGroup.getFirstExists(false);
            if (tankNameSprite) {
                tankNameSprite.spawn(tank.getPlayerId());
            } else {
                this.log.error("Could not create tank name sprite. No sprite available.");
            }
        } else {
            this.log.error("Could not create tank sprite. No sprite available.");
        }
    }

    _removeTank(playerId) {
        if (this.tankSprites[playerId]) {
            this.tankSprites[playerId].remove();
            delete this.tankSprites[playerId];

            // Remove all tank-dependent stuff.
            this._removeUpgrades(playerId);
            this._removeCounters(playerId);
            this._removeWeaponSymbol(playerId);
            this._removeChatSymbol(playerId);

            return true;
        }

        return false;
    }

    _spawnTankExplosion(playerId) {
        const explosion = this.tankExplosionGroup.getFirstExists(false);
        const tank = this.gameController.getTank(playerId);
        if (tank && explosion) {
            const x = UIUtils.mpx(tank.getX());
            const y = UIUtils.mpx(tank.getY());

            explosion.spawn(x, y, playerId);
        } else {
            this.log.error("Could not create explosion group. No tank or group available.");
        }
    }

    _spawnTankFeathers(playerId, tankPosition) {
        const tank = this.gameController.getTank(playerId);
        if (tank) {
            this.chickenOutSound.play();
            for (let i = 0; i < UIConstants.TANK_FEATHER_COUNT; ++i) {
                const feather = this.tankFeatherGroup.getFirstExists(false);
                if (feather) {
                    const x = UIUtils.mpx(tank.getX());
                    const y = UIUtils.mpx(tank.getY());

                    feather.spawn(x, y);
                } else {
                    this.log.error("Could not create tank feather. No sprite available.");
                }
            }

            const stake = this.gameController.getStake(playerId);
            if (stake) {
                GameManager.showRankChange(-stake.value, tankPosition);
            }
        } else {
            this.log.error("Could not create tank feather. No tank available.");
        }
    }

    _addCameraShake(shake) {
        this.cameraShake = Math.min(UIConstants.MAX_CAMERA_SHAKE, this.cameraShake + shake);
    }

    _fireWeapon(playerId) {
        const tankSprite = this.tankSprites[playerId];
        if (tankSprite) {
            tankSprite.fire();
        }
    }

    _emptyWeapon(playerId) {
        const tankSprite = this.tankSprites[playerId];
        if (tankSprite) {
            tankSprite.emptyBarrel();
        }
    }

    _updateHomingMissileTarget(projectileId, playerId) {
        if (this.projectiles[projectileId]) {
            if (playerId !== null) {
                this.homingMissileTargetChangeSound.play();
            }
            this.projectiles[projectileId].updateTarget(playerId);
        }
    }

    _activateUpgrade(upgradeId) {
        if (this.upgrades[upgradeId]) {
            this.upgrades[upgradeId].activate();
        }
    }

    _weakenUpgrade(upgradeId) {
        if (this.upgrades[upgradeId]) {
            this.upgrades[upgradeId].weaken();
        }
    }

    _strengthenUpgrade(upgradeId) {
        if (this.upgrades[upgradeId]) {
            this.upgrades[upgradeId].strengthen();
        }
    }

    _destabiliseZone(zoneId) {
        if (this.zones[zoneId]) {
            this.zones[zoneId].destabilise();
        }
    }

    _createProjectile(projectile) {
        switch (projectile.getType()) {
            case Constants.WEAPON_TYPES.BULLET:
            {
                let projectileImage = this.projectileGroup.getFirstExists(false);
                if (!projectileImage) {
                    projectileImage = this.projectileGroup.add(new UIProjectileImage(this.game, this.gameController));
                }
                this.projectiles[projectile.getId()] = projectileImage;
                projectileImage.spawn(UIUtils.mpx(projectile.getX()), UIUtils.mpx(projectile.getY()), projectile.getId(), "bullet");
                break;
            }
            case Constants.WEAPON_TYPES.LASER:
            {
                let laserGraphicsInstance = this.laserGroup.getFirstExists(false);
                if (!laserGraphicsInstance) {
                    laserGraphicsInstance = this.laserGroup.add(new UILaserGraphics(this.game, this.gameController));
                }
                this.projectiles[projectile.getId()] = laserGraphicsInstance;
                laserGraphicsInstance.spawn(UIUtils.mpx(projectile.getX()), UIUtils.mpx(projectile.getY()), projectile.getId(), projectile.getPlayerId());
                break;
            }
            case Constants.WEAPON_TYPES.DOUBLE_BARREL:
            {
                let projectileImage = this.projectileGroup.getFirstExists(false);
                if (!projectileImage) {
                    projectileImage = this.projectileGroup.add(new UIProjectileImage(this.game, this.gameController));
                }
                this.projectiles[projectile.getId()] = projectileImage;
                projectileImage.spawn(UIUtils.mpx(projectile.getX()), UIUtils.mpx(projectile.getY()), projectile.getId(), "doubleBarrel");
                break;
            }
            case Constants.WEAPON_TYPES.SHOTGUN:
            {
                let projectileImage = this.projectileGroup.getFirstExists(false);
                if (!projectileImage) {
                    projectileImage = this.projectileGroup.add(new UIProjectileImage(this.game, this.gameController));
                }
                this.projectiles[projectile.getId()] = projectileImage;
                projectileImage.spawn(UIUtils.mpx(projectile.getX()), UIUtils.mpx(projectile.getY()), projectile.getId(), "shotgun");
                break;
            }
            case Constants.WEAPON_TYPES.HOMING_MISSILE:
            {
                let homingMissileImage = this.missileGroup.getFirstExists(false);
                if (!homingMissileImage) {
                    homingMissileImage = this.missileGroup.add(new UIMissileImage(this.game, this.gameController, this.homingMissileTargetingSounds));
                }
                this.projectiles[projectile.getId()] = homingMissileImage;
                homingMissileImage.spawn(UIUtils.mpx(projectile.getX()), UIUtils.mpx(projectile.getY()), projectile.getId(), projectile.getPlayerId(), "homingMissile");
                break;
            }
            case Constants.WEAPON_TYPES.MINE:
            {
                let mineShrapnelImage = this.shrapnelGroup.getFirstExists(false);
                if (!mineShrapnelImage) {
                    mineShrapnelImage = this.shrapnelGroup.add(new UIShrapnelImage(this.game, this.gameController));
                }
                this.projectiles[projectile.getId()] = mineShrapnelImage;
                mineShrapnelImage.spawn(UIUtils.mpx(projectile.getX()), UIUtils.mpx(projectile.getY()), projectile.getId(), projectile.getPlayerId());
                break;
            }
            case Constants.WEAPON_TYPES.GATLING_GUN:
            {
                let projectileImage = this.projectileGroup.getFirstExists(false);
                if (!projectileImage) {
                    projectileImage = this.projectileGroup.add(new UIProjectileImage(this.game, this.gameController));
                }
                this.projectiles[projectile.getId()] = projectileImage;
                projectileImage.spawn(UIUtils.mpx(projectile.getX()), UIUtils.mpx(projectile.getY()), projectile.getId(), "gatlingGun");
                break;
            }
        }
    }

    _bounceTankOnShield(tank, shieldedTank, collisionPoint, lookAtTankRotation) {
        if (tank.getSpeed() !== 0.0 || (lookAtTankRotation && tank.getRotationSpeed() !== 0.0) || shieldedTank.getSpeed() !== 0.0) {
            this._spawnShieldSparks(shieldedTank, collisionPoint);
            this.shieldImpactSounds[Math.floor(Math.random() * UIConstants.SHIELD_IMPACT_AUDIO_COUNT)].play();
        }
    }

    _bounceProjectileOnShield(projectile, shieldedTank, collisionPoint) {
        this._spawnShieldSparks(shieldedTank, collisionPoint);
        this.shieldImpactSounds[Math.floor(Math.random() * UIConstants.SHIELD_IMPACT_AUDIO_COUNT)].play();

        switch (projectile.getType()) {
            case Constants.WEAPON_TYPES.LASER:
            {
                const laserGraphicsInstance = this.projectiles[projectile.getId()];
                if (laserGraphicsInstance) {
                    laserGraphicsInstance.addPoint(UIUtils.mpx(collisionPoint.x), UIUtils.mpx(collisionPoint.y));
                }
                break;
            }
        }
    }

    _bounceProjectileOnMaze(projectile, collisionPoint) {
        switch (projectile.getType()) {
            case Constants.WEAPON_TYPES.BULLET:
            case Constants.WEAPON_TYPES.DOUBLE_BARREL:
            case Constants.WEAPON_TYPES.SHOTGUN:
            case Constants.WEAPON_TYPES.HOMING_MISSILE:
            case Constants.WEAPON_TYPES.GATLING_GUN:
            {
                this.bulletBounceSounds[Math.floor(Math.random() * UIConstants.BULLET_BOUNCE_AUDIO_COUNT)].play();
                break;
            }
            case Constants.WEAPON_TYPES.LASER:
            {
                const laserGraphicsInstance = this.projectiles[projectile.getId()];
                if (laserGraphicsInstance) {
                    laserGraphicsInstance.addPoint(UIUtils.mpx(collisionPoint.x), UIUtils.mpx(collisionPoint.y));
                }
                break;
            }
            case Constants.WEAPON_TYPES.MINE:
            {
                this.shrapnelHitSounds[Math.floor(Math.random() * UIConstants.SHRAPNEL_HIT_AUDIO_COUNT)].play();
                break;
            }
        }
    }

    _removeProjectile(projectileId) {
        if (this.projectiles[projectileId]) {
            this.projectiles[projectileId].remove();
            delete this.projectiles[projectileId];
        }
    }

    _spawnProjectilePuffs(projectileId) {
        const projectile = this.gameController.getProjectile(projectileId);
        if (projectile) {
            switch (projectile.getType()) {
                case Constants.WEAPON_TYPES.BULLET:
                case Constants.WEAPON_TYPES.DOUBLE_BARREL:
                case Constants.WEAPON_TYPES.HOMING_MISSILE:
                {
                    this.bulletPuffSounds[Math.floor(Math.random() * UIConstants.BULLET_PUFF_AUDIO_COUNT)].play();
                    const puffCount = QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.BULLET_PUFF_COUNT);
                    for (let i = 0; i < puffCount; ++i) {
                        const puff = this.bulletPuffGroup.getFirstExists(false);
                        if (puff) {
                            const x = UIUtils.mpx(projectile.getX());
                            const y = UIUtils.mpx(projectile.getY());
                            const speedX = UIUtils.mpx(projectile.getSpeedX());
                            const speedY = UIUtils.mpx(projectile.getSpeedY());

                            puff.spawn(x, y, speedX, speedY);
                        } else {
                            this.log.error("Could not create bullet puff. No sprite available.");
                        }
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.SHOTGUN:
                case Constants.WEAPON_TYPES.GATLING_GUN:
                {
                    const randomBulletPuffSound = this.bulletPuffSounds[Math.floor(Math.random() * UIConstants.BULLET_PUFF_AUDIO_COUNT)];
                    if (!randomBulletPuffSound.isPlaying) {
                        randomBulletPuffSound.play();
                    }
                    const puff = this.bulletPuffGroup.getFirstExists(false);
                    if (puff) {
                        const x = UIUtils.mpx(projectile.getX());
                        const y = UIUtils.mpx(projectile.getY());
                        const speedX = UIUtils.mpx(projectile.getSpeedX());
                        const speedY = UIUtils.mpx(projectile.getSpeedY());

                        puff.spawn(x, y, speedX, speedY);
                    } else {
                        this.log.error("Could not create bullet puff. No sprite available.");
                    }
                    break;
                }
            }
        } else {
            this.log.error("Could not create projectile puff. No projectile available.");
        }
    }

    _createTrap(trap) {
        switch (trap.getType()) {
            case Constants.WEAPON_TYPES.MINE:
            {
                let mineSprite = this.mineGroup.getFirstExists(false);
                if (!mineSprite) {
                    mineSprite = this.mineGroup.add(new UIMineSprite(this.game, this.gameController, this.mineActivateSound, this.mineTripSound, this.mineDetonateSound));
                }
                this.traps[trap.getId()] = mineSprite;
                mineSprite.spawn(UIUtils.mpx(trap.getX()), UIUtils.mpx(trap.getY()), trap.getId(), trap.getPlayerId(), trap.getField("activated"), trap.getField("tripped"));
                break;
            }
        }
    }

    _releaseTrap(trap) {
        switch (trap.getType()) {
            case Constants.WEAPON_TYPES.MINE:
            {
                this._spawnExplosion(trap.getX(), trap.getY(), this.mineExplosionSounds[Math.floor(Math.random() * UIConstants.MINE_EXPLOSION_AUDIO_COUNT)], QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.MINE_EXPLOSION_SMOKE_COUNT));
                this._addCameraShake(UIConstants.MINE_EXPLOSION_CAMERA_SHAKE);
                break;
            }
        }
    }

    _removeTrap(trapId) {
        if (this.traps[trapId]) {
            this.traps[trapId].remove();
            delete this.traps[trapId];
        }
    }

    _activateMine(trapId) {
        if (this.traps[trapId]) {
            this.traps[trapId].activate();
        }
    }

    _tripMine(trapId) {
        if (this.traps[trapId]) {
            this.traps[trapId].trip();
        }
    }

    _detonateMine(trapId) {
        if (this.traps[trapId]) {
            this.traps[trapId].detonate();
        }
    }

    _spawnExplosion(x, y, sound, smokeCount) {
        const explosion = this.explosionGroup.getFirstExists(false);
        if (explosion) {
            x = UIUtils.mpx(x);
            y = UIUtils.mpx(y);

            explosion.spawn(x, y, sound, smokeCount);
        } else {
            this.log.error("Could not create explosion group. No group available.");
        }
    }

    _spawnShieldSparks(shieldedTank, position) {
        this.shieldSparkGroup.emit(shieldedTank, position);
    }

    _createCollectible(collectible, playSpawnAnimation) {
        switch (collectible.getType()) {
            case Constants.COLLECTIBLE_TYPES.CRATE_LASER:
            case Constants.COLLECTIBLE_TYPES.CRATE_DOUBLE_BARREL:
            case Constants.COLLECTIBLE_TYPES.CRATE_SHOTGUN:
            case Constants.COLLECTIBLE_TYPES.CRATE_HOMING_MISSILE:
            case Constants.COLLECTIBLE_TYPES.CRATE_MINE:
            case Constants.COLLECTIBLE_TYPES.CRATE_GATLING_GUN:
            case Constants.COLLECTIBLE_TYPES.CRATE_AIMER:
            case Constants.COLLECTIBLE_TYPES.CRATE_SHIELD:
            case Constants.COLLECTIBLE_TYPES.CRATE_SPEED_BOOST:
            {
                const crateSprite = this.crateGroup.getFirstExists(false);
                if (crateSprite) {
                    this.collectibles[collectible.getId()] = crateSprite;
                    crateSprite.spawn(UIUtils.mpx(collectible.getX()), UIUtils.mpx(collectible.getY()), collectible.getRotation(), collectible.getType(), collectible.getId(), playSpawnAnimation);
                } else {
                    this.log.error("Could not create crate sprite. No sprite available.");
                }
                break;
            }
            case Constants.COLLECTIBLE_TYPES.GOLD:
            {
                const goldSprite = this.goldGroup.getFirstExists(false);
                if (goldSprite) {
                    this.collectibles[collectible.getId()] = goldSprite;
                    goldSprite.spawn(UIUtils.mpx(collectible.getX()), UIUtils.mpx(collectible.getY()), collectible.getId(), playSpawnAnimation);
                } else {
                    this.log.error("Could not create gold sprite. No sprite available");
                }
                break;
            }
            case Constants.COLLECTIBLE_TYPES.DIAMOND:
            {
                const diamondSprite = this.diamondGroup.getFirstExists(false);
                if (diamondSprite) {
                    this.collectibles[collectible.getId()] = diamondSprite;
                    diamondSprite.spawn(UIUtils.mpx(collectible.getX()), UIUtils.mpx(collectible.getY()), collectible.getRotation(), collectible.getId(), playSpawnAnimation);
                } else {
                    this.log.error("Could not create diamond sprite. No sprite available");
                }
                break;
            }
        }
    }

    _removeCollectible(collectibleId) {
        if (this.collectibles[collectibleId]) {
            this.collectibles[collectibleId].remove();
            delete this.collectibles[collectibleId];
        }
    }

    _startCollectibleAnimation(pickup) {
        const collectible = this.gameController.getCollectible(pickup.getCollectibleId());
        if (collectible) {
            switch (collectible.getType()) {
                case Constants.COLLECTIBLE_TYPES.GOLD:
                {
                    GameManager.sendGoldToTank(pickup, this._getCollectiblePositionAngleAndScale(pickup.getCollectibleId()));
                    break;
                }
                case Constants.COLLECTIBLE_TYPES.DIAMOND:
                {
                    GameManager.sendDiamondToTank(pickup, this._getCollectiblePositionAngleAndScale(pickup.getCollectibleId()));
                    break;
                }
            }
        } else {
            this.log.error("Could not start collectible animation. No collectible available.");
        }
    }

    _createWeapon(weapon, playSpawnAnimation) {
        const tankSprite = this.tankSprites[weapon.getPlayerId()];
        if (tankSprite) {
            tankSprite.addWeapon(weapon, playSpawnAnimation);
        }
    }

    _removeWeapon(playerId) {
        const tankSprite = this.tankSprites[playerId];
        if (tankSprite) {
            tankSprite.removeWeapon();
        }
    }

    _createUpgrade(upgrade, playSpawnAnimation) {
        const tankSprite = this.tankSprites[upgrade.getPlayerId()];
        if (tankSprite) {
            tankSprite.addUpgrade(upgrade, playSpawnAnimation);
        }

        switch (upgrade.getType()) {
            case Constants.UPGRADE_TYPES.LASER_AIMER:
            {
                let aimerGraphics = this.aimerGroup.getFirstExists(false);
                if (!aimerGraphics) {
                    aimerGraphics = this.aimerGroup.add(new UIAimerGraphics(this.game, this.gameController));
                }
                this.upgrades[upgrade.getId()] = aimerGraphics;
                aimerGraphics.spawn(upgrade.getPlayerId(), upgrade.getField("length"), upgrade.getField("activated"));
                break;
            }
            case Constants.UPGRADE_TYPES.SPAWN_SHIELD:
            case Constants.UPGRADE_TYPES.SHIELD:
            {
                let shieldSprite = this.shieldGroup.getFirstExists(false);
                if (!shieldSprite) {
                    shieldSprite = this.shieldGroup.add(new UIShieldSprite(this.game, this.gameController, this.shieldActivateSound, this.shieldWeakenedSound, this.shieldEndSound));
                }
                this.upgrades[upgrade.getId()] = shieldSprite;
                shieldSprite.spawn(upgrade.getPlayerId(), upgrade.getField("weakened"), playSpawnAnimation);
                break;
            }
            case Constants.UPGRADE_TYPES.AIMER:
            {
                let aimerGraphics = this.aimerGroup.getFirstExists(false);
                if (!aimerGraphics) {
                    aimerGraphics = this.aimerGroup.add(new UIAimerGraphics(this.game, this.gameController));
                }
                this.upgrades[upgrade.getId()] = aimerGraphics;
                aimerGraphics.spawn(upgrade.getPlayerId(), upgrade.getField("length"), true);
                break;
            }
            case Constants.UPGRADE_TYPES.SPEED_BOOST:
            {
                // FIXME Show speed boost.
                break;
            }
        }
    }

    _removeUpgrade(upgradeId) {
        if (this.upgrades[upgradeId]) {
            this.upgrades[upgradeId].remove();
            delete this.upgrades[upgradeId];
        }
    }

    _removeUpgrades(playerId) {
        for (const upgradeId in this.upgrades) {
            if (this.upgrades[upgradeId].getPlayerId() === playerId) {
                this.upgrades[upgradeId].remove();
                delete this.upgrades[upgradeId];
            }
        }
    }

    _createCounter(counter, playSpawnAnimation) {
        switch (counter.getType()) {
            case Constants.COUNTER_TYPES.TIMER_COUNTDOWN:
            {
                const counterSprite = this.counterTimerGroup.getFirstExists(false);
                if (counterSprite) {
                    this.counters[counter.getId()] = counterSprite;
                    // FIXME Hack to place counter beneath overtime sprite. Make a proper system for handling this.
                    if (this.overtimeGroup.exists) {
                        counterSprite.spawn(0, UIConstants.TIMER_TOP_MARGIN + UIConstants.TIMER_FONT_SIZE + UIConstants.TIMER_SPACING, counter.getId(), playSpawnAnimation);
                    } else {
                        counterSprite.spawn(0, UIConstants.TIMER_TOP_MARGIN, counter.getId(), playSpawnAnimation);
                    }
                } else {
                    this.log.error("Could not create counter sprite. No sprite available.");
                }
                break;
            }
            case Constants.COUNTER_TYPES.OVERTIME_COUNT_UP:
            {
                this.counters[counter.getId()] = this.overtimeGroup;
                this.overtimeGroup.spawn(this.game.width / 2.0, UIConstants.TIMER_TOP_MARGIN, counter.getId(), playSpawnAnimation);
                break;
            }
        }
    }

    _removeCounter(counterId) {
        if (this.counters[counterId]) {
            this.counters[counterId].remove();
            delete this.counters[counterId];
        }
    }

    _removeCounters(playerId) {
        for (const counterId in this.counters) {
            if (this.counters[counterId].getPlayerId() === playerId) {
                this.counters[counterId].remove();
                delete this.counters[counterId];
            }
        }
    }

    _createZone(zone, playSpawnAnimation) {
        switch (zone.getType()) {
            case Constants.ZONE_TYPES.SPAWN:
            {
                const zoneSprite = this.spawnZoneGroup.getFirstExists(false);
                if (zoneSprite) {
                    this.zones[zone.getId()] = zoneSprite;
                    zoneSprite.spawn(zone.getId(), zone.getField("radius"), zone.getField("unstable"), playSpawnAnimation);
                } else {
                    this.log.error("Could not create zone sprite. No sprite available.");
                }
                break;
            }
            case Constants.ZONE_TYPES.STORM:
            {
                this.zones[zone.getId()] = this.stormZoneGroup;
                const mazeLocalBounds = this._getMazeLocalBounds();
                this.stormZoneGroup.spawn(zone.getId(), mazeLocalBounds, playSpawnAnimation);
                break;
            }
        }
    }

    _removeZone(zoneId) {
        if (this.zones[zoneId]) {
            this.zones[zoneId].remove();
            delete this.zones[zoneId];
        }
    }

    _showWeaponSymbol(playerId) {
        // Check if symbol is present.
        if (playerId in this.weaponSymbolGroups) {
            this.weaponSymbolGroups[playerId].refresh();
        } else {
            const weaponSymbolSprite = this.weaponSymbolGroup.getFirstExists(false);
            if (weaponSymbolSprite) {
                this.weaponSymbolGroups[playerId] = weaponSymbolSprite;
                weaponSymbolSprite.spawn(playerId);
            } else {
                this.log.error("Could not create weapon symbol. No sprite available.");
            }
        }
    }

    _removeWeaponSymbol(playerId) {
        if (this.weaponSymbolGroups[playerId]) {
            this.weaponSymbolGroups[playerId].remove();
            delete this.weaponSymbolGroups[playerId];
        }
    }

    _showChatSymbol(playerIds) {
        // Check if symbol is present.
        for (let i = 0; i < playerIds.length; ++i) {
            const playerId = playerIds[i];
            if (playerId in this.chatSymbolSprites) {
                this.chatSymbolSprites[playerId].refresh();
            } else {
                const chatSymbolSprite = this.chatSymbolGroup.getFirstExists(false);
                if (chatSymbolSprite) {
                    this.chatSymbolSprites[playerId] = chatSymbolSprite;
                    chatSymbolSprite.spawn(playerId);
                } else {
                    this.log.error("Could not create chat symbol. No sprite available.");
                }
            }
        }
    }

    _hideChatSymbol(playerIds) {
        for (let i = 0; i < playerIds.length; ++i) {
            const playerId = playerIds[i];
            if (this.chatSymbolSprites[playerId]) {
                this.chatSymbolSprites[playerId].hide();
            }
        }
    }

    _removeChatSymbol(playerId) {
        if (this.chatSymbolSprites[playerId]) {
            this.chatSymbolSprites[playerId].remove();
            delete this.chatSymbolSprites[playerId];
        }
    }

    _spawnRubble(tank) {
        this.rubbleGroup.emit(tank);
    }

    _spawnCelebration(modeName, victoryAward) {
        this.celebrationTrophyGroup.spawn(this.game.width / 2.0, this.game.height / 2.0, modeName, victoryAward);
    }

    _clientEventHandler(self, evt, data) {
        self.log.debug(`Client event: ${evt}: ${data}`);
        switch (evt) {
            case TTClient.EVENTS.CHAT_ACTIVITY:
            {
                self._showChatSymbol(data);
                break;
            }
            case TTClient.EVENTS.GLOBAL_CHAT_POSTED:
            case TTClient.EVENTS.CHAT_POSTED:
            case TTClient.EVENTS.USER_CHAT_POSTED:
            {
                self._hideChatSymbol(data.getFrom());
                break;
            }
        }
    }

    _authenticationEventHandler(self, evt, data) {
        self.log.debug(`Authentication event: ${evt}: ${data}`);
        switch (evt) {
            case Users.EVENTS.GUEST_ADDED:
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            {
                self.gameController.addPlayer(data);

                break;
            }
            case Users.EVENTS.GUESTS_ADDED:
            {
                for (let i = 0; i < data.length; ++i) {
                    self.gameController.addPlayer(data[i]);
                }

                break;
            }
            case Users.EVENTS.GUEST_REMOVED:
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            {
                self.gameController.removePlayer(data);

                break;
            }
        }
    }

    _leaveState() {
        // Unregister game controller with GameManager.
        GameSession.setGameController(null);

        if (Users.getAllPlayerIds().length === 0) {
            this.state.start("Menu");
        } else {
            this.state.start("Lobby");
        }
    }

    _clientStateChangeHandler(self, oldState, newState, data, msg) {
        switch (newState) {
            case TTClient.STATES.UNCONNECTED:
            {
                self._leaveState();

                break;
            }
        }
    }

    _debugDrawB2DWorld(b2dWorld) {
        if (b2dWorld) {
            let body = b2dWorld.GetBodyList();
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(2, 0xff0000, 0.9);
            this.debugGraphics.beginFill(0x00ff00, 0.3);
            while (true) {
                if (body === null) {
                    break;
                }
                this._debugDrawB2DBody(body);
                body = body.GetNext();
            }
        }
    }

    _debugDrawB2DBody(b2dBody) {
        let fixture = b2dBody.GetFixtureList();
        while (true) {
            if (fixture === null) { break; }
            if (fixture.GetShape().GetVertices !== undefined) { this._debugDrawB2DPolygonFixture(b2dBody, fixture); } else { this._debugDrawB2DCircleFixture(b2dBody, fixture); }
            fixture = fixture.GetNext();
        }
    }

    _debugDrawB2DPolygonFixture(b2dBody, b2dFixture) {
        const shape = b2dFixture.GetShape();
        const vertices = shape.GetVertices();
        const bodyTransform = b2dBody.GetTransform();
        const debugVertex = Box2D.Common.Math.b2Vec2.Make(0, 0);

        if (vertices.length > 0) {
            debugVertex.SetV(vertices[0]);
            debugVertex.MulM(bodyTransform.R);
            debugVertex.Add(bodyTransform.position);
            this.debugGraphics.moveTo(UIUtils.mpx(debugVertex.x), UIUtils.mpx(debugVertex.y));
        }
        for (let i = 1; i < vertices.length; ++i) {
            debugVertex.SetV(vertices[i]);
            debugVertex.MulM(bodyTransform.R);
            debugVertex.Add(bodyTransform.position);
            this.debugGraphics.lineTo(UIUtils.mpx(debugVertex.x), UIUtils.mpx(debugVertex.y));
        }
    }

    _debugDrawB2DCircleFixture(b2dBody, b2dFixture) {
        const shape = b2dFixture.GetShape();
        const bodyTransform = b2dBody.GetTransform();

        this.debugGraphics.drawCircle(UIUtils.mpx(bodyTransform.position.x), UIUtils.mpx(bodyTransform.position.y), 2.0 * UIUtils.mpx(shape.GetRadius()));
    }

    _debugDrawWorld(world) {
        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2, 0x0000ff, 0.5);
        this._debugDrawGroup(world);
    }

    _debugDrawGroup(group) {
        for (let i = 0; i < group.children.length; ++i) {
            const child = group.children[i];
            if (child.type === Phaser.GROUP || child.type === Phaser.EMITTER) {
                this._debugDrawGroup(child);
            } else if (child.type === Phaser.SPRITE || child.type === Phaser.IMAGE) {
                this._debugDrawSprite(child);
            }
        }
    }

    _debugDrawSprite(sprite) {
        const rect = sprite.getBounds();
        rect.topLeft = this.gameGroup.toLocal(rect.topLeft);
        if (sprite.exists) {
            this.debugGraphics.beginFill(0x00ff00, 0.1);
            this.debugGraphics.drawRect(rect.x, rect.y, rect.width / this.gameGroup.scale.x, rect.height / this.gameGroup.scale.y);
        } else {
            this.debugGraphics.beginFill(0xff0000, 0.1);
            this.debugGraphics.drawRect(rect.x, rect.y, rect.width / this.gameGroup.scale.x, rect.height / this.gameGroup.scale.y);
        }
    }

    _debugDrawMazeMap(map, minValue, maxValue, minColour, maxColour, alpha, clear) {
        clear = clear === undefined ? true : clear;
        if (clear) {
            this.debugGraphics.clear();
        }
        this.debugGraphics.lineStyle(0, 0x000000, 0);
        for (let i = 0; i < map.length; ++i) {
            for (let j = 0; j < map[i].length; ++j) {
                const rect = new Phaser.Rectangle(i * Constants.MAZE_TILE_SIZE.px, j * Constants.MAZE_TILE_SIZE.px, Constants.MAZE_TILE_SIZE.px, Constants.MAZE_TILE_SIZE.px);
                const value = map[i][j];
                const colour = Phaser.Color.interpolateColor(minColour, maxColour, maxValue - minValue, value - minValue);
                this.debugGraphics.beginFill(colour, alpha);
                this.debugGraphics.drawRect(rect.x, rect.y, rect.width, rect.height);
            }
        }
    }

    _debugDrawMazePath(path, width, startColour, endColour, clear) {
        clear = clear === undefined ? true : clear;
        if (clear) {
            this.debugGraphics.clear();
        }
        if (path.length > 0) {
            this.debugGraphics.moveTo((path[0].x + 0.5) * Constants.MAZE_TILE_SIZE.px, (path[0].y + 0.5) * Constants.MAZE_TILE_SIZE.px);
            for (let i = 1; i < path.length; ++i) {
                const colour = Phaser.Color.interpolateColor(startColour, endColour, path.length - 1, i);
                this.debugGraphics.lineStyle(width, colour, 0.8);
                this.debugGraphics.lineTo((path[i].x + 0.5) * Constants.MAZE_TILE_SIZE.px, (path[i].y + 0.5) * Constants.MAZE_TILE_SIZE.px);
            }
        }
    }

    _debugDrawPath(path, width, startColour, endColour, clear) {
        clear = clear === undefined ? true : clear;
        if (clear) {
            this.debugGraphics.clear();
        }
        if (path.length > 0) {
            this.debugGraphics.moveTo(UIUtils.mpx(path[0].x), UIUtils.mpx(path[0].y));
            for (let i = 1; i < path.length; ++i) {
                const colour = Phaser.Color.interpolateColor(startColour, endColour, path.length - 1, i);
                this.debugGraphics.lineStyle(width, colour, 0.8);
                this.debugGraphics.lineTo(UIUtils.mpx(path[i].x), UIUtils.mpx(path[i].y));
            }
        }
    }

    _debugDrawPoint(point, size, colour, clear) {
        clear = clear === undefined ? true : clear;
        if (clear) {
            this.debugGraphics.clear();
        }
        this.debugGraphics.lineStyle(0, 0x00000, 0.0);
        this.debugGraphics.beginFill(colour, 0.3);
        this.debugGraphics.drawCircle(UIUtils.mpx(point.x), UIUtils.mpx(point.y), size);
    }
}

Game.UIGameState = UIGameState;
