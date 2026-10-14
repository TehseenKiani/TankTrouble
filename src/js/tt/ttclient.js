/**
 * This class implements the TankTrouble multiplayer client code to be used client side
 * (in a browser).
 *
 * The TTClient class acts as a state machine, with the following states:
 *
 * TTClient.STATES = {
 *   UNCONNECTED: "unconnected",
 *   CONNECTING: "connecting",
 *   CONNECTED: "connected",
 *   HANDSHAKED: "handshaked",
 *   AUTHENTICATED: "authenticated"
 * }
 *
 * Listeners are notified of state changes, errors as well as various events
 * of general interest, such as:
 * - The list of available games has been updated
 *
 * The TTClient class is used like this (please note parameters accepted by
 * callback functions):
 *
 * const c = new TTClient('ws://localhost:12345/');
 * c.addErrorListener(function(error, message) { ... });
 * c.addStateChangeListener(function(oldState, newState, data, message) { ... });
 * c.addEventListener(function(event, data) { ... });
 * c.connect();
 * ...
 *
 */

import { Log } from "./log.js";
import { PingMessage } from "./pingmessage.js";
import { PongMessage } from "./pongmessage.js";
import { AchievementUnlockedMessage } from "./achievementunlockedmessage.js";
import { HandshakeMessage } from "./handshakemessage.js";
import { HandshakeResultMessage } from "./handshakeresultmessage.js";
import { AuthenticateMessage } from "./authenticatemessage.js";
import { AuthenticateResultMessage } from "./authenticateresultmessage.js";
import { DeauthenticateMessage } from "./deauthenticatemessage.js";
import { DeauthenticateResultMessage } from "./deauthenticateresultmessage.js";
import { ChatActivityMessage } from "./chatactivitymessage.js";
import { GlobalChatMessage } from "./globalchatmessage.js";
import { ChatMessage } from "./chatmessage.js";
import { UserChatMessage } from "./userchatmessage.js";
import { ReportChatMessage } from "./reportchatmessage.js";
import { ReportChatResultMessage } from "./reportchatresultmessage.js";
import { UndoChatReportMessage } from "./undochatreportmessage.js";
import { UndoChatReportResultMessage } from "./undochatreportresultmessage.js";
import { SystemChatMessage } from "./systemchatmessage.js";
import { CreateGameResultMessage } from "./creategameresultmessage.js";
import { CreateGameMessage } from "./creategamemessage.js";
import { CountDownMessage } from "./countdownmessage.js";
import { GameStateMessage } from "./gamestatemessage.js";
import { JoinGameMessage } from "./joingamemessage.js";
import { JoinGameResultMessage } from "./joingameresultmessage.js";
import { LeaveGameMessage } from "./leavegamemessage.js";
import { LeaveGameResultMessage } from "./leavegameresultmessage.js";
import { CancelLeaveGameMessage } from "./cancelleavegamemessage.js";
import { CancelLeaveGameResultMessage } from "./cancelleavegameresultmessage.js";
import { ListGamesMessage } from "./listgamesmessage.js";
import { ListGamesResultMessage } from "./listgamesresultmessage.js";
import { RequestMazeMessage } from "./requestmazemessage.js";
import { RequestMazeResultMessage } from "./requestmazeresultmessage.js";
import { TankDestroyedMessage } from "./tankdestroyedmessage.js";
import { TankKilledMessage } from "./tankkilledmessage.js";
import { ProjectileDestroyedMessage } from "./projectiledestroyedmessage.js";
import { ProjectileTimeoutMessage } from "./projectiletimeoutmessage.js";
import { TrapDestroyedMessage } from "./trapdestroyedmessage.js";
import { CollectibleDestroyedMessage } from "./collectibledestroyedmessage.js";
import { WeaponDestroyedMessage } from "./weapondestroyedmessage.js";
import { UpgradeDestroyedMessage } from "./upgradedestroyedmessage.js";
import { CounterDestroyedMessage } from "./counterdestroyedmessage.js";
import { ZoneDestroyedMessage } from "./zonedestroyedmessage.js";
import { RoundEndedMessage } from "./roundendedmessage.js";
import { RoundCreatedMessage } from "./roundcreatedmessage.js";
import { RoundStartedMessage } from "./roundstartedmessage.js";
import { StakesMessage } from "./stakesmessage.js";
import { RoundStateMessage } from "./roundstatemessage.js";
import { RoundStateDeltaMessage } from "./roundstatedeltamessage.js";
import { CelebrationStartedMessage } from "./celebrationstartedmessage.js";
import { TankStateMessage } from "./tankstatemessage.js";
import { PlayerKickedMessage } from "./playerkickedmessage.js";
import { PlayersBannedMessage } from "./playersbannedmessage.js";
import { PlayersUnbannedMessage } from "./playersunbannedmessage.js";
import { PlayerUpdatedMessage } from "./playerupdatedmessage.js";
import { ShutdownMessage } from "./shutdownmessage.js";
import { Shutdown } from "./shutdown.js";
import { ContentUpdatedMessage } from "./contentupdatedmessage.js";
import { TrapTrippedMessage } from "./traptrippedmessage.js";
import { Trip } from "./trip.js";
import { Constants } from "./constants.js";
import { MessageParser } from "./messageparser.js";
import { GameState } from "./gamestate.js";
import { Maze } from "./maze.js";
import { Kill } from "./kill.js";
import { Pickup } from "./pickup.js";
import { PlayerDetails } from "./playerdetails.js";
import { VictoryAward } from "./victoryaward.js";
import { WeaponDeactivation } from "./weapondeactivation.js";
import { UpgradeUpdate } from "./upgradeupdate.js";
import { PlayerKick } from "./playerkick.js";
import { ChatPost } from "./chatpost.js";
import { SystemChatPost } from "./systemchatpost.js";
import { AchievementUnlock } from "./achievementunlock.js";
import { PlayerUpdate } from "./playerupdate.js";

export class TTClient {
    // A room uses its own socket and server-authoritative state.
    roomTransport = null;
    static STATES = {
        UNCONNECTED: "unconnected",
        CONNECTING: "connecting",
        CONNECTED: "connected",
        HANDSHAKED: "handshaked",
        AUTHENTICATED: "authenticated"
    };

    static PLAYER_STATES = {
        NOT_AUTHENTICATED: "not authenticated",
        AUTHENTICATING: "authenticating",
        AUTHENTICATED: "authenticated"
    };

    static EVENTS = {
        PLAYERS_AUTHENTICATING: "players authenticating",
        PLAYERS_AUTHENTICATED: "players authenticated",
        GAME_LIST_CHANGED: "game list changed",
        GAME_JOINED: "game joined",
        CHAT_REPORTED: "chat reported",
        CHAT_REPORT_UNDONE: "chat report undone",
        CHAT_ACTIVITY: "chat activity",
        GLOBAL_CHAT_POSTED: "global chat posted",
        CHAT_POSTED: "chat posted",
        USER_CHAT_POSTED: "user chat posted",
        SYSTEM_CHAT_POSTED: "system chat posted",
        PLAYERS_BANNED: "players banned",
        PLAYERS_UNBANNED: "players unbanned",
        PLAYER_UPDATED: "player updated",
        ACHIEVEMENT_UNLOCKED: "achievement unlocked",
        ROUND_TRIP_TIME_CHANGED: "round trip time changed",
        PLAYERS_KICKED: "players kicked",
        SHUTDOWN: "shutdown"
    };

    static ERRORS = {
        HANDSHAKE: "handshake",
        AUTHENTICATE: "authenticate",
        DEAUTHENTICATE: "deauthenticate",
        LIST_GAMES: "list games",
        JOIN_GAME: "join game",
        CREATE_GAME: "create game",
        LEAVE_GAME: "leave game",
        REQUEST_MAZE: "request maze"
    };

    id = "";
    version = "";
    gameManager = null;
    focusManager = null;
    playerDetailsCache = null;
    currencyCache = null;
    virtualShopCache = null;
    tempBanValidityCache = null;
    garageContentCache = null;
    unseenAchievementsCache = null;
    state = null;
    socket = null;
    socketUrl = null;
    stateChangeListeners = [];
    eventListeners = [];
    errorListeners = [];
    games = [];
    gameState = null;
    expandedRoundState = null;
    lastRoundState = null;
    playerIds = [];
    tokens = [];
    playerIdAuthenticationState = {};
    authenticatedPlayerIds = [];
    currentGameId = null;
    log = null;
    txCount = 0;
    rxCount = 0;
    pingInterval = null;
    lastPingTime = null;
    currentRoundtripTime = 0;

    constructor(id, version, gameManager, focusManager, playerDetailsCache, currencyCache, virtualShopCache, tempBanValidityCache, garageContentCache, unseenAchievementsCache) {
        this.state = TTClient.STATES.UNCONNECTED;
        this.log = new Log("TTClient");
        this.id = id;
        this.version = version;
        this.gameManager = gameManager;
        this.focusManager = focusManager;
        this.playerDetailsCache = playerDetailsCache;
        this.currencyCache = currencyCache;
        this.virtualShopCache = virtualShopCache;
        this.tempBanValidityCache = tempBanValidityCache;
        this.garageContentCache = garageContentCache;
        this.unseenAchievementsCache = unseenAchievementsCache;
    }

    ping() {
        switch (this.state) {
            case TTClient.STATES.CONNECTED:
            case TTClient.STATES.HANDSHAKED:
            case TTClient.STATES.AUTHENTICATED:
            {
                this.lastPingTime = new Date();
                const pm = new PingMessage();
                this._send(pm);
                break;
            }
        }
    }

    addUser(playerId, token) {
        this.playerIds.push(playerId);
        this.tokens.push(token);
        this.playerIdAuthenticationState[playerId] = TTClient.PLAYER_STATES.NOT_AUTHENTICATED;

        // If already connected and handshaked, send authentication message with user.
        switch (this.state) {
            case TTClient.STATES.HANDSHAKED:
            case TTClient.STATES.AUTHENTICATED:
            {
                this.playerIdAuthenticationState[playerId] = TTClient.PLAYER_STATES.AUTHENTICATING;

                const msg = new AuthenticateMessage();
                msg.setTokens([token]);
                msg.setPlayerIds([playerId]);
                this._send(msg);

                this._notifyEventListeners(TTClient.EVENTS.PLAYERS_AUTHENTICATING, [playerId]);

                break;
            }
        }
    }

    addUsers(playerIds, tokens) {
        for (let i = 0; i < playerIds.length; ++i) {
            this.playerIds.push(playerIds[i]);
            this.tokens.push(tokens[i]);
            this.playerIdAuthenticationState[playerIds[i]] = TTClient.PLAYER_STATES.NOT_AUTHENTICATED;
        }

        // If already connected and handshaked, send authentication message with users.
        switch (this.state) {
            case TTClient.STATES.HANDSHAKED:
            case TTClient.STATES.AUTHENTICATED:
            {
                for (const playerId of playerIds) {
                    this.playerIdAuthenticationState[playerId] = TTClient.PLAYER_STATES.AUTHENTICATING;
                }

                const msg = new AuthenticateMessage();
                msg.setTokens(tokens);
                msg.setPlayerIds(playerIds);
                this._send(msg);

                this._notifyEventListeners(TTClient.EVENTS.PLAYERS_AUTHENTICATING, playerIds);

                break;
            }
        }
    }

    removeUser(playerId) {
        for (let i = 0; i < this.authenticatedPlayerIds.length; ++i) {
            if (this.authenticatedPlayerIds[i] === playerId) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                this.authenticatedPlayerIds.splice(i, 1);

                // If already authenticated, send deauthentication message with user.
                const msg = new DeauthenticateMessage();
                msg.setPlayerIds([playerId]);
                this._send(msg);

                break;
            }
        }
        for (let i = 0; i < this.playerIds.length; ++i) {
            if (this.playerIds[i] === playerId) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                this.playerIds.splice(i, 1);
                this.tokens.splice(i, 1);

                delete this.playerIdAuthenticationState[playerId];

                // If no players are left, end any existing game, and go back to handshaked state.
                if (this.playerIds.length === 0) {
                    this._endGame();
                    this._setState(TTClient.STATES.HANDSHAKED);
                }

                break;
            }
        }
    }

    replaceUser(playerIdToReplace, playerId, token) {
        // Most of the content of removeUser EXCEPT leaving the game if no players are left.
        for (let i = 0; i < this.authenticatedPlayerIds.length; ++i) {
            if (this.authenticatedPlayerIds[i] === playerIdToReplace) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                this.authenticatedPlayerIds.splice(i, 1);

                // If already authenticated, send deauthentication message with user.
                const msg = new DeauthenticateMessage();
                msg.setPlayerIds([playerIdToReplace]);
                this._send(msg);

                break;
            }
        }
        for (let i = 0; i < this.playerIds.length; ++i) {
            if (this.playerIds[i] === playerIdToReplace) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                this.playerIds.splice(i, 1);
                this.tokens.splice(i, 1);

                delete this.playerIdAuthenticationState[playerIdToReplace];

                break;
            }
        }

        // Add replacing user as usual.
        this.addUser(playerId, token);
    }

    updateUser(playerId, iconChanged, usernameChanged) {
        // If authenticated, send update player info message with user.
        if (this.playerIdAuthenticationState[playerId] === TTClient.PLAYER_STATES.AUTHENTICATED) {
            const msg = new PlayerUpdatedMessage();
            msg.setPlayerId(playerId);
            msg.setIconChanged(iconChanged);
            msg.setUsernameChanged(usernameChanged);
            msg.setContentChanged(false);
            this._send(msg);
        }
    }

    getState() {
        return this.state;
    }

    getSocket() {
        return this.socket;
    }

    getRoundTripTime() {
        return this.currentRoundtripTime;
    }

    connect(socketUrl) {
        this.socketUrl = socketUrl;
        this.socket = new WebSocket(this.socketUrl);
        this.socket.binaryType = "arraybuffer";

        this._setState(TTClient.STATES.CONNECTING);

        this.socket.onmessage = event => {
            //client.log.debug(event.data);
            /*if (event.data.byteLength !== undefined) {
                client.rxCount += event.data.byteLength;
            } else {
                client.rxCount += event.data.length;
            }*/
            //client.log.debug("RX bytes: " + client.rxCount);
            const msg = MessageParser.parse(event.data);
            if (msg === false) {
                this.log.error(`Failed to parse data as message:${event.data}`);
                return;
            }

            // We have successfully parsed a message, so we need to determine what action to take

            // Handle globally valid messages here
            switch (msg.getTypeId()) {
                case PongMessage.typeId:
                {
                    this.currentRoundtripTime = Date.now() - this.lastPingTime;
                    this._notifyEventListeners(TTClient.EVENTS.ROUND_TRIP_TIME_CHANGED, this.currentRoundtripTime);
                    return;
                }
                case PingMessage.typeId:
                {
                    // Ignore on purpose.
                    return;
                }
                case ChatActivityMessage.typeId:
                {
                    this._notifyEventListeners(TTClient.EVENTS.CHAT_ACTIVITY, msg.getPlayerIds());
                    return;
                }
                case GlobalChatMessage.typeId:
                {
                    const globalChatPost = new ChatPost(msg.getFrom(), null, msg.getMessage(), msg.getChatMessageId(), msg.getSendReceipt());
                    this._notifyEventListeners(TTClient.EVENTS.GLOBAL_CHAT_POSTED, globalChatPost);
                    return;
                }
                case ChatMessage.typeId:
                {
                    const chatPost = new ChatPost(msg.getFrom(), null, msg.getMessage(), msg.getChatMessageId(), msg.getSendReceipt());
                    this._notifyEventListeners(TTClient.EVENTS.CHAT_POSTED, chatPost);
                    return;
                }
                case UserChatMessage.typeId:
                {
                    const userChatPost = new ChatPost(msg.getFrom(), msg.getTo(), msg.getMessage(), msg.getChatMessageId(), msg.getSendReceipt());
                    this._notifyEventListeners(TTClient.EVENTS.USER_CHAT_POSTED, userChatPost);
                    return;
                }
                case SystemChatMessage.typeId:
                {
                    const systemChatPost = new SystemChatPost(msg.getInvolvedPlayerIds(), msg.getMessage(), msg.getSendReceipt());
                    this._notifyEventListeners(TTClient.EVENTS.SYSTEM_CHAT_POSTED, systemChatPost);
                    return;
                }
                case ListGamesResultMessage.typeId:
                {
                    if (msg.getResult() === true) {
                        // Result data should be an array of json structures representing valid stub
                        // games
                        this.games = msg.getResultData().map(gameStateObject => GameState.withObject(gameStateObject));
                        // Tell any listeners that game list may have changed
                        this._notifyEventListeners(TTClient.EVENTS.GAME_LIST_CHANGED);
                        return;
                    } else {
                        this._notifyErrorListeners(TTClient.ERRORS.LIST_GAMES, `Failed to retrieve games list: ${msg.getMessage()}`);
                        return;
                    }
                }
                case DeauthenticateResultMessage.typeId:
                {
                    if (msg.getResult() === true) {
                        // Intentionally do nothing.
                        return;
                    } else {
                        this._notifyErrorListeners(TTClient.ERRORS.DEAUTHENTICATE, `Failed to deauthenticate player(s): ${msg.getMessage()}`);
                        return;
                    }
                }
                case ReportChatResultMessage.typeId:
                {
                    // Tell any listeners that chat report was accepted.
                    this._notifyEventListeners(TTClient.EVENTS.CHAT_REPORTED, msg.getResultData());
                    return;
                }
                case UndoChatReportResultMessage.typeId:
                {
                    this._notifyEventListeners(TTClient.EVENTS.CHAT_REPORT_UNDONE, msg.getResultData());
                    return;
                }
                case PlayersBannedMessage.typeId:
                {
                    const playerIds = msg.getPlayerIds();
                    // Invalidate the temp ban cache of banned players.
                    for (const playerId of playerIds) {
                        this.tempBanValidityCache.invalidate(playerId);
                    }
                    // Tell any listeners that players were banned.
                    this._notifyEventListeners(TTClient.EVENTS.PLAYERS_BANNED, msg.getPlayerIds());
                    return;
                }
                case PlayersUnbannedMessage.typeId:
                {
                    const playerIds = msg.getPlayerIds();
                    // Invalidate the temp ban cache of banned players.
                    for (const playerId of playerIds) {
                        this.tempBanValidityCache.invalidate(playerId);
                    }
                    // Tell any listeners that players were banned.
                    this._notifyEventListeners(TTClient.EVENTS.PLAYERS_UNBANNED, msg.getPlayerIds());
                    return;
                }
                case PlayerUpdatedMessage.typeId:
                {
                    // Invalidate the updated player's details.
                    this.playerDetailsCache.invalidate(msg.getPlayerId());
                    if (msg.getContentChanged()) {
                        // Invalidate the updated player's currency.
                        this.currencyCache.invalidate(msg.getPlayerId());
                        // Invalidate the updated player's virtual shop.
                        this.virtualShopCache.invalidate(msg.getPlayerId());
                        // Invalidate the updated player's garage content.
                        this.garageContentCache.invalidate(msg.getPlayerId());
                    }
                    // Tell any listeners that player was updated.
                    const playerUpdate = new PlayerUpdate(msg.getPlayerId(), msg.getIconChanged(), msg.getUsernameChanged());
                    this._notifyEventListeners(TTClient.EVENTS.PLAYER_UPDATED, playerUpdate);
                    return;
                }
                case AchievementUnlockedMessage.typeId:
                {
                    // Invalidate the virtual shop of the player.
                    this.virtualShopCache.invalidate(msg.getPlayerId());
                    // Invalidate the unseen achievements of the player.
                    this.unseenAchievementsCache.invalidate(msg.getPlayerId());
                    // Invalidate the garage content of the player.
                    this.garageContentCache.invalidate(msg.getPlayerId());
                    // Invalidate the currency of the player.
                    this.currencyCache.invalidate(msg.getPlayerId());
                    // Tell any listeners that an achievement was unlocked.
                    const achievementUnlock = new AchievementUnlock(msg.getPlayerId(), msg.getAchievementId());
                    this._notifyEventListeners(TTClient.EVENTS.ACHIEVEMENT_UNLOCKED, achievementUnlock);
                    return;
                }
                case PlayerKickedMessage.typeId:
                {
                    this._playerKickedMessageHandler(msg);
                    return;
                }
                case ShutdownMessage.typeId:
                {
                    this._shutdownMessageHandler(msg);
                    return;
                }
                case ContentUpdatedMessage.typeId:
                {
                    if (msg.getVirtualShopChanged()) {
                        this.virtualShopCache.invalidateAll();
                    }
                    return;
                }
            }

            // Not a globally valid message, so we need to inspect current client state
            // to determine what to do
            switch (this.state) {
                case TTClient.STATES.UNCONNECTED:
                case TTClient.STATES.CONNECTING:
                {
                    this.log.error(`Message of type ${msg.getTypeId()} received while in state ${this.state}. This should never happen.`);
                    break;
                }
                case TTClient.STATES.CONNECTED:
                {
                    switch (msg.getTypeId()) {
                        case HandshakeResultMessage.typeId:
                        {
                            if (msg.getResult() === true) {
                                // The client is now handshaked.
                                this._setState(TTClient.STATES.HANDSHAKED);

                                // Send an authenticate message if someone is already logged in.
                                if (this.playerIds.length > 0) {
                                    for (const playerId of this.playerIds) {
                                        this.playerIdAuthenticationState[playerId] = TTClient.PLAYER_STATES.AUTHENTICATING;
                                    }

                                    const authenticateMsg = new AuthenticateMessage();
                                    authenticateMsg.setTokens(this.tokens);
                                    authenticateMsg.setPlayerIds(this.playerIds);
                                    this._send(authenticateMsg);

                                    this._notifyEventListeners(TTClient.EVENTS.PLAYERS_AUTHENTICATING, this.playerIds);
                                }
                            } else {
                                const shutdown = new Shutdown(msg.getMessage(), msg.getResultData());

                                this._notifyEventListeners(TTClient.EVENTS.SHUTDOWN, shutdown);
                                // Removed since a failure to handshake will be handled by shutting the client down.
                                //client._notifyErrorListeners(TTClient.ERRORS.HANDSHAKE, "Failed to handshake: " + msg.getMessage());
                            }

                            break;
                        }
                        default:
                        {
                            this.log.error(`Received message of type ${msg.getTypeId()} while in state ${this.state}. This should never happen`);
                        }
                    }
                    break;
                }
                case TTClient.STATES.HANDSHAKED:
                {
                    switch (msg.getTypeId()) {
                        case AuthenticateResultMessage.typeId:
                        {
                            if (msg.getResult() === true) {
                                // AuthenticateResultMessage contains player details as payload data
                                // so we retrieve that here, and store player details for the authenticated
                                // player in the player details cache
                                const playerDetailsObjects = msg.getResultData();
                                const playerIds = [];

                                for (const playerDetailsObject of playerDetailsObjects) {
                                    const playerDetails = PlayerDetails.withObject(playerDetailsObject);
                                    this.playerDetailsCache.set(
                                        playerDetails.getPlayerId(),
                                        playerDetails
                                    );

                                    playerIds.push(playerDetails.getPlayerId());

                                    this.playerIdAuthenticationState[playerDetails.getPlayerId()] = TTClient.PLAYER_STATES.AUTHENTICATED;
                                    this.authenticatedPlayerIds.push(playerDetails.getPlayerId());
                                }

                                // The client is now authenticated.
                                this._setState(TTClient.STATES.AUTHENTICATED);

                                this._notifyEventListeners(TTClient.EVENTS.PLAYERS_AUTHENTICATED, playerIds);
                            } else {
                                // If authentication failed. Kick all users and log them out.
                                this._kickAllUsers();
                                this._notifyErrorListeners(TTClient.ERRORS.AUTHENTICATE, `Failed to authenticate player: ${msg.getMessage()}`);
                            }
                            break;
                        }
                        default:
                        {
                            this.log.error(`Received message of type ${msg.getTypeId()} while in state ${this.state}. This should never happen`);
                        }
                    }
                    break;
                }
                case TTClient.STATES.AUTHENTICATED:
                {
                    switch (msg.getTypeId()) {
                        case RoundStateMessage.typeId:
                        {
                            // Handle receiving a RoundState message before going to the game state:
                            // - if the UI is not ready, it will be ignored,
                            // - but it will be stored if it is an expanded round state (containing weapons).

                            this._roundStateMessageHandler(msg);
                            break;
                        }
                        case RoundStateDeltaMessage.typeId:
                        {
                            this._roundStateDeltaMessageHandler(msg);
                            break;
                        }
                        case AuthenticateResultMessage.typeId:
                        {
                            if (msg.getResult() === true) {
                                // AuthenticateResultMessage contains player details as payload data
                                // so we retrieve that here, and store player details for the authenticated
                                // player in the player details cache
                                const playerDetailsObjects = msg.getResultData();
                                const playerIds = [];

                                for (const playerDetailsObject of playerDetailsObjects) {
                                    const playerDetails = PlayerDetails.withObject(playerDetailsObject);
                                    this.playerDetailsCache.set(
                                        playerDetails.getPlayerId(),
                                        playerDetails
                                    );

                                    playerIds.push(playerDetails.getPlayerId());

                                    this.playerIdAuthenticationState[playerDetails.getPlayerId()] = TTClient.PLAYER_STATES.AUTHENTICATED;
                                    this.authenticatedPlayerIds.push(playerDetails.getPlayerId());
                                }

                                if (this.currentGameId) {
                                    const joinGameMsg = new JoinGameMessage();
                                    joinGameMsg.setGameId(this.currentGameId);
                                    joinGameMsg.setPlayerIds(playerIds);
                                    this._send(joinGameMsg);
                                }

                                this._notifyEventListeners(TTClient.EVENTS.PLAYERS_AUTHENTICATED, playerIds);
                            } else {
                                // If authentication failed. Kick all users and log them out.
                                this._kickAllUsers();
                                this._notifyErrorListeners(TTClient.ERRORS.AUTHENTICATE, `Failed to authenticate player: ${msg.getMessage()}`);
                            }
                            break;
                        }
                        case CreateGameResultMessage.typeId:
                        case JoinGameResultMessage.typeId:
                        {
                            if (msg.getResult() === true) {
                                // Our request to join/create a game was accepted, so change
                                // state accordingly. Detailed game state will arrive later
                                // in a separate game state message
                                this.currentGameId = msg.getResultData();

                                this._notifyEventListeners(TTClient.EVENTS.GAME_JOINED, msg.getResultData());
                            } else {
                                // Notify listeners that an error has occurred
                                if (msg.getTypeId() === CreateGameResultMessage.typeId) {
                                    this._notifyErrorListeners(TTClient.ERRORS.CREATE_GAME, `Failed to create game: ${msg.getMessage()}`);
                                } else {
                                    this._notifyErrorListeners(TTClient.ERRORS.JOIN_GAME, `Failed to join game: ${msg.getMessage()}`);
                                }

                                this._endGame();

                                // Update game list to ensure it is up to date.
                                this.updateGameList();
                            }
                            break;
                        }
                        case GameStateMessage.typeId:
                        {
                            // Handle receiving a GameState message before going to the game state:
                            // - if the UI is not ready, it will be ignored,
                            // - but it will be stored.

                            this._gameStateMessageHandler(msg);
                            break;
                        }
                        case TankStateMessage.typeId:
                        {
                            this._tankStateMessageHandler(msg);
                            break;
                        }
                        case LeaveGameMessage.typeId:
                        {
                            this._endGame();
                            break;
                        }
                        case LeaveGameResultMessage.typeId:
                        {
                            if (msg.getResult() === true) {
                                this._endGame();
                            } else {
                                // Notify listeners that an error has occurred.
                                // FIXME Removed since it is completely valid for the leave game request to be rejected.
                                //client._notifyErrorListeners(TTClient.ERRORS.LEAVE_GAME, "Failed to leave game: " + msg.getMessage());
                            }
                            break;
                        }
                        case CancelLeaveGameResultMessage.typeId:
                        {
                            // Intentionally do nothing.
                            break;
                        }
                        case RequestMazeResultMessage.typeId:
                        {
                            if (msg.getResult() === true) {
                                // Result data should be a json structure representing maze
                                const resultData = msg.getResultData();
                                const maze = Maze.withObject(resultData);

                                const gameController = this.gameManager.getGameController();
                                if (gameController) {
                                    gameController.setMaze(maze);
                                }
                            } else {
                                // Notify listeners that an error has occurred
                                // FIXME Removed since it causes problems with an error when a new game is started with only one player. Need to find workaround.
                                //client._notifyErrorListeners(TTClient.ERRORS.REQUEST_MAZE, "Failed to request maze: " + msg.getMessage());
                            }
                            break;
                        }
                        case RoundCreatedMessage.typeId:
                        {
                            this._roundCreatedMessageHandler(msg);
                            break;
                        }
                        case RoundStartedMessage.typeId:
                        {
                            // Update title.
                            if (!this.focusManager.isFocused()) {
                                this.focusManager.showMessageInTitle("Go!");
                            }

                            const gameController = this.gameManager.getGameController();
                            if (gameController) {
                                gameController.startRound();
                            }
                            break;
                        }
                        case CelebrationStartedMessage.typeId:
                        {
                            const gameController = this.gameManager.getGameController();
                            if (gameController) {
                                gameController.startCelebration();
                            }
                            break;
                        }
                        case CountDownMessage.typeId:
                        {
                            const gameController = this.gameManager.getGameController();
                            if (gameController) {
                                gameController.countDown(msg.getValue());
                            }
                            break;
                        }
                        case RoundEndedMessage.typeId:
                        {
                            this._roundEndedMessageHandler(msg);
                            break;
                        }
                        case StakesMessage.typeId:
                        {
                            this._stakesMessageHandler(msg);
                            break;
                        }
                        case TankDestroyedMessage.typeId:
                        {
                            this._tankDestroyedMessageHandler(msg);
                            break;
                        }
                        case TankKilledMessage.typeId:
                        {
                            this._tankKilledMessageHandler(msg);
                            break;
                        }
                        case ProjectileTimeoutMessage.typeId:
                        {
                            const gameController = this.gameManager.getGameController();
                            if (gameController) {
                                gameController.timeoutProjectile(msg.getProjectileId());
                            }
                            break;
                        }
                        case ProjectileDestroyedMessage.typeId:
                        {
                            const gameController = this.gameManager.getGameController();
                            if (gameController) {
                                gameController.destroyProjectile(msg.getProjectileId());
                            }
                            break;
                        }
                        case TrapTrippedMessage.typeId:
                        {
                            this._trapTrippedMessageHandler(msg);
                            break;
                        }
                        case TrapDestroyedMessage.typeId:
                        {
                            const gameController = this.gameManager.getGameController();
                            if (gameController) {
                                gameController.destroyTrap(msg.getTrapId());
                            }
                            break;
                        }
                        case CollectibleDestroyedMessage.typeId:
                        {
                            this._collectibleDestroyedMessageHandler(msg);
                            break;
                        }
                        case WeaponDestroyedMessage.typeId:
                        {
                            this._weaponDestroyedMessageHandler(msg);
                            break;
                        }
                        case UpgradeDestroyedMessage.typeId:
                        {
                            this._upgradeDestroyedMessageHandler(msg);
                            break;
                        }
                        case CounterDestroyedMessage.typeId:
                        {
                            this._counterDestroyedMessageHandler(msg);
                            break;
                        }
                        case ZoneDestroyedMessage.typeId:
                        {
                            this._zoneDestroyedMessageHandler(msg);
                            break;
                        }
                        default:
                        {
                            this.log.error(`Received message of type ${msg.getTypeId()} while in state ${this.state}. This should never happen`);
                        }
                    }
                    break;
                }
                default:
                {
                    this.log.error(`Unknown client state: ${this.state}`);
                    break;
                }
            }
        };

        this.socket.onerror = event => {
            this._stopPinging();

            for (const playerId of this.playerIds) {
                this.playerIdAuthenticationState[playerId] = TTClient.PLAYER_STATES.NOT_AUTHENTICATED;
            }
            this.authenticatedPlayerIds = [];

            this._setState(TTClient.STATES.UNCONNECTED);
        };

        this.socket.onclose = event => {
            this._stopPinging();

            for (const playerId of this.playerIds) {
                this.playerIdAuthenticationState[playerId] = TTClient.PLAYER_STATES.NOT_AUTHENTICATED;
            }
            this.authenticatedPlayerIds = [];

            this._setState(TTClient.STATES.UNCONNECTED);
        };

        this.socket.onopen = event => {
            this._startPinging();

            this._clearGame();

            // Clear local cache so any changes in other players' details while disconnected will show up.
            this.playerDetailsCache.invalidateAll();

            this._setState(TTClient.STATES.CONNECTED);

            // Send handshake message.
            const msg = new HandshakeMessage();
            msg.setClientId(this.id);
            msg.setVersion(this.version);
            this._send(msg);
        };

        return true;
    }

    _startPinging() {
        // Set a timer to measure ping times at regular intervals
        if (!this.pingInterval) {
            this.pingInterval = setInterval(
                () => {
                    this.ping();
                },
                5000
            );
        }
    }

    _stopPinging() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    _clearGame() {
        // Clear game id and stored game state.
        this.currentGameId = null;
        this.gameState = null;
        // Clear stored round state.
        this.expandedRoundState = null;
        this.roundState = null;
    }

    _endGame() {
        this._clearGame();

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.endGame();
        }
    }

    _setState(newState, data, msg) {
        if (this.state === newState) {
            // Don't emit signals when we are changing to the state we
            // are already in
            return;
        }

        const oldState = this.state;
        this.state = newState;
        this._notifyStateChangeListeners(oldState, this.state, data, msg);
    }

    _notifyStateChangeListeners(oldState, newState, data, msg) {
        for (const stateChangeListener of this.stateChangeListeners) {
            stateChangeListener.callback(stateChangeListener.context, oldState, newState, data, msg);
        }
    }

    _notifyErrorListeners(error, msg) {
        for (const errorListener of this.errorListeners) {
            errorListener.callback(errorListener.context, error, msg);
        }
    }

    _notifyEventListeners(evt, data) {
        for (const eventListener of this.eventListeners) {
            eventListener.callback(eventListener.context, evt, data);
        }
    }

    addErrorListener(callback, context) {
        this.errorListeners.push({ callback, context });
    }

    removeErrorListener(callback, context) {
        const index = this.errorListeners.findIndex(listener => listener.callback === callback && listener.context === context);
        if (index !== -1) {
            this.errorListeners.splice(index, 1);
        }
    }

    addEventListener(callback, context) {
        this.eventListeners.push({ callback, context });
    }

    removeEventListener(callback, context) {
        const index = this.eventListeners.findIndex(listener => listener.callback === callback && listener.context === context);
        if (index !== -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    addStateChangeListener(callback, context) {
        if (context?.gameController?.roomConnection) return;
        this.stateChangeListeners.push({ callback, context });
    }

    removeStateChangeListener(callback, context) {
        const index = this.stateChangeListeners.findIndex(listener => listener.callback === callback && listener.context === context);
        if (index !== -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    _tankStateMessageHandler(msg) {
        const tankState = msg.getTankState();

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.setTankState(tankState);
        }
    }

    _roundStateMessageHandler(msg) {
        const roundState = msg.getRoundState();
        this.lastRoundState = roundState;
        if (roundState.getWeaponStates().length > 0) {
            this.expandedRoundState = roundState;
        }
        this.roundState = roundState;

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.setRoundState(roundState);
        }
    }

    _roundStateDeltaMessageHandler(msg) {
        msg.setRoundState(this.lastRoundState.applyDelta(msg.getRoundState()));
        this._roundStateMessageHandler(msg);
    }

    _gameStateMessageHandler(msg) {
        const gameState = msg.getGameState();
        this.gameState = gameState;

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.setGameState(gameState);
        }
    }

    _tankKilledMessageHandler(msg) {
        if (msg.getKillerPlayerId() !== msg.getVictimPlayerId()) {
            // Invalidate the killer player's details.
            this.playerDetailsCache.invalidate(msg.getKillerPlayerId());
        }

        const kill = new Kill(msg.getVictimPlayerId(), msg.getKillerPlayerId(), msg.getExperience(), msg.getDeadlyId(), msg.getDeadlyType());

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.killTank(kill);
        }
    }

    _tankDestroyedMessageHandler(msg) {
        const playerId = msg.getPlayerId();

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.destroyTank(playerId);
        }
    }

    _trapTrippedMessageHandler(msg) {
        const trip = new Trip(msg.getPlayerId(), msg.getTrapId(), msg.getTrapType(), msg.getEntered());

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.tripTrap(trip);
        }
    }

    _collectibleDestroyedMessageHandler(msg) {
        const gameController = this.gameManager.getGameController();
        if (gameController) {
            const collectible = gameController.getCollectible(msg.getCollectibleId());
            if (collectible) {
                if (collectible.getType() === Constants.COLLECTIBLE_TYPES.GOLD || collectible.getType() === Constants.COLLECTIBLE_TYPES.DIAMOND) {
                    // Invalidate the involved player's currency.
                    this.currencyCache.invalidate(msg.getPlayerId());

                    // Invalidate the involved player's virtual shop.
                    this.virtualShopCache.invalidate(msg.getPlayerId());
                }
            }

            const pickup = new Pickup(msg.getPlayerId(), msg.getCollectibleId());

            gameController.destroyCollectible(pickup);
        }
    }

    _weaponDestroyedMessageHandler(msg) {
        const weaponDeactivation = new WeaponDeactivation(msg.getWeaponId(), msg.getPlayerId());

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.destroyWeapon(weaponDeactivation);
        }
    }

    _upgradeDestroyedMessageHandler(msg) {
        const upgradeUpdate = new UpgradeUpdate(msg.getUpgradeId(), msg.getPlayerId());

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.destroyUpgrade(upgradeUpdate);
        }
    }

    _counterDestroyedMessageHandler(msg) {
        const counterId = msg.getCounterId();

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.destroyCounter(counterId);
        }
    }

    _zoneDestroyedMessageHandler(msg) {
        const zoneId = msg.getZoneId();

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.destroyZone(zoneId);
        }
    }

    _roundCreatedMessageHandler(msg) {
        // Update title.
        if (!this.focusManager.isFocused()) {
            this.focusManager.showMessageInTitle("Ready!");
        }

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.createRound(msg.getRanked());
        }

        this.requestMaze();
    }

    _roundEndedMessageHandler(msg) {
        const goldAmount = msg.getVictoryGoldAmountPerWinner();
        for (const playerId of msg.getWinnerPlayerIds()) {
            // Invalidate the winning player's details.
            this.playerDetailsCache.invalidate(playerId);

            if (goldAmount > 0) {
                // Invalidate the winning player's currency.
                this.currencyCache.invalidate(playerId);

                // Invalidate the winning player's virtual shop.
                this.virtualShopCache.invalidate(playerId);
            }
        }

        for (const rankChange of msg.getRankChanges()) {
            // Invalidate the ranked player's details.
            this.playerDetailsCache.invalidate(rankChange.playerId);
        }

        // Clear stored round state.
        this.expandedRoundState = null;
        this.roundState = null;

        // Update title.
        if (!this.focusManager.isFocused()) {
            this.focusManager.clearTitle();
        }

        const victoryAward = new VictoryAward(msg.getWinnerPlayerIds(), msg.getVictoryExperiencePerWinner(), msg.getVictoryGoldAmountPerWinner(), msg.getRankChanges());

        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.endRound(victoryAward);
        }
    }

    _stakesMessageHandler(msg) {
        const gameController = this.gameManager.getGameController();
        if (gameController) {
            gameController.setStakes(msg.getStakes());
        }
    }

    _playerKickedMessageHandler(msg) {
        const playerKick = new PlayerKick([msg.getPlayerId()], msg.getMessageType(), msg.getReason());
        this._notifyEventListeners(TTClient.EVENTS.PLAYERS_KICKED, playerKick);
    }

    _kickAllUsers() {
        // Clone the array since it may be modified in event listeners.
        const playerKick = new PlayerKick([...this.playerIds], PlayerKick.MESSAGE_TYPES.NOTIFICATION, "All players were kicked due to an unexpected error");
        this._notifyEventListeners(TTClient.EVENTS.PLAYERS_KICKED, playerKick);
    }

    _shutdownMessageHandler(msg) {
        const shutdown = new Shutdown(msg.getReason(), false);
        this._notifyEventListeners(TTClient.EVENTS.SHUTDOWN, shutdown);
    }

    _send(message) {
        switch (this.state) {
            case TTClient.STATES.UNCONNECTED:
            case TTClient.STATES.CONNECTING:
            {
                return false;
            }
        }
        //this.log.debug("Sending message " + message.pack());
        try {
            const packedMessage = message.pack();

            return this.socket.send(packedMessage);
        } catch (error) {
            this.log.error(`Failed to send message: ${error.message}`);
            return false;
        }
    }

    chatActivity() {
        const msg = new ChatActivityMessage();
        msg.setPlayerIds(this.authenticatedPlayerIds);
        this._send(msg);
    }

    globalChat(message) {
        const msg = new GlobalChatMessage();
        msg.setFrom(this.authenticatedPlayerIds);
        msg.setMessage(message);
        this._send(msg);
    }

    chat(message) {
        const msg = new ChatMessage();
        msg.setFrom(this.authenticatedPlayerIds);
        msg.setMessage(message);
        this._send(msg);
    }

    userChat(recipientPlayerIds, message) {
        const msg = new UserChatMessage();
        msg.setTo(recipientPlayerIds);
        msg.setFrom(this.authenticatedPlayerIds);
        msg.setMessage(message);
        this._send(msg);
    }

    reportChat(chatMessageId) {
        const msg = new ReportChatMessage();
        msg.setReporters(this.authenticatedPlayerIds);
        msg.setChatMessageId(chatMessageId);
        this._send(msg);
    }

    undoChatReport(chatMessageId) {
        const msg = new UndoChatReportMessage();
        msg.setReporters(this.authenticatedPlayerIds);
        msg.setChatMessageId(chatMessageId);
        this._send(msg);
    }

    updateGameList() {
        const listGamesMsg = new ListGamesMessage();
        this._send(listGamesMsg);
    }

    quickjoinGame() {
        this.joinGame("*");
    }

    joinGame(gameId) {
        const msg = new JoinGameMessage();
        msg.setGameId(gameId);
        msg.setPlayerIds(this.authenticatedPlayerIds);
        this._send(msg);
    }

    leaveGame(force) {
        if (this.roomTransport) { this.roomTransport.leave(); return; }
        const msg = new LeaveGameMessage();
        msg.setForce(force);
        this._send(msg);
    }

    cancelLeaveGame() {
        if (this.roomTransport) return;
        const msg = new CancelLeaveGameMessage();
        this._send(msg);
    }

    requestMaze() {
        if (this.roomTransport) return;
        const msg = new RequestMazeMessage();
        this._send(msg);
    }

    createGame(ranked, symmetric, storm, gameMode, maxActivePlayerCount, crateTypes) {
        const msg = new CreateGameMessage();
        msg.setRanked(ranked);
        msg.setSymmetric(symmetric);
        msg.setStorm(storm);
        msg.setGameMode(gameMode);
        msg.setMaxActivePlayerCount(maxActivePlayerCount);
        msg.setCrateTypes(crateTypes);
        this._send(msg);
    }

    getAvailableGameStates() {
        return this.games;
    }

    getExpandedRoundState() {
        if (this.roomTransport) return false;
        if (this.expandedRoundState) {
            return this.expandedRoundState;
        }
        return false;
    }

    getRoundState() {
        if (this.currentGameId) {
            if (this.roundState) {
                return this.roundState;
            }
            return false;
        } else {
            this.log.error("Attempt to get round state with client not in game");
            return false;
        }
    }

    getGameState() {
        if (this.roomTransport) return false;
        if (this.currentGameId) {
            if (this.gameState) {
                return this.gameState;
            }
            return false;
        } else {
            this.log.error("Attempt to get game state with client not in game");
            return false;
        }
    }

    setTankState(tankState) {
        if (this.roomTransport) return;
        if (this.currentGameId) {
            const tankStateMsg = new TankStateMessage();
            tankStateMsg.setTankState(tankState);
            this._send(tankStateMsg);
        } else {
            this.log.error("Attempt to set tank state with client not in game");
        }
    }

    getCurrentGameId() {
        return this.currentGameId;
    }

    getPlayerIds() {
        return this.playerIds;
    }

    getAuthenticatedPlayerIds() {
        return this.authenticatedPlayerIds;
    }

    isPlayerAuthenticating(playerId) {
        return this.playerIdAuthenticationState[playerId] === TTClient.PLAYER_STATES.AUTHENTICATING;
    }
}
