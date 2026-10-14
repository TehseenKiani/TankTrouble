import { RoundStateMessage } from "./roundstatemessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class RoundStateDeltaMessage extends RoundStateMessage {
    static typeId = MessageSchemas.roundStateDeltaMessage.typeId;
    static schema = MessageSchemas.roundStateDeltaMessage.schema;
}
