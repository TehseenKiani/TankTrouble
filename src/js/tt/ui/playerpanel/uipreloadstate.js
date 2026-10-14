import { PlayerPanel } from "./playerpanel.js";
import { Assets } from "../../../assets.js";
import { AudioManager } from "../../../audiomanager.js";
import { Images } from "../../../images.js";
import { UIConstants } from "../uiconstants.js";
import { UITankIcon } from "../uitankicon.js";

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
        this.preloadBackground = this.add.sprite(this.game.world.centerX - ((UIConstants.WAITING_ICON_WIDTH * 0.3) / 2.0), this.game.height / 2.0, "preloadbar");
        this.preloadBackground.anchor.setTo(0.0, 0.5);
        this.preloadBackground.alpha = 0.3;
        this.preloadBackground.scale.setTo(0.3 * UIConstants.ASSET_SCALE);
        this.preloadBar = this.add.sprite(this.game.world.centerX - ((UIConstants.WAITING_ICON_WIDTH * 0.3) / 2.0), this.game.height / 2.0, "preloadbar");
        this.load.setPreloadSprite(this.preloadBar);
        this.preloadBar.anchor.setTo(0.0, 0.5);
        this.preloadBar.scale.setTo(0.3 * UIConstants.ASSET_SCALE);

        //load game assets
        this.load.spine("laika", Assets.url("images/spine/laika.json"));
        this.load.spine("dimitri", Assets.url("images/spine/dimitri.json"));

        this.load.atlas("playerpanel", Images.url("atlases/playerPanel.png"), Assets.url("images/atlases/playerPanel.json"));
        this.load.physics("playerpanel-physics", Assets.url("images/physics/playerPanel.json"));

        this.load.atlas("ranks", Images.url("atlases/ranks.png"), Assets.url("images/atlases/ranks.json"));

        this.load.image("favourite", Images.url("lobby/favourite.png"));
        this.load.image("tankiconplaceholder-medium", UITankIcon.getImageUrl("placeholder", UIConstants.TANK_ICON_SIZES.MEDIUM));
        this.load.image("addtank", Images.url("lobby/addTank.png"));

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

        this.state.start("Main");
    }
}

PlayerPanel.UIPreloadState = UIPreloadState;
