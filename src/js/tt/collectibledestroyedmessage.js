import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class CollectibleDestroyedMessage extends Message {
    static typeId = MessageSchemas.collectibleDestroyedMessage.typeId;

    collectibleId = "";
    playerId = "";

    setCollectibleId(collectibleId) {
        this.collectibleId = collectibleId;
    }

    getCollectibleId() {
        return this.collectibleId;
    }

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getPlayerId() {
        return this.playerId;
    }

    _toObject() {
        return {
            collectibleId: this.collectibleId,
            playerId: this.playerId
        };
    }

    _fromObject(object) {
        this.setCollectibleId(object.collectibleId);
        this.setPlayerId(object.playerId);
    }
}
