import { CounterState } from "./counterstate.js";
import { Log } from "./log.js";

export class Counter {
    static _EVENTS = {};

    id = null;
    type = 0;
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

    update(deltaTime) {
        this.log.error("Attempt to call Counter.update. update() must be overridden in subclasses");
    }

    done() {
        this.log.error("Attempt to call Counter.done. done() must be overridden in subclasses");
    }

    setCounterState(counterState) {
        this.id = counterState.getId();
        this.type = counterState.getType();
        this._setFields(counterState.getFields());
    }

    getCounterState() {
        return CounterState.withState(this.id, this.type, JSON.stringify(this.getFields()));
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

    static createInitialCounterState(id, type, fieldsJSON) {
        const counterState = CounterState.withState(
            id,
            type,
            fieldsJSON
        );

        return counterState;
    }
}
