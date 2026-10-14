import { ClientManager } from "../../../clientmanager.js";
import { UIButtonGroup } from "../uibuttongroup.js";
import { UIConstants } from "../uiconstants.js";

export class UILeaveGameButtonGroup extends Phaser.Group {
    constructor(game, x, y, gameController) {
        // Call super.
        super(game, null);
        this.x = x;
        this.y = y;
        this.gameController = gameController;

        //this.anchor.set(0.5, 0.5);
        this.scale.setTo(0.0);

        this.message = this.addChild(new Phaser.Text(game, 0, 0, "Leaving game at end of round", { font: `${UIConstants.LEAVE_GAME_MESSAGE_FONT_SIZE}px Arial`, fontWeight: "bold", fill: "#000000", stroke: "#ffffff", strokeThickness: UIConstants.LEAVE_GAME_MESSAGE_STROKE_WIDTH }));
        this.message.anchor.setTo(0.0, 0.5);

        this.leaveGameGroup = this.addChild(new UIButtonGroup(game, 0, 0, "Warning", UIConstants.BUTTON_SIZES.MEDIUM, "X", this._leaveGame, this, 0, Phaser.Keyboard.ESC));

        this.messageMask = this.addChild(new Phaser.Graphics(game, 0, 0));
        this.messageMask.beginFill(0xffffff);
        this.messageMask.drawRect(-this.message.width - (UIConstants.LEAVE_GAME_BUTTON_WIDTH / 2.0), -this.message.height / 2.0, this.message.width + (UIConstants.LEAVE_GAME_BUTTON_WIDTH / 2.0), this.message.height);

        this.message.mask = this.messageMask;

        this.wantToLeave = false;

        this.removeTween = null;
        this.openTween = null;
        this.closeTween = null;

        this.exists = false;
        this.visible = false;
    }

    _leaveGame() {
        if (this.wantToLeave) {
            if (this.openTween) {
                this.openTween.stop();
            }
            this.closeTween = this.game.add.tween(this.message).to({ x: 0.0 }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
            this.wantToLeave = false;
            ClientManager.getClient().cancelLeaveGame();
        } else {
            if (this.closeTween) {
                this.closeTween.stop();
            }
            this.openTween = this.game.add.tween(this.message).to({ x: -this.message.width - (UIConstants.LEAVE_GAME_BUTTON_WIDTH / 2.0) }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true, UIConstants.LEAVE_GAME_MESSAGE_DELAY);
            this.wantToLeave = true;
            ClientManager.getClient().leaveGame(false);
        }
    }

    spawn() {
        this.exists = true;
        this.visible = true;
        this.leaveGameGroup.spawn();
        this.leaveGameGroup.enableInput();

        if (this.removeTween) {
            this.removeTween.stop();
        }
        this.game.add.tween(this.scale).to({ x: UIConstants.ASSET_SCALE, y: UIConstants.ASSET_SCALE }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true);
    }

    update() {
        if (!this.exists) {
            return;
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
        this.leaveGameGroup.disableInput();

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
