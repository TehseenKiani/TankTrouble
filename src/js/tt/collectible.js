import { Box2D } from "./box2d.js";
import { CollectibleState } from "./collectiblestate.js";
import { Log } from "./log.js";

export class Collectible {
    id = null;
    type = 0;
    x = 0;
    y = 0;
    rotation = 0;
    b2dBody = null;
    log = null;

    constructor(collectibleState) {
        this.setCollectibleState(collectibleState);
        this.log = new Log(`Collectible ${this.id}`);
    }

    getId() {
        return this.id;
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

    setRotation(rotation) {
        this.rotation = rotation;
    }

    getRotation() {
        return this.rotation;
    }

    setB2DBody(b2dBody) {
        this.b2dBody = b2dBody;
    }

    getB2DBody() {
        return this.b2dBody;
    }

    setCollectibleState(collectibleState) {
        this.id = collectibleState.getId();
        this.x = collectibleState.getX();
        this.y = collectibleState.getY();
        this.rotation = collectibleState.getRotation();
        this.type = collectibleState.getType();

        if (this.b2dBody) {
            this.b2dBody.SetPositionAndAngle(
                Box2D.Common.Math.b2Vec2.Make(this.x, this.y),
                this.rotation
            );
        }
    }

    getCollectibleState() {
        const collectibleState = CollectibleState.withState(
            this.id,
            this.type,
            this.x,
            this.y,
            this.rotation
        );

        return collectibleState;
    }

    update(deltaTime) {
        // Update position from physics.
        this.x = this.b2dBody.GetPosition().x;
        this.y = this.b2dBody.GetPosition().y;
        this.rotation = this.b2dBody.GetAngle();

        // FIXME Update physics from state.
    }
}
