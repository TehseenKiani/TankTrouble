import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class JoinGameMessage extends Message {
    static typeId = MessageSchemas.joinGameMessage.typeId;

    gameId = 0;
    playerIds = [];

    setGameId(gameId) {
        this.gameId = gameId;
    }

    getGameId() {
        return this.gameId;
    }

    setPlayerIds(playerIds) {
        this.playerIds = playerIds;
    }

    getPlayerIds() {
        return this.playerIds;
    }

    _toObject() {
        return {
            gameId: this.gameId,
            playerIds: this.playerIds
        };
    }

    _fromObject(object) {
        this.setGameId(object.gameId);
        this.setPlayerIds(object.playerIds);
    }
}
