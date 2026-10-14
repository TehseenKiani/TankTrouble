import { Constants } from "./constants.js";
import { Weapon } from "./weapon.js";
import { ProjectileState } from "./projectilestate.js";
import { IdGenerator } from "./idgenerator.js";

export class ShotgunWeapon extends Weapon {
    _bulletCount = 0;
    _triggerPulled = false;
    _reloadTime = 0;

    constructor(weaponState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setWeaponState(weaponState);
    }

    fire() {
        if (!this._triggerPulled) {
            this._triggerPulled = true;

            if (this._reloadTime <= 0 && this._bulletCount > 0) {
                --this._bulletCount;

                this._reloadTime = Constants.SHOTGUN_RELOAD_TIME;

                this._emitEvent(Weapon._EVENTS.WEAPON_FIRED, this);

                return true;
            }
        }

        return false;
    }

    getProjectileStates(tank) {
        const result = [];

        for (let i = 0; i < Constants.SHOTGUN_BUCKSHOT_COUNT; ++i) {
            const randomSeed = Math.random() - 0.5;
            const rotation = tank.getRotation() + (randomSeed * Constants.SHOTGUN_BUCKSHOT_SPREAD);
            const spread = randomSeed * Constants.SHOTGUN.SPACE.m;
            const sinRotation = Math.sin(rotation);
            const cosRotation = Math.cos(rotation);
            const speed = Constants.SHOTGUN.MIN_SPEED.m + (Math.random() * (Constants.SHOTGUN.MAX_SPEED.m - Constants.SHOTGUN.MIN_SPEED.m));

            const projectileState = ProjectileState.withState(
                IdGenerator.generate("sg"),
                tank.getPlayerId(),
                Constants.WEAPON_TYPES.SHOTGUN,
                tank.getX() + (sinRotation * Constants.SHOTGUN.OFFSET.m) + (cosRotation * spread),
                tank.getY() - (cosRotation * Constants.SHOTGUN.OFFSET.m) + (sinRotation * spread),
                sinRotation * speed,
                -cosRotation * speed
            );

            result.push(projectileState);
        }

        return result;
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

    update(deltaTime) {
        if (this._reloadTime > 0) {
            this._reloadTime -= deltaTime;
        }
    }

    done() {
        return this._bulletCount === 0 && this._reloadTime <= 0;
    }

    isDefault() {
        return false;
    }

    static createInitialWeaponState(id, playerId, bulletCount) {
        const fields = {
            _bulletCount: bulletCount,
            _triggerPulled: false,
            _reloadTime: 0
        };

        return Weapon.createInitialWeaponState(id, playerId, Constants.WEAPON_TYPES.SHOTGUN, JSON.stringify(fields));
    }
}
