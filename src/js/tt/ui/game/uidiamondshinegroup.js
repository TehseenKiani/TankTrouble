import { UIConstants } from "../uiconstants.js";

export class UIDiamondShineGroup extends Phaser.Group {
    constructor(game) {
        // Call super.
        super(game, null);

        // Create glow image.
        this.glowImage = this.addChild(new Phaser.Image(game, 0, 0, "game", "diamondGlow"));
        this.glowImage.anchor.setTo(0.5, 0.5);

        // Create ray images.
        this.firstRayImage = this.addChild(new Phaser.Image(game, 0, 0, "game", "diamondRays"));
        this.firstRayImage.anchor.setTo(0.5, 0.5);
        this.secondRayImage = this.addChild(new Phaser.Image(game, 0, 0, "game", "diamondRays"));
        this.secondRayImage.anchor.setTo(0.5, 0.5);

        this.animationTime = 0.0;

        // Disable shine.
        this.exists = false;
        this.visible = false;
        this.glowImage.kill();
        this.firstRayImage.kill();
        this.secondRayImage.kill();
    }

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return false;
        }

        this.animationTime += this.game.time.delta / 1000;

        // Animate glow.
        const glowScaleAnimationValue = ((Math.cos(this.animationTime * 2.0 * Math.PI) / UIConstants.DIAMOND_GLOW_SCALE_CYCLE_SPEED) * 0.25) + 1.25;
        this.glowImage.scale.setTo(glowScaleAnimationValue, glowScaleAnimationValue);

        // Animate rays.
        this.firstRayImage.rotation += (UIConstants.DIAMOND_FIRST_RAY_ROTATION_SPEED * this.game.time.delta) / 1000;
        this.secondRayImage.rotation += (UIConstants.DIAMOND_SECOND_RAY_ROTATION_SPEED * this.game.time.delta) / 1000;

        const firstRayAlphaAnimationTime = this.animationTime * 2.0 * Math.PI;
        this.firstRayImage.alpha = (Math.cos(firstRayAlphaAnimationTime / UIConstants.DIAMOND_FIRST_RAY_OPACITY_CYCLE_SPEED) * 0.4) + 0.6;
        const secondRayAlphaAnimationTime = (this.animationTime + UIConstants.DIAMOND_SECOND_RAY_OPACITY_CYCLE_PHASE) * 2.0 * Math.PI;
        this.secondRayImage.alpha = (Math.cos(secondRayAlphaAnimationTime / UIConstants.DIAMOND_SECOND_RAY_OPACITY_CYCLE_SPEED) * 0.4) + 0.6;
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    spawn(x, y, rotation) {
        // Revive and place the group.
        this.exists = true;
        this.visible = true;
        this.x = x;
        this.y = y;
        this.rotation = rotation;

        this.glowImage.revive();
        this.firstRayImage.revive();
        this.secondRayImage.revive();

        // Reset state.
        this.alpha = 0.0;
        this.animationTime = 0.0;
        this.firstRayImage.rotation = Math.random() * Math.PI;
        this.secondRayImage.rotation = this.firstRayImage.rotation + (Math.PI * 0.25);

        this.fadeInTween = this.game.add.tween(this).to({ alpha: 1 }, UIConstants.DIAMOND_SPAWN_TIME, Phaser.Easing.Linear.None, true);
    }

    getShineInfo() {
        return { firstRayAngle: this.firstRayImage.angle, firstRayAlpha: this.firstRayImage.alpha,
            secondRayAngle: this.secondRayImage.angle, secondRayAlpha: this.secondRayImage.alpha,
            glowScale: this.glowImage.scale };
    }

    remove() {
        if (this.fadeInTween) {
            this.fadeInTween.stop();
        }

        // Kill the group.
        this.exists = false;
        this.visible = false;

        this.glowImage.kill();
        this.firstRayImage.kill();
        this.secondRayImage.kill();
    }

    retire() {
        if (this.fadeInTween) {
            this.fadeInTween.stop();
        }

        // Kill the group.
        this.exists = false;
        this.visible = false;

        this.glowImage.kill();
        this.firstRayImage.kill();
        this.secondRayImage.kill();
    }
}
