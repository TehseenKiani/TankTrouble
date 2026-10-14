import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class TankDestroyedMessage extends Message {
    static typeId = MessageSchemas.tankDestroyedMessage.typeId;

    playerId = "";

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getPlayerId() {
        return this.playerId;
    }

    _toObject() {
        return {
            playerId: this.playerId
        };
    }

    _fromObject(object) {
        this.setPlayerId(object.playerId);
    }
}
