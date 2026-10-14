import { Constants } from "./constants.js";
import { Weapon } from "./weapon.js";
import { ProjectileState } from "./projectilestate.js";
import { IdGenerator } from "./idgenerator.js";

export class LaserWeapon extends Weapon {
    _fired = false;
    _timeSinceFire = 0;

    constructor(weaponState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setWeaponState(weaponState);
    }

    fire() {
        if (!this._fired) {
            this._fired = true;

            this._emitEvent(Weapon._EVENTS.WEAPON_FIRED, this);

            return true;
        }

        return false;
    }

    getProjectileStates(tank) {
        const projectileState = ProjectileState.withState(
            IdGenerator.generate("l"),
            tank.getPlayerId(),
            Constants.WEAPON_TYPES.LASER,
            tank.getX() + (Math.sin(tank.getRotation()) * Constants.LASER.OFFSET.m),
            tank.getY() - (Math.cos(tank.getRotation()) * Constants.LASER.OFFSET.m),
            Math.sin(tank.getRotation()) * Constants.LASER.SPEED.m,
            -Math.cos(tank.getRotation()) * Constants.LASER.SPEED.m
        );

        return [projectileState];
    }

    getTrapStates(tank) {
        return [];
    }

    release() {}

    reload(projectile) {}

    movementLocked() {
        return this._fired && this._timeSinceFire <= Constants.LASER_LOCK_TIME;
    }

    update(deltaTime) {
        if (this._fired) {
            this._timeSinceFire += deltaTime;
        }
    }

    done() {
        return this._fired && this._timeSinceFire > Constants.LASER_MAX_LIFETIME;
    }

    isDefault() {
        return false;
    }

    static createInitialWeaponState(id, playerId) {
        const fields = {
            _fired: false,
            _timeSinceFire: 0
        };

        return Weapon.createInitialWeaponState(id, playerId, Constants.WEAPON_TYPES.LASER, JSON.stringify(fields));
    }
}
