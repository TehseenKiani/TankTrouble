import { Game } from "./game.js";
import { Assets } from "../../../assets.js";
import { AudioManager } from "../../../audiomanager.js";
import { Images } from "../../../images.js";
import { UIConstants } from "../uiconstants.js";
import { UITankIcon } from "../uitankicon.js";
import { UIWaitingIconGroup } from "../uiwaitingicongroup.js";
import { Users } from "../../../users.js";

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - load - a reference to the Phaser.Loader
 *  - add - a reference to the Phaser.GameObjectFactory
*/

//loading the game assets
class UIPreloadState {
    preloadBar = null;

    preload() {
        //show loading screen
        this.preloadBackground = this.add.sprite(this.game.world.centerX - (UIConstants.WAITING_ICON_WIDTH / 2.0), this.game.height / 3.0, "preloadbar");
        this.preloadBackground.anchor.setTo(0.0, 0.5);
        this.preloadBackground.alpha = 0.3;
        this.preloadBackground.scale.setTo(UIConstants.ASSET_SCALE);
        this.preloadBar = this.add.sprite(this.game.world.centerX - (UIConstants.WAITING_ICON_WIDTH / 2.0), this.game.height / 3.0, "preloadbar");
        this.load.setPreloadSprite(this.preloadBar);
        this.preloadBar.anchor.setTo(0.0, 0.5);
        this.preloadBar.scale.setTo(UIConstants.ASSET_SCALE);

        // With loading text.
        this.waitingIconGroup = this.game.add.existing(new UIWaitingIconGroup(this.game));
        this.waitingIconGroup.spawn(this.game.width / 2.0, this.game.height / 3.0, false, "Loading");

        //load game assets
        this.load.spine("laika", Assets.url("images/spine/laika.json"));
        this.load.spine("dimitri", Assets.url("images/spine/dimitri.json"));

        this.load.nineSlice("button24", Images.url("buttons/standard24.png"), 22, 22, 22, 22);
        this.load.nineSlice("button24Active", Images.url("buttons/standard24Active.png"), 22, 22, 22, 22);
        this.load.nineSlice("button24Disabled", Images.url("buttons/24Disabled.png"), 22, 22, 22, 22);
        this.load.nineSlice("buttonWarning34", Images.url("buttons/warning34.png"), 22, 22, 22, 22);
        this.load.nineSlice("buttonWarning34Active", Images.url("buttons/warning34Active.png"), 22, 22, 22, 22);
        this.load.nineSlice("button34", Images.url("buttons/standard34.png"), 22, 22, 22, 22);
        this.load.nineSlice("button34Active", Images.url("buttons/standard34Active.png"), 22, 22, 22, 22);
        this.load.nineSlice("button34Disabled", Images.url("buttons/34Disabled.png"), 22, 22, 22, 22);
        this.load.nineSlice("button52", Images.url("buttons/standard52.png"), 22, 22, 22, 22);
        this.load.nineSlice("button52Active", Images.url("buttons/standard52Active.png"), 22, 22, 22, 22);
        this.load.nineSlice("button52Disabled", Images.url("buttons/52Disabled.png"), 22, 22, 22, 22);

        this.load.atlas("game", Images.url("atlases/game.png"), Assets.url("images/atlases/game.json"));
        this.load.physics("game-physics", Assets.url("images/physics/game.json"));

        this.load.atlas("celebration", Images.url("atlases/celebration.png"), Assets.url("images/atlases/celebration.json"));
        this.load.physics("celebration-physics", Assets.url("images/physics/celebration.json"));

        this.load.atlas("ranks", Images.url("atlases/ranks.png"), Assets.url("images/atlases/ranks.json"));

        this.load.image("background", Images.url("beta/background.png"));
        this.load.image("menuBackground", Images.url("menu/background.png"));
        this.load.spritesheet("waitingmodeicon", Images.url("lobby/waitingModes.png"), 400, 400);
        this.load.image("favourite", Images.url("lobby/favourite.png"));
        this.load.image("tankiconplaceholder-small", UITankIcon.getImageUrl("placeholder", UIConstants.TANK_ICON_SIZES.SMALL));
        this.load.image("tankiconplaceholder-large", UITankIcon.getImageUrl("placeholder", UIConstants.TANK_ICON_SIZES.LARGE));
        this.load.spritesheet("gameiconplaceholder", Images.url("lobby/mazes.png"), 328, 248);
        this.load.spritesheet("gameicon", Images.url("lobby/mazes.png"), 328, 248);
        this.load.spritesheet("gamemodeicon", Images.url("lobby/gameModes.png"), 196, 196);
        this.load.image("disconnectedicon", Images.url("lobby/disconnected.png"));

        this.load.audio("countDown0", Assets.url("audio/CountDown00.m4a"));
        this.load.audio("countDown1", Assets.url("audio/CountDown01.m4a"));
        this.load.audio("countDown2", Assets.url("audio/CountDown02.m4a"));
        this.load.audio("countDown3", Assets.url("audio/CountDown03.m4a"));
        this.load.audio("tankLand", Assets.url("audio/TankLand.m4a"));
        this.load.audio("emptyBarrel0", Assets.url("audio/EmptyBarrel00.m4a"));
        this.load.audio("emptyBarrel1", Assets.url("audio/EmptyBarrel01.m4a"));
        this.load.audio("emptyBarrel2", Assets.url("audio/EmptyBarrel02.m4a"));
        this.load.audio("emptyBarrel3", Assets.url("audio/EmptyBarrel03.m4a"));
        this.load.audio("fireBullet0", Assets.url("audio/FireBullet00.m4a"));
        this.load.audio("fireBullet1", Assets.url("audio/FireBullet01.m4a"));
        this.load.audio("bulletBounce0", Assets.url("audio/BulletBounce00.m4a"));
        this.load.audio("bulletBounce1", Assets.url("audio/BulletBounce01.m4a"));
        this.load.audio("bulletBounce2", Assets.url("audio/BulletBounce02.m4a"));
        this.load.audio("bulletBounce3", Assets.url("audio/BulletBounce03.m4a"));
        this.load.audio("bulletBounce4", Assets.url("audio/BulletBounce04.m4a"));
        this.load.audio("bulletBounce5", Assets.url("audio/BulletBounce05.m4a"));
        this.load.audio("bulletBounce6", Assets.url("audio/BulletBounce06.m4a"));
        this.load.audio("bulletBounce7", Assets.url("audio/BulletBounce07.m4a"));
        this.load.audio("bulletBounce8", Assets.url("audio/BulletBounce08.m4a"));
        this.load.audio("bulletBounce9", Assets.url("audio/BulletBounce09.m4a"));
        this.load.audio("bulletBounce10", Assets.url("audio/BulletBounce10.m4a"));
        this.load.audio("bulletBounce11", Assets.url("audio/BulletBounce11.m4a"));
        this.load.audio("shieldActivate", Assets.url("audio/ShieldActivate.m4a"));
        this.load.audio("shieldImpact0", Assets.url("audio/ShieldImpact00.m4a"));
        this.load.audio("shieldImpact1", Assets.url("audio/ShieldImpact01.m4a"));
        this.load.audio("shieldImpact2", Assets.url("audio/ShieldImpact02.m4a"));
        this.load.audio("shieldWeakened", Assets.url("audio/ShieldWeakened.m4a"));
        this.load.audio("shieldEnd", Assets.url("audio/ShieldEnd.m4a"));
        this.load.audio("fireLaser", Assets.url("audio/FireLaser.m4a"));
        this.load.audio("fireShotgun", Assets.url("audio/FireShotgun.m4a"));
        this.load.audio("fireMissile", Assets.url("audio/FireMissile.m4a"));
        this.load.audio("homingMissileTargetChange", Assets.url("audio/HomingMissileTargetChange.m4a"));
        this.load.audio("homingMissileTargeting0", Assets.url("audio/HomingMissileTargeting00.m4a"));
        this.load.audio("homingMissileTargeting1", Assets.url("audio/HomingMissileTargeting01.m4a"));
        this.load.audio("homingMissileTargeting2", Assets.url("audio/HomingMissileTargeting02.m4a"));
        this.load.audio("homingMissileTargeting3", Assets.url("audio/HomingMissileTargeting03.m4a"));
        this.load.audio("homingMissileTargeting4", Assets.url("audio/HomingMissileTargeting04.m4a"));
        this.load.audio("homingMissileTargeting5", Assets.url("audio/HomingMissileTargeting05.m4a"));
        this.load.audio("homingMissileTargeting6", Assets.url("audio/HomingMissileTargeting06.m4a"));
        this.load.audio("homingMissileTargeting7", Assets.url("audio/HomingMissileTargeting07.m4a"));
        this.load.audio("homingMissileTargeting8", Assets.url("audio/HomingMissileTargeting08.m4a"));
        this.load.audio("homingMissileTargeting9", Assets.url("audio/HomingMissileTargeting09.m4a"));
        this.load.audio("homingMissileTargeting10", Assets.url("audio/HomingMissileTargeting10.m4a"));
        this.load.audio("chargeGatlingGun", Assets.url("audio/ChargeGatlingGun.m4a"));
        this.load.audio("holdGatlingGun", Assets.url("audio/HoldGatlingGun.m4a"));
        this.load.audio("dischargeGatlingGun", Assets.url("audio/DischargeGatlingGun.m4a"));
        this.load.audio("fireMine", Assets.url("audio/FireMine.m4a"));
        this.load.audio("mineActivate", Assets.url("audio/MineActivate.m4a"));
        this.load.audio("mineTrip", Assets.url("audio/MineTrip.m4a"));
        this.load.audio("mineDetonate", Assets.url("audio/MineDetonate.m4a"));
        this.load.audio("mineExplosion0", Assets.url("audio/MineExplosion00.m4a"));
        this.load.audio("mineExplosion1", Assets.url("audio/MineExplosion01.m4a"));
        this.load.audio("mineExplosion2", Assets.url("audio/MineExplosion02.m4a"));
        this.load.audio("shrapnelHit0", Assets.url("audio/ShrapnelHit00.m4a"));
        this.load.audio("shrapnelHit1", Assets.url("audio/ShrapnelHit01.m4a"));
        this.load.audio("shrapnelHit2", Assets.url("audio/ShrapnelHit02.m4a"));
        this.load.audio("shrapnelHit3", Assets.url("audio/ShrapnelHit03.m4a"));
        this.load.audio("shrapnelHit4", Assets.url("audio/ShrapnelHit04.m4a"));
        this.load.audio("shrapnelHit5", Assets.url("audio/ShrapnelHit05.m4a"));
        this.load.audio("shrapnelHit6", Assets.url("audio/ShrapnelHit06.m4a"));
        this.load.audio("crateSpawn", Assets.url("audio/CrateSpawn.m4a"));
        this.load.audio("crateLand", Assets.url("audio/CrateLand.m4a"));
        this.load.audio("laserPickup", Assets.url("audio/LaserPickup.m4a"));
        this.load.audio("doubleBarrelPickup", Assets.url("audio/DoubleBarrelPickup.m4a"));
        this.load.audio("shotgunPickup", Assets.url("audio/ShotgunPickup.m4a"));
        this.load.audio("missilePickup", Assets.url("audio/MissilePickup.m4a"));
        this.load.audio("minePickup", Assets.url("audio/MinePickup.m4a"));
        this.load.audio("gatlingGunPickup", Assets.url("audio/GatlingGunPickup.m4a"));
        this.load.audio("shieldPickup", Assets.url("audio/ShieldPickup.m4a"));
        this.load.audio("weaponLoad", Assets.url("audio/WeaponLoad.m4a"));
        this.load.audio("tankExplosion0", Assets.url("audio/TankExplosion00.m4a"));
        this.load.audio("tankExplosion1", Assets.url("audio/TankExplosion01.m4a"));
        this.load.audio("tankExplosion2", Assets.url("audio/TankExplosion02.m4a"));
        this.load.audio("bulletPuff0", Assets.url("audio/BulletPuff00.m4a"));
        this.load.audio("bulletPuff1", Assets.url("audio/BulletPuff01.m4a"));
        this.load.audio("bulletPuff2", Assets.url("audio/BulletPuff02.m4a"));
        this.load.audio("chickenOut", Assets.url("audio/ChickenOut.m4a"));
        this.load.audio("goldSpawn", Assets.url("audio/GoldSpawn.m4a"));
        this.load.audio("diamondSpawn", Assets.url("audio/DiamondSpawn.m4a"));
        this.load.audio("spawnZoneTear", Assets.url("audio/SpawnZoneTear.m4a"));
        this.load.audio("spawnZoneOpen", Assets.url("audio/SpawnZoneOpen.m4a"));
        this.load.audio("spawnZoneUnstable", Assets.url("audio/SpawnZoneUnstable.m4a"));
        this.load.audio("spawnZoneCollapse", Assets.url("audio/SpawnZoneCollapse.m4a"));
        this.load.audio("winnerCelebration", Assets.url("audio/WinnerCelebration.m4a"));
        this.load.audio("poop", Assets.url("audio/Poop.m4a"));
        this.load.audio("laikaHowl0", Assets.url("audio/LaikaHowl00.m4a"));
        this.load.audio("laikaHowl1", Assets.url("audio/LaikaHowl01.m4a"));
        this.load.audio("laikaWhine", Assets.url("audio/LaikaWhine.m4a"));
        this.load.audio("laikaGrowl", Assets.url("audio/LaikaGrowl.m4a"));
    }

    create() {
        // Apply sound setting now.
        this.game.sound.mute = !AudioManager.isSoundOn();
        if (AudioManager.isSoundOn()) {
            this.game.sound.volume = AudioManager.getSoundVolume();
        }

        // Go directly to lobby state if any players are present.
        if (Users.getAllPlayerIds().length === 0) {
            this.state.start("Menu");
        } else {
            this.state.start("Lobby");
        }
    }
}

Game.UIPreloadState = UIPreloadState;
