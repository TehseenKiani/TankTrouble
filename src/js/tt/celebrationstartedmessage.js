import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class CelebrationStartedMessage extends Message {
    static typeId = MessageSchemas.celebrationStartedMessage.typeId;

    _toObject() {
        return {};
    }

    _fromObject(object) {}
}
