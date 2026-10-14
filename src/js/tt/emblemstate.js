export class EmblemState {
    data = {};

    static withState(id, playerId, type) {
        const instance = new this();
        instance.data.id = id;
        instance.data.playerId = playerId;
        instance.data.type = type;
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

    toObject() {
        return this.data;
    }
}
