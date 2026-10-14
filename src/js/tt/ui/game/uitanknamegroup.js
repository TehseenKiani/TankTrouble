import { Constants } from "../../constants.js";
import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";
import { Utils } from "../../../utils.js";

export class UITankNameGroup extends Phaser.Group {
    constructor(game, gameController) {
        // Call super.
        super(game, null);

        this.gameController = gameController;

        this.tankName = this.addChild(new Phaser.Text(game, 0, 0, "", { font: `${UIConstants.TANK_NAME_FONT_SIZE}px TankTrouble`, fill: "#fff", strokeThickness: UIConstants.TANK_NAME_STROKE_WIDTH }));
        this.tankName.anchor.setTo(0.5, 0.0);

        this.playerId = null;

        // State.
        this.timeAlive = 0.0;
        this.fading = false;

        // Disable tank name.
        this.exists = false;
        this.visible = false;

        // Create log.
        this.log = new Log("UITankNameGroup");
    }

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        const tank = this.gameController.getTank(this.playerId);
        if (tank) {
            this.x = UIUtils.mpx(tank.getX());
            this.y = UIUtils.mpx(tank.getY()) + (Constants.TANK.HEIGHT.px * 0.7);

            // Push name clear of edges.
            const halfWorldWidth = this.tankName.width * this.tankName.worldScale.x * 0.5;
            const worldPosition = this.parent.toGlobal(this.position);

            if (worldPosition.x - halfWorldWidth < UIConstants.TANK_NAME_MARGIN) {
                this.x = this.parent.toLocal({ x: UIConstants.TANK_NAME_MARGIN + halfWorldWidth, y: worldPosition.y }).x;
            } else if (worldPosition.x + halfWorldWidth > this.game.width - UIConstants.TANK_NAME_MARGIN) {
                this.x = this.parent.toLocal({ x: this.game.width - UIConstants.TANK_NAME_MARGIN - halfWorldWidth, y: worldPosition.y }).x;
            }

            this.timeAlive += this.game.time.delta / 1000;

            if (!this.fading && this.timeAlive > UIConstants.TANK_NAME_DISPLAY_TIME) {
                // Start fading out.
                this.fading = true;
            }
        } else {
            this.fading = true;
        }

        if (this.fading) {
            this.alpha = Math.max(0.0, this.alpha - 0.025);
        }

        // Disable when all faded out.
        if (this.alpha === 0.0) {
            this.exists = false;
            this.visible = false;
        }
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    spawn(playerId) {
        // Revive and place the group.
        const tank = this.gameController.getTank(playerId);
        if (tank) {
            this.x = UIUtils.mpx(tank.getX());
            this.y = UIUtils.mpx(tank.getY()) + (Constants.TANK.HEIGHT.px * 0.7);
            this.exists = true;
            this.visible = true;
            this.alpha = 1.0;

            this.tankName.setText("");
        }

        // Store playerId.
        this.playerId = playerId;

        // Reset state.
        this.timeAlive = 0.0;
        this.fading = false;

        // Send request for player details.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    const username = Utils.maskUnapprovedUsername(result);
                    this.tankName.setText(username);
                }
            });
    }

    retire() {
        this.exists = false;
        this.visible = false;
    }
}
