export class CounterState {
    data = {};

    static withState(id, type, fieldsJSON) {
        const instance = new this();
        instance.data.id = id;
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
