import { UpgradeState } from "./upgradestate.js";
import { Log } from "./log.js";

export class Upgrade {
    static _EVENTS = {
        UPGRADE_ACTIVATED: "upgrade activated",
        UPGRADE_WEAKENED: "upgrade weakened",
        UPGRADE_STRENGTHENED: "upgrade strengthened"
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
        this.log = new Log("Upgrade");
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

    update(deltaTime) {
        this.log.error("Attempt to call Upgrade.update. update() must be overridden in subclasses");
    }

    done() {
        this.log.error("Attempt to call Upgrade.done. done() must be overridden in subclasses");
    }

    setUpgradeState(upgradeState) {
        this.id = upgradeState.getId();
        this.playerId = upgradeState.getPlayerId();
        this.type = upgradeState.getType();
        this._setFields(upgradeState.getFields());
    }

    getUpgradeState() {
        return UpgradeState.withState(this.id, this.playerId, this.type, JSON.stringify(this.getFields()));
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

    static createInitialUpgradeState(id, playerId, type, fieldsJSON) {
        const upgradeState = UpgradeState.withState(
            id,
            playerId,
            type,
            fieldsJSON
        );

        return upgradeState;
    }
}
