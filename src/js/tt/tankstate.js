export class TankState {
    data = {};

    static withState(playerId, x, y, forward, back, rotation, left, right, fireDown, locked) {
        const instance = new this();
        instance.data.playerId = playerId;
        instance.data.x = x;
        instance.data.y = y;
        instance.data.forward = forward;
        instance.data.back = back;
        instance.data.rotation = rotation;
        instance.data.left = left;
        instance.data.right = right;
        instance.data.fireDown = fireDown;
        instance.data.locked = locked;
        return instance;
    }

    static withObject(object) {
        const instance = new this();
        instance.data = object;
        return instance;
    }

    getPlayerId() {
        return this.data.playerId;
    }

    getX() {
        return this.data.x;
    }

    setX(x) {
        this.data.x = x;
    }

    getY() {
        return this.data.y;
    }

    setY(y) {
        this.data.y = y;
    }

    getForward() {
        return this.data.forward;
    }

    setForward(forward) {
        this.data.forward = forward;
    }

    getBack() {
        return this.data.back;
    }

    setBack(back) {
        this.data.back = back;
    }

    getRotation() {
        return this.data.rotation;
    }

    setRotation(rotation) {
        this.data.rotation = rotation;
    }

    getLeft() {
        return this.data.left;
    }

    setLeft(left) {
        this.data.left = left;
    }

    getRight() {
        return this.data.right;
    }

    setRight(right) {
        this.data.right = right;
    }

    getFireDown() {
        return this.data.fireDown;
    }

    setFireDown(fireDown) {
        this.data.fireDown = fireDown;
    }

    getLocked() {
        return this.data.locked;
    }

    setLocked(locked) {
        this.data.locked = locked;
    }

    toObject() {
        return this.data;
    }
}
