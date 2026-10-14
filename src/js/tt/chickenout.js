export class ChickenOut {
    playerId = null;
    projectileIds = [];
    trapIds = [];

    constructor(playerId, projectileIds, trapIds) {
        this.playerId = playerId;
        this.projectileIds = projectileIds;
        this.trapIds = trapIds;
    }

    getPlayerId() {
        return this.playerId;
    }

    getProjectileIds() {
        return this.projectileIds;
    }

    getTrapIds() {
        return this.trapIds;
    }
}
