import { Constants } from "./constants.js";
import { Weapon } from "./weapon.js";
import { Mine } from "./mine.js";
import { IdGenerator } from "./idgenerator.js";

export class MineWeapon extends Weapon {
    _mineCount = 0;
    _triggerPulled = false;

    constructor(weaponState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setWeaponState(weaponState);
    }

    fire() {
        if (!this._triggerPulled) {
            this._triggerPulled = true;

            if (this._mineCount > 0) {
                --this._mineCount;

                this._emitEvent(Weapon._EVENTS.WEAPON_FIRED, this);

                return true;
            }
        }

        return false;
    }

    getProjectileStates(tank) {
        return [];
    }

    getTrapStates(tank) {
        const trapState = Mine.createInitialTrapState(
            IdGenerator.generate("mi"),
            tank.getPlayerId(),
            tank.getX() + (Math.sin(tank.getRotation()) * Constants.MINE.OFFSET.m),
            tank.getY() - (Math.cos(tank.getRotation()) * Constants.MINE.OFFSET.m),
            -Math.sin(tank.getRotation()) * Constants.MINE.LAUNCH_SPEED.m,
            Math.cos(tank.getRotation()) * Constants.MINE.LAUNCH_SPEED.m
        );

        return [trapState];
    }

    release() {
        this._triggerPulled = false;
    }

    reload(projectile) {}

    movementLocked() {
        return false;
    }

    update(deltaTime) {}

    done() {
        return this._mineCount === 0 && !this._triggerPulled;
    }

    isDefault() {
        return false;
    }

    static createInitialWeaponState(id, playerId, mineCount) {
        const fields = {
            _mineCount: mineCount,
            _triggerPulled: false
        };

        return Weapon.createInitialWeaponState(id, playerId, Constants.WEAPON_TYPES.MINE, JSON.stringify(fields));
    }
}
