import { Message } from "./message.js";

export class ResultMessage extends Message {
    resultData = null;
    result = false;
    message = "";

    setResultData(resultData) {
        this.resultData = resultData;
    }

    getResultData() {
        return this.resultData;
    }

    getResult() {
        return this.result;
    }

    setResult(result) {
        this.result = result;
    }

    getMessage() {
        return this.message;
    }

    setMessage(message) {
        this.message = message;
    }

    _toObject() {
        return {
            resultData: this.resultData,
            message: this.message,
            result: this.result
        };
    }

    _fromObject(object) {
        this.setResultData(object.resultData);
        this.setResult(object.result);
        this.setMessage(object.message);
    }
}
