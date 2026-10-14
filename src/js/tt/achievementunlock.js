export class AchievementUnlock {
    playerId = "";
    achievementId = "";

    constructor(playerId, achievementId) {
        this.playerId = playerId;
        this.achievementId = achievementId;
    }

    getPlayerId() {
        return this.playerId;
    }

    getAchievementId() {
        return this.achievementId;
    }
}
