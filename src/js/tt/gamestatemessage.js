import { Message } from "./message.js";
import { GameState } from "./gamestate.js";
import { MessageSchemas } from "./messageschemas.js";

export class GameStateMessage extends Message {
    static typeId = MessageSchemas.gameStateMessage.typeId;

    gameState = null;

    setGameState(gameState) {
        this.gameState = gameState;
    }

    getGameState() {
        return this.gameState;
    }

    _toObject() {
        return {
            gameState: this.gameState.toObject()
        };
    }

    _fromObject(object) {
        this.setGameState(GameState.withObject(object.gameState));
    }
}
