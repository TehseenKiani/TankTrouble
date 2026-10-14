import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class ChatActivityMessage extends Message {
    static typeId = MessageSchemas.chatActivityMessage.typeId;

    playerIds = [];

    getPlayerIds() {
        return this.playerIds;
    }

    setPlayerIds(playerIds) {
        this.playerIds = playerIds;
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
