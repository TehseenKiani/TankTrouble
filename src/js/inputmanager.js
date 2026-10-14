import { TankTrouble } from "./tanktrouble.js";
import { GameSession } from "./gamesession.js";
import { Log } from "./tt/log.js";

export class InputManager {
    static chatKey = Phaser.Keyboard.ENTER;

    playerId = null;
    log = null;

    constructor(playerId) {
        this.playerId = playerId;
        this.log = new Log("InputManager");
    }

    update() {
        const game = GameSession.getGame();

        if (game && game.input.keyboard.downDuration(InputManager.chatKey, 16)) {
            TankTrouble.ChatBox.open();
        }
    }

    getPlayerId() {
        return this.playerId;
    }

    reset() {
        this.log.error("Attempt to call InputManager.reset. reset() must be overridden in subclasses");
    }

    static setChatKey(chatKey) {
        InputManager.chatKey = chatKey;
    }
}
