export class GameSession {
    static controllerChangeListeners = [];
    static addControllerChangeListener(callback) { GameSession.controllerChangeListeners.push(callback); }
    static phaserInstance = null;
    static gameController = null;
    static gameEventListeners = [];
    static roundEventListeners = [];

    static setGame(game) {
        GameSession.phaserInstance = game;
    }

    static getGame() {
        return GameSession.phaserInstance;
    }

    static disableGameInput() {
        const game = GameSession.getGame();
        if (game && game.input) {
            game.input.enabled = false;
            game.input.reset();
        }
    }

    static enableGameInput() {
        const game = GameSession.getGame();
        if (game && game.input) {
            game.input.enabled = true;
            game.input.reset();
        }
    }

    static addGameEventListener(callback, context) {
        GameSession.gameEventListeners.push({ callback, context });
    }

    static removeGameEventListener(callback, context) {
        for (let i = 0; i < GameSession.gameEventListeners.length; i++) {
            if (GameSession.gameEventListeners[i].callback === callback && GameSession.gameEventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                GameSession.gameEventListeners.splice(i, 1);
                return;
            }
        }
    }

    static addRoundEventListener(callback, context) {
        GameSession.roundEventListeners.push({ callback, context });
    }

    static removeRoundEventListener(callback, context) {
        for (let i = 0; i < GameSession.roundEventListeners.length; i++) {
            if (GameSession.roundEventListeners[i].callback === callback && GameSession.roundEventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                GameSession.roundEventListeners.splice(i, 1);
                return;
            }
        }
    }

    static setGameController(gameController) {
        // Remove old event listener.
        if (GameSession.gameController) {
            GameSession.gameController.removeGameEventListener(GameSession._gameEventHandler, GameSession);
            GameSession.gameController.removeRoundEventListener(GameSession._roundEventHandler, GameSession);
        }

        GameSession.gameController = gameController;
        for (const callback of GameSession.controllerChangeListeners) callback(gameController);

        // Add new event listener.
        if (GameSession.gameController) {
            GameSession.gameController.addGameEventListener(GameSession._gameEventHandler, GameSession);
            GameSession.gameController.addRoundEventListener(GameSession._roundEventHandler, GameSession);
        }
    }

    static getGameController() {
        return GameSession.gameController;
    }

    static _gameEventHandler(self, id, evt, data) {
        // Forward to game event listeners.
        for (let i = 0; i < GameSession.gameEventListeners.length; ++i) {
            GameSession.gameEventListeners[i].callback(GameSession.gameEventListeners[i].context, id, evt, data);
        }
    }

    static _roundEventHandler(self, id, evt, data) {
        // Forward to round event listeners.
        for (let i = 0; i < GameSession.roundEventListeners.length; ++i) {
            GameSession.roundEventListeners[i].callback(GameSession.roundEventListeners[i].context, id, evt, data);
        }
    }
}
