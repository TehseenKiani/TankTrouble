import { Constants } from "../../constants.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";
import { Log } from "../../log.js";

export class UIDiamondSprite extends Phaser.Sprite {
    constructor(game, gameController, shineGroup, sparkleGroup) {
        // Call super.
        super(game, 0, 0, "game", "diamond");
        this.log = new Log("UIDiamondSprite");

        this.anchor.setTo(0.5, 0.5);

        this.gameController = gameController;
        this.shineGroup = shineGroup;
        this.sparkleGroup = sparkleGroup;

        this.diamondShine = null;

        this.sparkleIntervalTime = 0.0;

        // Disable diamond.
        this.kill();
    }

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return false;
        }

        this.sparkleIntervalTime -= this.game.time.delta;

        if (this.sparkleIntervalTime <= 0.0) {
            this._sparkle();
            this.sparkleIntervalTime = UIConstants.DIAMOND_SPARKLE_MIN_INTERVAL_TIME + (Math.random() * (UIConstants.DIAMOND_SPARKLE_MAX_INTERVAL_TIME - UIConstants.DIAMOND_SPARKLE_MIN_INTERVAL_TIME));
        }

        // Update position from game model.
        const diamond = this.gameController.getCollectible(this.diamondId);
        if (diamond) {
            this.smoothedX = (this.x + UIUtils.mpx(diamond.getX())) / 2.0;
            this.smoothedY = (this.y + UIUtils.mpx(diamond.getY())) / 2.0;
        }

        this.x = this.smoothedX;
        this.y = this.smoothedY;
    }

    spawn(x, y, rotation, diamondId, animate) {
        // Revive and place the sprite.
        this.reset(x, y);
        this.scale.setTo(1.0, 1.0);
        this.rotation = rotation;

        this.smoothedX = x;
        this.smoothedY = y;

        if (animate) {
            this.game.sound.play("diamondSpawn");

            this.scale.setTo(0.01, 0.01);
            this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.DIAMOND_SPAWN_TIME, Phaser.Easing.Quadratic.Out, true);
        }

        // Create shine.
        this.diamondShine = this.shineGroup.getFirstExists(false);
        if (this.diamondShine) {
            const shineX = this.x;
            const shineY = this.y;
            const shineRotation = this.rotation;

            this.diamondShine.spawn(shineX, shineY, shineRotation);
        } else {
            this.log.error("Could not create diamond shine group. No group available.");
        }

        // Store diamondId.
        this.diamondId = diamondId;

        // Reset state.
        this.sparkleIntervalTime = UIConstants.DIAMOND_SPARKLE_MIN_INTERVAL_TIME + (Math.random() * (UIConstants.DIAMOND_SPARKLE_MAX_INTERVAL_TIME - UIConstants.DIAMOND_SPARKLE_MIN_INTERVAL_TIME));
    }

    getExtraPositionInfo() {
        if (this.diamondShine) {
            return this.diamondShine.getShineInfo();
        }

        return null;
    }

    _sparkle() {
        const sparkleImage = this.sparkleGroup.getFirstExists(false);
        if (sparkleImage) {
            const distance = (Constants.DIAMOND.HEIGHT.px * 0.5) - 5 - (Math.random() * 5);
            const angle = Math.random() * 2.0 * Math.PI;

            const localX = Math.cos(angle) * distance * 0.5;
            const localY = Math.sin(angle) * distance;

            // Rotate sparkle position
            const sparkleX = this.x + (Math.cos(this.rotation) * localX) - (Math.sin(this.rotation) * localY);
            const sparkleY = this.y + (Math.sin(this.rotation) * localX) + (Math.cos(this.rotation) * localY);

            sparkleImage.spawn(sparkleX, sparkleY);
        } else {
            this.log.error("Could not create gold sparkle image. No image available.");
        }
    }

    remove() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        this.kill();
        if (this.diamondShine) {
            this.diamondShine.remove();
        }
    }

    retire() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        // Kill the sprite.
        this.kill();

        if (this.diamondShine) {
            this.diamondShine.retire();
        }
    }
}
