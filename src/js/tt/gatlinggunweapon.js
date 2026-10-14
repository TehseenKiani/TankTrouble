import { Constants } from "./constants.js";
import { Weapon } from "./weapon.js";
import { ProjectileState } from "./projectilestate.js";
import { IdGenerator } from "./idgenerator.js";

export class GatlingGunWeapon extends Weapon {
    _bulletCount = 0;
    _triggerPulled = false;
    _weaponCharge = 0.0;
    _timeSinceFire = 0.0;
    _newBurst = true;

    constructor(weaponState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setWeaponState(weaponState);
    }

    fire() {
        if (!this._triggerPulled) {
            this._triggerPulled = true;

            this._timeSinceFire = Constants.GATLING_GUN_FIRE_RATE;
            this._newBurst = true;
        }

        return false;
    }

    getProjectileStates(tank) {
        const randomSeed = Math.random() - 0.5;
        const rotation = tank.getRotation() + (randomSeed * Constants.GATLING_GUN_BULLET_SPREAD);
        const spread = randomSeed * Constants.GATLING_GUN.SPACE.m;
        const sinRotation = Math.sin(rotation);
        const cosRotation = Math.cos(rotation);
        const speed = Constants.GATLING_GUN.MIN_SPEED.m + (Math.random() * (Constants.GATLING_GUN.MAX_SPEED.m - Constants.GATLING_GUN.MIN_SPEED.m));

        const projectileState = ProjectileState.withState(
            IdGenerator.generate("gg"),
            tank.getPlayerId(),
            Constants.WEAPON_TYPES.GATLING_GUN,
            tank.getX() + (sinRotation * Constants.GATLING_GUN.OFFSET.m) + (cosRotation * spread),
            tank.getY() - (cosRotation * Constants.GATLING_GUN.OFFSET.m) + (sinRotation * spread),
            sinRotation * speed,
            -cosRotation * speed
        );

        return [projectileState];
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
        if (this._triggerPulled) {
            this._weaponCharge = Math.min(this._weaponCharge + (deltaTime / Constants.GATLING_GUN_CHARGE_TIME), 1.0);

            if (this._weaponCharge === 1.0) {
                this._timeSinceFire += deltaTime;
                if (this._timeSinceFire >= Constants.GATLING_GUN_FIRE_RATE) {
                    this._timeSinceFire -= Constants.GATLING_GUN_FIRE_RATE;

                    if (this._bulletCount > 0) {
                        --this._bulletCount;

                        if (this._newBurst) {
                            this._emitEvent(Weapon._EVENTS.WEAPON_FIRED, this);

                            this._newBurst = false;
                        }

                        this._emitEvent(Weapon._EVENTS.WEAPON_DELAYED_FIRE, this.playerId);
                    } else {
                        this._emitEvent(Weapon._EVENTS.WEAPON_EMPTY, this);
                    }
                }
            }
        } else {
            this._weaponCharge = Math.max(this._weaponCharge - (deltaTime / Constants.GATLING_GUN_DISCHARGE_TIME), 0.0);
        }
    }

    done() {
        return this._weaponCharge === 0.0 && this._bulletCount === 0.0;
    }

    isDefault() {
        return false;
    }

    static createInitialWeaponState(id, playerId, bulletCount) {
        const fields = {
            _bulletCount: bulletCount,
            _triggerPulled: false,
            _weaponCharge: 0.0,
            _timeSinceFire: 0.0,
            _newBurst: true
        };

        return Weapon.createInitialWeaponState(id, playerId, Constants.WEAPON_TYPES.GATLING_GUN, JSON.stringify(fields));
    }
}
