import { Constants } from "./constants.js";
import { Weapon } from "./weapon.js";
import { Trap } from "./trap.js";
import { ProjectileState } from "./projectilestate.js";
import { IdGenerator } from "./idgenerator.js";

export class Mine extends Trap {
    _activated = false;
    _tripped = false;
    _detonated = false;
    _trippingTankIds = [];
    _detonationTime = 0.0;

    constructor(trapState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setTrapState(trapState);
    }

    update(deltaTime) {
        this.timeAlive += deltaTime;

        // Clean out any destroyed tanks from tripping tanks.
        for (let i = this._trippingTankIds.length - 1; i >= 0; i--) {
            if (!this.roundModel.getTank(this._trippingTankIds[i])) {
                this._trippingTankIds.splice(i, 1);
            }
        }

        // Update the speed of the mine.
        const velocity = this.b2dBody.GetLinearVelocity();
        const length = velocity.Length();
        if (length > 0.0) {
            const newLength = Math.max(0.0, length - (Constants.MINE.ACCELERATION * deltaTime));
            velocity.Multiply(newLength / length);
        }

        // Activate the mine after a period.
        if (this.timeAlive >= Constants.MINE_ACTIVATION_DELAY && !this._activated) {
            this._activated = true;
            this._emitEvent(Weapon._EVENTS.MINE_ACTIVATED, this.id);
        }

        if (this._trippingTankIds.length > 0 && this._activated && !this._tripped) {
            this._tripped = true;
            this._emitEvent(Weapon._EVENTS.MINE_TRIPPED, this.id);
        } else if (this._trippingTankIds.length === 0 && this._tripped && !this._detonated) {
            this._detonated = true;
            this._detonationTime = Constants.MINE_DETONATION_DELAY;
            this._emitEvent(Weapon._EVENTS.MINE_DETONATED, this.id);
        }

        // Delay the explosion.
        if (this._detonated) {
            this._detonationTime -= deltaTime;
        }

        // Update position and velocity from physics.
        this.x = this.b2dBody.GetPosition().x;
        this.y = this.b2dBody.GetPosition().y;
        this.speedX = this.b2dBody.GetLinearVelocity().x;
        this.speedY = this.b2dBody.GetLinearVelocity().y;
    }

    trip(playerId, entered) {
        if (entered) {
            const index = this._trippingTankIds.indexOf(playerId);
            if (index === -1) {
                this._trippingTankIds.push(playerId);
            }
        } else {
            const index = this._trippingTankIds.indexOf(playerId);
            if (index !== -1) {
                this._trippingTankIds.splice(index, 1);
            }
        }
    }

    released() {
        return this._detonated && this._detonationTime <= 0;
    }

    getProjectileStates() {
        const result = [];

        for (let i = 0; i < Constants.MINE_SHRAPNEL_COUNT; ++i) {
            const speed = Constants.MINE.MIN_SPEED.m + (Math.random() * (Constants.MINE.MAX_SPEED.m - Constants.MINE.MIN_SPEED.m));
            const direction = Math.random() * Math.PI * 2.0;
            const speedX = Math.cos(direction) * speed;
            const speedY = Math.sin(direction) * speed;

            const projectileState = ProjectileState.withState(
                IdGenerator.generate("mb"),
                this.playerId,
                Constants.WEAPON_TYPES.MINE,
                this.x,
                this.y,
                speedX,
                speedY
            );

            result.push(projectileState);
        }

        return result;
    }

    done() {
        return this.released();
    }

    static createInitialTrapState(id, playerId, x, y, speedX, speedY) {
        const fields = {
            _activated: false,
            _tripped: false,
            _detonated: false,
            _trippingTankIds: [],
            _detonationTime: 0.0
        };

        return Trap.createInitialTrapState(id, playerId, Constants.WEAPON_TYPES.MINE, x, y, speedX, speedY, JSON.stringify(fields));
    }
}
