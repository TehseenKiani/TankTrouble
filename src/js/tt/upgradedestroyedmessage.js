import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class UpgradeDestroyedMessage extends Message {
    static typeId = MessageSchemas.upgradeDestroyedMessage.typeId;

    upgradeId = "";
    playerId = "";

    setUpgradeId(upgradeId) {
        this.upgradeId = upgradeId;
    }

    getUpgradeId() {
        return this.upgradeId;
    }

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getPlayerId() {
        return this.playerId;
    }

    _toObject() {
        return {
            upgradeId: this.upgradeId,
            playerId: this.playerId
        };
    }

    _fromObject(object) {
        this.setUpgradeId(object.upgradeId);
        this.setPlayerId(object.playerId);
    }
}
