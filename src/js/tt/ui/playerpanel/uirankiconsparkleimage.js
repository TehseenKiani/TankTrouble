import { UIConstants } from "../uiconstants.js";

export class UIRankIconSparkleImage extends Phaser.Image {
    constructor(game) {
        // Call super.
        super(game, 0, 0, "ranks", "sparkle");

        this.anchor.setTo(0.5, 0.5);

        this.tint = 0xffff00 + (Math.random() * 0x000099);

        // Disable sparkle.
        this.kill();
    }

    update() {
    }

    spawn(x, y, delay) {
        // Revive and place the image.
        this.reset(x, y);

        this.scale.setTo(0.01, 0.01);
        this.sizeTween = this.game.add.tween(this.scale);
        this.sizeTween.to({ x: 1.0, y: 1.0 }, UIConstants.SPARKLE_ANIMATION_TIME, Phaser.Easing.Linear.None, false, delay);
        this.sizeTween.to({ x: 0.01, y: 0.01 }, UIConstants.SPARKLE_ANIMATION_TIME, Phaser.Easing.Linear.None, true);
        this.sizeTween.onComplete.add(
            () => {
                this.kill();
            },
            this
        );

        this.rotation = Math.random() * Math.PI;

        this.rotationTween = this.game.add.tween(this).to({ rotation: this.rotation + Math.PI }, 2 * UIConstants.SPARKLE_ANIMATION_TIME, Phaser.Easing.Linear.None, true, delay);
    }

    remove() {
        if (this.sizeTween) {
            this.sizeTween.stop();
        }

        if (this.rotationTween) {
            this.rotationTween.stop();
        }

        // Kill the image.
        this.kill();
    }

    retire() {
        if (this.sizeTween) {
            this.sizeTween.stop();
        }

        if (this.rotationTween) {
            this.rotationTween.stop();
        }

        // Kill the image.
        this.kill();
    }
}
