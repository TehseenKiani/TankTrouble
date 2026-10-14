import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class HandshakeResultMessage extends ResultMessage {
    static typeId = MessageSchemas.handshakeResultMessage.typeId;
}
