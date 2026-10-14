import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class AuthenticateMessage extends Message {
    static typeId = MessageSchemas.authenticateMessage.typeId;

    tokens = [];
    playerIds = [];

    setTokens(tokens) {
        this.tokens = tokens;
    }

    getTokens() {
        return this.tokens;
    }

    setPlayerIds(playerIds) {
        this.playerIds = playerIds;
    }

    getPlayerIds() {
        return this.playerIds;
    }

    _toObject() {
        return {
            tokens: this.tokens,
            playerIds: this.playerIds
        };
    }

    _fromObject(object) {
        this.setTokens(object.tokens);
        this.setPlayerIds(object.playerIds);
    }
}
