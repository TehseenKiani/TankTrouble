import { Box2D } from "./box2d.js";
import { ProjectileState } from "./projectilestate.js";
import { Log } from "./log.js";

export class Projectile {
    id = null;
    playerId = null;
    type = 0;
    x = 0.0;
    y = 0.0;
    speedX = 0.0;
    speedY = 0.0;
    lifetime = 0.0;
    timeoutWindow = 0;
    timeoutBounceCount = 0;
    b2dBody = null;
    roundModel = null;
    timeAlive = 0.0;
    deadlyToOwner = false;
    initialSpeedSquared = 0;
    initialSpeed = 0;
    stopped = false;
    bounces = [];
    eventHandler = null;
    eventContext = null;
    log = null;

    constructor(projectileState, lifetime, timeoutWindow, timeoutBounceCount, roundModel, eventHandler, eventContext) {
        this.setProjectileState(projectileState);
        this.timeAlive = 0.0;
        this.lifetime = lifetime;
        this.timeoutWindow = timeoutWindow;
        this.timeoutBounceCount = timeoutBounceCount;
        this.deadlyToOwner = false;
        this.initialSpeedSquared = (this.speedX * this.speedX) + (this.speedY * this.speedY);
        this.initialSpeed = Math.sqrt(this.initialSpeedSquared);
        this.stopped = false;
        this.bounces = [];
        this.roundModel = roundModel;
        this.eventHandler = eventHandler;
        this.eventContext = eventContext;
        this.log = new Log("Projectile");
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

    isDeadlyToOwner() {
        return this.deadlyToOwner;
    }

    makeDeadlyToOwner() {
        this.deadlyToOwner = true;
    }

    getTimeAlive() {
        return this.timeAlive;
    }

    setProjectileState(projectileState) {
        this.id = projectileState.getId();
        this.playerId = projectileState.getPlayerId();
        this.x = projectileState.getX();
        this.y = projectileState.getY();
        this.speedX = projectileState.getSpeedX();
        this.speedY = projectileState.getSpeedY();
        this.type = projectileState.getType();

        if (this.b2dBody) {
            this.b2dBody.SetPosition(
                Box2D.Common.Math.b2Vec2.Make(this.x, this.y)
            );
            this.b2dBody.SetLinearVelocity(
                Box2D.Common.Math.b2Vec2.Make(this.speedX, this.speedY)
            );
        }
    }

    getProjectileState() {
        const projectileState = ProjectileState.withState(
            this.id,
            this.playerId,
            this.type,
            this.x,
            this.y,
            this.speedX,
            this.speedY
        );

        return projectileState;
    }

    update(deltaTime) {
        this.timeAlive += deltaTime;

        // Clean up bounces older than timeout window.
        const currentTimeout = Date.now() - this.timeoutWindow;
        for (let i = 0; i < this.bounces.length; ++i) {
            if (this.bounces[i] >= currentTimeout) {
                this.bounces.splice(0, i);
                break;
            }
        }

        // Correct the speed of the projectile.
        if (Math.abs(this.b2dBody.GetLinearVelocity().LengthSquared() - this.initialSpeedSquared) > 0.01) {
            const velocity = this.b2dBody.GetLinearVelocity();
            const length = velocity.Length();
            if (length === 0) {
                this.stopped = true;
            } else {
                velocity.Multiply(this.initialSpeed / length);
            }
        }

        // Update position and velocity from physics.
        this.x = this.b2dBody.GetPosition().x;
        this.y = this.b2dBody.GetPosition().y;
        this.speedX = this.b2dBody.GetLinearVelocity().x;
        this.speedY = this.b2dBody.GetLinearVelocity().y;
    }

    hitShield() {
        this.bounces.push(Date.now());
    }

    hitMaze() {
        this.bounces.push(Date.now());
    }

    done() {
        return this.timeAlive >= this.lifetime || this.stopped || this.bounces.length >= this.timeoutBounceCount;
    }

    _emitEvent(evt, data) {
        if (this.eventHandler && this.eventContext) {
            this.eventHandler(this.eventContext, evt, data);
        }
    }
}
