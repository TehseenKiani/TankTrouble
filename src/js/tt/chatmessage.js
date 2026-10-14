import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class ChatMessage extends Message {
    static typeId = MessageSchemas.chatMessage.typeId;

    from = [];
    message = "";
    chatMessageId = 0;
    sendReceipt = "";

    setFrom(from) {
        this.from = from;
    }

    getFrom() {
        return this.from;
    }

    setMessage(message) {
        this.message = message;
    }

    getMessage() {
        return this.message;
    }

    setChatMessageId(chatMessageId) {
        this.chatMessageId = chatMessageId;
    }

    getChatMessageId() {
        return this.chatMessageId;
    }

    setSendReceipt(sendReceipt) {
        this.sendReceipt = sendReceipt;
    }

    getSendReceipt() {
        return this.sendReceipt;
    }

    _toObject() {
        return {
            from: this.from,
            message: this.message,
            chatMessageId: this.chatMessageId,
            sendReceipt: this.sendReceipt
        };
    }

    _fromObject(object) {
        this.setFrom(object.from);
        this.setMessage(object.message);
        this.setChatMessageId(object.chatMessageId);
        this.setSendReceipt(object.sendReceipt);
    }
}
