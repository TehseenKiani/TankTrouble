import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class CountDownMessage extends Message {
    static typeId = MessageSchemas.countDownMessage.typeId;

    value = 0;

    setValue(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    _toObject() {
        return {
            value: this.value
        };
    }

    _fromObject(object) {
        this.setValue(object.value);
    }
}
