import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class AuthenticateResultMessage extends ResultMessage {
    static typeId = MessageSchemas.authenticateResultMessage.typeId;
}
