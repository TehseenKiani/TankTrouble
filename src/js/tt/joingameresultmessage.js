import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class JoinGameResultMessage extends ResultMessage {
    static typeId = MessageSchemas.joinGameResultMessage.typeId;
}
