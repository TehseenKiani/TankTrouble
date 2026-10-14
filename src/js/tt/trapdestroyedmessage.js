import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class TrapDestroyedMessage extends Message {
    static typeId = MessageSchemas.trapDestroyedMessage.typeId;

    trapId = "";

    setTrapId(trapId) {
        this.trapId = trapId;
    }

    getTrapId() {
        return this.trapId;
    }

    _toObject() {
        return {
            trapId: this.trapId
        };
    }

    _fromObject(object) {
        this.setTrapId(object.trapId);
    }
}
