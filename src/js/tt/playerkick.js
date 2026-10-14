export class PlayerKick {
    static MESSAGE_TYPES = {
        NOTIFICATION: "notification",
        WARNING: "warning"
    };

    playerIds = [];
    messageType = null;
    reason = null; // String with reason message

    constructor(playerIds, messageType, reason) {
        this.playerIds = playerIds;
        this.messageType = messageType;
        this.reason = reason;
    }

    getPlayerIds() {
        return this.playerIds;
    }

    getMessageType() {
        return this.messageType;
    }

    getReason() {
        return this.reason;
    }
}
