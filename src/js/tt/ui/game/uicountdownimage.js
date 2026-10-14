import { UIConstants } from "../uiconstants.js";

export class UICountDownImage extends Phaser.Image {
    constructor(game) {
        // Call super.
        super(game, 0, 0, "game", "countdown0");

        this.anchor.set(0.5, 0.5);

        // Kill the sprite.
        this.kill();
    }

    update() {
    }

    spawn(countDownValue) {
        // Revive the sprite.
        this.revive();

        this.frameName = `countdown${countDownValue}`;

        this.alpha = 1.0;
        this.scale.set(0.0, 0.0);

        if (countDownValue > 0) {
            this.removeEvent = this.game.time.events.add(UIConstants.COUNT_DOWN_DISPLAY_TIME, this.remove, this);

            this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, 300, Phaser.Easing.Back.Out, true);
        } else {
            this.game.add.tween(this.scale).to({ x: 2.0, y: 2.0 }, 500, Phaser.Easing.Cubic.Out, true);
            this.game.add.tween(this).to({ alpha: 0.0 }, 100, Phaser.Easing.Linear.None, true, 400).onComplete.add(
                () => {
                    // Kill the sprite.
                    this.kill();
                },
                this
            );
        }
    }

    remove() {
        this.removeEvent = null;

        // Animate icon away.
        this.game.add.tween(this).to({ alpha: 0.0 }, 100, Phaser.Easing.Linear.None, true);
        this.game.add.tween(this.scale).to({ x: 1.5, y: 1.5 }, 100, Phaser.Easing.Linear.None, true).onComplete.add(
            () => {
                // Kill the sprite.
                this.kill();
            },
            this
        );
    }

    retire() {
        if (this.removeEvent) {
            this.game.time.events.remove(this.removeEvent);
        }

        // Kill the sprite.
        this.kill();
    }
}
