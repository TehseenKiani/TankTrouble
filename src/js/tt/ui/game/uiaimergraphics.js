import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { QualityManager } from "../../../qualitymanager.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UIAimerGraphics extends Phaser.Graphics {
    constructor(game, gameController) {
        // Call super.
        super(game, 0, 0);

        this.gameController = gameController;

        // State.
        this.colour = 0x00ff00;

        // Disable aimer.
        this.kill();
    }

    // Local scaled-add (out = a + b * s). Phaser CE >=2.x changed
    // Phaser.Point.multiplyAdd's semantics in a way that breaks raycasting here.
    static _multiplyAdd(a, b, s, out) {
        if (out === undefined) { out = new Phaser.Point(); }
        return out.setTo(a.x + (b.x * s), a.y + (b.y * s));
    }

    // FIXME Move to UIUtils and reuse Ray object, RaycastResult object hitPoint array and so on.
    _castRay(start, end) {
        // Do raycast against world.
        const ray = new p2.Ray({
            mode: p2.Ray.CLOSEST,
            from: [-start.x, -start.y],
            to: [-end.x, -end.y],
            skipBackfaces: true,
            collisionMask: UIUtils.wallCollisionGroup.mask | UIUtils.tankCollisionGroup.mask | UIUtils.shieldCollisionGroup.mask | UIUtils.spawnCollisionGroup.mask,
            collisionGroup: UIUtils.rayCollisionGroup.mask
        });

        const result = new p2.RaycastResult();
        this.game.physics.p2.world.raycast(result, ray);

        const returnResult = {};
        returnResult.hasHit = result.hasHit();
        if (result.hasHit()) {
            const hitPoint = [0, 0];
            result.getHitPoint(hitPoint, ray);

            returnResult.hitPoint = new Phaser.Point(-hitPoint[0], -hitPoint[1]);
            returnResult.hitNormal = new Phaser.Point(-result.normal[0], -result.normal[1]);
            returnResult.hitDistance = result.getHitDistance(ray);
            returnResult.hasHitTank = result.shape.collisionGroup === UIUtils.tankCollisionGroup.mask;
            returnResult.hasHitSpawn = result.shape.collisionGroup === UIUtils.spawnCollisionGroup.mask;
        }

        return returnResult;
    }

    spawn(playerId, maxLength, activated) {
        // Revive the graphics.
        this.revive();

        // Clear graphics.
        this.clear();

        // Store playerId, maxLength and activated.
        this.playerId = playerId;
        this.maxLength = maxLength;
        this.activated = activated;

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

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        if (!this.activated) {
            return;
        }

        // Compute aimer trajectory if not disabled.
        const aimerPositions = [];

        let remainingLength = this.maxLength;

        const tank = this.gameController.getTank(this.playerId);
        if (tank) {
            aimerPositions.push(new Phaser.Point(tank.getX() + (Math.sin(tank.getRotation()) * UIUtils.pxm(UIConstants.AIMER_OFFSET)),
                tank.getY() - (Math.cos(tank.getRotation()) * UIUtils.pxm(UIConstants.AIMER_OFFSET))));

            const rayDirection = new Phaser.Point(Math.sin(tank.getRotation()), -Math.cos(tank.getRotation()));
            const rayStart = new Phaser.Point(0, 0);
            const rayEnd = new Phaser.Point(0, 0);

            while (remainingLength > 0.0) {
                rayStart.x = aimerPositions.at(-1).x;
                rayStart.y = aimerPositions.at(-1).y;
                UIAimerGraphics._multiplyAdd(rayStart, rayDirection, remainingLength, rayEnd);

                const result = this._castRay(rayStart, rayEnd);

                if (result.hasHit) {
                    aimerPositions.push(result.hitPoint);

                    if (result.hasHitTank || result.hasHitSpawn) {
                        // Stop at a tank.
                        break;
                    } else {
                        remainingLength -= Math.max(UIConstants.AIMER_MIN_STEP_LENGTH, result.hitDistance);

                        // Compute reflection direction.
                        UIAimerGraphics._multiplyAdd(rayDirection, result.hitNormal, -2 * rayDirection.dot(result.hitNormal), rayDirection);
                        rayDirection.normalize();
                    }
                } else {
                    aimerPositions.push(rayEnd);
                    break;
                }
            }
        }

        // Draw graphics.
        this.clear();

        this.lineStyle(UIConstants.AIMER_WIDTH, this.colour, 1.0);

        const beamPosition = new Phaser.Point(0, 0);
        let beamOn = Math.random() > 0.5;
        let segmentSample = 0.0;

        if (aimerPositions.length >= 2) {
            const minSegmentLength = QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.AIMER_MIN_SEGMENT_LENGTH);
            const maxOffSegmentLength = QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.AIMER_OFF_MAX_SEGMENT_LENGTH);
            const maxOnSegmentLength = QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.AIMER_ON_MAX_SEGMENT_LENGTH);
            this.moveTo(UIUtils.mpx(aimerPositions[0].x), UIUtils.mpx(aimerPositions[0].y));
            for (let i = 1; i < aimerPositions.length; ++i) {
                const segmentStart = aimerPositions[i - 1];
                const segmentEnd = aimerPositions[i];
                const segmentDirection = Phaser.Point.subtract(segmentEnd, segmentStart);
                const segmentLength = segmentDirection.getMagnitude();
                segmentDirection.normalize();

                while (segmentSample < segmentLength) {
                    UIAimerGraphics._multiplyAdd(segmentStart, segmentDirection, segmentSample, beamPosition);
                    if (beamOn) {
                        this.lineTo(UIUtils.mpx(beamPosition.x), UIUtils.mpx(beamPosition.y));
                        segmentSample += minSegmentLength + (Math.random() * (maxOffSegmentLength - minSegmentLength));
                    } else {
                        this.moveTo(UIUtils.mpx(beamPosition.x), UIUtils.mpx(beamPosition.y));
                        segmentSample += minSegmentLength + (Math.random() * (maxOnSegmentLength - minSegmentLength));
                    }

                    beamOn = !beamOn;
                }

                segmentSample -= segmentLength;
            }
        }
    }

    getPlayerId() {
        return this.playerId;
    }

    activate() {
        this.activated = true;
    }

    weaken() {
        // FIXME Show that aimer is timing out.
    }

    strengthen() {
    }

    remove() {
        // Kill the graphics.
        this.kill();
    }

    retire() {
        // Kill the graphics.
        this.kill();
    }
}
