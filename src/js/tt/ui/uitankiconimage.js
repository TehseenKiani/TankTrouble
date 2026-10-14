import { TankTrouble } from "../../tanktrouble.js";
import { Log } from "../log.js";
import { UIConstants } from "./uiconstants.js";
import { UITankIcon } from "./uitankicon.js";
import { UIUtils } from "./uiutils.js";

export class UITankIconImage extends Phaser.Image {
    constructor(game, active, size) {
        // Call super.
        super(game,
            0,
            0,
            game.add.bitmapData(
                UIConstants.TANK_ICON_WIDTHS[size],
                UIConstants.TANK_ICON_HEIGHTS[size]
            ));

        this.size = size;

        this.anchor.setTo(0.5, 0.5);

        this.tankIconPlaceholder = this.addChild(new Phaser.Sprite(game, 0, 0, `tankiconplaceholder-${this.size}`));
        this.tankIconPlaceholder.anchor.setTo(0.5, 0.5);

        this.inputEnabled = active;
        if (active) {
            this.input.useHandCursor = true;

            UIUtils.addButton(this,
                self => {},
                self => {},
                self => {
                    if (self.playerId && self.showingDetails) {
                        const gameBounds = self.game.scale.bounds;
                        const position = self.toGlobal(new Phaser.Point(0, 0));
                        // Scale from game canvas position to pixel position.
                        Phaser.Point.divide(position, self.game.scale.scaleFactor, position);
                        const preferredInfoOffsetHorizontal = (Math.abs(self.width) / self.game.scale.scaleFactor.x) * 0.4;
                        const preferredInfoOffsetVertical = (Math.abs(self.height) / self.game.scale.scaleFactor.y) * 0.25;
                        TankTrouble.TankInfoBox.show(gameBounds.x + position.x, gameBounds.y + position.y, self.playerId, preferredInfoOffsetHorizontal, preferredInfoOffsetVertical);
                    }
                },
                this
            );
        }

        this.playerId = null;
        this.showingDetails = false;

        this.spawnTween = null;
        this.removeTween = null;
        this.updateHideTween = null;
        this.updateShowTween = null;

        // Disable icon.
        this.kill();
        this.scale.set(0.0, 0.0);

        // Create log.
        this.log = new Log("UITankIconImage");
    }

    update() {
    }

    spawn(x, y, playerId, flipped, animate, targetScale) {
        // Revive and place the sprite.
        this.reset(x, y);
        this.tankIconPlaceholder.revive();
        this.scale.set(0.0, 0.0);

        // Clear previous tank.
        this.key.clear();
        delete this.key.canvas.dataset.tankIconSignature;

        // Store playerId.
        this.playerId = playerId;
        this.flipped = flipped;
        this.targetScale = targetScale || 1.0;

        const delay = 50 + (Math.random() * 200);

        if (this.removeTween) {
            this.removeTween.stop();
            this.removeTween = null;
        }
        if (animate) {
            this.spawnTween = this.game.add.tween(this.scale).to({
                x: this.flipped ? -this.targetScale : this.targetScale,
                y: this.targetScale
            }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
        } else {
            this.scale.set(this.flipped ? -this.targetScale : this.targetScale, this.targetScale);
        }

        // Load player tank icon.
        UITankIcon.loadPlayerTankIcon(this.key.canvas, this.size, this.playerId).then(() => {
            // Clear placeholder and show icon.
            this.tankIconPlaceholder.kill();
            this.key.dirty = true;

            this.showingDetails = true;
        });
    }

    refresh(x, y, targetScale) {
        if (x !== undefined) {
            this.game.add.tween(this).to({ x }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
        if (y !== undefined) {
            this.game.add.tween(this).to({ y }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
        if (targetScale !== undefined) {
            this.targetScale = targetScale;
            this.game.add.tween(this.scale).to({ x: this.flipped ? -this.targetScale : this.targetScale, y: this.targetScale }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
    }

    updateIcon() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        // Only update if we are not in the process of removing icon.
        if (!this.removeTween) {
            if (this.updateHideTween) {
                this.updateHideTween.stop();
            }
            if (this.updateShowTween) {
                this.updateShowTween.stop();
            }
            this.updateHideTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None);
            this.updateShowTween = this.game.add.tween(this.scale).to({ x: this.flipped ? -this.targetScale : this.targetScale, y: this.targetScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out);

            this.updateHideTween.onComplete.add(
                () => {
                    // Load player tank icon.
                    UITankIcon.loadPlayerTankIcon(this.key.canvas, this.size, this.playerId).then(() => {
                        // Clear placeholder and show icon.
                        this.tankIconPlaceholder.kill();
                        this.key.dirty = true;

                        this.updateShowTween.start();
                    });
                },
                this
            );

            this.updateHideTween.start();
        }
    }

    remove() {
        this.showingDetails = false;

        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        if (this.updateHideTween) {
            this.updateHideTween.stop();
        }

        if (this.updateShowTween) {
            this.updateShowTween.stop();
        }

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

    retire() {
        // Kill the sprite.
        this.kill();
    }
}
