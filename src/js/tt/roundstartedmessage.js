import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class RoundStartedMessage extends Message {
    static typeId = MessageSchemas.roundStartedMessage.typeId;

    _toObject() {
        return {};
    }

    _fromObject(object) {}
}
