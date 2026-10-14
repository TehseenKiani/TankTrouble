import { Constants } from "./constants.js";
import { Box2D } from "./box2d.js";
import { B2DUtils } from "./b2dutils.js";
import { Weapon } from "./weapon.js";
import { Projectile } from "./projectile.js";
import { TargetChange } from "./targetchange.js";

export class HomingMissile extends Projectile {
    currentTargetPlayerId = null;

    update(deltaTime) {
        this.timeAlive += deltaTime;

        // Clean up bounces older than timeout window.
        const currentTimeout = Date.now() - this.timeoutWindow;
        for (let i = 0; i < this.bounces.length; ++i) {
            if (this.bounces[i] >= currentTimeout) {
                this.bounces.splice(0, i);
                break;
            }
        }

        if (this.timeAlive > Constants.HOMING_MISSILE_ACTIVATION_TIME) {
            if (!this.isDeadlyToOwner()) {
                this.makeDeadlyToOwner();
            }

            // Find closest tank.
            const tanks = this.roundModel.getTanks();
            const maze = this.roundModel.getMaze();

            if (maze) {
                let shortestDistance = null;
                let targetPosition = null;
                let targetPlayerId = null;

                const startPosition = {
                    x: Math.floor(this.x / Constants.MAZE_TILE_SIZE.m),
                    y: Math.floor(this.y / Constants.MAZE_TILE_SIZE.m)
                };
                const distances = maze.getDistancesFromPosition(startPosition);
                if (distances !== false) {
                    for (const tank in tanks) {
                        const endPosition = {
                            x: Math.floor(tanks[tank].getX() / Constants.MAZE_TILE_SIZE.m),
                            y: Math.floor(tanks[tank].getY() / Constants.MAZE_TILE_SIZE.m)
                        };

                        const currentDistance = maze.getDistanceToPosition(distances, endPosition);
                        if (currentDistance !== false) {
                            // Tie-break equal distances by not targeting owner.
                            if (shortestDistance === null || currentDistance < shortestDistance || (currentDistance === shortestDistance && tank !== this.getPlayerId())) {
                                shortestDistance = currentDistance;
                                targetPosition = endPosition;
                                targetPlayerId = tank;
                            }
                        }
                    }
                }

                if (targetPlayerId) {
                    // Convert target position from tiles to metres.
                    if (shortestDistance <= 1) {
                        targetPosition.x = tanks[targetPlayerId].getX();
                        targetPosition.y = tanks[targetPlayerId].getY();
                    } else {
                        const shortestPath = maze.getShortestPathWithGraph(startPosition, targetPosition);
                        targetPosition.x = (shortestPath[0].x + 0.5) * Constants.MAZE_TILE_SIZE.m;
                        targetPosition.y = (shortestPath[0].y + 0.5) * Constants.MAZE_TILE_SIZE.m;
                    }

                    const relativeToMissile = B2DUtils.toLocalSpace(this.b2dBody, targetPosition);
                    let newSpeedX = this.b2dBody.GetLinearVelocity().x;
                    let newSpeedY = this.b2dBody.GetLinearVelocity().y;

                    if (relativeToMissile.x < 0) {
                        newSpeedX -= Constants.HOMING_MISSILE.ACCELERATION * deltaTime;
                    } else {
                        newSpeedX += Constants.HOMING_MISSILE.ACCELERATION * deltaTime;
                    }
                    if (relativeToMissile.y < 0) {
                        newSpeedY -= Constants.HOMING_MISSILE.ACCELERATION * deltaTime;
                    } else {
                        newSpeedY += Constants.HOMING_MISSILE.ACCELERATION * deltaTime;
                    }

                    this.b2dBody.SetLinearVelocity(
                        Box2D.Common.Math.b2Vec2.Make(newSpeedX, newSpeedY)
                    );
                }

                if (targetPlayerId !== this.currentTargetPlayerId) {
                    const targetChange = new TargetChange(this.id, targetPlayerId);
                    this._emitEvent(Weapon._EVENTS.HOMING_MISSILE_TARGET_CHANGED, targetChange);
                }

                this.currentTargetPlayerId = targetPlayerId;
            }
        }

        // Correct the speed of the missile.
        if (this.b2dBody.GetLinearVelocity().LengthSquared() - this.initialSpeedSquared > 0.01) {
            const velocity = this.b2dBody.GetLinearVelocity();
            const length = velocity.Length();
            velocity.Multiply(this.initialSpeed / length);
        }

        // Update position and velocity from physics.
        this.x = this.b2dBody.GetPosition().x;
        this.y = this.b2dBody.GetPosition().y;
        this.speedX = this.b2dBody.GetLinearVelocity().x;
        this.speedY = this.b2dBody.GetLinearVelocity().y;
    }
}
