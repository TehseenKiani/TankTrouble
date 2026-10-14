export class ScoreState {
    data = {};

    static withState(id, playerId, type, value) {
        const instance = new this();
        instance.data.id = id;
        instance.data.playerId = playerId;
        instance.data.type = type;
        instance.data.value = value;
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

    getValue() {
        return this.data.value;
    }

    toObject() {
        return this.data;
    }
}
