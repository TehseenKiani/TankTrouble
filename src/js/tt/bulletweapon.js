import { Constants } from "./constants.js";
import { Weapon } from "./weapon.js";
import { ProjectileState } from "./projectilestate.js";
import { IdGenerator } from "./idgenerator.js";

export class BulletWeapon extends Weapon {
    _bulletCount = 0;
    _triggerPulled = false;
    _bulletsFired = 0;
    _timeAlive = 0.0;

    constructor(weaponState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setWeaponState(weaponState);
    }

    fire() {
        if (!this._triggerPulled) {
            this._triggerPulled = true;

            if (this._bulletsFired < this._bulletCount) {
                ++this._bulletsFired;

                this._emitEvent(Weapon._EVENTS.WEAPON_FIRED, this);

                return true;
            } else {
                this._emitEvent(Weapon._EVENTS.WEAPON_EMPTY, this);
            }
        }

        return false;
    }

    getProjectileStates(tank) {
        const speedModifier = this.roundModel.getModifier(tank.getPlayerId(), Constants.MODIFIER_TYPES.SPEED);
        const projectileState = ProjectileState.withState(
            IdGenerator.generate("b"),
            tank.getPlayerId(),
            Constants.WEAPON_TYPES.BULLET,
            tank.getX() + (Math.sin(tank.getRotation()) * Constants.BULLET.OFFSET.m),
            tank.getY() - (Math.cos(tank.getRotation()) * Constants.BULLET.OFFSET.m),
            Math.sin(tank.getRotation()) * Constants.BULLET.SPEED.m * speedModifier,
            -Math.cos(tank.getRotation()) * Constants.BULLET.SPEED.m * speedModifier
        );

        return [projectileState];
    }

    getTrapStates(tank) {
        return [];
    }

    release() {
        this._triggerPulled = false;
    }

    reload(projectile) {
        // Prevent bullets from a previous bullet weapon from reloading this bullet weapon (only relevant when tanks can respawn).
        if (this._timeAlive >= projectile.getTimeAlive()) {
            --this._bulletsFired;
        }
    }

    movementLocked() {
        return false;
    }

    update(deltaTime) {
        this._timeAlive += deltaTime;
    }

    done() {
        return false;
    }

    isDefault() {
        return true;
    }

    static createInitialWeaponState(id, playerId, bulletCount) {
        const fields = {
            _bulletCount: bulletCount,
            _triggerPulled: false,
            _bulletsFired: 0,
            _timeAlive: 0.0
        };

        return Weapon.createInitialWeaponState(id, playerId, Constants.WEAPON_TYPES.BULLET, JSON.stringify(fields));
    }
}
