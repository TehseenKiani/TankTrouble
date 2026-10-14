import { Box2D } from "./box2d.js";
import { TrapState } from "./trapstate.js";
import { Log } from "./log.js";

export class Trap {
    id = null;
    playerId = null;
    type = 0;
    x = 0.0;
    y = 0.0;
    speedX = 0.0;
    speedY = 0.0;
    b2dBody = null;
    roundModel = null;
    timeAlive = 0.0;
    eventHandler = null;
    eventContext = null;
    log = null;

    constructor(roundModel, eventHandler, eventContext) {
        this.timeAlive = 0.0;
        this.roundModel = roundModel;
        this.eventHandler = eventHandler;
        this.eventContext = eventContext;
        this.log = new Log("Trap");
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

    setX(x) {
        this.x = x;
    }

    getX() {
        return this.x;
    }

    setY(y) {
        this.y = y;
    }

    getY() {
        return this.y;
    }

    setSpeedX(speedX) {
        this.speedX = speedX;
    }

    getSpeedX() {
        return this.speedX;
    }

    setSpeedY(speedY) {
        this.speedY = speedY;
    }

    getSpeedY() {
        return this.speedY;
    }

    setB2DBody(b2dBody) {
        this.b2dBody = b2dBody;
    }

    getB2DBody() {
        return this.b2dBody;
    }

    getTimeAlive() {
        return this.timeAlive;
    }

    update(deltaTime) {
        this.log.error("Attempt to call Trap.update. update() must be overridden in subclasses");
    }

    trip(playerId, entered) {
        this.log.error("Attempt to call Trap.trip. trip() must be overridden in subclasses");
    }

    released() {
        this.log.error("Attempt to call Trap.released. released() must be overridden in subclasses");
    }

    getProjectileStates() {
        this.log.error("Attempt to call Trap.getProjectileStates. getProjectileStates() must be overridden in subclasses");
    }

    done() {
        this.log.error("Attempt to call Trap.done. done() must be overridden in subclasses");
    }

    setTrapState(trapState) {
        this.id = trapState.getId();
        this.playerId = trapState.getPlayerId();
        this.x = trapState.getX();
        this.y = trapState.getY();
        this.speedX = trapState.getSpeedX();
        this.speedY = trapState.getSpeedY();
        this.type = trapState.getType();
        this._setFields(trapState.getFields());

        if (this.b2dBody) {
            this.b2dBody.SetPosition(
                Box2D.Common.Math.b2Vec2.Make(this.x, this.y)
            );
            this.b2dBody.SetLinearVelocity(
                Box2D.Common.Math.b2Vec2.Make(this.speedX, this.speedY)
            );
        }
    }

    getTrapState() {
        const trapState = TrapState.withState(
            this.id,
            this.playerId,
            this.type,
            this.x,
            this.y,
            this.speedX,
            this.speedY,
            JSON.stringify(this.getFields())
        );

        return trapState;
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

    static createInitialTrapState(id, playerId, type, x, y, speedX, speedY, fieldsJSON) {
        const trapState = TrapState.withState(
            id,
            playerId,
            type,
            x,
            y,
            speedX,
            speedY,
            fieldsJSON
        );

        return trapState;
    }
}
