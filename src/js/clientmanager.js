import { Constants } from "./tt/constants.js";
import { ContentUpdatedMessage } from "./tt/contentupdatedmessage.js";
import { MessageParser } from "./tt/messageparser.js";
import { PingMessage } from "./tt/pingmessage.js";
import { PlayerKick } from "./tt/playerkick.js";
import { PlayerUpdatedByAdminMessage } from "./tt/playerupdatedbyadminmessage.js";
import { PlayersBannedMessage } from "./tt/playersbannedmessage.js";
import { PlayersUnbannedMessage } from "./tt/playersunbannedmessage.js";
import { PongMessage } from "./tt/pongmessage.js";
import { TTClient } from "./tt/ttclient.js";
import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { FocusManager } from "./focusmanager.js";
import { GameSession } from "./gamesession.js";
import { Log } from "./tt/log.js";
import { OverlayManager } from "./overlaymanager.js";
import { Users } from "./users.js";

export class ClientManager {
    static client = null;
    static clientId = "";
    static clientVersion = "";
    static log = new Log("ClientManager");
    static newlySelectedServerId = null;
    static multiplayerServerId = null;
    static reconnectTimeout = null;
    static availableServers = {};

    static loadAvailableServers() {
        if (typeof g_mpServers === "object") {
            const serverIds = g_mpServers.id;
            const serverNames = g_mpServers.name;
            const serverUrls = g_mpServers.url;
            for (let i = 0; i < serverIds.length; ++i) {
                ClientManager.availableServers[serverIds[i]] = { name: serverNames[i], url: serverUrls[i], latency: undefined };
            }
        }
    }

    static loadClientSettings() {
        if (Cookies.get("multiplayerserverid")) {
            ClientManager.multiplayerServerId = Cookies.get("multiplayerserverid");
        }
        ClientManager.clientId = g_clientId;
        ClientManager.clientVersion = g_version;
    }

    static init() {
        ClientManager.client = new TTClient(
            ClientManager.clientId,
            ClientManager.clientVersion,
            GameSession,
            FocusManager,
            Caches.getPlayerDetailsCache(),
            Caches.getCurrencyCache(),
            Caches.getVirtualShopCache(),
            Caches.getTempBanValidityCache(),
            Caches.getGarageContentCache(),
            Caches.getUnseenAchievementsCache()
        );

        const authenticatedPlayerIds = Users.getAuthenticatedPlayerIds();
        ClientManager.client.addUsers(authenticatedPlayerIds, Users.getAuthenticatedMultiplayerTokens(authenticatedPlayerIds));

        const guestPlayerIds = Users.getGuestPlayerIds();
        ClientManager.client.addUsers(guestPlayerIds, Users.getGuestMultiplayerTokens(guestPlayerIds));

        if (ClientManager.multiplayerServerId) {
            ClientManager._attemptToConnectToServer(ClientManager.multiplayerServerId);
        } else {
            ClientManager._findAndConnectToBestAvailableServer();
        }

        Users.addEventListener(ClientManager._authenticationEventHandler, this);
        TankTrouble.ChatBox.addEventListener(ClientManager._chatEventHandler, this);
        ClientManager.getClient().addStateChangeListener(ClientManager._clientStateChangeHandler, this);
        ClientManager.getClient().addEventListener(ClientManager._clientEventHandler, this);
        ClientManager.getClient().addErrorListener(ClientManager._clientErrorHandler, this);
    }

    static shutdown() {
        Users.removeEventListener(ClientManager._authenticationEventHandler, this);
        TankTrouble.ChatBox.removeEventListener(ClientManager._chatEventHandler, this);
        ClientManager.getClient().removeStateChangeListener(ClientManager._clientStateChangeHandler, this);
        ClientManager.getClient().removeEventListener(ClientManager._clientEventHandler, this);
        ClientManager.getClient().removeErrorListener(ClientManager._clientErrorHandler, this);

        // Disconnect from the current server.
        ClientManager.client.disconnect();

        // Clear reconnectTimeout.
        if (ClientManager.reconnectTimeout) {
            ClientManager.log.debug("Clear automatic reconnect attempt during shutdown");
            clearTimeout(ClientManager.reconnectTimeout);
            ClientManager.reconnectTimeout = null;
        }
    }

    static getAvailableServers() {
        return ClientManager.availableServers;
    }

    static getClient() {
        return ClientManager.client;
    }

    static selectMultiplayerServer(id) {
        // Clear reconnectTimeout.
        if (ClientManager.reconnectTimeout) {
            clearTimeout(ClientManager.reconnectTimeout);
            ClientManager.reconnectTimeout = null;
        }

        if (ClientManager.client.getState() === TTClient.STATES.UNCONNECTED) {
            // Connect immediately.
            ClientManager._attemptToConnectToServer(id);
        } else {
            // Store server id for later connection.
            ClientManager.newlySelectedServerId = id;
            // Disconnect from the current server.
            ClientManager.client.disconnect();
        }
    }

    /**
     * Utility method for updating (and receiving callbacks)
     * on updated multiplayer server ping times.
     *
     * Callback functions provided get called with 6 parameters,
     * for each multiplayerserver in ClientManager.availableServers, regardless
     * of whether they can be reached or not:
     * - success: true if an updated latency could be calculated, false otherwise
     * - serverId: The id of the server, which can be used to identify the server in ClientManager.availableServers
     * - latency: Number of milliseconds. Undefined if no latency could be calculated.
     * - gameCount: Number of games. Undefined if no latency could be calculated.
     * - playerCount: Number of players. Undefined if no latency could be calculated.
     * - message: A human readable message in case success gets set to false
     *
     * @param {Function} callback A function which accepts 6 parameters (result, serverId, latency, gameCount, playerCount, message).
     */
    static getAvailableServerStats(callback) {
        Users.withFreshAdmissionToken().then(() => {
            const serverIds = Object.keys(ClientManager.availableServers);
            // Generate a socket for each available server
            ClientManager.log.debug("Updating latencies");
            for (let i = 0; i < serverIds.length; i++) {
                ClientManager._getSelectedServerStats(serverIds[i], callback);
            }
        });
    }

    static _buildServerUrl(baseUrl) {
        const separator = baseUrl.includes("?") ? "&" : "?";

        return `${baseUrl}${separator}t=${encodeURIComponent(Users.getAdmissionToken())}`;
    }

    /**
     * Utility method for updating (and receiving callbacks)
     * on updated multiplayer server ping times.
     *
     * Callback functions provided get called with 6 parameters,
     * for each multiplayerserver in ClientManager.availableServers, regardless
     * of whether they can be reached or not:
     * - success: true if an updated latency could be calculated, false otherwise
     * - serverId: The id of the server, which can be used to identify the server in ClientManager.availableServers
     * - latency: Number of milliseconds. Undefined if no latency could be calculated.
     * - gameCount: Number of games. Undefined if no latency could be calculated.
     * - playerCount: Number of players. Undefined if no latency could be calculated.
     * - message: A human readable message in case success gets set to false
     *
     * @param {Function} callback A function which accepts 6 parameters (result, serverId, latency, gameCount, playerCount, message).
     */
    static _getSelectedServerStats(serverId, callback) {
        const availableServer = ClientManager.availableServers[serverId];

        if (!availableServer) {
            callback(false, serverId);
            return;
        }
        ClientManager.log.debug(`Updating latency for ${serverId}`);

        // Create a new socket
        const socket = new WebSocket(ClientManager._buildServerUrl(availableServer.url));
        let pingTime;

        socket.onopen = event => {
            const msg = new PingMessage();
            ClientManager.log.debug(`Latency checking socket connected ${serverId}`);
            try {
                socket.send(msg.pack());
                pingTime = new Date();
            } catch (error) {
                ClientManager.log.error(`Failed to send ping on latency connection: ${error.message}`);
            }
        };

        socket.onerror = event => {
            ClientManager.log.error(`Latency checking socket connect_error ${serverId}`);
            ClientManager.availableServers[serverId].latency = undefined;
            callback(false, serverId);
        };

        socket.onmessage = event => {
            const msg = MessageParser.parse(event.data);
            if (!msg) {
                socket.close();

                callback(false, serverId, undefined, undefined, undefined, "Failed to parse message received on latency connection");
            } else if (msg.getTypeId() === PongMessage.typeId) {
                const pongTime = new Date();
                socket.close();

                const latency = pongTime - pingTime;
                ClientManager.availableServers[serverId].latency = latency;

                ClientManager.log.debug(`Latency ${serverId}: ${latency}`);
                callback(true, serverId, latency, msg.getGameCount(), msg.getPlayerCount(), "");
            }
        };
    }

    static _attemptToConnectToServer(serverId) {
        ClientManager.log.debug(`Attempt to connect to server initiated: ${serverId}`);
        Users.withFreshAdmissionToken().then(() => {
            ClientManager._getSelectedServerStats(serverId, (success, statsServerId, latency, gameCount, playerCount, message) => {
                // Check if the client connected to another server while attempting to connect to this server.
                if (ClientManager.client.getState() === TTClient.STATES.UNCONNECTED) {
                    if (success) {
                        // Enable server.
                        TankTrouble.SettingsBox.enableServer(statsServerId, latency);

                        // Set the server selection box.
                        TankTrouble.SettingsBox.setServer(statsServerId);

                        ClientManager.log.debug(`Attempt to connect to server resulted in new connect: ${statsServerId}`);

                        // Store the selected server.
                        Cookies.set("multiplayerserverid", statsServerId, { expires: 365 });
                        ClientManager.multiplayerServerId = statsServerId;

                        // Connect.
                        ClientManager.client.connect(ClientManager._buildServerUrl(ClientManager.availableServers[statsServerId].url));
                    } else {
                        // Disable server.
                        TankTrouble.SettingsBox.disableServer(statsServerId);

                        // Clear preselected server.
                        Cookies.remove("multiplayerserverid");
                        ClientManager.multiplayerServerId = null;

                        // Try to find available server.
                        ClientManager._findAndConnectToBestAvailableServer();
                    }
                } else {
                    ClientManager.log.debug(`Client connected to other server while attempting to connect to this server: ${statsServerId}`);
                }
            });
        });
    }

    static _findAndConnectToBestAvailableServer() {
        ClientManager.log.debug("Find and connect to best available server initiated");

        const availableServerCount = Object.keys(ClientManager.availableServers).length;
        let serverResponseCount = 0;
        let runningServerCount = 0;
        let leastLatencyServerId = "";
        let leastLatency = 1000000;
        let leastLatencyWithPlayersServerId = "";
        let leastLatencyWithPlayers = 1000000;

        // Otherwise try all available servers.
        ClientManager.getAvailableServerStats((success, serverId, latency, gameCount, playerCount, message) => {
            // Count that we got a response.
            serverResponseCount++;

            ClientManager.log.debug(`Received response from ${serverId} (${serverResponseCount}/${availableServerCount})`);

            if (success) {
                // Enable server.
                TankTrouble.SettingsBox.enableServer(serverId, latency);

                // Count that we found a server which was running.
                runningServerCount++;

                if (latency < leastLatency) {
                    leastLatency = latency;
                    leastLatencyServerId = serverId;
                }
                if (playerCount > 0) {
                    if (latency < leastLatencyWithPlayers) {
                        leastLatencyWithPlayers = latency;
                        leastLatencyWithPlayersServerId = serverId;
                    }
                }
            } else {
                // Disable server.
                TankTrouble.SettingsBox.disableServer(serverId);
            }

            // Check if this was the last server responding.
            if (serverResponseCount === availableServerCount) {
                // Check if the client connected while querying servers.
                if (ClientManager.client.getState() === TTClient.STATES.UNCONNECTED) {
                    if (runningServerCount > 0) {
                        // If at least one server is running, connect to the lobby of the server with least latency.
                        // Connect to a server with players if latency is not significantly poorer than the one potentially without.

                        let bestServerId = leastLatencyServerId;

                        if (leastLatencyWithPlayers < leastLatency + Constants.CLIENT.MAX_LATENCY_DIFFERENCE_TO_ACCEPT_FOR_POPULATED_SERVER) {
                            bestServerId = leastLatencyWithPlayersServerId;
                        }

                        // Store this server for next time.
                        Cookies.set("multiplayerserverid", bestServerId, { expires: 365 });
                        ClientManager.multiplayerServerId = bestServerId;

                        // Set the server selection box.
                        TankTrouble.SettingsBox.setServer(bestServerId);

                        ClientManager.log.debug("Find and connect to best available server resulted in new connect");

                        // Connect.
                        ClientManager.client.connect(ClientManager._buildServerUrl(ClientManager.availableServers[bestServerId].url));
                    } else {
                        // Try again after a few seconds.
                        ClientManager.log.debug("Failed to find any server. Attempting again in a few seconds");
                        // Clear any existing time out.
                        if (ClientManager.reconnectTimeout) {
                            clearTimeout(ClientManager.reconnectTimeout);
                        }
                        ClientManager.reconnectTimeout = setTimeout(ClientManager._findAndConnectToBestAvailableServer, Constants.CLIENT.RECONNECT_INTERVAL);
                    }
                } else {
                    ClientManager.log.debug("Client connected while querying available servers");
                }
            }
        });
    }

    static _sendMessageToServer(serverId, msg, timeout) {
        const availableServer = ClientManager.availableServers[serverId];

        if (!availableServer) {
            return;
        }
        ClientManager.log.debug(`Sending message ${msg} to ${serverId}`);

        Users.withFreshAdmissionToken().then(() => {
            // Create a new socket
            const socket = new WebSocket(ClientManager._buildServerUrl(availableServer.url));

            socket.onopen = event => {
                try {
                    socket.send(msg.pack());
                    setTimeout(() => {
                        socket.close();
                    }, timeout);
                } catch (error) {
                    ClientManager.log.error(`Failed to send message on connection: ${error.message}`);
                }
            };
        });
    }

    static broadcastUpdateUserByAdmin(adminId, playerId, iconChanged, usernameChanged, contentChanged) {
        const adminToken = Users.getAuthenticatedMultiplayerToken(adminId);

        const msg = new PlayerUpdatedByAdminMessage();
        msg.setAdminId(adminId);
        msg.setToken(adminToken);
        msg.setClientId(ClientManager.clientId);
        msg.setPlayerId(playerId);
        msg.setIconChanged(iconChanged);
        msg.setUsernameChanged(usernameChanged);
        msg.setContentChanged(contentChanged);

        const serverIds = Object.keys(ClientManager.availableServers);
        // Generate a socket for each available server
        ClientManager.log.debug("Broadcasting update user by admin");
        for (let i = 0; i < serverIds.length; i++) {
            ClientManager._sendMessageToServer(serverIds[i], msg, 1000);
        }
    }

    static broadcastContentUpdated(adminId, virtualShopChanged) {
        const adminToken = Users.getAuthenticatedMultiplayerToken(adminId);

        const msg = new ContentUpdatedMessage();
        msg.setAdminId(adminId);
        msg.setToken(adminToken);
        msg.setClientId(ClientManager.clientId);
        msg.setVirtualShopChanged(virtualShopChanged);

        const serverIds = Object.keys(ClientManager.availableServers);
        // Generate a socket for each available server
        ClientManager.log.debug("Broadcasting update content");
        for (let i = 0; i < serverIds.length; i++) {
            ClientManager._sendMessageToServer(serverIds[i], msg, 1000);
        }
    }

    static broadcastPlayersBanned(adminId, playerIds) {
        const adminToken = Users.getAuthenticatedMultiplayerToken(adminId);

        const msg = new PlayersBannedMessage();
        msg.setAdminId(adminId);
        msg.setToken(adminToken);
        msg.setClientId(ClientManager.clientId);
        msg.setPlayerIds(playerIds);

        const serverIds = Object.keys(ClientManager.availableServers);
        // Generate a socket for each available server
        ClientManager.log.debug("Broadcasting players banned");
        for (let i = 0; i < serverIds.length; i++) {
            ClientManager._sendMessageToServer(serverIds[i], msg, 1000);
        }
    }

    static broadcastPlayersUnbanned(adminId, playerIds) {
        const adminToken = Users.getAuthenticatedMultiplayerToken(adminId);

        const msg = new PlayersUnbannedMessage();
        msg.setAdminId(adminId);
        msg.setToken(adminToken);
        msg.setClientId(ClientManager.clientId);
        msg.setPlayerIds(playerIds);

        const serverIds = Object.keys(ClientManager.availableServers);
        // Generate a socket for each available server
        ClientManager.log.debug("Broadcasting players unbanned");
        for (let i = 0; i < serverIds.length; i++) {
            ClientManager._sendMessageToServer(serverIds[i], msg, 1000);
        }
    }

    static _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            {
                ClientManager.getClient().addUser(data, Users.getAuthenticatedMultiplayerToken(data));

                break;
            }
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            {
                ClientManager.getClient().removeUser(data);

                break;
            }
            case Users.EVENTS.GUEST_ADDED:
            {
                ClientManager.getClient().addUser(data, Users.getGuestMultiplayerToken(data));

                break;
            }
            case Users.EVENTS.GUESTS_ADDED:
            {
                ClientManager.getClient().addUsers(data, Users.getGuestMultiplayerTokens(data));

                break;
            }
            case Users.EVENTS.GUEST_REMOVED:
            {
                ClientManager.getClient().removeUser(data);

                break;
            }
            case Users.EVENTS.GUEST_SIGNED_UP:
            {
                ClientManager.getClient().updateUser(data, false, true);

                break;
            }
            case Users.EVENTS.PLAYER_UPDATED:
            {
                ClientManager.getClient().updateUser(data.playerId, data.iconChanged, data.usernameChanged);

                break;
            }
        }
    }

    static _chatEventHandler(self, evt, data) {
        switch (evt) {
            case TankTrouble.ChatBox.EVENTS.CHAT_ACTIVITY:
            {
                ClientManager.getClient().chatActivity();

                break;
            }
            case TankTrouble.ChatBox.EVENTS.GLOBAL_CHAT:
            {
                ClientManager.getClient().globalChat(data);

                break;
            }
            case TankTrouble.ChatBox.EVENTS.CHAT:
            {
                ClientManager.getClient().chat(data);

                break;
            }
            case TankTrouble.ChatBox.EVENTS.USER_CHAT:
            {
                ClientManager.getClient().userChat(data.recipientPlayerIds, data.message);

                break;
            }
            case TankTrouble.ChatBox.EVENTS.REPORT_CHAT:
            {
                ClientManager.getClient().reportChat(data);

                break;
            }
            case TankTrouble.ChatBox.EVENTS.UNDO_CHAT_REPORT:
            {
                ClientManager.getClient().undoChatReport(data);

                break;
            }
        }
    }

    static _clientStateChangeHandler(self, oldState, newState, data, msg) {
        ClientManager.log.debug(`Client state: ${newState}: ${msg}`);
        switch (newState) {
            case TTClient.STATES.UNCONNECTED:
            {
                // Connect immediately if we have a newly selected server id.
                if (ClientManager.newlySelectedServerId) {
                    ClientManager.log.debug("Reconnect immediately to selected server");
                    // Attempt to connect to newly selected server.
                    ClientManager._attemptToConnectToServer(ClientManager.newlySelectedServerId);
                    // Clear value.
                    ClientManager.newlySelectedServerId = null;
                } else if (ClientManager.multiplayerServerId) {
                    // Attempt to reconnect after a few seconds.
                    ClientManager.log.debug("Attempt to reconnect in a few seconds");
                    // Clear any existing time out.
                    if (ClientManager.reconnectTimeout) {
                        clearTimeout(ClientManager.reconnectTimeout);
                    }
                    ClientManager.reconnectTimeout = setTimeout(ClientManager._attemptToConnectToServer, Constants.CLIENT.RECONNECT_INTERVAL, ClientManager.multiplayerServerId);
                } else {
                    ClientManager.log.debug("Attempt to find a server in a few seconds");
                    // Clear any existing time out.
                    if (ClientManager.reconnectTimeout) {
                        clearTimeout(ClientManager.reconnectTimeout);
                    }
                    ClientManager.reconnectTimeout = setTimeout(ClientManager._findAndConnectToBestAvailableServer, Constants.CLIENT.RECONNECT_INTERVAL);
                }

                break;
            }
            case TTClient.STATES.CONNECTING:
            {
                // Clear reconnectTimeout.
                if (ClientManager.reconnectTimeout) {
                    ClientManager.log.debug("Clear automatic reconnect attempt");
                    clearTimeout(ClientManager.reconnectTimeout);
                    ClientManager.reconnectTimeout = null;
                }

                break;
            }
        }
    }

    static _clientEventHandler(self, evt, data) {
        switch (evt) {
            case TTClient.EVENTS.PLAYERS_KICKED: {
                const playerIds = data.getPlayerIds();
                for (let i = 0; i < playerIds.length; ++i) {
                    if (Users.isAuthenticatedUser(playerIds[i])) {
                        // Submit deauthenticate request.
                        Backend.deauthenticate(playerIds[i], Caches.getEmailCache(), Caches.getCurrencyCache())
                            .then(result => {
                                if (typeof result !== "object") {
                                    ClientManager.log.error("Could not deauthenticate kicked player");
                                }
                            });
                        // Immediately remove kicked user.
                        Users.removeAuthenticatedUser(playerIds[i]);
                    } else {
                        // Submit delete guest request.
                        Backend.deleteGuest(playerIds[i], Caches.getCurrencyCache())
                            .then(result => {
                                if (typeof result !== "object") {
                                    ClientManager.log.error("Could not deauthenticate kicked player");
                                }
                            })
                            .catch(message => {
                                ClientManager.log.error(message);
                            });
                        // Immediately remove kicked guest user.
                        Users.removeGuestUser(playerIds[i]);
                    }
                }

                switch (data.getMessageType()) {
                    case PlayerKick.MESSAGE_TYPES.NOTIFICATION:
                    {
                        TankTrouble.ErrorBox.show(data.getReason());
                        break;
                    }
                    case PlayerKick.MESSAGE_TYPES.WARNING:
                    {
                        TankTrouble.ErrorBox.show(data.getReason(), "Warning!");
                        break;
                    }
                }

                break;
            }
            case TTClient.EVENTS.SHUTDOWN: {
                ClientManager.shutdown();

                OverlayManager.replacePotentialOverlay(
                    TankTrouble.MessageOverlay,
                    {
                        headline: "Site disabled",
                        message: data.getReason(),
                        canCancel: false,
                        canClose: false
                    },
                    true
                );

                if (data.getReload()) {
                    setTimeout(() => {
                        location.reload();
                    }, 7000);
                }

                break;
            }
        }
    }

    static _clientErrorHandler(self, error, msg) {
        self.log.error(`Client error: ${msg}`);
        TankTrouble.ErrorBox.show(msg);
    }
}
