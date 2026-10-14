import { Scrapyard } from "./scrapyard.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";

class UIBootState {
    log = null;

    create() {
        // Create log
        this.log = new Log("UIBootState");

        // Generally, we do not want to prevent default actions such as touch scrolling.
        this.input.touch.preventDefault = false;

        // We do not want the page to scroll to top on every scale refresh.
        this.scale.compatibility.scrollTo = false;

        // Do not pause when losing focus.
        this.game.stage.disableVisibilityChange = true;

        // Set scale mode to user scale.
        this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.scale.setUserScale(1.0 / UIConstants.CANVAS_PIXEL_RATIO, 1.0 / UIConstants.CANVAS_PIXEL_RATIO, 0, 0);
        this.scale.setGameSize(this.game.width * UIConstants.CANVAS_PIXEL_RATIO, this.game.height * UIConstants.CANVAS_PIXEL_RATIO);

        // Setup resize callback to resize the game whenever the parent bounds change
        this.scale.setResizeCallback((scale, parentBounds) => {
            if (Math.abs((parentBounds.width * UIConstants.CANVAS_PIXEL_RATIO) - this.game.width) >= 0.01 ||
                Math.abs((parentBounds.height * UIConstants.CANVAS_PIXEL_RATIO) - this.game.height) >= 0.01) {
                this.log.debug("RESIZE CANVAS!");
                this.scale.setGameSize(parentBounds.width * UIConstants.CANVAS_PIXEL_RATIO, parentBounds.height * UIConstants.CANVAS_PIXEL_RATIO);
            }
        }, this);

        this.state.start("Preload");
    }
}

Scrapyard.UIBootState = UIBootState;

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - scale - a reference to the Phaser.ScaleManager
 *  - state - a reference to the Phaser.StateManager
*/
