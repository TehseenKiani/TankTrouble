import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class DeauthenticateMessage extends Message {
    static typeId = MessageSchemas.deauthenticateMessage.typeId;

    playerIds = [];

    setPlayerIds(playerIds) {
        this.playerIds = playerIds;
    }

    getPlayerIds() {
        return this.playerIds;
    }

    _toObject() {
        return {
            playerIds: this.playerIds
        };
    }

    _fromObject(object) {
        this.setPlayerIds(object.playerIds);
    }
}
