import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class ReportChatResultMessage extends ResultMessage {
    static typeId = MessageSchemas.reportChatResultMessage.typeId;
}
