import { Constants } from "../../constants.js";
import { Log } from "../../log.js";
import { UIButtonGroup } from "../uibuttongroup.js";
import { UIConstants } from "../uiconstants.js";

export class UIGameButtonGroup extends Phaser.Group {
    constructor(game, joinGameCallback, joinGameCallbackContext) {
        // Call super.
        super(game, null);

        this.joinGameCallback = joinGameCallback;
        this.joinGameCallbackContext = joinGameCallbackContext;

        this.joinGame = this.addChild(new UIButtonGroup(game, 0, 0, "", UIConstants.BUTTON_SIZES.MEDIUM, "Join", this._joinGame, this));

        this.queueInfo = this.addChild(new Phaser.Text(game, 0, UIConstants.JOIN_GAME_BUTTON_INFO_Y, "0 in queue", { font: `${UIConstants.BUTTON_INFO_FONT_SIZE}px Arial`, fill: "#999999" }));
        this.queueInfo.anchor.setTo(0.5, 0.5);

        this.isEnabled = false;

        this.removeTween = null;

        // Disable button.
        this.scale.set(0.0, 0.0);
        this.exists = false;
        this.visible = false;

        // Create log.
        this.log = new Log("UIGameButtonGroup");
    }

    spawn(x, y, gameState, favouriteActiveQueuedCounts, isEnabled) {
        // Revive and place the button.
        this.x = x;
        this.y = y;
        this.exists = true;
        this.visible = true;

        // Store gameId and max active player count.
        this.gameId = gameState.getId();
        this.maxActivePlayerCount = gameState.getMaxActivePlayerCount();
        this.favouriteActiveQueuedCounts = favouriteActiveQueuedCounts;

        this.isEnabled = isEnabled;

        this.joinGame.spawn();
        this._updateUI();

        const delay = 50 + (Math.random() * 200);

        if (this.removeTween) {
            this.removeTween.stop();
        }
        this.game.add.tween(this.scale).to({ x: UIConstants.ASSET_SCALE, y: UIConstants.ASSET_SCALE }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
    }

    refresh(favouriteActiveQueuedCounts) {
        // Refresh.
        this.favouriteActiveQueuedCounts = favouriteActiveQueuedCounts;

        this._updateUI();
    }

    _updateUI() {
        if (this.favouriteActiveQueuedCounts[1] + this.favouriteActiveQueuedCounts[2] >= this.maxActivePlayerCount + Constants.GAME.MAX_QUEUED_PLAYERS) {
            this.joinGame.setText("Queue up");
            this.joinGame.disable();
            this.queueInfo.setText("Full");
        } else if (this.favouriteActiveQueuedCounts[1] + this.favouriteActiveQueuedCounts[2] >= this.maxActivePlayerCount) {
            this.joinGame.setText("Queue up");
            if (this.isEnabled) {
                this.joinGame.enable();
            } else {
                this.joinGame.disable();
            }
            this.queueInfo.setText(`${this.favouriteActiveQueuedCounts[2] - (this.maxActivePlayerCount - this.favouriteActiveQueuedCounts[1])} in queue`);
        } else {
            this.joinGame.setText("Join");
            if (this.isEnabled) {
                this.joinGame.enable();
            } else {
                this.joinGame.disable();
            }
            this.queueInfo.setText("");
        }
    }

    disable() {
        this.isEnabled = false;
        this._updateUI();
    }

    enable() {
        this.isEnabled = true;
        this._updateUI();
    }

    remove() {
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

    _joinGame() {
        // Start an online battle.
        this.joinGameCallback.call(this.joinGameCallbackContext, this.gameId);
    }

    retire() {
        this.exists = false;
        this.visible = false;
    }
}
