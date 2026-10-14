export class ZoneState {
    data = {};

    static withState(id, type, tiles, fieldsJSON) {
        const instance = new this();
        instance.data.id = id;
        instance.data.type = type;
        instance.data.tiles = tiles;
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

    getType() {
        return this.data.type;
    }

    getTiles() {
        return this.data.tiles;
    }

    getFields() {
        return JSON.parse(this.data.fieldsJSON);
    }

    toObject() {
        return this.data;
    }
}
