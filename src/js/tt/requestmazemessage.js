import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class RequestMazeMessage extends Message {
    static typeId = MessageSchemas.requestMazeMessage.typeId;

    _toObject() {
        return {};
    }

    _fromObject(object) {}
}
