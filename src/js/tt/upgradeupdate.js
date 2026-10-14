export class UpgradeUpdate {
    upgradeId = null;
    playerId = null; // String with id of owner

    constructor(upgradeId, playerId) {
        this.upgradeId = upgradeId;
        this.playerId = playerId;
    }

    getUpgradeId() {
        return this.upgradeId;
    }

    getPlayerId() {
        return this.playerId;
    }
}
