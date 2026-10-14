export class CollectibleState {
    data = {};

    static withState(id, type, x, y, rotation) {
        const instance = new this();
        instance.data.id = id;
        instance.data.type = type;
        instance.data.x = x;
        instance.data.y = y;
        instance.data.rotation = rotation;
        return instance;
    }

    static withObject(object) {
        const instance = new this();
        instance.data = object;
        return instance;
    }

    getId() {
        return this.data.id;
    }

    getType() {
        return this.data.type;
    }

    getX() {
        return this.data.x;
    }

    getY() {
        return this.data.y;
    }

    getRotation() {
        return this.data.rotation;
    }

    toObject() {
        return this.data;
    }
}
