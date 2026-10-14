import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class SystemChatMessage extends Message {
    static typeId = MessageSchemas.systemChatMessage.typeId;

    involvedPlayerIds = [];
    message = "";
    sendReceipt = "";

    getInvolvedPlayerIds() {
        return this.involvedPlayerIds;
    }

    setInvolvedPlayerIds(involvedPlayerIds) {
        this.involvedPlayerIds = involvedPlayerIds;
    }

    setMessage(message) {
        this.message = message;
    }

    getMessage() {
        return this.message;
    }

    setSendReceipt(sendReceipt) {
        this.sendReceipt = sendReceipt;
    }

    getSendReceipt() {
        return this.sendReceipt;
    }

    _toObject() {
        return {
            involvedPlayerIds: this.involvedPlayerIds,
            message: this.message,
            sendReceipt: this.sendReceipt
        };
    }

    _fromObject(object) {
        this.setInvolvedPlayerIds(object.involvedPlayerIds);
        this.setMessage(object.message);
        this.setSendReceipt(object.sendReceipt);
    }
}
