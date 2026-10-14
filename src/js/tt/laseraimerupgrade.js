import { Constants } from "./constants.js";
import { Upgrade } from "./upgrade.js";

export class LaserAimerUpgrade extends Upgrade {
    _activated = false;
    _weaponId = 0;
    _length = 0;

    constructor(upgradeState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setUpgradeState(upgradeState);
    }

    update(deltaTime) {
        if (!this._activated) {
            const activeWeapon = this.roundModel.getActiveWeapon(this.playerId);
            if (activeWeapon && activeWeapon.getId() === this._weaponId) {
                this._activated = true;

                this._emitEvent(Upgrade._EVENTS.UPGRADE_ACTIVATED, this.id);
            }
        }
    }

    done() {
        if (this._activated) {
            const activeWeapon = this.roundModel.getActiveWeapon(this.playerId);
            if (activeWeapon && (activeWeapon.getField("fired") || activeWeapon.getId() !== this._weaponId)) {
                return true;
            }
        }

        return false;
    }

    static createInitialUpgradeState(id, playerId, weaponId, length) {
        const fields = {
            _activated: false,
            _weaponId: weaponId,
            _length: length
        };

        return Upgrade.createInitialUpgradeState(id, playerId, Constants.UPGRADE_TYPES.LASER_AIMER, JSON.stringify(fields));
    }
}
