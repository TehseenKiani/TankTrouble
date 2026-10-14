import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class GameEndedMessage extends Message {
    static typeId = MessageSchemas.gameEndedMessage.typeId;

    _toObject() {
        return {};
    }

    _fromObject(object) {}
}
