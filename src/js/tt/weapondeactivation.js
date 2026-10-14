export class WeaponDeactivation {
    weaponId = null;
    playerId = null; // String with id of owner

    constructor(weaponId, playerId) {
        this.weaponId = weaponId;
        this.playerId = playerId;
    }

    getWeaponId() {
        return this.weaponId;
    }

    getPlayerId() {
        return this.playerId;
    }
}
