import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class PlayersUnbannedMessage extends Message {
    static typeId = MessageSchemas.playersUnbannedMessage.typeId;

    playerIds = [];
    adminId = "";
    token = "";
    clientId = "";

    setPlayerIds(playerIds) {
        this.playerIds = playerIds;
    }

    getPlayerIds() {
        return this.playerIds;
    }

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

    _toObject() {
        return {
            playerIds: this.playerIds,
            adminId: this.adminId,
            token: this.token,
            clientId: this.clientId
        };
    }

    _fromObject(object) {
        this.setPlayerIds(object.playerIds);
        this.setAdminId(object.adminId);
        this.setToken(object.token);
        this.setClientId(object.clientId);
    }
}
