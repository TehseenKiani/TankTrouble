import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

//FIXME Maybe collect sounds in a wrapper object.
export class UIAccessoryImage extends Phaser.Image {
    constructor(game, type, number, selectedFunction, smokeEmitter, sparkEmitter, accessoryToWelderPoints, context) {
        // Call super.
        super(game, 0, 0, type + number);
        this.anchor.setTo(0.5, 0.5);

        this.type = type;
        this.number = number;
        this.selectedFunction = selectedFunction;
        this.welderSmokeEmitter = smokeEmitter;
        this.welderSparkEmitter = sparkEmitter;
        this.accessoryToWelderPoints = accessoryToWelderPoints;
        this.context = context;

        // State.
        this.unlocked = null;
        this.disabled = false;
        this.busy = false;
        this.selected = false;
        this.weldingSound = null;

        this.flyOutTweenX = null;
        this.flyOutTweenY = null;
        this.spawnTween = null;
        this.removeTween = null;
        this.sizeTween = null;
        this.applyAccessoryEvent = null;

        this.enable();

        this.events.onInputUp.add(this._onInputUpHandler, this);
        this.events.onInputOver.add(this._onInputOverHandler, this);
        this.events.onInputOut.add(this._onInputOutHandler, this);

        // Disable accessory.
        this.kill();
        this.scale.set(0.0, 0.0);
    }

    update() {
    }

    spawn(x, y, unlocked, delay, startX, startY) {
        // If startX and startY are not specified, do not fly out.

        // Revive and place the sprite.
        if (startX !== undefined && startY !== undefined) {
            this.reset(startX, startY);
        } else {
            this.reset(x, y);
        }
        this.scale.set(0.0, 0.0);

        // Reset state.
        this.busy = true;
        this.disabled = false;
        this.selected = false;
        this.weldingSound = null;

        // Store params.
        this.unlocked = unlocked;

        if (this.unlocked) {
            this.inputEnabled = true;
            this.input.useHandCursor = true;
        } else {
            this.inputEnabled = false;

            this.tint = 0x333333;
        }

        if (this.removeTween) {
            this.removeTween.stop();
        }
        if (this.sizeTween) {
            this.sizeTween.stop();
        }

        if (startX !== undefined && startY !== undefined) {
            this.flyOutTweenX = this.game.add.tween(this.position).to({ x }, UIConstants.ACCESSORY_FLY_OUT_TIME, Phaser.Easing.Linear.None, true, delay);
            this.flyOutTweenY = this.game.add.tween(this.position).to({ y }, UIConstants.ACCESSORY_FLY_OUT_TIME, UIUtils.easingCubicBezier(0, 1.7, 1.7, 1), true, delay);
            this.flyOutTweenX.onComplete.add(
                () => {
                    this.busy = false;
                },
                this
            );
        }

        this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
        if (startX !== undefined && startY !== undefined) {
            this.spawnTween.onStart.add(
                () => {
                    this.game.sound.play(`woosh${Math.floor((Math.random() * 3) + 1)}`);
                },
                this
            );
        } else {
            this.busy = false;
        }
    }

    _onInputUpHandler(sprite, pointer) {
        this.selectedFunction.call(this.context, this);
    }

    _onInputOverHandler(sprite, pointer) {
        if (!this.disabled) {
            this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.2, y: 1.2 }, UIConstants.ELEMENT_SELECTION_TIME, Phaser.Easing.Back.Out, true);
        }
    }

    _onInputOutHandler(sprite, pointer) {
        if (!this.disabled) {
            this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_DESELECTION_TIME, Phaser.Easing.Back.Out, true);
        }
    }

    deselect(type) {
        if (this.getType() === type) {
            this.selected = false;
        }
    }

    select() {
        this.selected = true;
    }

    disable() {
        this.disabled = true;
        this.inputEnabled = false;
    }

    enable() {
        if (this.unlocked) {
            this.disabled = false;
            this.inputEnabled = true;
            this.input.useHandCursor = true;
        }
    }

    applyAccessory(tankIcon, tankIconScroller, floor) {
        if (!this.busy) {
            this.busy = true;
            this.disable();

            this.weldingSound = this.game.sound.play("welder");
            this.welderSmokeEmitter.spawn(tankIcon, this.accessoryToWelderPoints[this.getType() + tankIcon.getAccessory(this.getType())],
                this.accessoryToWelderPoints[this.getType() + this.getNumber()]);

            this.welderSparkEmitter.spawn(tankIcon, floor, this.accessoryToWelderPoints[this.getType() + tankIcon.getAccessory(this.getType())],
                this.accessoryToWelderPoints[this.getType() + this.getNumber()]);

            this.applyAccessoryEvent = this.game.time.events.add(500, () => {
                this.busy = false;
                this.enable();

                tankIcon.applyAccessory(this.getType(), this.getNumber());
                this.applyAccessoryEvent = null;
            }, this);

            // Disable tank icon scroller while welding.
            tankIconScroller.disable(UIConstants.GARAGE_WELD_PARTICLE_TIME);
        }
    }

    getType() {
        return this.type;
    }

    getNumber() {
        return this.number;
    }

    remove() {
        this.disable();

        if (this.applyAccessoryEvent) {
            this.game.time.events.remove(this.applyAccessoryEvent);
            this.applyAccessoryEvent = null;
        }

        if (this.weldingSound) {
            this.weldingSound.stop();
        }

        if (this.spawnTween) {
            this.spawnTween.stop();
        }
        if (this.sizeTween) {
            this.sizeTween.stop();
        }

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
        // Kill the sprite.
        this.kill();
    }
}
