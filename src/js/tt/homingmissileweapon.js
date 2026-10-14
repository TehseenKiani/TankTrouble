import { Constants } from "./constants.js";
import { Weapon } from "./weapon.js";
import { ProjectileState } from "./projectilestate.js";
import { IdGenerator } from "./idgenerator.js";

export class HomingMissileWeapon extends Weapon {
    _launched = false;
    _activationTime = 0;

    constructor(weaponState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setWeaponState(weaponState);
    }

    fire() {
        if (!this._launched) {
            this._launched = true;

            this._activationTime = Constants.HOMING_MISSILE_ACTIVATION_TIME;

            this._emitEvent(Weapon._EVENTS.WEAPON_FIRED, this);

            // Tell the model to update the box2d body of the tank.
            this.roundModel.updateWeapon(this.playerId, this.id);

            return true;
        }

        return false;
    }

    getProjectileStates(tank) {
        const projectileState = ProjectileState.withState(
            IdGenerator.generate("hm"),
            tank.getPlayerId(),
            Constants.WEAPON_TYPES.HOMING_MISSILE,
            tank.getX() + (Math.sin(tank.getRotation()) * Constants.HOMING_MISSILE.OFFSET.m),
            tank.getY() - (Math.cos(tank.getRotation()) * Constants.HOMING_MISSILE.OFFSET.m),
            Math.sin(tank.getRotation()) * Constants.HOMING_MISSILE.SPEED.m,
            -Math.cos(tank.getRotation()) * Constants.HOMING_MISSILE.SPEED.m
        );

        return [projectileState];
    }

    getTrapStates(tank) {
        return [];
    }

    release() {}

    reload(projectile) {}

    movementLocked() {
        return false;
    }

    update(deltaTime) {
        if (this._activationTime > 0) {
            this._activationTime -= deltaTime;
        }
    }

    done() {
        return this._launched && this._activationTime <= 0;
    }

    isDefault() {
        return false;
    }

    static createInitialWeaponState(id, playerId) {
        const fields = {
            _launched: false,
            _activationTime: 0
        };

        return Weapon.createInitialWeaponState(id, playerId, Constants.WEAPON_TYPES.HOMING_MISSILE, JSON.stringify(fields));
    }
}
