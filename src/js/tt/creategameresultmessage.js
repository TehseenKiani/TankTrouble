import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class CreateGameResultMessage extends ResultMessage {
    static typeId = MessageSchemas.createGameResultMessage.typeId;
}
