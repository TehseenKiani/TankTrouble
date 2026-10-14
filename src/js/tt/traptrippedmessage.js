import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class TrapTrippedMessage extends Message {
    static typeId = MessageSchemas.trapTrippedMessage.typeId;

    playerId = "";
    trapId = "";
    trapType = 0;
    entered = false;

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getPlayerId() {
        return this.playerId;
    }

    setTrapId(trapId) {
        this.trapId = trapId;
    }

    getTrapId() {
        return this.trapId;
    }

    setTrapType(trapType) {
        this.trapType = trapType;
    }

    getTrapType() {
        return this.trapType;
    }

    setEntered(entered) {
        this.entered = entered;
    }

    getEntered() {
        return this.entered;
    }

    _toObject() {
        return {
            playerId: this.playerId,
            trapId: this.trapId,
            trapType: this.trapType,
            entered: this.entered
        };
    }

    _fromObject(object) {
        this.setPlayerId(object.playerId);
        this.setTrapId(object.trapId);
        this.setTrapType(object.trapType);
        this.setEntered(object.entered);
    }
}
