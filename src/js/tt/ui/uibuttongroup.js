import { UIConstants } from "./uiconstants.js";
import { UIUtils } from "./uiutils.js";

export class UIButtonGroup extends Phaser.Group {
    constructor(game, x, y, type, size, text, pressedFunction, context, minWidth, keyboardShortcut) {
        // Call super.
        super(game, null);
        this.x = x;
        this.y = y;

        this.type = type;
        this.size = size;
        this.text = text;
        this.pressedFunction = pressedFunction;
        this.context = context;
        this.minWidth = minWidth || 0;
        this.keyboardShortcut = keyboardShortcut || false;

        this.isInputEnabled = true;
        this.isEnabled = true;

        // Setup the correct size buttons.
        this.setSize(this.size);

        // Hide active and disabled button.
        this.enable();

        this.removeTween = null;
        this.spawnTween = null;

        this.scale.set(0.0, 0.0);
        this.exists = false;
        this.visible = false;
    }

    spawn() {
        this.exists = true;
        this.visible = true;
        this.enable();

        const delay = 50 + (Math.random() * 200);

        if (this.removeTween) {
            this.removeTween.stop();
            this.removeTween = null;
        }
        this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
    }

    setMinWidth(minWidth) {
        this.minWidth = minWidth;

        this._updateSize();
    }

    setText(text) {
        this.text = text;

        this.buttonText.setText(text);

        this._updateSize();
    }

    setSize(size) {
        this.size = size;

        if (this.buttonSlice) {
            this.removeChild(this.buttonSlice);
            this.buttonSlice.destroy();
        }
        this.buttonSlice = this.addChild(new PhaserNineSlice.NineSlice(this.game, 0, 0, `button${this.type}${UIConstants.BUTTON_RESOLUTIONS[this.size]}`, null, 1, 1));
        this.buttonSlice.anchor.setTo(0.5, 0.5);

        if (this.buttonSliceActive) {
            this.removeChild(this.buttonSliceActive);
            this.buttonSliceActive.destroy();
        }
        this.buttonSliceActive = this.addChild(new PhaserNineSlice.NineSlice(this.game, 0, 0, `button${this.type}${UIConstants.BUTTON_RESOLUTIONS[this.size]}Active`, null, 1, 1));
        this.buttonSliceActive.anchor.setTo(0.5, 0.5);

        if (this.buttonSliceDisabled) {
            this.removeChild(this.buttonSliceDisabled);
            this.buttonSliceDisabled.destroy();
        }
        this.buttonSliceDisabled = this.addChild(new PhaserNineSlice.NineSlice(this.game, 0, 0, `button${UIConstants.BUTTON_RESOLUTIONS[this.size]}Disabled`, null, 1, 1));
        this.buttonSliceDisabled.anchor.setTo(0.5, 0.5);

        if (this.buttonText) {
            this.removeChild(this.buttonText);
            this.buttonText.destroy();
        }
        this.buttonText = this.addChild(new Phaser.Text(this.game, 0, 0, this.text, { font: `${UIConstants.BUTTON_FONT_SIZES[this.size]}px TankTrouble`, fill: "#fff" }));
        this.buttonText.anchor.setTo(0.5, 0.5);

        this.buttonTextY = UIUtils.computeButtonTextY(this.size, UIConstants.BUTTON_FONT_BASELINE_FRACTION);
        this.buttonText.y = this.buttonTextY;

        this._updateSize();

        if (this.isInputEnabled) {
            this.buttonSlice.inputEnabled = true;
            this.buttonSlice.input.useHandCursor = true;
            this.buttonSliceActive.inputEnabled = true;
            this.buttonSliceActive.input.useHandCursor = true;
        } else {
            this.buttonSlice.inputEnabled = false;
            this.buttonSliceActive.inputEnabled = false;
        }

        if (this.isEnabled) {
            this.buttonSlice.revive();
            this.buttonSliceActive.kill();
            this.buttonSliceDisabled.kill();
        } else {
            this.buttonSlice.kill();
            this.buttonSliceActive.kill();
            this.buttonSliceDisabled.revive();
            this.buttonText.y = this.buttonTextY;
        }

        UIUtils.addButton(this.buttonSlice,
            self => {
                // Deactivate mouse pointer button click.
                self.game.input.mousePointer.leftButton.reset();

                self.buttonSlice.kill();
                self.buttonSliceActive.revive();
                self.buttonText.y = self.buttonTextY + UIConstants.BUTTON_ACTIVE_OFFSET;
            },
            self => {
                self.buttonSlice.revive();
                self.buttonSliceActive.kill();
                self.buttonText.y = self.buttonTextY;
            },
            self => {
                self.pressedFunction.call(self.context);
            },
            this
        );
    }

    enableInput() {
        this.isInputEnabled = true;

        this.buttonSlice.inputEnabled = true;
        this.buttonSlice.input.useHandCursor = true;
        this.buttonSliceActive.inputEnabled = true;
        this.buttonSliceActive.input.useHandCursor = true;
    }

    disableInput() {
        this.isInputEnabled = false;

        this.buttonSlice.inputEnabled = false;
        this.buttonSliceActive.inputEnabled = false;
    }

    enable() {
        this.isEnabled = true;

        this.enableInput();
        this.buttonSlice.revive();
        this.buttonSliceActive.kill();
        this.buttonSliceDisabled.kill();
    }

    disable() {
        this.isEnabled = false;

        this.disableInput();
        this.buttonSlice.kill();
        this.buttonSliceActive.kill();
        this.buttonSliceDisabled.revive();
        this.buttonText.y = this.buttonTextY;
    }

    _updateSize() {
        const width = Math.max(this.minWidth, this.buttonText.width + (2 * UIConstants.BUTTON_MARGINS[this.size])) + (2 * UIConstants.BUTTON_SHADOW_WIDTH);
        const height = UIConstants.BUTTON_HEIGHTS[this.size] + UIConstants.BUTTON_SHADOW_HEIGHT_TOP + UIConstants.BUTTON_SHADOW_HEIGHT_BOTTOM;
        this.buttonSlice.resize(width, height);
        this.buttonSliceActive.resize(width, height);
        this.buttonSliceDisabled.resize(width, height);
    }

    update() {
        if (!this.exists) {
            return;
        }

        if (this.isEnabled && this.isInputEnabled && this.keyboardShortcut) {
            if (this.game.input.keyboard.downDuration(this.keyboardShortcut, 16)) {
                this.pressedFunction.call(this.context);
            }
        }

        // Call super.
        super.update();
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    remove() {
        this.disableInput();

        if (this.spawnTween) {
            this.spawnTween.stop();
            this.spawnTween = null;
        }
        this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        this.removeTween.onComplete.add(
            () => {
                // Kill the button.
                this.exists = false;
                this.visible = false;
            },
            this
        );
    }

    retire() {
        // Kill the button.
        this.exists = false;
        this.visible = false;
    }
}
