export class Pickup {
    playerId = null;
    collectibleId = null; // String with id of collectible

    constructor(playerId, collectibleId) {
        this.playerId = playerId;
        this.collectibleId = collectibleId;
    }

    getPlayerId() {
        return this.playerId;
    }

    getCollectibleId() {
        return this.collectibleId;
    }
}
