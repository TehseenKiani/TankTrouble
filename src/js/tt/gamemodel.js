import { Player } from "./player.js";
import { Score } from "./score.js";
import { Emblem } from "./emblem.js";
import { GameState } from "./gamestate.js";
import { Log } from "./log.js";

/*
 * Events:
 * - updated()
 *
 * Datastructures:
 *
 * Playerstate:
 *
 * {
 *      id: <int>,
 *      queued: <bool>,
 *      enqueueTime: <string> // Sortable string format.
 *      team: <int>
 * }
 */
export class GameModel {
    static _EVENTS = {
        PLAYER_ADDED_ACTIVE: "player added to active",
        PLAYER_ADDED_QUEUE: "player added to queue",
        PLAYER_REMOVED: "player removed",
        PLAYERS_ADDED_QUEUE: "players added to queue", // Aggregated event which is not fired before update.
        PLAYERS_ADDED_ACTIVE: "players added to active", // Aggregated event which is not fired before update.
        PLAYERS_REMOVED: "players removed", // Aggregated event which is not fired before update.
        GAME_STARTED: "game started",
        COUNT_DOWN: "count down",
        GAME_STATE_CHANGED: "game state changed",
        GAME_ENDED: "game ended"
    };

    static _STATES = {
        BETWEEN_ROUNDS: "between rounds",
        COUNTING_DOWN: "counting down",
        IN_ROUND: "in round",
        ENDED: "ended" // The game has completely ended and is ready for deallocation
    };

    queuedPlayers = {};
    activePlayers = {};
    mode = null;
    maxActivePlayerCount = 0;
    theme = null;
    scores = {};
    emblems = {};
    playerIdScoreIds = {};
    eventListeners = [];
    addedActivePlayerIds = [];
    addedQueuedPlayerIds = [];
    removedPlayerIds = [];
    state = null;
    gameStarted = false;
    log = null;

    constructor(controllerId, mode, maxActivePlayerCount, theme) {
        // Create a logger
        this.log = new Log(`GameModel ${controllerId}`);

        this.mode = mode;
        this.maxActivePlayerCount = maxActivePlayerCount;
        this.theme = theme;

        // Set initial state
        this.state = GameModel._STATES.BETWEEN_ROUNDS;
    }

    getGameState() {
        const gameState = new GameState();
        const playerStates = [];
        for (const queuedPlayerId in this.queuedPlayers) {
            const queuedPlayer = this.queuedPlayers[queuedPlayerId];
            playerStates.push(queuedPlayer.getPlayerState());
        }
        for (const activePlayerId in this.activePlayers) {
            const activePlayer = this.activePlayers[activePlayerId];
            playerStates.push(activePlayer.getPlayerState());
        }
        gameState.setPlayerStates(playerStates);

        gameState.setMode(this.mode);
        gameState.setMaxActivePlayerCount(this.maxActivePlayerCount);
        gameState.setTheme(this.theme);

        const scoreStates = [];
        for (const scoreId in this.scores) {
            const score = this.scores[scoreId];
            scoreStates.push(score.getScoreState());
        }
        gameState.setScoreStates(scoreStates);

        const emblemStates = [];
        for (const emblemId in this.emblems) {
            const emblem = this.emblems[emblemId];
            emblemStates.push(emblem.getEmblemState());
        }
        gameState.setEmblemStates(emblemStates);

        return gameState;
    }

    emitGameState(gameState) {
        this._notifyEventListeners(GameModel._EVENTS.GAME_STATE_CHANGED, gameState);
    }

    activatePlayer(playerId) {
        if (playerId in this.queuedPlayers) {
            const playerTeam = this.queuedPlayers[playerId].getTeam();
            this._removePlayerFromQueue(playerId, false);
            this._addPlayerToActive(playerId, playerTeam, true);
            return true;
        } else {
            return false;
        }
    }

    setPlayerState(playerState) {
        const playerAlreadyQueued = playerState.getPlayerId() in this.queuedPlayers;
        const playerAlreadyActive = playerState.getPlayerId() in this.activePlayers;
        const playerTeam = playerState.getTeam();
        if (!playerAlreadyQueued && !playerAlreadyActive) {
            this.playerIdScoreIds[playerState.getPlayerId()] = [];

            if (playerState.getQueued()) {
                this._addPlayerToQueue(playerState.getPlayerId(), playerTeam, true);
            } else {
                this._addPlayerToActive(playerState.getPlayerId(), playerTeam, true);
            }
        } else if (playerAlreadyQueued) {
            if (playerState.getQueued()) {
                // Intentionally do nothing.
            } else {
                this._removePlayerFromQueue(playerState.getPlayerId(), false);
                this._addPlayerToActive(playerState.getPlayerId(), playerTeam, true);
            }
        } else if (playerAlreadyActive) { // Not strictly necessary, as both values can't be true.
            if (playerState.getQueued()) {
                this._removePlayerFromActive(playerState.getPlayerId(), false);
                this._addPlayerToQueue(playerState.getPlayerId(), playerTeam, true);
            } else {
                // Intentionally do nothing.
            }
        }
    }

    setMode(mode) {
        this.mode = mode;
    }

    getMode() {
        return this.mode;
    }

    setMaxActivePlayerCount(maxActivePlayerCount) {
        this.maxActivePlayerCount = maxActivePlayerCount;
    }

    getMaxActivePlayerCount() {
        return this.maxActivePlayerCount;
    }

    setTheme(theme) {
        this.theme = theme;
    }

    getTheme() {
        return this.theme;
    }

    setScoreState(scoreState) {
        if (!(scoreState.getId() in this.scores)) {
            const score = new Score(scoreState);

            // Update map from player to scores.
            this.playerIdScoreIds[scoreState.getPlayerId()].push(score.getId());

            this.scores[scoreState.getId()] = score;
        } else {
            this.scores[scoreState.getId()].setScoreState(scoreState);
        }
    }

    setEmblemState(emblemState) {
        if (!(emblemState.getId() in this.emblems)) {
            const emblem = new Emblem(emblemState);
            this.emblems[emblemState.getId()] = emblem;
        } else {
            this.emblems[emblemState.getId()].setEmblemState(emblemState);
        }
    }

    addPlayer(playerId, playerTeam) {
        if ((playerId in this.queuedPlayers) || (playerId in this.activePlayers)) {
            this.log.error("Attempt to add player which was already in game. This should not happen!");
            return false;
        } else {
            this.playerIdScoreIds[playerId] = [];
            this._addPlayerToQueue(playerId, playerTeam, true);
            return true;
        }
    }

    countDown(value) {
        this._notifyEventListeners(GameModel._EVENTS.COUNT_DOWN, value);
    }

    getNextQueuedPlayerId() {
        const queuedPlayerIds = this.getQueuedPlayerIds();
        let nextQueuedPlayerId = null;
        let lowestEnqueueTime = null;
        for (const queuedPlayerId of queuedPlayerIds) {
            if (!lowestEnqueueTime) {
                // First queued played id, so grab his queue time and id regardless
                lowestEnqueueTime = this.queuedPlayers[queuedPlayerId].getEnqueueTime();
                nextQueuedPlayerId = queuedPlayerId;
            } else if (lowestEnqueueTime > this.queuedPlayers[queuedPlayerId].getEnqueueTime()) {
                // Current queued played id has lowest queue time so far
                // so use that
                lowestEnqueueTime = this.queuedPlayers[queuedPlayerId].getEnqueueTime();
                nextQueuedPlayerId = queuedPlayerId;
            } else {
                // Intentionally ignore this queuedPlayerId
            }
        }
        return nextQueuedPlayerId;
    }

    removePlayer(playerId) {
        this.log.debug(`Removing player ${playerId}`);

        if (playerId in this.queuedPlayers) {
            this.log.debug(`Removing player ${playerId} from queue`);

            for (const scoreId of this.playerIdScoreIds[playerId]) {
                delete this.scores[scoreId];
            }

            delete this.playerIdScoreIds[playerId];

            this._removePlayerFromQueue(playerId, true);
            return true;
        }

        if (playerId in this.activePlayers) {
            this.log.debug(`Removing player ${playerId} from list of active players`);

            for (const scoreId of this.playerIdScoreIds[playerId]) {
                delete this.scores[scoreId];
            }

            delete this.playerIdScoreIds[playerId];

            this._removePlayerFromActive(playerId, true);
            return true;
        }

        // Player is not in the game, so return false
        this.log.warn(`Failed to remove player ${playerId} from game. Player does not appear to be in the game.`);
        return false;
    }

    removeScore(scoreId) {
        const score = this.scores[scoreId];
        if (score) {
            delete this.scores[scoreId];
            const scoreIds = this.playerIdScoreIds[score.getPlayerId()];
            const index = scoreIds.indexOf(scoreId);
            if (index !== -1) {
                scoreIds.splice(index, 1);
            }
        }
    }

    removeEmblem(emblemId) {
        const emblem = this.emblems[emblemId];
        if (emblem) {
            delete this.emblems[emblemId];
        }
    }

    getTotalPlayerCount() {
        return this.getQueuedPlayerCount() + this.getActivePlayerCount();
    }

    getQueuedPlayerCount() {
        return Object.keys(this.queuedPlayers).length;
    }

    getActivePlayerCount() {
        return Object.keys(this.activePlayers).length;
    }

    getQueuedPlayer(playerId) {
        return this.queuedPlayers[playerId];
    }

    getActivePlayer(playerId) {
        return this.activePlayers[playerId];
    }

    getActivePlayers() {
        return this.activePlayers;
    }

    isPlayerActive(playerId) {
        return playerId in this.activePlayers;
    }

    getActivePlayerIds() {
        return Object.keys(this.activePlayers);
    }

    getQueuedPlayerIds() {
        return Object.keys(this.queuedPlayers);
    }

    getAllPlayerIds() {
        return [...Object.keys(this.activePlayers), ...Object.keys(this.queuedPlayers)];
    }

    getScores() {
        return this.scores;
    }

    getScore(scoreId) {
        return this.scores[scoreId];
    }

    getScoreByPlayerIdAndType(playerId, type) {
        for (const scoreId in this.scores) {
            const score = this.scores[scoreId];
            if (score.getPlayerId() === playerId && score.getType() === type) {
                return score;
            }
        }

        return null;
    }

    getEmblems() {
        return this.emblems;
    }

    getEmblem(emblemId) {
        return this.emblems[emblemId];
    }

    getEmblemByPlayerIdAndType(playerId, type) {
        for (const emblemId in this.emblems) {
            const emblem = this.emblems[emblemId];
            if (emblem.getPlayerId() === playerId && emblem.getType() === type) {
                return emblem;
            }
        }

        return null;
    }

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
        if (this.state === GameModel._STATES.ENDED) {
            this._notifyEventListeners(GameModel._EVENTS.GAME_ENDED);
        } else if (this.state === GameModel._STATES.COUNTING_DOWN && !this.gameStarted) {
            this._notifyEventListeners(GameModel._EVENTS.GAME_STARTED);
            this.gameStarted = true;
        }
    }

    _addPlayerToQueue(playerId, playerTeam, emitEvent) {
        const player = new Player(playerId, true, new Date(), playerTeam);
        this.queuedPlayers[playerId] = player;
        if (emitEvent) {
            this._notifyEventListeners(GameModel._EVENTS.PLAYER_ADDED_QUEUE, playerId);
            this.addedQueuedPlayerIds.push(playerId);
        }
    }

    _removePlayerFromQueue(playerId, emitEvent) {
        this.log.debug(`Removing queued player ${playerId} from game`);
        delete this.queuedPlayers[playerId];
        if (emitEvent) {
            this._notifyEventListeners(GameModel._EVENTS.PLAYER_REMOVED, playerId);
            this.removedPlayerIds.push(playerId);
        }
    }

    _addPlayerToActive(playerId, playerTeam, emitEvent) {
        const player = new Player(playerId, false, new Date(), playerTeam);
        this.activePlayers[playerId] = player;
        if (emitEvent) {
            this._notifyEventListeners(GameModel._EVENTS.PLAYER_ADDED_ACTIVE, playerId);
            this.addedActivePlayerIds.push(playerId);
        }
    }

    _removePlayerFromActive(playerId, emitEvent) {
        this.log.debug(`Removing active player ${playerId} from game`);
        delete this.activePlayers[playerId];
        if (emitEvent) {
            this._notifyEventListeners(GameModel._EVENTS.PLAYER_REMOVED, playerId);
            this.removedPlayerIds.push(playerId);
        }
    }

    addEventListener(callback, context, gameId) {
        this.eventListeners.push({ callback, context, gameId });
    }

    removeEventListener(callback, context) {
        const index = this.eventListeners.findIndex(listener => listener.callback === callback && listener.context === context);
        if (index !== -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    _notifyEventListeners(evt, data) {
        for (const eventListener of this.eventListeners) {
            eventListener.callback(eventListener.context, eventListener.gameId, evt, data);
        }
    }

    update() {
        let gameStateChanged = false;
        // Send queued player updates.
        if (this.addedQueuedPlayerIds.length > 0) {
            this._notifyEventListeners(GameModel._EVENTS.PLAYERS_ADDED_QUEUE, this.addedQueuedPlayerIds);
            gameStateChanged = true;
            this.addedQueuedPlayerIds = [];
        }
        if (this.addedActivePlayerIds.length > 0) {
            this._notifyEventListeners(GameModel._EVENTS.PLAYERS_ADDED_ACTIVE, this.addedActivePlayerIds);
            gameStateChanged = true;
            this.addedActivePlayerIds = [];
        }
        if (this.removedPlayerIds.length > 0) {
            this._notifyEventListeners(GameModel._EVENTS.PLAYERS_REMOVED, this.removedPlayerIds);
            gameStateChanged = true;
            this.removedPlayerIds = [];
        }

        if (gameStateChanged) {
            this._notifyEventListeners(GameModel._EVENTS.GAME_STATE_CHANGED, this.getGameState());
        }
    }
}
