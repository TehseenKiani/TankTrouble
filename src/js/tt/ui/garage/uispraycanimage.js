import { UIConstants } from "../uiconstants.js";

export class UISprayCanImage extends Phaser.Image {
    constructor(game, selectedFunction, releasedFunction, emitters, context) {
        // Call super.
        super(game, 0, 0, "spraycan");
        this.anchor.setTo(0.5, 0.5);

        this.selectedFunction = selectedFunction;
        this.releasedFunction = releasedFunction;
        this.sprayEmitters = emitters;
        this.context = context;

        // Set up UI Physics body.
        /*    this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.kinematic = true;
        this.body.setRectangle(Constants.TANK.WIDTH.px, Constants.TANK.HEIGHT.px);
        this.body.addRectangle(Constants.BULLET_TURRET.WIDTH.px, Constants.BULLET_TURRET.HEIGHT.px, Constants.BULLET_TURRET.OFFSET_X.px, Constants.BULLET_TURRET.OFFSET_Y.px);
        this.body.setCollisionGroup(UIUtils.tankCollisionGroup);
        this.body.collides(UIUtils.fragmentCollisionGroup);
    */
        // Create masked colour data and colour image.
        this.maskedColour = game.make.bitmapData(this.width, this.height);
        this.colourImage = this.addChild(new Phaser.Image(game, 0, 0, this.maskedColour));
        this.colourImage.anchor.setTo(0.5, 0.5);

        // Create spray can shade.
        this.shade = this.addChild(new Phaser.Image(game, 0, 0, "spraycanshade"));
        this.shade.anchor.setTo(0.5, 0.5);

        // State.
        this.colour = null;
        this.unlocked = null;
        this.disabled = false;
        this.busy = false;
        this.selected = false;
        this.originalX = null;
        this.originalY = null;
        this.spraySound = null;
        this.shakeSound = null;
        this.overallScale = 1.0;

        this.returnTween = null;
        this.moveToStartTween = null;
        this.moveToEndTween = null;
        this.spawnTween = null;
        this.removeTween = null;
        this.sizeTween = null;

        this.inputEnabled = true;
        this.input.useHandCursor = true;
        this.input.enableDrag(false, true);
        this.events.onDragStart.add(this._onStartDragHandler, this);
        this.events.onDragStop.add(this._onStopDragHandler, this);
        this.events.onInputOver.add(this._onInputOverHandler, this);
        this.events.onInputOut.add(this._onInputOutHandler, this);

        // Disable spray can.
        this.kill();
        this.scale.set(0.0, 0.0);
    }

    update() {
    }

    spawn(x, y, colour, unlocked, delay) {
        // Revive and place the sprite.
        this.reset(x, y);
        this.scale.set(0.0, 0.0);

        // Reset state.
        this.busy = false;
        this.disabled = false;
        this.selected = false;
        this.originalX = x;
        this.originalY = y;

        this.returnTween = this.game.add.tween(this.position).to({ x: this.originalX, y: this.originalY }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut);
        this.returnTween.onComplete.add(
            () => {
                this.busy = false;
                this.inputEnabled = true;
                this.input.useHandCursor = true;
            }
        );

        // Store params.
        this.colour = colour;
        this.unlocked = unlocked;

        this.colourImage.kill();

        if (this.unlocked) {
            this.inputEnabled = true;
            this.input.useHandCursor = true;

            if (this.colour.type === "numeric") {
                this.tint = this.colour.numericValue;
            } else {
                this.colourImage.revive();
                this.maskedColour.cls();
                this.maskedColour.alphaMask(`colour${this.colour.imageValue}`, "spraycan");
            }
        } else {
            this.inputEnabled = false;

            this.shade.tint = 0x666666;
        }

        if (this.removeTween) {
            this.removeTween.stop();
        }
        if (this.sizeTween) {
            this.sizeTween.stop();
        }
        this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0 * this.overallScale, y: 1.0 * this.overallScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
    }

    _onStartDragHandler(sprite, pointer) {
        // Disable touch scrolling.
        this.game.input.touch.preventDefault = true;
        this.selectedFunction.call(this.context, this);
    }

    _onStopDragHandler(sprite, pointer) {
        // Enable touch scrolling.
        this.game.input.touch.preventDefault = false;

        if (!this.releasedFunction.call(this.context, this, pointer.position.clone())) {
            // Nothing was hit so return to original position.
            this.returnTween.start();
        }
    }

    _onInputOverHandler(sprite, pointer) {
        if (!this.selected && !this.disabled) {
            this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.2 * this.overallScale, y: 1.2 * this.overallScale }, UIConstants.ELEMENT_SELECTION_TIME, Phaser.Easing.Back.Out, true);
        }
    }

    _onInputOutHandler(sprite, pointer) {
        if (!this.selected && !this.disabled) {
            this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.0 * this.overallScale, y: 1.0 * this.overallScale }, UIConstants.ELEMENT_DESELECTION_TIME, Phaser.Easing.Back.Out, true);
        }
    }

    deselect() {
        this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.0 * this.overallScale, y: 1.0 * this.overallScale }, UIConstants.ELEMENT_DESELECTION_TIME, Phaser.Easing.Back.Out, true);
        this.selected = false;
    }

    select() {
        this.sizeTween = this.game.add.tween(this.scale).to({ x: 1.4 * this.overallScale, y: 1.4 * this.overallScale }, UIConstants.ELEMENT_SELECTION_TIME, Phaser.Easing.Back.Out, true);
        this.selected = true;
    }

    sprayTurret(tankIcon, tankIconScroller, currentEmitter) {
        const localTankPosition = this.parent.toLocal(tankIcon.worldPosition);
        this._spray(
            localTankPosition.clone().add(tankIcon.width * UIConstants.GARAGE_SPRAY_START_X, tankIcon.height * UIConstants.GARAGE_SPRAY_TURRET_Y),
            localTankPosition.clone().add(tankIcon.width * UIConstants.GARAGE_SPRAY_TURRET_END_X, tankIcon.height * UIConstants.GARAGE_SPRAY_TURRET_Y),
            tankIcon,
            tankIconScroller,
            tankIcon.paintTurret,
            currentEmitter
        );
    }

    sprayTread(tankIcon, tankIconScroller, currentEmitter) {
        const localTankPosition = this.parent.toLocal(tankIcon.worldPosition);
        this._spray(
            localTankPosition.clone().add(tankIcon.width * UIConstants.GARAGE_SPRAY_START_X, tankIcon.height * UIConstants.GARAGE_SPRAY_TREAD_Y),
            localTankPosition.clone().add(tankIcon.width * UIConstants.GARAGE_SPRAY_TREAD_END_X, tankIcon.height * UIConstants.GARAGE_SPRAY_TREAD_Y),
            tankIcon,
            tankIconScroller,
            tankIcon.paintTread,
            currentEmitter
        );
    }

    sprayBase(tankIcon, tankIconScroller, currentEmitter) {
        const localTankPosition = this.parent.toLocal(tankIcon.worldPosition);
        this._spray(
            localTankPosition.clone().add(tankIcon.width * UIConstants.GARAGE_SPRAY_START_X, tankIcon.height * UIConstants.GARAGE_SPRAY_BASE_Y),
            localTankPosition.clone().add(tankIcon.width * UIConstants.GARAGE_SPRAY_BASE_END_X, tankIcon.height * UIConstants.GARAGE_SPRAY_BASE_Y),
            tankIcon,
            tankIconScroller,
            tankIcon.paintBase,
            currentEmitter
        );
    }

    _spray(startPosition, endPosition, tankIcon, tankIconScroller, paintFunction, currentEmitter) {
        if (!this.busy) {
            this.busy = true;
            this.inputEnabled = false;

            this.shade.frame = 1;
            this.game.add.tween(this.scale).to({ x: 1.2 * this.overallScale, y: 1.2 * this.overallScale }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
            this.moveToStartTween = this.game.add.tween(this.position).to({ x: startPosition.x, y: startPosition.y }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut);

            this.shakeTween = this.game.add.tween(this.position).to(
                { x: startPosition.x, y: startPosition.y + UIConstants.GARAGE_SPRAY_SHAKE_OFFSET },
                UIConstants.GARAGE_SPRAY_SHAKE_TIME,
                Phaser.Easing.None,
                false,
                0,
                UIConstants.GARAGE_SPRAY_SHAKE_COUNT,
                true);
            this.shakeTween.onStart.add(
                () => {
                    this.game.add.tween(this).to(
                        { rotation: UIConstants.GARAGE_SPRAY_SHAKE_MAX_ROTATION * ((Math.random() * 2) - 1) },
                        UIConstants.GARAGE_SPRAY_SHAKE_TIME,
                        Phaser.Easing.None,
                        true,
                        0,
                        UIConstants.GARAGE_SPRAY_SHAKE_COUNT,
                        true);
                    this.shakeSound = this.game.sound.play("shakecan");
                }
            );
            this.shakeTween.onComplete.add(
                () => {
                    this.shakeSound.stop();
                }
            );

            this.moveToEndTween = this.game.add.tween(this.position).to({ x: endPosition.x, y: endPosition.y }, UIConstants.GARAGE_SPRAY_TIME, Phaser.Easing.Quadratic.InOut);
            this.moveToEndTween.onStart.add(
                () => {
                    this.spraySound = this.game.sound.play("spraycan");
                    this.sprayEmitters[currentEmitter].spawn(this, currentEmitter);
                    this.shade.frame = 2;
                }
            );
            this.moveToEndTween.onComplete.add(
                () => {
                    if (this.selected) {
                        this.game.add.tween(this.scale).to({ x: 1.4 * this.overallScale, y: 1.4 * this.overallScale }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
                    } else {
                        this.game.add.tween(this.scale).to({ x: 1.0 * this.overallScale, y: 1.0 * this.overallScale }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
                    }
                    this.spraySound.stop();
                    this.sprayEmitters[currentEmitter].remove();
                    this.shade.frame = 0;
                    paintFunction(tankIcon, this.colour);
                }
            );

            let totalSprayDuration = 0;
            totalSprayDuration += this.moveToStartTween.totalDuration;
            totalSprayDuration += this.moveToEndTween.totalDuration;
            totalSprayDuration += this.returnTween.totalDuration;

            if (Math.random() < UIConstants.GARAGE_SPRAY_SHAKE_PROBABILITY) {
                this.moveToStartTween.chain(this.shakeTween);
                this.shakeTween.chain(this.moveToEndTween);

                totalSprayDuration += this.shakeTween.totalDuration;
            } else {
                this.moveToStartTween.chain(this.moveToEndTween);
            }
            this.moveToEndTween.chain(this.returnTween);
            this.moveToStartTween.start();

            // Disable tank icon scroller while spraying.
            tankIconScroller.disable(totalSprayDuration);
        }
    }

    getColour() {
        return this.colour;
    }

    setOverallScale(overallScale) {
        this.overallScale = overallScale;
    }

    remove() {
        this.disabled = true;
        this.inputEnabled = false;

        if (this.spraySound) {
            this.spraySound.stop();
        }

        if (this.shakeSound) {
            this.shakeSound.stop();
        }

        if (this.spawnTween) {
            this.spawnTween.stop();
        }
        if (this.sizeTween) {
            this.sizeTween.stop();
        }

        if (this.moveToStartTween) {
            this.moveToStartTween.stop();
        }

        if (this.shakeTween) {
            this.shakeTween.stop();
        }

        if (this.moveToEndTween) {
            this.moveToEndTween.stop();
        }

        if (this.returnTween) {
            this.returnTween.stop();
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
        this.events.onDragStart.remove(this._onDragStartHandler, this);
        this.events.onDragStop.remove(this._onDragStopHandler, this);

        // Kill the sprite.
        this.kill();
    }
}
