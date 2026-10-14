export class WeaponState {
    data = {};

    static withState(id, playerId, type, fieldsJSON) {
        const instance = new this();
        instance.data.id = id;
        instance.data.playerId = playerId;
        instance.data.type = type;
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

    getFields() {
        return JSON.parse(this.data.fieldsJSON);
    }

    toObject() {
        return this.data;
    }
}
