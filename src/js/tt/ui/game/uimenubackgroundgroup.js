import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UIDimitriSpine } from "../uidimitrispine.js";
import { UILaikaSpine } from "../uilaikaspine.js";

export class UIMenuBackgroundGroup extends Phaser.Group {
    constructor(game, x, y) {
        // Call super.
        super(game, null);
        this.x = x;
        this.y = y;

        // Add background image.
        this.backgroundImage = this.game.add.image(0, 0, "menuBackground", 0, this);
        this.backgroundImage.anchor.setTo(0.5, 0.5);

        // Add Laika spine.
        this.laikaSpine = this.addChild(new UILaikaSpine(this.game, UIConstants.MENU_LAIKA_X, UIConstants.MENU_LAIKA_Y));
        this.laikaSpine.anchor.setTo(0.5, 0.5);

        // Add Dimitri spine.
        this.dimitriSpine = this.addChild(new UIDimitriSpine(this.game, UIConstants.MENU_DIMITRI_X, UIConstants.MENU_DIMITRI_Y));
        this.dimitriSpine.anchor.setTo(0.5, 0.5);

        this.laikaSpine.idle();
        this.dimitriSpine.idle();

        // State.
        this.laikaEventDelay = UIConstants.MENU_LAIKA_MIN_EVENT_DELAY + (Math.random() * (UIConstants.MENU_LAIKA_MAX_EVENT_DELAY - UIConstants.MENU_LAIKA_MIN_EVENT_DELAY));
        this.dimitriEventDelay = UIConstants.MENU_DIMITRI_MIN_EVENT_DELAY + (Math.random() * (UIConstants.MENU_DIMITRI_MAX_EVENT_DELAY - UIConstants.MENU_DIMITRI_MIN_EVENT_DELAY));

        // Create log.
        this.log = new Log("UIMenuBackgroundGroup");
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.update();

        // Make animation calls.
        this.laikaEventDelay -= this.game.time.delta / 1000;
        if (this.laikaEventDelay < 0) {
            this.laikaEventDelay = UIConstants.MENU_LAIKA_MIN_EVENT_DELAY + (Math.random() * (UIConstants.MENU_LAIKA_MAX_EVENT_DELAY - UIConstants.MENU_LAIKA_MIN_EVENT_DELAY));
            if (Math.random() > 0.5) {
                this.laikaSpine.growl(UIConstants.MENU_LAIKA_GROWL_TIME);
            } else {
                this.laikaSpine.howl(UIConstants.MENU_LAIKA_HOWL_TIME);
            }
        }

        this.dimitriEventDelay -= this.game.time.delta / 1000;
        if (this.dimitriEventDelay < 0) {
            this.dimitriEventDelay = UIConstants.MENU_DIMITRI_MIN_EVENT_DELAY + (Math.random() * (UIConstants.MENU_DIMITRI_MAX_EVENT_DELAY - UIConstants.MENU_DIMITRI_MIN_EVENT_DELAY));
            this.dimitriSpine.scowl(UIConstants.MENU_DIMITRI_SCOWL_TIME);
        }
    }

    retire() {
        this.exists = false;
        this.visible = false;
        this.laikaSpine.retire();
        this.dimitriSpine.retire();
    }
}
