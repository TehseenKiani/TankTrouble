import { MathUtils } from "../../mathutils.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";

export class UIDisconnectedIconGroup extends Phaser.Group {
    constructor(game) {
        // Call super.
        super(game, null);

        this.disconnectedIcon = this.addChild(new Phaser.Sprite(this.game, 0, 0, "disconnectedicon"));
        this.disconnectedIcon.anchor.setTo(0.5, 0.5);

        this.scale.setTo(UIConstants.ASSET_SCALE);

        this.headerText = this.addChild(new Phaser.Text(game, 0, UIConstants.DISCONNECTED_HEADER_Y, "Connecting", { font: `${UIConstants.DISCONNECTED_HEADER_FONT_SIZE}px TankTrouble`, fontWeight: "bold", fill: "#000000", stroke: "#ffffff", strokeThickness: UIConstants.DISCONNECTED_HEADER_STROKE_WIDTH }));
        this.headerText.anchor.setTo(0.5, 0.5);

        this.waitingText = this.addChild(new Phaser.Text(game, 0, UIConstants.DISCONNECTED_MESSAGE_Y, "", { font: `${UIConstants.DISCONNECTED_MESSAGE_FONT_SIZE}px Arial`, fontWeight: "bold", fill: "#000000", stroke: "#ffffff", strokeThickness: UIConstants.DISCONNECTED_MESSAGE_STROKE_WIDTH }));
        this.waitingText.anchor.setTo(0.0, 0.5);

        this.removeTween = null;

        this.message = "";

        this.dotCount = 0;

        this.lastDotUpdateTime = 0;
        this.lastMessageUpdateTime = 0;
        this.currentTime = 0;

        // Disable icon.
        this.exists = false;
        this.visible = false;

        // Create log.
        this.log = new Log("UIDisconnectedIconGroup");
    }

    update() {
        if (!this.exists) {
            return;
        }

        this.currentTime += this.game.time.delta;
        if (this.currentTime > this.lastDotUpdateTime + UIConstants.WAITING_UPDATE_TIME) {
            this.dotCount = (this.dotCount + 1) % (UIConstants.WAITING_MAX_DOTS + 1);

            this.lastDotUpdateTime = this.currentTime;
        }

        if (this.currentTime > this.lastMessageUpdateTime + UIConstants.DISCONNECTED_MESSAGE_UPDATE_TIME) {
            this._updateMessage();
        }

        let dotsString = "";
        for (let i = 0; i < this.dotCount; ++i) {
            dotsString += ".";
        }

        this.waitingText.setText(`${this.message} ${dotsString}`);
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    spawn(x, y, delay) {
        if (this.spawnEvent) {
            this.game.time.events.remove(this.spawnEvent);
            this.spawnEvent = false;
        }

        this.spawnEvent = this.game.time.events.add(delay, () => {
            // Revive and place the group.
            this.x = x;
            this.y = y;
            this.exists = true;
            this.visible = true;

            this._updateMessage();
        });
    }

    remove() {
        if (this.spawnEvent) {
            this.game.time.events.remove(this.spawnEvent);
            this.spawnEvent = false;
        }

        this.exists = false;
        this.visible = false;
    }

    retire() {
        if (this.spawnEvent) {
            this.game.time.events.remove(this.spawnEvent);
            this.spawnEvent = false;
        }

        this.exists = false;
        this.visible = false;
    }

    _updateMessage() {
        this.message = MathUtils.randomArrayEntry(UIConstants.CONNECTING_MESSAGES);

        this.waitingText.setText(this.message);
        this.waitingText.x = -this.waitingText.width / 2.0;

        this.lastMessageUpdateTime = this.currentTime;
    }
}
