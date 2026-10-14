import { TankTrouble } from "../../../tanktrouble.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UITankIconLoginImage extends Phaser.Image {
    constructor(game, size) {
        // Call super.
        super(game, 0, 0, "addtank");

        this.size = size;

        this.anchor.setTo(0.5, 0.5);

        this.inputEnabled = true;
        this.input.useHandCursor = true;

        UIUtils.addButton(this,
            self => {},
            self => {},
            self => {
                const gameBounds = self.game.scale.bounds;
                const position = self.toGlobal(new Phaser.Point(0, 0));
                // Scale from game canvas position to pixel position.
                Phaser.Point.divide(position, self.game.scale.scaleFactor, position);
                TankTrouble.AddUserBox.show(gameBounds.x + position.x, gameBounds.y + position.y, "top", (UIConstants.TANK_ICON_HEIGHTS[self.size] / self.game.scale.scaleFactor.y) * 0.25);
            },
            this
        );

        this.spawnTween = null;
        this.removeTween = null;

        // Disable icon.
        this.kill();
        this.scale.set(0.0, 0.0);

        // Create log.
        this.log = new Log("UITankIconLoginImage");
    }

    update() {
    }

    spawn(x, y, targetScale) {
        // Revive and place the sprite.
        this.reset(x, y);
        this.scale.set(0.0, 0.0);

        this.targetScale = targetScale || 1.0;

        if (this.removeTween) {
            this.removeTween.stop();
            this.removeTween = null;
        }

        const delay = 50 + (Math.random() * 200);

        this.spawnTween = this.game.add.tween(this.scale).to({ x: this.targetScale, y: this.targetScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
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
            this.game.add.tween(this.scale).to({ x: this.targetScale, y: this.targetScale }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
    }

    remove(animate) {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        if (animate) {
            this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
            this.removeTween.onComplete.add(
                () => {
                    this.removeTween = null;
                    // Kill the sprite.
                    this.kill();
                },
                this
            );
        } else {
            // Kill the sprite.
            this.kill();
        }
    }

    retire() {
        // Kill the sprite.
        this.kill();
    }
}
