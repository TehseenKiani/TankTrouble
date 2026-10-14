import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class AchievementUnlockedMessage extends Message {
    static typeId = MessageSchemas.achievementUnlockedMessage.typeId;

    playerId = "";
    achievementId = "";

    getPlayerId() {
        return this.playerId;
    }

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getAchievementId() {
        return this.achievementId;
    }

    setAchievementId(achievementId) {
        this.achievementId = achievementId;
    }

    _toObject() {
        return {
            playerId: this.playerId,
            achievementId: this.achievementId
        };
    }

    _fromObject(object) {
        this.setPlayerId(object.playerId);
        this.setAchievementId(object.achievementId);
    }
}
