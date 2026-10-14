export class ChatPost {
    from = [];
    to = [];
    message = "";
    chatMessageId = 0;
    sendReceipt = "";

    constructor(from, to, message, chatMessageId, sendReceipt) {
        this.from = from;
        this.to = to;
        this.message = message;
        this.chatMessageId = chatMessageId;
        this.sendReceipt = sendReceipt;
    }

    getFrom() {
        return this.from;
    }

    getTo() {
        return this.to;
    }

    getMessage() {
        return this.message;
    }

    getChatMessageId() {
        return this.chatMessageId;
    }

    getSendReceipt() {
        return this.sendReceipt;
    }
}
