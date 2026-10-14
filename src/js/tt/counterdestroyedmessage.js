import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class CounterDestroyedMessage extends Message {
    static typeId = MessageSchemas.counterDestroyedMessage.typeId;

    counterId = "";

    setCounterId(counterId) {
        this.counterId = counterId;
    }

    getCounterId() {
        return this.counterId;
    }

    _toObject() {
        return {
            counterId: this.counterId
        };
    }

    _fromObject(object) {
        this.setCounterId(object.counterId);
    }
}
