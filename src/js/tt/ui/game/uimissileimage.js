import { Constants } from "../../constants.js";
import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { QualityManager } from "../../../qualitymanager.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UIMissileImage extends Phaser.Image {
    constructor(game, gameController, targetingSounds) {
        // Call super.
        super(game, 0, 0, "game", "");

        this.gameController = gameController;
        this.targetingSounds = targetingSounds;

        // State.
        this.targetId = null;
        this.targetTime = 0;

        this.anchor.setTo(0.5, 0.5);

        // Disable missile.
        this.kill();
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.update();

        this.smokeEmitter.update();

        // Play targeting sound depending on distance to target.
        if (this.targetId !== null) {
            const projectile = this.gameController.getProjectile(this.projectileId);
            const tank = this.gameController.getTank(this.targetId);
            const maze = this.gameController.getMaze();
            if (projectile && tank && maze) {
                this.targetTime += this.game.time.delta / 1000;

                const projectilePosition = {
                    x: Math.floor(projectile.getX() / Constants.MAZE_TILE_SIZE.m),
                    y: Math.floor(projectile.getY() / Constants.MAZE_TILE_SIZE.m)
                };
                const tankPosition = {
                    x: Math.floor(tank.getX() / Constants.MAZE_TILE_SIZE.m),
                    y: Math.floor(tank.getY() / Constants.MAZE_TILE_SIZE.m)
                };
                const distanceToTarget = maze.getDistanceBetweenPositions(projectilePosition, tankPosition);
                if (distanceToTarget !== false) {
                    if (this.targetTime > (distanceToTarget + 1) * UIConstants.MISSILE_TARGETING_SOUND_INTERVAL_PER_TILE) {
                        this.targetTime = 0;
                        this.targetingSounds[Math.floor(Math.random() * UIConstants.MISSILE_TARGETING_AUDIO_COUNT)].play();
                    }
                }
            }
        }

        // Update position and rotation from game model.
        const projectile = this.gameController.getProjectile(this.projectileId);
        if (projectile) {
            this.x = UIUtils.mpx(projectile.getX());
            this.y = UIUtils.mpx(projectile.getY());

            this.rotation = Math.atan2(projectile.getSpeedY(), projectile.getSpeedX()) + (Math.PI * 0.5);
        }
    }

    setSmokeEmitter(smokeEmitter) {
        this.smokeEmitter = smokeEmitter;
    }

    updateTarget(playerId) {
        this.targetId = playerId;
        this.targetTime = 0;

        if (playerId !== null) {
            // Send request for player details.
            Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        this.smokeEmitter.setSmokeColour(result.getBaseColour().numericValue);
                    } else {
                        this.smokeEmitter.setSmokeColour(UIConstants.MISSILE_SMOKE_COLOUR);
                    }
                });
        } else {
            this.smokeEmitter.setSmokeColour(UIConstants.MISSILE_SMOKE_COLOUR);
        }
    }

    spawn(x, y, projectileId, playerId, frameName) {
        this.frameName = frameName;

        // Revive and place the image.
        this.reset(x, y);

        // Store projectileId and playerId.
        this.projectileId = projectileId;
        this.playerId = playerId;

        // Reset state.
        this.targetId = null;
        this.targetTime = 0;

        // Send request for player details.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.tint = result.getTurretColour().numericValue;
                } else {
                    this.tint = UIConstants.TANK_UNAVAILABLE_COLOUR.numericValue;
                }
            });

        this.smokeEmitter.spawn(x, y, QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.MISSILE_SMOKE_FREQUENCY), UIConstants.MISSILE_SMOKE_COLOUR);
    }

    remove() {
        // Kill the image.
        this.kill();
    }

    retire() {
        // Kill the image.
        this.kill();
    }
}
