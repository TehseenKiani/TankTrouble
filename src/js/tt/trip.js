export class Trip {
    playerId = null;
    trapId = null;
    trapType = null;
    entered = false; // Did the player enter or leave the trap?

    constructor(playerId, trapId, trapType, entered) {
        this.playerId = playerId;
        this.trapId = trapId;
        this.trapType = trapType;
        this.entered = entered;
    }

    getPlayerId() {
        return this.playerId;
    }

    getTrapId() {
        return this.trapId;
    }

    getTrapType() {
        return this.trapType;
    }

    getEntered() {
        return this.entered;
    }
}
