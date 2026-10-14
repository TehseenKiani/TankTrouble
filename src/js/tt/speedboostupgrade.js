import { Constants } from "./constants.js";
import { Upgrade } from "./upgrade.js";

export class SpeedBoostUpgrade extends Upgrade {
    _lifetime = 0;
    _speedBoost = 0;

    constructor(upgradeState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setUpgradeState(upgradeState);
    }

    update(deltaTime) {
        this._lifetime -= deltaTime;
    }

    done() {
        return this._lifetime <= 0;
    }

    static createInitialUpgradeState(id, playerId, lifetime, speedBoost) {
        const fields = {
            _lifetime: lifetime,
            _speedBoost: speedBoost
        };

        return Upgrade.createInitialUpgradeState(id, playerId, Constants.UPGRADE_TYPES.SPEED_BOOST, JSON.stringify(fields));
    }
}
