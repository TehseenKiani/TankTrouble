import { ResultMessage } from "./resultmessage.js";
import { MessageSchemas } from "./messageschemas.js";

export class RequestMazeResultMessage extends ResultMessage {
    static typeId = MessageSchemas.requestMazeResultMessage.typeId;
    static schema = MessageSchemas.requestMazeResultMessage.schema;

    _toObject() {
        return {
            result: this.result,
            message: this.message,
            maze: this.resultData
        };
    }

    _fromObject(object) {
        this.setResult(object.result);
        this.setMessage(object.message);
        this.setResultData(object.maze);
    }
}
