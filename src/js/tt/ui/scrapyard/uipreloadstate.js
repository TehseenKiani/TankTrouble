import { Scrapyard } from "./scrapyard.js";
import { Images } from "../../../images.js";

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - load - a reference to the Phaser.Loader
 *  - add - a reference to the Phaser.GameObjectFactory
*/
class UIPreloadState {
    preload() {
        // Load game assets
        this.load.spritesheet("plates", Images.url("snippets/plates.png"), 22, 42, 20);
    }

    create() {
        this.state.start("Main");
    }
}

Scrapyard.UIPreloadState = UIPreloadState;
