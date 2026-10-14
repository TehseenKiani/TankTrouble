import { Constants } from "./constants.js";
import { Weapon } from "./weapon.js";
import { ProjectileState } from "./projectilestate.js";
import { IdGenerator } from "./idgenerator.js";

export class DoubleBarrelWeapon extends Weapon {
    _bulletCount = 0;
    _triggerPulled = false;
    _leftBarrel = false;

    constructor(weaponState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setWeaponState(weaponState);
    }

    fire() {
        if (!this._triggerPulled) {
            this._triggerPulled = true;

            if (this._bulletCount > 0) {
                --this._bulletCount;

                this._leftBarrel = !this._leftBarrel;

                this._emitEvent(Weapon._EVENTS.WEAPON_FIRED, this);

                return true;
            }
        }

        return false;
    }

    getProjectileStates(tank) {
        const sinRotation = Math.sin(tank.getRotation());
        const cosRotation = Math.cos(tank.getRotation());
        const speedModifier = this.roundModel.getModifier(tank.getPlayerId(), Constants.MODIFIER_TYPES.SPEED);

        if (this._leftBarrel) {
            const projectileState = ProjectileState.withState(
                IdGenerator.generate("db"),
                tank.getPlayerId(),
                Constants.WEAPON_TYPES.DOUBLE_BARREL,
                tank.getX() + (sinRotation * Constants.DOUBLE_BARREL.OFFSET.m) - (cosRotation * Constants.DOUBLE_BARREL.SPACE.m),
                tank.getY() - (cosRotation * Constants.DOUBLE_BARREL.OFFSET.m) - (sinRotation * Constants.DOUBLE_BARREL.SPACE.m),
                sinRotation * Constants.DOUBLE_BARREL.SPEED.m * speedModifier,
                -cosRotation * Constants.DOUBLE_BARREL.SPEED.m * speedModifier
            );

            return [projectileState];
        } else {
            const projectileState = ProjectileState.withState(
                IdGenerator.generate("db"),
                tank.getPlayerId(),
                Constants.WEAPON_TYPES.DOUBLE_BARREL,
                tank.getX() + (sinRotation * Constants.DOUBLE_BARREL.OFFSET.m) + (cosRotation * Constants.DOUBLE_BARREL.SPACE.m),
                tank.getY() - (cosRotation * Constants.DOUBLE_BARREL.OFFSET.m) + (sinRotation * Constants.DOUBLE_BARREL.SPACE.m),
                sinRotation * Constants.DOUBLE_BARREL.SPEED.m * speedModifier,
                -cosRotation * Constants.DOUBLE_BARREL.SPEED.m * speedModifier
            );

            return [projectileState];
        }
    }

    getTrapStates(tank) {
        return [];
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
        return this._bulletCount === 0 && !this._triggerPulled;
    }

    isDefault() {
        return false;
    }

    static createInitialWeaponState(id, playerId, bulletCount) {
        const fields = {
            _bulletCount: bulletCount,
            _triggerPulled: false,
            _leftBarrel: false
        };

        return Weapon.createInitialWeaponState(id, playerId, Constants.WEAPON_TYPES.DOUBLE_BARREL, JSON.stringify(fields));
    }
}
