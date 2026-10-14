import { GAME_VIEWPORT, updateCanvasViewport } from "../canvaslayout.js";
import { Game } from "./game.js";
import { Images } from "../../../images.js";
import { Log } from "../../log.js";
import { OverlayManager } from "../../../overlaymanager.js";
import { UIConstants } from "../uiconstants.js";

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - load - a reference to the Phaser.Loader
 *  - scale - a reference to the Phaser.ScaleManager
 *  - state - a reference to the Phaser.StateManager
*/

//setting game configuration and loading the assets for the loading screen
class UIBootState {
    log = null;

    init() {
        this.game.plugins.add(PhaserSpine.SpinePlugin);
        this.game.plugins.add(PhaserNineSlice.Plugin);
        if (this.game.debug.text) {
            this.game.time.advancedTiming = true;
        }
    }

    preload() {
        //assets we'll use in the loading screen
        this.load.image("preloadbar", Images.url("lobby/waiting.png"));
        this.load.image("waitingicon", Images.url("lobby/waiting.png"));
    }

    create() {
        // Create log.
        this.log = new Log("UIBootState");

        // Generally, we do not want to prevent default actions such as touch scrolling.
        this.input.touch.preventDefault = false;

        // We do not want the page to scroll to top on every scale refresh.
        this.scale.compatibility.scrollTo = false;

        // Prevent right click menu.
        this.game.canvas.oncontextmenu = event => { event.preventDefault(); };

        // Do not pause the sounds when losing focus.
        this.game.stage.disableVisibilityChange = true;

        // Capture keyboard input to prevent bubbling to browser.
        this.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.SPACEBAR]);

        // Disable game input if overlay is showing.
        if (OverlayManager.isOverlayShowing()) {
            this.input.enabled = false;
        }

        // Set world size.
        this.world.bounds = new Phaser.Rectangle(0, 0, this.game.width, this.game.height);

        // Update camera bounds.
        this.camera.setBoundsToWorld();

        // Loading screen will have a white background.
        this.stage.backgroundColor = "#fff";

        // Set scale mode to user scale.
        this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        updateCanvasViewport(this.game, { width: this.game.width, height: this.game.height }, GAME_VIEWPORT, UIConstants.CANVAS_PIXEL_RATIO);
        this.scale.setResizeCallback((scale, parentBounds) => {
            updateCanvasViewport(this.game, parentBounds, GAME_VIEWPORT, UIConstants.CANVAS_PIXEL_RATIO);
        }, this);

        this.state.start("Preload");
    }
}

Game.UIBootState = UIBootState;
