export class InputState {
    data = {};

    static withState(playerId, forward, back, left, right, fire) {
        const instance = new this();
        instance.data.playerId = playerId;
        instance.data.forward = forward;
        instance.data.back = back;
        instance.data.left = left;
        instance.data.right = right;
        instance.data.fire = fire;
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

    getForward() {
        return this.data.forward;
    }

    getBack() {
        return this.data.back;
    }

    getLeft() {
        return this.data.left;
    }

    getRight() {
        return this.data.right;
    }

    getFire() {
        return this.data.fire;
    }

    toObject() {
        return this.data;
    }
}
