import { Constants } from "./constants.js";
import { Upgrade } from "./upgrade.js";

export class SpawnShieldUpgrade extends Upgrade {
    distSquared = 0;
    _lifetime = 0;
    _weakenDistanceSquared = 0;
    _maxDistanceSquared = 0;
    _x = 0;
    _y = 0;
    _weakened = false;

    constructor(upgradeState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setUpgradeState(upgradeState);
    }

    update(deltaTime) {
        this._lifetime -= deltaTime;

        const tank = this.roundModel.getTank(this.playerId);
        this.distSquared = 0.0;
        if (tank) {
            const currentX = tank.getX();
            const currentY = tank.getY();
            this.distSquared = ((currentX - this._x) * (currentX - this._x)) + ((currentY - this._y) * (currentY - this._y));
        }

        if (!this._weakened) {
            if (this._lifetime <= Constants.SPAWN_SHIELD_WEAKEN_TIME || this.distSquared > this._weakenDistanceSquared) {
                this._weakened = true;

                this._emitEvent(Upgrade._EVENTS.UPGRADE_WEAKENED, this.id);
            }
        } else if (this._lifetime > Constants.SPAWN_SHIELD_WEAKEN_TIME && this.distSquared <= this._weakenDistanceSquared) {
            this._weakened = false;

            this._emitEvent(Upgrade._EVENTS.UPGRADE_STRENGTHENED, this.id);
        }
    }

    done() {
        return this._lifetime <= 0 || this.distSquared > this._maxDistanceSquared;
    }

    static createInitialUpgradeState(id, playerId, lifetime, weakenDistanceSquared, maxDistanceSquared, x, y) {
        const fields = {
            _lifetime: lifetime,
            _weakenDistanceSquared: weakenDistanceSquared,
            _maxDistanceSquared: maxDistanceSquared,
            _x: x,
            _y: y,
            _weakened: false
        };

        return Upgrade.createInitialUpgradeState(id, playerId, Constants.UPGRADE_TYPES.SPAWN_SHIELD, JSON.stringify(fields));
    }
}
