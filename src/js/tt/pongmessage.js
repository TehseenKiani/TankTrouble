import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class PongMessage extends Message {
    static typeId = MessageSchemas.pongMessage.typeId;

    gameCount = 0;
    playerCount = 0;

    setGameCount(gameCount) {
        this.gameCount = gameCount;
    }

    getGameCount() {
        return this.gameCount;
    }

    setPlayerCount(playerCount) {
        this.playerCount = playerCount;
    }

    getPlayerCount() {
        return this.playerCount;
    }

    _toObject() {
        return {
            gameCount: this.gameCount,
            playerCount: this.playerCount
        };
    }

    _fromObject(object) {
        this.setGameCount(object.gameCount);
        this.setPlayerCount(object.playerCount);
    }
}
