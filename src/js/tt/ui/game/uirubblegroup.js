import { Log } from "../../log.js";
import { QualityManager } from "../../../qualitymanager.js";
import { UIConstants } from "../uiconstants.js";
import { UIRubbleEmitter } from "./uirubbleemitter.js";
import { UIRubbleFragmentSprite } from "./uirubblefragmentsprite.js";
import { UIUtils } from "../uiutils.js";

export class UIRubbleGroup extends Phaser.Group {
    constructor(game) {
        // Call super.
        super(game, null);

        // Create fragment group.
        this.fragmentGroup = this.game.add.group(this);

        // Add pool of fragments.
        for (let i = 0; i < UIConstants.RUBBLE_FRAGMENT_POOL_SIZE; ++i) {
            this.fragmentGroup.add(new UIRubbleFragmentSprite(game));
        }

        // Create smoke emitter.
        this.emitter = this.add(new UIRubbleEmitter(game));

        // Create log.
        this.log = new Log("UIRubbleGroup");

        // Disable rubble.
        this.exists = false;
        this.visible = false;
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.update();

        // Disable when all children are dead.
        if (this.countLiving() <= 1 && this.fragmentGroup.countLiving() === 0) {
            this.exists = false;
            this.visible = false;
        }
    }

    emit(tank) {
        if (QualityManager.getQuality() !== QualityManager.QUALITY_SETTINGS.LOW) {
            if (tank.getSpeed() !== 0.0 || tank.getRotationSpeed() !== 0.0) {
                this.exists = true;
                this.visible = true;

                const rubbleFragmentSprite = this.fragmentGroup.getFirstExists(false);
                if (rubbleFragmentSprite) {
                    rubbleFragmentSprite.spawn(UIUtils.mpx(tank.getX()), UIUtils.mpx(tank.getY()), tank.getRotation(), tank.getSpeed());
                } else {
                    // this.log.error("Could not create rubble fragment sprite. No sprite available.");
                }

                this.emitter.emit(UIUtils.mpx(tank.getX()), UIUtils.mpx(tank.getY()), tank.getRotation(), tank.getSpeed());
            }
        }
    }

    retire() {
        this.exists = false;
        this.visible = false;
        this.emitter.retire();
        this.fragmentGroup.callAll("retire");
    }
}
