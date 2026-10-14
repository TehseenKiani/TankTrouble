export class Message {
    static typeId = 0;
    static schema = null;

    getTypeId() {
        return this.constructor.typeId;
    }

    pack() {
        const object = {
            _typeId: this.getTypeId(), /* The underscore makes the typeId come first */
            ...this._toObject()
        };

        return this.constructor.schema ? this.constructor.schema.encode(object) : JSON.stringify(object);
    }

    unpack(data) {
        this._fromObject(this.constructor.schema ? this.constructor.schema.decode(data) : data);
    }

    _toObject() {
        console.error("Attempt to call Message._toObject. _toObject() must be overridden in subclasses");
    }

    _fromObject(object) {
        console.error("Attempt to call Message._fromObject. _fromObject() must be overridden in subclasses");
    }
}
