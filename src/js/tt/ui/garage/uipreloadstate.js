import { Garage } from "./garage.js";
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
        this.load.image("background", Images.url("beta/background.png"));
        this.load.image("tankiconplaceholder-large", UITankIcon.getImageUrl("placeholder", UIConstants.TANK_ICON_SIZES.LARGE));
        this.load.image("spraycan", Images.url("garage/sprayCan.png"));
        this.load.spritesheet("spraycanshade", Images.url("garage/sprayCanShade.png"), 52, 122, 3);
        this.load.image("leftarrow", Images.url("garage/leftArrow.png"));
        this.load.image("rightarrow", Images.url("garage/rightArrow.png"));

        this.load.audio("spraycan", Assets.url("audio/SprayCan.m4a"));
        this.load.audio("shakecan", Assets.url("audio/ShakeCan.m4a"));
        this.load.audio("welder", Assets.url("audio/Welder.m4a"));
        this.load.audio("woosh1", Assets.url("audio/Woosh1.m4a"));
        this.load.audio("woosh2", Assets.url("audio/Woosh2.m4a"));
        this.load.audio("woosh3", Assets.url("audio/Woosh3.m4a"));

        // Create dynamic assets.
        let spray = this.game.make.bitmapData(UIConstants.SPRAY_RADIUS * 2, UIConstants.SPRAY_RADIUS * 2);
        this.game.cache.addBitmapData("spray0", spray);
        spray = this.game.make.bitmapData(UIConstants.SPRAY_RADIUS * 2, UIConstants.SPRAY_RADIUS * 2);
        this.game.cache.addBitmapData("spray1", spray);
        let welderSmoke = this.game.make.bitmapData(UIConstants.WELDER_SMOKE_RADIUS * 2, UIConstants.WELDER_SMOKE_RADIUS * 2);
        this.game.cache.addBitmapData("weldersmoke0", welderSmoke);
        welderSmoke = this.game.make.bitmapData(UIConstants.WELDER_SMOKE_RADIUS * 2, UIConstants.WELDER_SMOKE_RADIUS * 2);
        this.game.cache.addBitmapData("weldersmoke1", welderSmoke);
        const welderSpark = this.game.make.bitmapData(UIConstants.WELDER_SPARK_LENGTH, UIConstants.WELDER_SPARK_WIDTH);
        welderSpark.line(0, UIConstants.WELDER_SPARK_WIDTH / 2, UIConstants.WELDER_SPARK_LENGTH, UIConstants.WELDER_SPARK_WIDTH / 2, "#ffddaa", UIConstants.WELDER_SPARK_WIDTH);
        this.game.cache.addBitmapData("welderspark", welderSpark);
    }

    create() {
        // Apply sound setting now.
        this.game.sound.mute = !AudioManager.isSoundOn();
        if (AudioManager.isSoundOn()) {
            this.game.sound.volume = AudioManager.getSoundVolume();
        }

        if (Users.getAllPlayerIds().length > 0) {
            this.state.start("Load");
        } else {
            this.state.start("NoUsers");
        }
    }
}

Garage.UIPreloadState = UIPreloadState;
