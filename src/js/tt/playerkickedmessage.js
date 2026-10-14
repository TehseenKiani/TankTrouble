import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class PlayerKickedMessage extends Message {
    static typeId = MessageSchemas.playerKickedMessage.typeId;

    playerId = "";
    messageType = "";
    reason = "";

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getPlayerId() {
        return this.playerId;
    }

    setMessageType(messageType) {
        this.messageType = messageType;
    }

    getMessageType() {
        return this.messageType;
    }

    setReason(reason) {
        this.reason = reason;
    }

    getReason() {
        return this.reason;
    }

    _toObject() {
        return {
            playerId: this.playerId,
            messageType: this.messageType,
            reason: this.reason
        };
    }

    _fromObject(object) {
        this.setPlayerId(object.playerId);
        this.setMessageType(object.messageType);
        this.setReason(object.reason);
    }
}
