import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class UserChatMessage extends Message {
    static typeId = MessageSchemas.userChatMessage.typeId;

    to = [];
    from = [];
    message = "";
    chatMessageId = 0;
    sendReceipt = "";

    getTo() {
        return this.to;
    }

    setTo(to) {
        this.to = to;
    }

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
            to: this.to,
            from: this.from,
            message: this.message,
            chatMessageId: this.chatMessageId,
            sendReceipt: this.sendReceipt
        };
    }

    _fromObject(object) {
        this.setTo(object.to);
        this.setFrom(object.from);
        this.setMessage(object.message);
        this.setChatMessageId(object.chatMessageId);
        this.setSendReceipt(object.sendReceipt);
    }
}
