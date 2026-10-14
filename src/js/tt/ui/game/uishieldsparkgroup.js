import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UIShieldSparkBoltImage } from "./uishieldsparkboltimage.js";
import { UIShieldSparkEmitter } from "./uishieldsparkemitter.js";
import { UIUtils } from "../uiutils.js";

export class UIShieldSparkGroup extends Phaser.Group {
    constructor(game) {
        // Call super.
        super(game, null);

        // Create bolt group.
        this.boltGroup = this.game.add.group(this);

        // Add pool of bolts.
        for (let i = 0; i < UIConstants.SHIELD_SPARK_BOLT_POOL_SIZE; ++i) {
            this.boltGroup.add(new UIShieldSparkBoltImage(game));
        }

        // Create spark emitter.
        this.emitter = this.add(new UIShieldSparkEmitter(game));

        // Create log.
        this.log = new Log("UIShieldSparkGroup");

        // Disable shield spark.
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
        if (this.countLiving() <= 1 && this.boltGroup.countLiving() === 0) {
            this.exists = false;
            this.visible = false;
        }
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    emit(tank, position) {
        this.exists = true;
        this.visible = true;

        const boltImage = this.boltGroup.getFirstExists(false);
        const rotation = Phaser.Math.angleBetween(tank.getX(), tank.getY(), position.x, position.y);

        if (boltImage) {
            boltImage.spawn(UIUtils.mpx(position.x), UIUtils.mpx(position.y), rotation);
        } else {
            // this.log.error("Could not create shield spark bolt sprite. No sprite available.");
        }

        this.emitter.emit(UIUtils.mpx(position.x), UIUtils.mpx(position.y), rotation);
    }

    retire() {
        this.exists = false;
        this.visible = false;
        this.emitter.retire();
        this.boltGroup.callAll("retire");
    }
}
