import { UIConstants } from "../uiconstants.js";

export class UIScrollerArrowImage extends Phaser.Image {
    constructor(game, direction, scrollFunction, releaseFunction, context) {
        // Call super.
        super(game, 0, 0, `${direction}arrow`);
        this.anchor.setTo(0.5, 0.5);

        this.scrollFunction = scrollFunction;
        this.releaseFunction = releaseFunction;
        this.context = context;

        // State.
        this.pressed = false;
        this.timePressed = 0;
        this.clicked = false;

        this.removeTween = null;

        this.inputEnabled = true;
        this.input.useHandCursor = true;
        this.events.onInputDown.add(this._onInputDownHandler, this);
        this.events.onInputUp.add(this._onInputUpHandler, this);
        this.events.onInputOver.add(this._onInputOverHandler, this);
        this.events.onInputOut.add(this._onInputOutHandler, this);

        // Disable spray can.
        this.kill();
        this.scale.set(0.0, 0.0);
    }

    update() {
        if (!this.exists) {
            return;
        }

        if (this.pressed || this.clicked) {
            this.scrollFunction.call(this.context);
        }
    }

    spawn(x, y) {
        // Revive and place the sprite.
        this.reset(x, y);

        // Reset state.
        this.pressed = false;
        this.timePressed = 0;
        this.clicked = false;

        if (this.removeTween) {
            this.removeTween.stop();
        }
        this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true);
    }

    releaseClick() {
        if (this.clicked) {
            this.releaseFunction.call(this.context);
        }
        this.clicked = false;
    }

    _onInputDownHandler(sprite, pointer) {
        this.pressed = true;
        this.timePressed = pointer.timeDown;
        this.clicked = false;
    }

    _onInputUpHandler(sprite, pointer) {
        if (pointer.timeUp - this.timePressed < UIConstants.MAX_CLICK_LENGTH) {
            this.clicked = true;
        } else if (this.pressed) {
            this.releaseFunction.call(this.context);
        }
        this.pressed = false;
    }

    _onInputOverHandler(sprite, pointer) {
        this.game.add.tween(this.scale).to({ x: 1.2, y: 1.2 }, UIConstants.ELEMENT_SELECTION_TIME, Phaser.Easing.Back.Out, true);
    }

    _onInputOutHandler(sprite, pointer) {
        this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_DESELECTION_TIME, Phaser.Easing.Back.Out, true);
    }

    remove() {
        this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        this.removeTween.onComplete.add(
            () => {
                // Kill the sprite.
                this.kill();
            },
            this
        );
    }

    retire() {
        this.events.onDragStart.remove(this._onDragStartHandler, this);
        this.events.onDragStop.remove(this._onDragStopHandler, this);

        // Kill the sprite.
        this.kill();
    }
}
