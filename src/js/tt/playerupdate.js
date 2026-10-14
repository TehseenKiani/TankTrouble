export class PlayerUpdate {
    playerId = "";
    iconChanged = false;
    usernameChanged = false;

    constructor(playerId, iconChanged, usernameChanged) {
        this.playerId = playerId;
        this.iconChanged = iconChanged;
        this.usernameChanged = usernameChanged;
    }

    getPlayerId() {
        return this.playerId;
    }

    getIconChanged() {
        return this.iconChanged;
    }

    getUsernameChanged() {
        return this.usernameChanged;
    }
}
