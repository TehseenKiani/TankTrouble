import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class UndoChatReportResultMessage extends ResultMessage {
    static typeId = MessageSchemas.undoChatReportResultMessage.typeId;
}
