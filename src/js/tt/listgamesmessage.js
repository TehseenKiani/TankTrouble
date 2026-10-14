import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class ListGamesMessage extends Message {
    static typeId = MessageSchemas.listGamesMessage.typeId;

    _toObject() {
        return {};
    }

    _fromObject(object) {}
}
