import { Constants } from "./constants.js";
import { Upgrade } from "./upgrade.js";

export class ShieldUpgrade extends Upgrade {
    _lifetime = 0;
    _weakened = false;

    constructor(upgradeState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setUpgradeState(upgradeState);
    }

    update(deltaTime) {
        this._lifetime -= deltaTime;

        if (!this._weakened) {
            if (this._lifetime <= Constants.SHIELD_WEAKEN_TIME) {
                this._weakened = true;

                this._emitEvent(Upgrade._EVENTS.UPGRADE_WEAKENED, this.id);
            }
        }
    }

    done() {
        return this._lifetime <= 0;
    }

    static createInitialUpgradeState(id, playerId, lifetime) {
        const fields = {
            _lifetime: lifetime,
            _weakened: false
        };

        return Upgrade.createInitialUpgradeState(id, playerId, Constants.UPGRADE_TYPES.SHIELD, JSON.stringify(fields));
    }
}
