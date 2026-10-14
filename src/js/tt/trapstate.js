export class TrapState {
    data = {};

    static withState(id, playerId, type, x, y, speedX, speedY, fieldsJSON) {
        const instance = new this();
        instance.data.id = id;
        instance.data.playerId = playerId;
        instance.data.type = type;
        instance.data.x = x;
        instance.data.y = y;
        instance.data.speedX = speedX;
        instance.data.speedY = speedY;
        instance.data.fieldsJSON = fieldsJSON;
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

    getPlayerId() {
        return this.data.playerId;
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

    getSpeedX() {
        return this.data.speedX;
    }

    getSpeedY() {
        return this.data.speedY;
    }

    getFields() {
        return JSON.parse(this.data.fieldsJSON);
    }

    toObject() {
        return this.data;
    }
}
