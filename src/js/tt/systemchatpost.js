export class SystemChatPost {
    involvedPlayerIds = [];
    message = "";
    sendReceipt = "";

    constructor(involvedPlayerIds, message, sendReceipt) {
        this.involvedPlayerIds = involvedPlayerIds;
        this.message = message;
        this.sendReceipt = sendReceipt;
    }

    getInvolvedPlayerIds() {
        return this.involvedPlayerIds;
    }

    getMessage() {
        return this.message;
    }

    getSendReceipt() {
        return this.sendReceipt;
    }
}
