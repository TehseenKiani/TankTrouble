import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class ShutdownMessage extends Message {
    static typeId = MessageSchemas.shutdownMessage.typeId;

    reason = "";

    setReason(reason) {
        this.reason = reason;
    }

    getReason() {
        return this.reason;
    }

    _toObject() {
        return {
            reason: this.reason
        };
    }

    _fromObject(object) {
        this.setReason(object.reason);
    }
}
