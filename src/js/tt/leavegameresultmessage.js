import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class LeaveGameResultMessage extends ResultMessage {
    static typeId = MessageSchemas.leaveGameResultMessage.typeId;
}
