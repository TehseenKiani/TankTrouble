import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class PingMessage extends Message {
    static typeId = MessageSchemas.pingMessage.typeId;

    _toObject() {
        return {};
    }

    _fromObject(object) {}
}
