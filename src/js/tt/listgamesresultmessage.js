import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class ListGamesResultMessage extends ResultMessage {
    static typeId = MessageSchemas.listGamesResultMessage.typeId;
}
