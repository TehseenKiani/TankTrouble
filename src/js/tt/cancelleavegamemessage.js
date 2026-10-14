import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class CancelLeaveGameMessage extends Message {
    static typeId = MessageSchemas.cancelLeaveGameMessage.typeId;

    _toObject() {
        return {};
    }

    _fromObject(object) {}
}
