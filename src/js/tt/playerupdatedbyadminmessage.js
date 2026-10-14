import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class PlayerUpdatedByAdminMessage extends Message {
    static typeId = MessageSchemas.playerUpdatedByAdminMessage.typeId;

    adminId = "";
    token = "";
    clientId = "";
    playerId = "";
    iconChanged = false;
    usernameChanged = false;
    contentChanged = false;

    setAdminId(adminId) {
        this.adminId = adminId;
    }

    getAdminId() {
        return this.adminId;
    }

    setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    setClientId(clientId) {
        this.clientId = clientId;
    }

    getClientId() {
        return this.clientId;
    }

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getPlayerId() {
        return this.playerId;
    }

    setIconChanged(iconChanged) {
        this.iconChanged = iconChanged;
    }

    getIconChanged() {
        return this.iconChanged;
    }

    setUsernameChanged(usernameChanged) {
        this.usernameChanged = usernameChanged;
    }

    getUsernameChanged() {
        return this.usernameChanged;
    }

    setContentChanged(contentChanged) {
        this.contentChanged = contentChanged;
    }

    getContentChanged() {
        return this.contentChanged;
    }

    _toObject() {
        return {
            adminId: this.adminId,
            token: this.token,
            clientId: this.clientId,
            playerId: this.playerId,
            iconChanged: this.iconChanged,
            usernameChanged: this.usernameChanged,
            contentChanged: this.contentChanged
        };
    }

    _fromObject(object) {
        this.setAdminId(object.adminId);
        this.setToken(object.token);
        this.setClientId(object.clientId);
        this.setPlayerId(object.playerId);
        this.setIconChanged(object.iconChanged);
        this.setUsernameChanged(object.usernameChanged);
        this.setContentChanged(object.contentChanged);
    }
}
