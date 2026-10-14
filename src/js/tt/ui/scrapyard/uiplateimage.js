import { UIConstants } from "../uiconstants.js";

//FIXME Maybe collect sounds in a wrapper object

export class UIPlateImage extends Phaser.Image {
    constructor(game) {
        // Call super.
        super(game, 0, 0, "plates");

        // State
        this.ancestor = null;
        this.created = 0;
        this.digit = 0;

        // Disable plate
        this.kill();
    }

    spawn(x, y, digit, flipped, ancestor) {
        // Revive and place the sprite
        this.reset(x, y);

        // State
        this.ancestor = ancestor;
        this.created = this.game.time.now;
        this.digit = digit;

        // Set up plate
        if (flipped) {
            this.frame = this.digit + 10;
            this.bringToTop();
        } else {
            this.anchor.y = 1;
            this.frame = this.digit;
            this.sendToBack();
        }
    }

    flip() {
        // Begin flip tween
        const topTween = this.game.add.tween(this.scale).to({ y: 0 }, UIConstants.SCRAPYARD_FLIP_TIME / 2, Phaser.Easing.Sinusoidal.In, true);
        const bottomTween = this.game.add.tween(this.scale).to({ y: 1 }, UIConstants.SCRAPYARD_FLIP_TIME / 2, Phaser.Easing.Sinusoidal.Out);
        topTween.chain(bottomTween);

        topTween.onComplete.add(() => {
            // Switch to successor's digit
            this.digit = (this.digit + 1) % 10;

            // Switch to digit's bottom frame
            this.frame = this.digit + 10;
            this.anchor.y = 0;

            this.bringToTop();
        }, this);

        bottomTween.onComplete.add(() => {
            // This plates now completely covers its ancestor plate and we can remove the ancestor
            if (this.ancestor) {
                this.ancestor.remove();
            }
        }, this);
    }

    remove() {
        this.kill();
    }
}
