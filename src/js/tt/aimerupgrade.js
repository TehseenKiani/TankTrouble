import { Constants } from "./constants.js";
import { Upgrade } from "./upgrade.js";

export class AimerUpgrade extends Upgrade {
    _lifetime = 0;
    _length = 0;

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

    static createInitialUpgradeState(id, playerId, lifetime, length) {
        const fields = {
            _lifetime: lifetime,
            _length: length
        };

        return Upgrade.createInitialUpgradeState(id, playerId, Constants.UPGRADE_TYPES.AIMER, JSON.stringify(fields));
    }
}
