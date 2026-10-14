import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class UndoChatReportMessage extends Message {
    static typeId = MessageSchemas.undoChatReportMessage.typeId;

    reporters = [];
    chatMessageId = 0;

    setReporters(reporters) {
        this.reporters = reporters;
    }

    getReporters() {
        return this.reporters;
    }

    setChatMessageId(chatMessageId) {
        this.chatMessageId = chatMessageId;
    }

    getChatMessageId() {
        return this.chatMessageId;
    }

    _toObject() {
        return {
            reporters: this.reporters,
            chatMessageId: this.chatMessageId
        };
    }

    _fromObject(object) {
        this.setReporters(object.reporters);
        this.setChatMessageId(object.chatMessageId);
    }
}
