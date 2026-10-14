import { Constants } from "./tt/constants.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";

export class Users {
    static authenticatedUsers = {};
    static guestUsers = {};
    static highestGmUser = "";
    static highestGmLevel = null;
    static adminRoles = [];
    static admissionToken = "";
    static admissionTokenExpiresAt = 0;
    static eventListeners = [];
    static EVENTS = {
        PLAYER_AUTHENTICATED: "player authenticated",
        PLAYER_DEAUTHENTICATED: "player deauthenticated",
        GUEST_ADDED: "guest added",
        GUESTS_ADDED: "guests added",
        GUEST_REMOVED: "guest removed",
        GUEST_SIGNED_UP: "guest signed up",
        PLAYER_UPDATED: "player updated"
    };

    static addEventListener(callback, context) {
        Users.eventListeners.push({ callback, context });
    }

    static removeEventListener(callback, context) {
        for (let i = 0; i < Users.eventListeners.length; i++) {
            if (Users.eventListeners[i].callback === callback && Users.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                Users.eventListeners.splice(i, 1);
                return;
            }
        }
    }

    static loadAuthenticatedUsers() {
        if (typeof g_users === "object") {
            const playerIds = Object.keys(g_users);
            for (let i = 0; i < playerIds.length; i++) {
                Users.addAuthenticatedUser(playerIds[i], g_users[playerIds[i]].multiplayerToken);
            }
        }
    }

    static loadGuestUsers() {
        if (typeof g_guests === "object") {
            const playerIds = Object.keys(g_guests);
            for (let i = 0; i < playerIds.length; i++) {
                Users.addGuestUser(playerIds[i], g_guests[playerIds[i]].multiplayerToken);
            }
        }
    }

    static loadHighestGm() {
        if (typeof g_initialHighestGmLevel === "number") {
            Users.highestGmLevel = g_initialHighestGmLevel;
        }
        if (typeof g_initialHighestGmUser === "string") {
            Users.highestGmUser = g_initialHighestGmUser;
        }
    }

    static loadAdminRoles() {
        if (Array.isArray(g_initialAdminRoles)) {
            Users.adminRoles = g_initialAdminRoles;
        }
    }

    static loadAdmissionToken() {
        if (typeof g_admissionToken === "string") {
            Users.admissionToken = g_admissionToken;
        }
        if (typeof g_admissionTokenExpiresAt === "number") {
            Users.admissionTokenExpiresAt = g_admissionTokenExpiresAt;
        }
    }

    static getAdmissionToken() {
        return Users.admissionToken;
    }

    static isAdmissionTokenNearExpiry() {
        return Users.admissionTokenExpiresAt - Math.floor(Date.now() / 1000) < Constants.CLIENT.ADMISSION_TOKEN_REFRESH_THRESHOLD;
    }

    static refreshAdmissionToken() {
        return Backend.getAdmissionToken()
            .then(result => {
                if (typeof result !== "object") {
                    return false;
                }

                Users.admissionToken = result.token;
                Users.admissionTokenExpiresAt = result.expiresAt;

                return true;
            })
            .catch(() => false);
    }

    static withFreshAdmissionToken() {
        if (!Users.isAdmissionTokenNearExpiry()) {
            return Promise.resolve(true);
        }

        return Users.refreshAdmissionToken();
    }

    static init() {
        Users.addEventListener(Users._authenticationEventHandler, Users);
        Users._updateGm();
    }

    static addAuthenticatedUser(playerId, multiplayerToken) {
        Users.authenticatedUsers[playerId] = multiplayerToken;
        Users._notifyEventListeners(Users.EVENTS.PLAYER_AUTHENTICATED, playerId);
    }

    static removeAuthenticatedUser(playerId) {
        delete Users.authenticatedUsers[playerId];
        Users._notifyEventListeners(Users.EVENTS.PLAYER_DEAUTHENTICATED, playerId);
    }

    static addGuestUser(playerId, multiplayerToken) {
        Users.guestUsers[playerId] = multiplayerToken;
        Users._notifyEventListeners(Users.EVENTS.GUEST_ADDED, playerId);
    }

    static addGuestUsers(playerIds, multiplayerTokens) {
        for (let i = 0; i < playerIds.length; ++i) {
            Users.guestUsers[playerIds[i]] = multiplayerTokens[i];
        }
        Users._notifyEventListeners(Users.EVENTS.GUESTS_ADDED, playerIds);
    }

    static removeGuestUser(playerId) {
        delete Users.guestUsers[playerId];
        Users._notifyEventListeners(Users.EVENTS.GUEST_REMOVED, playerId);
    }

    static signUpGuestUser(playerId) {
        const multiplayerToken = Users.guestUsers[playerId];
        delete Users.guestUsers[playerId];
        Users.authenticatedUsers[playerId] = multiplayerToken;
        Users._notifyEventListeners(Users.EVENTS.GUEST_SIGNED_UP, playerId);
    }

    static updateUser(playerId, iconChanged, usernameChanged) {
        const change = { playerId, iconChanged, usernameChanged };
        Users._notifyEventListeners(Users.EVENTS.PLAYER_UPDATED, change);
    }

    static getAuthenticatedPlayerIds() {
        return Object.keys(Users.authenticatedUsers);
    }

    static getAuthenticatedMultiplayerToken(playerId) {
        return Users.authenticatedUsers[playerId];
    }

    static getAuthenticatedMultiplayerTokens(playerIds) {
        const tokens = [];
        for (let i = 0; i < playerIds.length; ++i) {
            tokens.push(Users.authenticatedUsers[playerIds[i]]);
        }

        return tokens;
    }

    static isAuthenticatedUser(playerId) {
        return Object.hasOwn(Users.authenticatedUsers, playerId);
    }

    static getGuestPlayerIds() {
        return Object.keys(Users.guestUsers);
    }

    static getHighestGmUser() {
        return Users.highestGmUser;
    }

    static getHighestGmLevel() {
        return Users.highestGmLevel;
    }

    static hasAdminRole(role) {
        for (let i = 0; i < Users.adminRoles.length; ++i) {
            const userAdminRoles = Users.adminRoles[i];
            for (let j = 0; j < userAdminRoles.roles.length; ++j) {
                if (userAdminRoles.roles[j] === role) {
                    return true;
                }
            }
        }

        return false;
    }

    static hasSpecificUserAdminRole(playerId, role) {
        for (let i = 0; i < Users.adminRoles.length; ++i) {
            const userAdminRoles = Users.adminRoles[i];
            if (userAdminRoles.playerId === playerId) {
                for (let j = 0; j < userAdminRoles.roles.length; ++j) {
                    if (userAdminRoles.roles[j] === role) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    static getAdminUserForRole(role) {
        for (let i = 0; i < Users.adminRoles.length; ++i) {
            const userAdminRoles = Users.adminRoles[i];
            for (let j = 0; j < userAdminRoles.roles.length; ++j) {
                if (userAdminRoles.roles[j] === role) {
                    return userAdminRoles.playerId;
                }
            }
        }

        return null;
    }

    static getGuestMultiplayerToken(playerId) {
        return Users.guestUsers[playerId];
    }

    static getGuestMultiplayerTokens(playerIds) {
        const tokens = [];
        for (let i = 0; i < playerIds.length; ++i) {
            tokens.push(Users.guestUsers[playerIds[i]]);
        }

        return tokens;
    }

    static isGuestUser(playerId) {
        return Object.hasOwn(Users.guestUsers, playerId);
    }

    static isAnyUser(playerId) {
        return this.isAuthenticatedUser(playerId) || this.isGuestUser(playerId);
    }

    static getAllPlayerIds() {
        return [...Object.keys(Users.authenticatedUsers), ...Object.keys(Users.guestUsers)];
    }

    static _updateGm() {
        Users.highestGmUser = "";
        Users.highestGmLevel = null;
        Users.adminRoles = null;

        const playerIds = Users.getAuthenticatedPlayerIds();
        let highestGmPlayerId = "";
        let highestGmLevel = null;

        const detailsPromises = playerIds.map(playerId => {
            return Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        if (result.getGmLevel() !== null && result.getGmLevel() > highestGmLevel) {
                            highestGmPlayerId = result.getPlayerId();
                            highestGmLevel = result.getGmLevel();
                        }
                    }
                })
                .catch(() => {});
        });

        // When we have all responses, update result.
        Promise.all(detailsPromises).then(() => {
            Users.highestGmUser = highestGmPlayerId;
            Users.highestGmLevel = highestGmLevel;
        });

        Backend.getAdminRoles(playerIds)
            .then(result => {
                if (Array.isArray(result)) {
                    Users.adminRoles = result;
                }
            });
    }

    static _notifyEventListeners(evt, data) {
        for (let i = 0; i < Users.eventListeners.length; i++) {
            Users.eventListeners[i].callback(Users.eventListeners[i].context, evt, data);
        }
    }

    static _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            case Users.EVENTS.PLAYER_UPDATED:
            {
                Users._updateGm();
                break;
            }
        }
    }
}
