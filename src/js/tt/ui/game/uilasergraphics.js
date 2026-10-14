import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UILaserGraphics extends Phaser.Graphics {
    constructor(game, gameController) {
        // Call super.
        super(game, 0, 0);

        this.gameController = gameController;

        // State.
        this.laserPositions = [];
        this.retracting = false;
        this.expanding = true;
        this.colour = 0x00ff00;
        this.timeAlive = 0.0;

        // Disable laser.
        this.kill();
    }

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        this.timeAlive += this.game.time.delta / 1000;

        if (this.retracting) {
            if (this.laserPositions.length === 0) {
                // Kill the graphics.
                this.kill();
            } else {
                this.laserPositions.shift();
                while (this.laserPositions.length > 0) {
                    if (this.laserPositions[0].updatePoint) {
                        break;
                    }
                    this.laserPositions.shift();
                }
            }
        } else if (this.timeAlive >= UIConstants.LASER_RETRACTION_TIME) {
            this.retracting = true;
        }

        if (this.expanding) {
            // Add position from game model.
            const laser = this.gameController.getProjectile(this.laserId);
            if (laser) {
                this.laserPositions.push({ x: UIUtils.mpx(laser.getX()), y: UIUtils.mpx(laser.getY()), updatePoint: true });
            }
        }

        // Draw graphics.
        this.clear();
        this.lineStyle(UIConstants.LASER_WIDTH, this.colour, 1.0);

        if (this.laserPositions.length >= 2) {
            this.moveTo(this.laserPositions[0].x, this.laserPositions[0].y);
            for (let i = 1; i < this.laserPositions.length; ++i) {
                this.lineTo(this.laserPositions[i].x, this.laserPositions[i].y);
            }
        }
    }

    spawn(x, y, laserId, playerId) {
        // Revive the graphics.
        this.revive();

        // Store laserId and playerId.
        this.laserId = laserId;
        this.playerId = playerId;

        // Reset state.
        this.laserPositions = [];
        const tank = this.gameController.getTank(this.playerId);
        if (tank) {
            this.laserPositions.push({ x: UIUtils.mpx(tank.getX()), y: UIUtils.mpx(tank.getY()), updatePoint: false });
        }
        this.laserPositions.push({ x, y, updatePoint: true });
        this.expanding = true;
        this.retracting = false;
        this.colour = 0x00ff00;
        this.timeAlive = 0.0;

        // Send request for player details.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.colour = result.getTurretColour().numericValue;
                } else {
                    this.colour = UIConstants.TANK_UNAVAILABLE_COLOUR.numericValue;
                }
            });
    }

    addPoint(x, y) {
        if (this.expanding) {
            this.laserPositions.push({ x, y, updatePoint: false });
        }
    }

    remove() {
        this.expanding = false;
        this.retracting = true;
    }

    retire() {
        // Kill the graphics.
        this.kill();
    }
}
