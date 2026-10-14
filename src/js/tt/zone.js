import { ZoneState } from "./zonestate.js";
import { Log } from "./log.js";

export class Zone {
    static _EVENTS = {
        ZONE_ENTERED: "zone entered",
        ZONE_LEFT: "zone left",
        ZONE_DESTABILISED: "zone destabilised"
    };

    id = null;
    type = 0;
    tiles = [];
    b2dBody = null;
    roundModel = null;
    eventHandler = null;
    eventContext = null;
    log = null;

    constructor(roundModel, eventHandler, eventContext) {
        this.roundModel = roundModel;
        this.eventHandler = eventHandler;
        this.eventContext = eventContext;
        this.log = new Log("Counter");
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    getTiles() {
        return this.tiles;
    }

    setB2DBody(b2dBody) {
        this.b2dBody = b2dBody;
    }

    getB2DBody() {
        return this.b2dBody;
    }

    update(deltaTime) {
        this.log.error("Attempt to call Zone.update. update() must be overridden in subclasses");
    }

    done() {
        this.log.error("Attempt to call Zone.done. done() must be overridden in subclasses");
    }

    isPhysical() {
        this.log.error("Attempt to call Zone.isPhysical. isPhysical() must be overridden in subclasses");
    }

    setZoneState(zoneState) {
        this.id = zoneState.getId();
        this.type = zoneState.getType();
        this.tiles = zoneState.getTiles();
        this._setFields(zoneState.getFields());
    }

    getZoneState() {
        return ZoneState.withState(this.id, this.type, this.tiles, JSON.stringify(this.getFields()));
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

    static createInitialZoneState(id, type, tiles, fieldsJSON) {
        const zoneState = ZoneState.withState(
            id,
            type,
            tiles,
            fieldsJSON
        );

        return zoneState;
    }
}
