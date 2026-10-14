import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class DeauthenticateResultMessage extends ResultMessage {
    static typeId = MessageSchemas.deauthenticateResultMessage.typeId;
}
