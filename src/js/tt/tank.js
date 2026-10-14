import { Box2D } from "./box2d.js";
import { Constants } from "./constants.js";
import { TankState } from "./tankstate.js";
import { Log } from "./log.js";

export class Tank {
    playerId = null;
    x = 0;
    y = 0;
    forward = false;
    back = false;
    rotation = 0;
    left = false;
    right = false;
    fireDown = false;
    locked = false;
    b2dBody = null;
    speed = 0.0;
    rotationSpeed = 0.0;
    roundModel = null;
    log = null;

    constructor(tankState, roundModel) {
        this.setTankState(tankState);
        this.roundModel = roundModel;
        this.log = new Log(`Tank ${this.playerId}`);
    }

    setTankState(tankState) {
        //FIXME This is probably where we would implement something to smooth out discrepancies. Or maybe it should be entirely in the UI?
        this.playerId = tankState.getPlayerId();
        this.x = tankState.getX();
        this.y = tankState.getY();
        this.forward = tankState.getForward();
        this.back = tankState.getBack();
        this.rotation = tankState.getRotation();
        this.left = tankState.getLeft();
        this.right = tankState.getRight();
        this.fireDown = tankState.getFireDown();
        this.locked = tankState.getLocked();

        if (this.b2dBody) {
            this.b2dBody.SetPositionAndAngle(
                Box2D.Common.Math.b2Vec2.Make(this.x, this.y),
                this.rotation
            );

            if (this.locked) {
                this.b2dBody.SetLinearVelocity(
                    Box2D.Common.Math.b2Vec2.Make(0.0, 0.0)
                );
                this.b2dBody.SetAngularVelocity(0.0);
            } else {
                this._computeSpeed();
                this._computeRotationSpeed();
                const speedX = Math.sin(this.rotation) * this.speed; // Normally it would be Math.cos(rotation), but the tank graphics is rotated 90 degrees CCW
                const speedY = -Math.cos(this.rotation) * this.speed; // Normally it would be Math.sin(rotation), but the tank graphics is rotated 90 degrees CCW
                this.b2dBody.SetLinearVelocity(
                    Box2D.Common.Math.b2Vec2.Make(speedX, speedY)
                );
                this.b2dBody.SetAngularVelocity(this.rotationSpeed);
            }
        }
    }

    getTankState() {
        const tankState = TankState.withState(
            this.playerId,
            this.x,
            this.y,
            this.forward,
            this.back,
            this.rotation,
            this.left,
            this.right,
            this.fireDown,
            this.locked
        );

        return tankState;
    }

    getPlayerId() {
        return this.playerId;
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

    setForward(forward) {
        this.forward = forward;
    }

    getForward() {
        if (this.locked) {
            return false;
        }
        return this.forward;
    }

    setBack(back) {
        this.back = back;
    }

    getBack() {
        if (this.locked) {
            return false;
        }
        return this.back;
    }

    setRotation(rotation) {
        this.rotation = rotation;
    }

    getRotation() {
        return this.rotation;
    }

    setLeft(left) {
        this.left = left;
    }

    getLeft() {
        if (this.locked) {
            return false;
        }
        return this.left;
    }

    setRight(right) {
        this.right = right;
    }

    getRight() {
        if (this.locked) {
            return false;
        }
        return this.right;
    }

    setFireDown(fireDown) {
        this.fireDown = fireDown;
    }

    getFireDown() {
        if (this.locked) {
            return false;
        }
        return this.fireDown;
    }

    setLocked(locked) {
        this.locked = locked;
    }

    getLocked() {
        return this.locked;
    }

    setB2DBody(b2dBody) {
        this.b2dBody = b2dBody;
    }

    getB2DBody() {
        return this.b2dBody;
    }

    getSpeed() {
        if (this.locked) {
            return 0.0;
        }

        return this.speed;
    }

    getRotationSpeed() {
        if (this.locked) {
            return 0.0;
        }

        return this.rotationSpeed;
    }

    update(deltaTime) {
        // Update position from physics.
        this.x = this.b2dBody.GetPosition().x;
        this.y = this.b2dBody.GetPosition().y;
        this.rotation = this.b2dBody.GetAngle();

        // Update physics from state.
        if (this.locked) {
            this.b2dBody.SetLinearVelocity(
                Box2D.Common.Math.b2Vec2.Make(0.0, 0.0)
            );
            this.b2dBody.SetAngularVelocity(0.0);
        } else {
            this._computeSpeed();
            this._computeRotationSpeed();

            const speedX = Math.sin(this.rotation) * this.speed; // Normally it would be Math.cos(rotation), but the tank graphics is rotated 90 degrees CCW
            const speedY = -Math.cos(this.rotation) * this.speed; // Normally it would be Math.sin(rotation), but the tank graphics is rotated 90 degrees CCW
            this.b2dBody.SetLinearVelocity(
                Box2D.Common.Math.b2Vec2.Make(speedX, speedY)
            );
            this.b2dBody.SetAngularVelocity(this.rotationSpeed);
        }
    }

    _computeSpeed() {
        this.speed = 0.0;

        const speedModifier = this.roundModel.getModifier(this.playerId, Constants.MODIFIER_TYPES.SPEED);
        if (this.forward) {
            this.speed += Constants.TANK.FORWARD_SPEED.m * speedModifier;
        }
        if (this.back) {
            this.speed -= Constants.TANK.BACK_SPEED.m * speedModifier;
        }
    }

    _computeRotationSpeed() {
        this.rotationSpeed = 0.0;

        const speedModifier = this.roundModel.getModifier(this.playerId, Constants.MODIFIER_TYPES.SPEED);
        if (this.left) {
            this.rotationSpeed += -Constants.TANK.ROTATION_SPEED * speedModifier;
        }
        if (this.right) {
            this.rotationSpeed += Constants.TANK.ROTATION_SPEED * speedModifier;
        }
    }
}
