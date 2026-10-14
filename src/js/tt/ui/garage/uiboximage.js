import { UIConstants } from "../uiconstants.js";

//FIXME Maybe collect sounds in a wrapper object.
export class UIBoxImage extends Phaser.Image {
    constructor(game, id, selectedFunction, context) {
        // Call super.
        super(game, 0, 0, `box${id}`);
        this.anchor.setTo(0.5, 0.9);
        this.hitArea = new Phaser.Rectangle((-this.width * 0.5) / 2, (-this.height * 0.9) / 2, this.width / 2, this.height / 2);

        this.id = id;
        this.selectedFunction = selectedFunction;
        this.context = context;

        // State.
        this.unlocked = null;
        this.disabled = false;
        this.open = false;
        this.selected = false;

        this.spawnTween = null;
        this.removeTween = null;
        this.sizeTween = null;

        this.enable();

        this.events.onInputUp.add(this._onInputUpHandler, this);
        this.events.onInputOver.add(this._onInputOverHandler, this);
        this.events.onInputOut.add(this._onInputOutHandler, this);

        // Disable box.
        this.kill();
        this.scale.set(0.0, 0.0);
    }

    update() {
    }

    spawn(x, y, unlocked, delay) {
        // Revive and place the sprite.
        this.reset(x, y);
        this.scale.set(0.0, 0.0);

        // Reset state.
        this.disabled = false;
        this.selected = false;

        if (this.open) {
            this.frame = 1;
        } else {
            this.frame = 0;
        }

        // Store params.
        this.unlocked = unlocked;

        if (this.unlocked) {
            this.enable();
        } else {
            this.inputEnabled = false;

            this.tint = 0x333333;
        }

        if (this.removeTween) {
            this.removeTween.stop();
            this.removeTween = null;
        }
        if (this.sizeTween) {
            this.sizeTween.stop();
        }

        if (this.open) {
            this.select();
        } else {
            this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
        }
    }

    _onInputUpHandler(sprite, pointer) {
        this.selectedFunction(this, this.context);
    }

    _onInputOverHandler(sprite, pointer) {
        if (!this.selected && !this.disabled) {
            this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.1, y: 1.1 }, UIConstants.ELEMENT_SELECTION_TIME, Phaser.Easing.Back.Out, true);
        }
    }

    _onInputOutHandler(sprite, pointer) {
        if (!this.selected && !this.disabled) {
            this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_DESELECTION_TIME, Phaser.Easing.Back.Out, true);
        }
    }

    deselect() {
        this.selected = false;
        this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_SELECTION_TIME, Phaser.Easing.Back.Out, true);
    }

    select() {
        this.selected = true;
        this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.2, y: 1.2 }, UIConstants.ELEMENT_SELECTION_TIME, Phaser.Easing.Back.Out, true);
    }

    disable() {
        this.disabled = true;
        this.inputEnabled = false;
    }

    enable() {
        if (!this.open && this.unlocked) {
            this.disabled = false;
            this.inputEnabled = true;
            this.input.useHandCursor = true;
        }
    }

    openBox() {
        if (!this.open) {
            this.open = true;
            this.disable();

            this.frame = 1;
        }
    }

    closeBox() {
        if (this.open) {
            this.open = false;
            this.enable();

            this.frame = 0;
        }
    }

    getId() {
        return this.id;
    }

    remove() {
        this.disable();

        if (this.spawnTween) {
            this.spawnTween.stop();
        }
        if (this.sizeTween) {
            this.sizeTween.stop();
        }

        // If already removing, don't add another tween.
        if (!this.removeTween) {
            this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
            this.removeTween.onComplete.add(
                () => {
                    this.removeTween = null;
                    // Kill the sprite.
                    this.kill();
                },
                this
            );
        }
    }

    retire() {
        // Kill the sprite.
        this.kill();
    }
}
