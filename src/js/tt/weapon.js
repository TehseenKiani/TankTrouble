import { WeaponState } from "./weaponstate.js";
import { Log } from "./log.js";

export class Weapon {
    static _EVENTS = {
        WEAPON_FIRED: "weapon fired",
        WEAPON_DELAYED_FIRE: "weapon delayed fire",
        WEAPON_EMPTY: "weapon empty",
        HOMING_MISSILE_TARGET_CHANGED: "homing missile target changed",
        MINE_ACTIVATED: "mine activated",
        MINE_TRIPPED: "mine tripped",
        MINE_DETONATED: "mine detonated"
    };

    id = null;
    playerId = null;
    type = 0;
    roundModel = null;
    eventHandler = null;
    eventContext = null;
    log = null;

    constructor(roundModel, eventHandler, eventContext) {
        this.roundModel = roundModel;
        this.eventHandler = eventHandler;
        this.eventContext = eventContext;
        this.log = new Log("Weapon");
    }

    getId() {
        return this.id;
    }

    getPlayerId() {
        return this.playerId;
    }

    getType() {
        return this.type;
    }

    fire() {
        this.log.error("Attempt to call Weapon.fire. fire() must be overridden in subclasses");
    }

    getProjectileStates(tank) {
        this.log.error("Attempt to call Weapon.getProjectileStates. getProjectileStates() must be overridden in subclasses");
    }

    getTrapStates(tank) {
        this.log.error("Attempt to call Weapon.getTrapStates. getTrapStates() must be overridden in subclasses");
    }

    release() {
        this.log.error("Attempt to call Weapon.release. release() must be overridden in subclasses");
    }

    reload(projectile) {
        this.log.error("Attempt to call Weapon.reload. reload() must be overridden in subclasses");
    }

    movementLocked() {
        this.log.error("Attempt to call Weapon.movementLocked. movementLocked() must be overridden in subclasses");
    }

    update(deltaTime) {
        this.log.error("Attempt to call Weapon.update. update() must be overridden in subclasses");
    }

    done() {
        this.log.error("Attempt to call Weapon.done. done() must be overridden in subclasses");
    }

    isDefault() {
        this.log.error("Attempt to call Weapon.isDefault. isDefault() must be overridden in subclasses");
    }

    setWeaponState(weaponState) {
        this.id = weaponState.getId();
        this.playerId = weaponState.getPlayerId();
        this.type = weaponState.getType();
        this._setFields(weaponState.getFields());
    }

    getWeaponState() {
        return WeaponState.withState(this.id, this.playerId, this.type, JSON.stringify(this.getFields()));
    }

    getField(fieldName) {
        if (Object.hasOwn(this, `_${fieldName}`)) {
            return this[`_${fieldName}`];
        } else {
            return null;
        }
    }

    getFields() {
        const fields = Object.keys(this).filter(field => field.startsWith("_"));

        const fieldValues = {};

        for (const field of fields) {
            fieldValues[field] = this[field];
        }

        return fieldValues;
    }

    _emitEvent(evt, data) {
        if (this.eventHandler && this.eventContext) {
            this.eventHandler(this.eventContext, evt, data);
        }
    }

    _setFields(fieldValues) {
        const fields = Object.keys(this).filter(field => field.startsWith("_"));

        for (const field of fields) {
            this[field] = fieldValues[field];
        }
    }

    static createInitialWeaponState(id, playerId, type, fieldsJSON) {
        const weaponState = WeaponState.withState(
            id,
            playerId,
            type,
            fieldsJSON
        );

        return weaponState;
    }
}
