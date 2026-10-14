import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class CancelLeaveGameResultMessage extends ResultMessage {
    static typeId = MessageSchemas.cancelLeaveGameResultMessage.typeId;
}
