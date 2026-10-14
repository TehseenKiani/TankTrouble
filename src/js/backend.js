import { registerLocalPlayer, getLocalPlayer } from "./localplayers.js";
import { Users } from "./users.js";
import { Ajax } from "./ajax.js";
import { Currency } from "./tt/currency.js";
import { PlayerDetails } from "./tt/playerdetails.js";

export class Backend {
    static _messageAndInputField(result) {
        const messageAndInputField = {};
        // Set focus to relevant input field based on the result data.
        if (result.result.data) {
            messageAndInputField.inputField = result.result.data.inputField;
        }
        messageAndInputField.message = result.result.message;

        return messageAndInputField;
    }

    /**
     * Issue a fresh admission token from the server.
     * Result is an object {token, expiresAt} on success, false on error.
     * @returns {Promise<Object|boolean>} Object containing the token and its expiry on success, false on error.
     */
    static getAdmissionToken() {
        return Ajax.getAdmissionToken().then(result => {
            return result.result.result ? result.result.data : false;
        });
    }

    /**
     * Get AIs from server.
     * Result is an object containing AI[] on success, false on error.
     * @returns {Promise<Object|boolean>} Object containing AI[] on success, false on error.
     */
    static getAIs() {
        return Ajax.getAIs().then(result => {
            return result.result.result ? result.result.data : false;
        });
    }

    /**
     * Get Kickstarter backers from server.
     * Result is an array of backer names on success, false on error.
     * @returns {Promise<string[]|boolean>} Array of backer names on success, false on error.
     */
    static getBackers() {
        return Ajax.getBackers().then(result => {
            return result.result.result ? result.result.data : false;
        });
    }

    /**
     * Get player details from cache or server.
     * Result is an object containing player details on success, string on error.
     * @param {string} playerId
     * @param {Cache} playerDetailsCache The cache to use.
     * @returns {Promise<PlayerDetails|string>} PlayerDetails on success, the player id on error.
     */
    static getPlayerDetails(playerId, playerDetailsCache) {
        const local = getLocalPlayer(playerId);
        if (local) return Promise.resolve(local);
        const cachedPlayerDetails = playerDetailsCache.get(playerId);
        if (cachedPlayerDetails) {
            return Promise.resolve(cachedPlayerDetails);
        }

        const pendingPlayerDetails = Ajax.getPlayerDetails(playerId).then(result => {
            const stillPending = playerDetailsCache.get(playerId) === pendingPlayerDetails;

            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);
                if (stillPending) {
                    playerDetailsCache.set(playerId, playerDetails);
                }

                return playerDetails;
            }

            if (stillPending) {
                playerDetailsCache.invalidate(playerId);
            }

            return playerId;
        });
        playerDetailsCache.set(playerId, pendingPlayerDetails);
        pendingPlayerDetails.catch(() => {
            if (playerDetailsCache.get(playerId) === pendingPlayerDetails) {
                playerDetailsCache.invalidate(playerId);
            }
        });

        return pendingPlayerDetails;
    }

    /**
     * Get player details from cache or server.
     * Result is PlayerDetails on success if the player was found, string with username on success if the player was not found, string on error.
     * NOTE: Only the player id of the player details can be counted on being up to date!
     * NOTE: If someone in the cache changes their username, and another user takes that username, the cache will not be updated!
     * @param {string} username The username of the player.
     * @param {Cache} playerDetailsCache The cache to use.
     * @returns {Promise<PlayerDetails|string>} PlayerDetails on success, the username if the player was not found.
     */
    static getPlayerDetailsByUsername(username, playerDetailsCache) {
        const cachedPlayerDetails = playerDetailsCache.get(username);
        if (cachedPlayerDetails) {
            return Promise.resolve(cachedPlayerDetails);
        }

        return Ajax.getPlayerDetailsByUsername(username).then(result => {
            if (result.result.result) {
                // Update playerDetailsCache as appropriate
                const playerDetails = PlayerDetails.withObject(result.result.data);
                playerDetailsCache.set(playerDetails.getUsername(), playerDetails);

                return playerDetails;
            }

            return username;
        });
    }

    /**
     * Get player details from server.
     * Result is PlayerDetails on success if the player was found, string with email if the player was not found, string on error.
     * @param {string} adminId
     * @param {string} email The email of the player.
     * @returns {Promise<PlayerDetails|string>} PlayerDetails on success, the email if the player was not found.
     */
    static getPlayerDetailsByEmail(adminId, email) {
        return Ajax.getPlayerDetailsByEmail(adminId, email).then(result => {
            return result.result.result ? PlayerDetails.withObject(result.result.data) : email;
        });
    }

    /**
     * Result is a object with player details on success, a string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @returns {Promise<PlayerDetails|string>} PlayerDetails on success, the error message on error.
     */
    static getSensitivePlayerDetails(adminId, playerId) {
        return Ajax.getSensitivePlayerDetails(adminId, playerId).then(result => {
            return result.result.result ? PlayerDetails.withObject(result.result.data) : result.result.message;
        });
    }

    /**
     * Get email address from cache or server.
     * Only currently logged in players' emails can be retrieved.
     * @param {string} playerId The player id of the player.
     * @param {Cache} emailCache The cache to use.
     * @returns {Promise<string|null|boolean>} Email on success, null if the user has no email, false on error.
     */
    static getEmail(playerId, emailCache) {
        const cachedEmail = emailCache.get(playerId);
        if (cachedEmail) {
            return Promise.resolve(cachedEmail);
        }

        return Ajax.getEmail(playerId).then(result => {
            if (result.result.result) {
                // Update emailCache as appropriate
                emailCache.set(playerId, result.result.data);

                return result.result.data;
            }

            return false;
        });
    }

    static getCurrency(playerId, currencyCache) {
        const cachedCurrency = currencyCache.get(playerId);
        if (cachedCurrency) {
            return Promise.resolve(cachedCurrency);
        }

        return Ajax.getCurrency(playerId).then(result => {
            if (result.result.result) {
                // Update currencyCache as appropriate
                const currency = Currency.withObject(result.result.data);
                currencyCache.set(playerId, currency);

                return currency;
            }

            return playerId;
        });
    }

    /**
     * Get tutorial progress for given players
     * @param {string[]} playerIds
     * @returns {Promise<Object|string>} mapping player ids to tutorial progress. Resolves to the error message on error.
     */
    static getTutorialProgress(playerIds) {
        return Ajax.getTutorialProgress(playerIds).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Update tutorial progress for given player
     * @param {string} playerId
     * @returns {Promise<boolean|string>} Resolves to true on success, otherwise the error message.
     */
    static updateTutorialProgress(playerId) {
        return Ajax.updateTutorialProgress(playerId).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    /**
     * Result is a bool on success, a string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @param {Object} playerDetailsCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static recommendPlayerPromotion(adminId, playerId, playerDetailsCache) {
        return Ajax.recommendPlayerPromotion(adminId, playerId).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                return true;
            }

            return result.result.message;
        });
    }

    /**
     * Result is a bool on success, a string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @param {number} adminLevel
     * @param {Object} playerDetailsCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static setPlayerAdminLevel(adminId, playerId, adminLevel, playerDetailsCache) {
        return Ajax.setPlayerAdminLevel(adminId, playerId, adminLevel).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                return true;
            }

            return result.result.message;
        });
    }

    /**
     * Result is bool on success, string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @param {Object} playerDetailsCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static retireAdmin(adminId, playerId, playerDetailsCache) {
        return Ajax.retireAdmin(adminId, playerId).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                return true;
            }

            return result.result.message;
        });
    }

    /**
     * @param {string} adminId
     * @param {boolean} accept
     * @param {Object} playerDetailsCache
     * @returns {Promise<boolean>}
     */
    static acceptAdminGuidelines(adminId, accept, playerDetailsCache) {
        return Ajax.acceptAdminGuidelines(adminId, accept).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);
            }

            return result.result.result;
        });
    }

    /**
     * Get temp ban validities from cache or server. If just one user is not cached, every user's information is retrieved again.
     * @param {string[]} playerIds The player ids to retrieve temp bans for
     * @param {Cache} tempBanValidityCache The cache to use.
     * @returns {Promise<Object|boolean>} Mapping playerIds to newest temp ban validity. Resolves to false on error.
     */
    static getNewestTempBanValidities(playerIds, tempBanValidityCache) {
        const cachedValidities = {};
        let cacheMiss = false;
        for (let i = 0; i < playerIds.length; ++i) {
            const cachedValue = tempBanValidityCache.get(playerIds[i]);
            if (cachedValue === false) {
                cacheMiss = true;
                break;
            }
            cachedValidities[playerIds[i]] = cachedValue;
        }

        if (!cacheMiss) {
            return Promise.resolve(cachedValidities);
        }

        return Ajax.getNewestTempBanValidities(playerIds).then(result => {
            if (result.result.result) {
                // Update tempBanValidityCache as appropriate
                for (const playerId in result.result.data) {
                    tempBanValidityCache.set(playerId, result.result.data[playerId]);
                }

                return result.result.data;
            }

            return false;
        });
    }

    /**
     * Create guest players.
     * @param {number} guestCount The number of guests to create.
     * @param {Cache} playerDetailsCache The cache to use.
     * @returns {Promise<string|Object>} If successfully created guests, return object with playerIds and multiplayerTokens properties that are arrays. Otherwise, return error message.
     */
    static createGuests(guestCount, playerDetailsCache) {
        return Ajax.createGuests(guestCount).then(result => {
            if (result.result.result) {
                const playerDetailsArray = result.result.data.playerDetails;
                const playerIds = [];
                for (let i = 0; i < playerDetailsArray.length; ++i) {
                    const playerDetails = registerLocalPlayer(PlayerDetails.withObject(playerDetailsArray[i]), [...Users.getAllPlayerIds(), ...playerIds]);

                    // Overwrite any cached player details.
                    playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                    playerIds.push(playerDetails.getPlayerId());
                }

                return { playerIds, multiplayerTokens: result.result.data.multiplayerTokens };
            }

            return result.result.message;
        });
    }

    /**
     * Sign up player.
     * @param {string} username The new username to assign to the player.
     * @param {string} password The password.
     * @param {string} confirmPassword The password again.
     * @param {string} email The email of the player.
     * @param {boolean} termsAccepted Whether the terms were accepted.
     * @param {Cache} playerDetailsCache The cache to use.
     * @returns {Promise<string|Object>} If successfully signed up player, return object with playerId and multiplayerToken properties. Otherwise return object with message and inputField properties.
     */
    static signUp(username, password, confirmPassword, email, termsAccepted, playerDetailsCache) {
        return Ajax.signUp(username, password, confirmPassword, email, termsAccepted).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data.playerDetails);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                return { playerId: playerDetails.getPlayerId(), multiplayerToken: result.result.data.multiplayerToken };
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * Sign up guest player in place.
     * @param {string} guestPlayerIdToSignUp The player id of the player to sign up.
     * @param {string} username The new username to assign to the player.
     * @param {string} password The password.
     * @param {string} confirmPassword The password again.
     * @param {string} email The email of the player.
     * @param {boolean} termsAccepted Whether the terms were accepted.
     * @param {Cache} playerDetailsCache The cache to use.
     * @returns {Promise<string|Object>} If successfully signed up guest, return "OK". Otherwise return object with message and inputField properties.
     */
    static signUpGuest(guestPlayerIdToSignUp, username, password, confirmPassword, email, termsAccepted, playerDetailsCache) {
        return Ajax.signUpGuest(guestPlayerIdToSignUp, username, password, confirmPassword, email, termsAccepted).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                return "OK";
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * Get a suggested username from the server.
     * Result is a string on success, false on error.
     * @returns {Promise<string|boolean>} Suggested username on success, false on error.
     */
    static getSuggestedUsername() {
        return Ajax.getSuggestedUsername().then(result => {
            return result.result.result ? result.result.data : false;
        });
    }

    /**
     * Check whether a username is available and valid.
     * Result is true on success, object with message and optional inputField on error.
     * @param {string} username
     * @param {string|null} playerId
     * @returns {Promise<boolean|Object>} True on success, otherwise object with message and inputField properties.
     */
    static checkUsername(username, playerId) {
        return Ajax.checkUsername(username, playerId).then(result => {
            if (result.result.result) {
                return true;
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * Check whether a password pair is valid.
     * Result is true on success, object with message and optional inputField on error.
     * @param {string} password
     * @param {string} confirmPassword
     * @param {string} username
     * @returns {Promise<boolean|Object>} True on success, otherwise object with message and inputField properties.
     */
    static checkPasswords(password, confirmPassword, username) {
        return Ajax.checkPasswords(password, confirmPassword, username).then(result => {
            if (result.result.result) {
                return true;
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * Check whether an email is valid and optionally whether it is taken.
     * Result is true on success, object with message and optional inputField on error.
     * @param {string} email
     * @param {boolean} checkIfTaken
     * @returns {Promise<boolean|Object>} True on success, otherwise object with message and inputField properties.
     */
    static checkEmail(email, checkIfTaken) {
        return Ajax.checkEmail(email, checkIfTaken).then(result => {
            if (result.result.result) {
                return true;
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * Authenticate player.
     * @param {string} usernameOrEmail The username or email.
     * @param {string} password The password.
     * @param {Cache} playerDetailsCache The cache to use.
     * @returns {Promise<string|Object>} If successfully authenticated user, return object with playerId, multiplayerToken and deletionRequestRemoved properties. Otherwise, return error message.
     */
    static authenticate(usernameOrEmail, password, playerDetailsCache) {
        return Ajax.authenticate(usernameOrEmail, password).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data.playerDetails);

                // Overwrite any cached player details.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                return { playerId: playerDetails.getPlayerId(), multiplayerToken: result.result.data.multiplayerToken, deletionRequestRemoved: result.result.data.deletionRequestRemoved };
            }

            return result.result.message;
        });
    }

    /**
     * Deauthenticate player.
     * @param {string} playerId The player id.
     * @param {Cache} emailCache The email cache to clear on success.
     * @param {Cache} currencyCache The currency cache to clear on success.
     * @returns {Promise<string|Object>} If successfully deauthenticated user, return object with playerId. Otherwise, return error message.
     */
    static deauthenticate(playerId, emailCache, currencyCache) {
        return Ajax.deauthenticate(playerId).then(result => {
            if (result.result.result) {
                // Clear sensitive caches.
                emailCache.invalidate(playerId);
                currencyCache.invalidate(playerId);

                return { playerId: result.result.data };
            }

            return result.result.message;
        });
    }

    /**
     * Delete guest player.
     * @param {string} playerId The player id.
     * @param {Cache} currencyCache The currency cache to clear on success.
     * @returns {Promise<string|Object>} If successfully deleted guest, return object with playerId. Otherwise, return error message.
     */
    static deleteGuest(playerId, currencyCache) {
        return Ajax.deleteGuest(playerId).then(result => {
            if (result.result.result) {
                // Clear sensitive cache.
                currencyCache.invalidate(playerId);

                return { playerId: result.result.data };
            }

            return result.result.message;
        });
    }

    /**
     * Delete a user account.
     * Result is true on success, string on error.
     * @param {string} playerId
     * @param {string} password
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static deleteUser(playerId, password) {
        return Ajax.deleteUser(playerId, password).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    static deleteUserAsAdmin(adminId, playerId, playerDetailsCache, playerDetailsByUsernameCache, emailCache) {
        return Ajax.deleteUserAsAdmin(adminId, playerId).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Invalidate the player details for this user.
                playerDetailsCache.invalidate(playerDetails.getPlayerId());

                // Invalidate the player details by username for this user.
                playerDetailsByUsernameCache.invalidate(playerDetails.getUsername());

                // Invalidate the email for this user.
                emailCache.invalidate(playerDetails.getPlayerId());

                return true;
            }

            return result.result.message;
        });
    }

    static cancelUserDeletion(adminId, playerId) {
        return Ajax.cancelUserDeletion(adminId, playerId).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    /**
     * Update player details on server.
     * @param {string} playerId The player id of the player.
     * @param {string} username The updated username to assign to the player.
     * @param {string} newPassword The updated password. Can be empty.
     * @param {string} confirmNewPassword The updated password again. Can be empty.
     * @param {string} email The updated email of the player,
     * @param {string} currentPassword The current password of the player.
     * @param {Cache} playerDetailsCache The cache to use.
     * @param {Cache} emailCache The cache to use.
     * @param {Cache} currencyCache The cache to use.
     * @returns {Promise<string|Object>} If successfully updated player details, return "OK". Otherwise return object with message and inputField properties.
     */
    static updatePlayerDetails(playerId, username, newPassword, confirmNewPassword, email, currentPassword, playerDetailsCache, emailCache, currencyCache) {
        return Ajax.updatePlayerDetails(playerId, username, newPassword, confirmNewPassword, email, currentPassword).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                // Invalidate the email for this user.
                emailCache.invalidate(playerDetails.getPlayerId());

                // Invalidate the currency for this user.
                currencyCache.invalidate(playerDetails.getPlayerId());

                return "OK";
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * Set username of player with rejected username.
     * @param {string} playerId The player id of the player.
     * @param {string} username The new username to assign to the player.
     * @param {Cache} playerDetailsCache The cache to use.
     * @returns {Promise<string|Object>} If successfully updated username, return "OK". Otherwise return object with message and inputField properties.
     */
    static setUsername(playerId, username, playerDetailsCache) {
        return Ajax.setUsername(playerId, username).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                return "OK";
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * @param {string} playerId
     * @param {string} email
     * @param {Cache} emailCache
     * @returns {Promise<string|Object>} If successfully updated email, return "OK". Otherwise return object with message and inputField properties.
     */
    static setEmail(playerId, email, emailCache) {
        return Ajax.setEmail(playerId, email).then(result => {
            if (result.result.result) {
                // Update email cache as appropriate.
                const updatedEmail = result.result.data;
                emailCache.set(playerId, updatedEmail);

                return "OK";
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * Result is bool on success, string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @param {string|null} email
     * @param {Cache} emailCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static setEmailAsAdmin(adminId, playerId, email, emailCache) {
        return Ajax.setEmailAsAdmin(adminId, playerId, email).then(result => {
            if (result.result.result) {
                // Update email cache as appropriate.
                const updatedEmail = result.result.data;
                emailCache.set(playerId, updatedEmail);

                return true;
            }

            return result.result.message;
        });
    }

    static verifyAccount(playerId, token, playerDetailsCache) {
        return Ajax.verifyAccount(playerId, token).then(result => {
            if (result.result.result) {
                // Invalidate the player details for this user.
                playerDetailsCache.invalidate(playerId);
            }

            return { headline: result.result.data.headline, message: result.result.data.message };
        });
    }

    /**
     * Recover account by setting new password.
     * @param {string} playerId The player id of the account.
     * @param {string} token The token of the recovery request.
     * @param {string} newPassword The new password.
     * @param {string} confirmNewPassword The new password again.
     * @returns {Promise<Object>} If successfully set new password, return object with headine and message properties. Otherwise return object with message and inputField properties.
     */
    static recoverAccount(playerId, token, newPassword, confirmNewPassword) {
        return Ajax.recoverAccount(playerId, token, newPassword, confirmNewPassword).then(result => {
            if (result.result.result) {
                return { headline: result.result.data.headline, message: result.result.data.message };
            }

            return Backend._messageAndInputField(result);
        });
    }

    /**
     * Request an account recovery email.
     * Result is true on success, string on error.
     * @param {string} usernameOrEmail
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static requestUserRecovery(usernameOrEmail) {
        return Ajax.requestUserRecovery(usernameOrEmail).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    /**
     * Check whether a user recovery request is valid.
     * Result is a string with the username on success, object with headline and message on error.
     * @param {string} playerId
     * @param {string} token
     * @returns {Promise<string|Object>} Username on success, otherwise object with headline and message properties.
     */
    static checkUserRecoveryRequest(playerId, token) {
        return Ajax.checkUserRecoveryRequest(playerId, token).then(result => {
            return result.result.result ? result.result.data : { headline: result.result.data.headline, message: result.result.data.message };
        });
    }

    static revertAccountChangeWithToken(playerId, token, playerDetailsCache, emailCache, currencyCache) {
        return Ajax.revertAccountChangeWithToken(playerId, token).then(result => {
            if (result.result.result) {
                // Invalidate the player details for this user.
                playerDetailsCache.invalidate(playerId);

                // Invalidate the email for this user.
                emailCache.invalidate(playerId);

                // Invalidate the currency for this user.
                currencyCache.invalidate(playerId);
            }

            return { headline: result.result.data.headline, message: result.result.data.message };
        });
    }

    static unsubscribeNewsletter(playerId, playerDetailsCache) {
        return Ajax.unsubscribeNewsletter(playerId).then(result => {
            if (result.result.result) {
                // Invalidate the player details for this user.
                playerDetailsCache.invalidate(playerId);
            }

            return { headline: result.result.data.headline, message: result.result.data.message };
        });
    }

    /**
     * Get unapproved player names and correspondin player ids.
     * Result is an object containing player names and player ids on success, string on error.
     * @param {number} limit
     * @returns {Promise<Object|string>} Object with player names and player ids on success, the error message on error.
     */
    static getUnapprovedPlayerNames(limit) {
        return Ajax.getUnapprovedPlayerNames(limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is an int on success, string on error.
     * @param {string} adminId
     * @returns {Promise<number|string>} Count on success, the error message on error.
     */
    static getUnapprovedPlayerNamesCount(adminId) {
        return Ajax.getUnapprovedPlayerNamesCount(adminId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Set player name approval of the provided player ids.
     * Result is a bool on success, string on error.
     * @param {string} adminId
     * @param {string[]} playerIds
     * @param {string[]} playerNames
     * @param {boolean|null} approved
     * @param {Object} playerDetailsCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static setPlayerNamesApproved(adminId, playerIds, playerNames, approved, playerDetailsCache) {
        return Ajax.setPlayerNamesApproved(adminId, playerIds, playerNames, approved).then(result => {
            if (result.result.result) {
                for (let i = 0; i < result.result.data.length; i++) {
                    const playerDetails = PlayerDetails.withObject(result.result.data[i]);

                    // Overwrite the player details for this user.
                    playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);
                }

                return true;
            }

            return result.result.message;
        });
    }

    /**
     * Set player banned of the provided player id.
     * Result is a bool on success, string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @param {boolean} moderation
     * @param {Object} playerDetailsCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static setPlayerBanned(adminId, playerId, moderation, playerDetailsCache) {
        return Ajax.setPlayerBanned(adminId, playerId, moderation).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                return true;
            }

            return result.result.message;
        });
    }

    /**
     * Reset password of given player's account.
     * Result is a bool on success, string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static resetAccountPassword(adminId, playerId) {
        return Ajax.resetAccountPassword(adminId, playerId).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    /**
     * Revert changes of provided account change id.
     * Result is bool on success, string on error.
     * @param {string} adminId
     * @param {number} accountChangeId
     * @param {Object} playerDetailsCache
     * @param {Object} emailCache
     * @param {Object} currencyCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static revertAccountChange(adminId, accountChangeId, playerDetailsCache, emailCache, currencyCache) {
        return Ajax.revertAccountChange(adminId, accountChangeId).then(result => {
            if (result.result.result) {
                const playerDetails = PlayerDetails.withObject(result.result.data);

                // Overwrite the player details for this user.
                playerDetailsCache.set(playerDetails.getPlayerId(), playerDetails);

                // Invalidate the email for this user.
                emailCache.invalidate(playerDetails.getPlayerId());

                // Invalidate the currency for this user.
                currencyCache.invalidate(playerDetails.getPlayerId());

                return true;
            }

            return result.result.message;
        });
    }

    /**
     * Resend verification email to player.
     * Result is a bool on success, string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static resendVerificationEmailAsAdmin(adminId, playerId) {
        return Ajax.resendVerificationEmailAsAdmin(adminId, playerId).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    /**
     * Resend the verification email.
     * Result is true on success, string on error.
     * @param {string} playerId
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static resendVerificationEmail(playerId) {
        return Ajax.resendVerificationEmail(playerId).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    static getPrimaryContent(tab, path) {
        return Ajax.getPrimaryContent(tab, path).then(result => {
            return result.result.data;
        });
    }

    static getFavourites(playerId, favouritesCache) {
        const cachedFavourites = favouritesCache.get(playerId);
        if (cachedFavourites) {
            return Promise.resolve(cachedFavourites);
        }

        return Ajax.getFavourites(playerId).then(result => {
            if (result.result.result) {
                // Update favouritesCache as appropriate
                const favourites = result.result.data;
                favouritesCache.set(playerId, favourites);

                return favourites;
            }

            return result.result.message;
        });
    }

    static setFavourited(favouriteId, value, playerIds, favouritesCache) {
        return Ajax.setFavourited(favouriteId, value).then(result => {
            if (result.result.result) {
                // Invalidate the favourites for all users.
                for (let i = 0; i < playerIds.length; ++i) {
                    favouritesCache.invalidate(playerIds[i]);
                }

                return true;
            }

            return result.result.message;
        });
    }

    static getScraps(includeVelocity) {
        return Ajax.getScraps(includeVelocity).then(result => {
            return result.result.data;
        });
    }

    static getStatistics() {
        return Ajax.getStatistics().then(result => {
            return result.result.data;
        });
    }

    static getGarageContent(playerId, garageContentCache) {
        const cachedGarageContent = garageContentCache.get(playerId);
        if (cachedGarageContent) {
            return Promise.resolve(cachedGarageContent);
        }

        return Ajax.getGarageContent(playerId).then(result => {
            // Update garageContentCache as appropriate
            const garageContent = result.result.data;
            garageContentCache.set(playerId, garageContent);

            return garageContent;
        });
    }

    static setAccessory(playerId, type, number, playerDetailsCache) {
        return Ajax.setAccessory(playerId, type, number).then(result => {
            // Invalidate playerDetailsCache
            playerDetailsCache.invalidate(playerId);

            return result.result.result;
        });
    }

    static setColour(playerId, place, colour, playerDetailsCache) {
        return Ajax.setColour(playerId, place, colour).then(result => {
            // Invalidate playerDetailsCache
            playerDetailsCache.invalidate(playerId);

            return result.result.result;
        });
    }

    /**
     * Get messages to and from the supplied player ids.
     * The messages are marked as seen.
     * @param {string[]} playerIds
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<Object|string>} Resolves to an object containing an array of messages, total message count, and offset. Returns message as string on error.
     */
    static getMessages(playerIds, offset, limit) {
        return Ajax.getMessages(playerIds, offset, limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Get messages to and from the supplied player ids.
     * Result is an object containing an array of messages, total message count, and the offset on success, string on error.
     * @param {string} adminId
     * @param {string[]} playerIds
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<Object|string>} Object with messages, count and offset on success, the error message on error.
     */
    static getMessagesAsAdmin(adminId, playerIds, offset, limit) {
        return Ajax.getMessagesAsAdmin(adminId, playerIds, offset, limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Get messages related to the senders of the oldest, unseen message sent to the admin id.
     * Result is an object containing an array of messages, total message count, and the oldest unseen message on success, string on error.
     * @param {string} adminId
     * @param {number} min Minimum number of messages to get.
     * @returns {Promise<Object|string>} Object with messages, count and offset on success, the error message on error.
     */
    static getMessagesAsAdminFromOldestUnseen(adminId, min) {
        return Ajax.getMessagesAsAdminFromOldestUnseen(adminId, min).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Get messages related to the player ids, starting from (and including) the oldest, unseen message sent to the admin id.
     * @param {string} adminId
     * @param {string[]} playerIds
     * @param {number} min Minimum number of messages to get.
     * @returns {Promise<Object|string>} Resolves to an object containing an array of messages, total message count, and the oldest unseen message. Returns message as string on error.
     */
    static getMessagesAsAdminPlayerLookup(adminId, playerIds, min) {
        return Ajax.getMessagesAsAdminPlayerLookup(adminId, playerIds, min).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Get the most often sent messages and the most recent sent messages.
     * Result is an object containing an array of popular messages data, popular messages count, an array of recent messages data, and recent messages count, string on error.
     * @param {string} adminId
     * @param {string[]} playerIds
     * @param {number} popularLimit Number of popular messages to get.
     * @param {number} recentLimit Number of recent messages to get.
     * @returns {Promise<Object|string>} Object with popular and recent message content on success, the error message on error.
     */
    static getPopularAndRecentMessageContent(adminId, playerIds, popularLimit, recentLimit) {
        return Ajax.getPopularAndRecentMessageContent(adminId, playerIds, popularLimit, recentLimit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is an int on success, string on error.
     * @param {string[]} recipientIds
     * @returns {Promise<number|string>} Count on success, the error message on error.
     */
    static getUnseenMessagesCount(recipientIds) {
        return Ajax.getUnseenMessagesCount(recipientIds).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Send message.
     * Result is a string on success, object on error.
     * @param {string[]} senderIds
     * @param {string[]} recipientIds
     * @param {string} body
     * @returns {Promise<string|Object>} Confirmation message on success, otherwise object with message and element properties.
     */
    static sendMessage(senderIds, recipientIds, body) {
        return Ajax.sendMessage(senderIds, recipientIds, body).then(result => {
            if (result.result.result) {
                return result.result.data;
            }

            const messageAndElement = {};
            // Set focus to relevant element based on response.result.data.
            if (result.result.data) {
                messageAndElement.element = result.result.data.element;
            }
            messageAndElement.message = result.result.message;

            return messageAndElement;
        });
    }

    /**
     * Send message by content id.
     * Result is a bool on success, string on error.
     * @param {string[]} senderIds
     * @param {string[]} recipientIds
     * @param {number} contentId
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static sendMessageByContentId(senderIds, recipientIds, contentId) {
        return Ajax.sendMessageByContentId(senderIds, recipientIds, contentId).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    /**
     * Edit message content.
     * Result is a bool on success, string on error.
     * @param {string} adminId
     * @param {number} id
     * @param {string} subject
     * @param {string} body
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static editMessageContent(adminId, id, subject, body) {
        return Ajax.editMessageContent(adminId, id, subject, body).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    /**
     * Mark message as seen.
     * Result is a bool on success, string on error.
     * @param {number[]} messageIds
     * @param {string[]} recipientIds
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static markMessagesAsSeen(messageIds, recipientIds) {
        return Ajax.markMessagesAsSeen(messageIds, recipientIds).then(result => {
            return result.result.result ? true : result.result.message;
        });
    }

    static getForumThreads(timeStamp, pinned, direction, offset, limit) {
        return Ajax.getForumThreads(timeStamp, pinned, direction, offset, limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getForumThreadsById(threadId, limit) {
        return Ajax.getForumThreadsById(threadId, limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getForumReplies(threadId, replyId, direction, offset, limit) {
        return Ajax.getForumReplies(threadId, replyId, direction, offset, limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static createForumThread(header, message, playerIds, playerDetailsCache) {
        return Ajax.createForumThread(header, message).then(result => {
            if (result.result.result) {
                // Invalidate the player details for all authenticated users.
                for (let i = 0; i < playerIds.length; ++i) {
                    playerDetailsCache.invalidate(playerIds[i]);
                }

                return result.result.data;
            }

            return result.result.message;
        });
    }

    static editForumThread(threadId, header, message) {
        return Ajax.editForumThread(threadId, header, message).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static createForumReply(threadId, message, playerIds, playerDetailsCache) {
        return Ajax.createForumReply(threadId, message).then(result => {
            if (result.result.result) {
                // Invalidate the player details for all authenticated users.
                for (let i = 0; i < playerIds.length; ++i) {
                    playerDetailsCache.invalidate(playerIds[i]);
                }

                return result.result.data;
            }

            return result.result.message;
        });
    }

    static editForumReply(threadId, replyId, message) {
        return Ajax.editForumReply(threadId, replyId, message).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumReplyApproved(threadId, replyId, value) {
        return Ajax.setForumReplyApproved(threadId, replyId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumReplyDeleted(threadId, replyId, value) {
        return Ajax.setForumReplyDeleted(threadId, replyId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumReplyBanned(threadId, replyId, value) {
        return Ajax.setForumReplyBanned(threadId, replyId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumReplyLiked(threadId, replyId, value) {
        return Ajax.setForumReplyLiked(threadId, replyId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumThreadApproved(threadId, value) {
        return Ajax.setForumThreadApproved(threadId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumThreadLocked(threadId, value) {
        return Ajax.setForumThreadLocked(threadId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumThreadPinned(threadId, value) {
        return Ajax.setForumThreadPinned(threadId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumThreadBanned(threadId, value) {
        return Ajax.setForumThreadBanned(threadId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumThreadDeleted(threadId, value) {
        return Ajax.setForumThreadDeleted(threadId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static setForumThreadLiked(threadId, value) {
        return Ajax.setForumThreadLiked(threadId, value).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is a chat message on success, string on error.
     * @param {number} adminId
     * @param {number} id
     * @returns {Promise<Object|string>} Chat message on success, the error message on error.
     */
    static getChatMessageById(adminId, id) {
        return Ajax.getChatMessageById(adminId, id).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is an object containg chat messages and count on success, string on error.
     * @param {string} adminId
     * @param {string[]} playerIds
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<Object|string>} Chat messages on success, the error message on error.
     */
    static getChatMessagesByPlayerIds(adminId, playerIds, offset, limit) {
        return Ajax.getChatMessagesByPlayerIds(adminId, playerIds, offset, limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is an object containg chat messages and count on success, string on error.
     * @param {string} adminId
     * @param {number} minTime
     * @param {number} maxTime
     * @param {string} serverName
     * @param {string} gameId
     * @returns {Promise<Object|string>} Chat messages on success, the error message on error.
     */
    static getChatMessagesByTime(adminId, minTime, maxTime, serverName, gameId) {
        return Ajax.getChatMessagesByTime(adminId, minTime, maxTime, serverName, gameId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is an object containing chat messages on success, string on error.
     * @param {string} adminId
     * @returns {Promise<Object|string>} Chat messages on success, the error message on error.
     */
    static getUnmoderatedChatMessages(adminId) {
        return Ajax.getUnmoderatedChatMessages(adminId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is an int on success, string on error.
     * @param {string} adminId
     * @returns {Promise<number|string>} Count on success, the error message on error.
     */
    static getUnmoderatedChatMessagesCount(adminId) {
        return Ajax.getUnmoderatedChatMessagesCount(adminId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is an object containg chat message, banned player ids and unbanned player ids on success, string on error.
     * @param {string} adminId
     * @param {number} chatMessageId
     * @param {boolean} approved
     * @param {Object} tempBanValidityCache
     * @returns {Promise<Object|string>} Updated chat message on success, the error message on error.
     */
    static setChatMessageApproved(adminId, chatMessageId, approved, tempBanValidityCache) {
        return Ajax.setChatMessageApproved(adminId, chatMessageId, approved).then(result => {
            if (result.result.result) {
                const { bannedPlayerIds } = result.result.data;
                if (Array.isArray(bannedPlayerIds)) {
                    // Clear existing cached temp ban validities.
                    for (let i = 0; i < bannedPlayerIds.length; ++i) {
                        tempBanValidityCache.invalidate(
                            bannedPlayerIds[i]
                        );
                    }
                }

                const { unbannedPlayerIds } = result.result.data;
                if (Array.isArray(unbannedPlayerIds)) {
                    // Clear existing cached temp ban validities.
                    for (let i = 0; i < unbannedPlayerIds.length; ++i) {
                        tempBanValidityCache.invalidate(
                            unbannedPlayerIds[i]
                        );
                    }
                }

                return result.result.data;
            }

            return result.result.message;
        });
    }

    static getNewsPosts() {
        return Ajax.getNewsPosts().then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getNewsPostById(id) {
        return Ajax.getNewsPostById(id).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getNewsPostPlaceholder() {
        return Ajax.getNewsPostPlaceholder().then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static createNewsPost(time, expiration, teaser, title, content, type, styles, script, teaserScript) {
        return Ajax.createNewsPost(time, expiration, teaser, title, content, type, styles, script, teaserScript).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static editNewsPost(id, time, expiration, teaser, title, content, type, styles, script, teaserScript) {
        return Ajax.editNewsPost(id, time, expiration, teaser, title, content, type, styles, script, teaserScript).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static deleteNewsPost(id) {
        return Ajax.deleteNewsPost(id).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getUploadedImages() {
        return Ajax.getUploadedImages().then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getUploadedImage(id) {
        return Ajax.getUploadedImage(id).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static deleteUploadedImage(id) {
        return Ajax.deleteUploadedImage(id).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getAchievements(playerId) {
        return Ajax.getAchievements(playerId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getUnlockedAchievement(playerId, achievementId) {
        return Ajax.getUnlockedAchievement(playerId, achievementId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getUnseenAchievements(playerId, unseenAchievementsCache) {
        const cachedUnseenAchievements = unseenAchievementsCache.get(playerId);
        if (cachedUnseenAchievements) {
            return Promise.resolve(cachedUnseenAchievements);
        }

        return Ajax.getUnseenAchievements(playerId).then(result => {
            if (result.result.result) {
                // Update unseenAchievementsCache as appropriate
                const unseenAchievements = result.result.data;
                unseenAchievementsCache.set(playerId, unseenAchievements);
                return unseenAchievements;
            }

            return result.result.message;
        });
    }

    static markAchievementAsSeen(playerId, achievementId, unseenAchievementsCache) {
        return Ajax.markAchievementAsSeen(playerId, achievementId).then(result => {
            if (result.result.result) {
                // Invalidate the unseen achievements for player.
                unseenAchievementsCache.invalidate(playerId);

                return result.result.result;
            }

            return result.result.message;
        });
    }

    static getVirtualShopItems(playerId, virtualShopCache) {
        const cachedVirtualShopItems = virtualShopCache.get(playerId);
        if (cachedVirtualShopItems) {
            return Promise.resolve(cachedVirtualShopItems);
        }

        return Ajax.getVirtualShopItems(playerId).then(result => {
            if (result.result.result) {
                // Update virtualShopCache as appropriate
                const virtualShopItems = result.result.data;
                virtualShopCache.set(playerId, virtualShopItems);

                return virtualShopItems;
            }

            return result.result.message;
        });
    }

    static getVirtualShopItemsAsAdmin(adminId, playerId) {
        return Ajax.getVirtualShopItemsAsAdmin(adminId, playerId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getVirtualShopItemDetails(playerId, itemId) {
        return Ajax.getVirtualShopItemDetails(playerId, itemId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getVirtualShopItemDetailsAsAdmin(adminId, itemId) {
        return Ajax.getVirtualShopItemDetailsAsAdmin(adminId, itemId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static editVirtualShopItem(adminId, id, name, quantity, description, priceGold, priceDiamonds, availability, visibility, durationStart, durationEnd, virtualShopCache) {
        return Ajax.editVirtualShopItem(adminId, id, name, quantity, description, priceGold, priceDiamonds, availability, visibility, durationStart, durationEnd).then(result => {
            if (result.result.result) {
                // Invalidate entire virtual shop cache.
                virtualShopCache.invalidateAll();

                return result.result.data;
            }

            return result.result.message;
        });
    }

    static purchaseVirtualShopItem(playerId, itemId, currencyCache, virtualShopCache, garageContentCache) {
        return Ajax.purchaseVirtualShopItem(playerId, itemId).then(result => {
            if (result.result.result) {
                // Invalidate the currency for player.
                currencyCache.invalidate(playerId);

                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                // Invalidate the garage content for player.
                garageContentCache.invalidate(playerId);

                return result.result.result;
            }

            return result.result.message;
        });
    }

    static purchaseVirtualShopItemAsAdmin(adminId, playerId, itemId, virtualShopCache, garageContentCache) {
        return Ajax.purchaseVirtualShopItemAsAdmin(adminId, playerId, itemId).then(result => {
            if (result.result.result) {
                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                // Invalidate the garage content for player.
                garageContentCache.invalidate(playerId);

                return true;
            }

            return result.result.message;
        });
    }

    /**
     * Result is bool on success, string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @param {number} purchaseId
     * @param {Object} currencyCache
     * @param {Object} virtualShopCache
     * @param {Object} garageContentCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static refundVirtualPurchase(adminId, playerId, purchaseId, currencyCache, virtualShopCache, garageContentCache) {
        return Ajax.refundVirtualPurchase(adminId, purchaseId).then(result => {
            if (result.result.result) {
                // Invalidate the currency for player.
                currencyCache.invalidate(playerId);

                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                // Invalidate the garage content for player.
                garageContentCache.invalidate(playerId);

                return true;
            }

            return result.result.message;
        });
    }

    static getShopItems() {
        return Ajax.getShopItems().then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getShopItemsAsAdmin(adminId, playerId) {
        return Ajax.getShopItemsAsAdmin(adminId, playerId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getShopItemDetails(itemId) {
        return Ajax.getShopItemDetails(itemId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getShopItemDetailsAsAdmin(adminId, itemId) {
        return Ajax.getShopItemDetailsAsAdmin(adminId, itemId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getShopItemPurchaseDetails(playerId, itemId, itemOption) {
        return Ajax.getShopItemPurchaseDetails(playerId, itemId, itemOption).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static purchaseShopItem(playerId, itemId, itemOption, name, paymentId, playerDetailsCache, currencyCache, virtualShopCache, garageContentCache) {
        return Ajax.purchaseShopItem(playerId, itemId, itemOption, name, paymentId).then(result => {
            if (result.result.result) {
                if (result.result.data.clientSecret) {
                    return result.result.data.clientSecret;
                }

                // Invalidate the player details for player.
                playerDetailsCache.invalidate(playerId);

                // Invalidate the currency for player.
                currencyCache.invalidate(playerId);

                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                // Invalidate the garage content for player.
                garageContentCache.invalidate(playerId);

                return result.result.result;
            }

            return Backend._messageAndInputField(result);
        });
    }

    static purchaseShopItemAsAdmin(adminId, playerId, itemId, itemOption, playerDetailsCache, currencyCache, virtualShopCache, garageContentCache) {
        return Ajax.purchaseShopItemAsAdmin(adminId, playerId, itemId, itemOption).then(result => {
            if (result.result.result) {
                // Invalidate the player details for player.
                playerDetailsCache.invalidate(playerId);

                // Invalidate the currency for player.
                currencyCache.invalidate(playerId);

                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                // Invalidate the garage content for player.
                garageContentCache.invalidate(playerId);

                return result.result.result;
            }

            return result.result.message;
        });
    }

    /**
     * Result is bool on success, string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @param {number} purchaseId
     * @param {Object} playerDetailsCache
     * @param {Object} currencyCache
     * @param {Object} virtualShopCache
     * @param {Object} garageContentCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static refundPurchase(adminId, playerId, purchaseId, playerDetailsCache, currencyCache, virtualShopCache, garageContentCache) {
        return Ajax.refundPurchase(adminId, purchaseId).then(result => {
            if (result.result.result) {
                // Invalidate the player details for player.
                playerDetailsCache.invalidate(playerId);

                // Invalidate the currency for player.
                currencyCache.invalidate(playerId);

                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                // Invalidate the garage content for player.
                garageContentCache.invalidate(playerId);

                return true;
            }

            return result.result.message;
        });
    }

    static getGoldShopItems() {
        return Ajax.getGoldShopItems().then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getGoldShopItemsAsAdmin(adminId, playerId) {
        return Ajax.getGoldShopItemsAsAdmin(adminId, playerId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static getGoldShopItemAsAdmin(adminId, playerId, itemId) {
        return Ajax.getGoldShopItemAsAdmin(adminId, playerId, itemId).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static purchaseGoldShopItem(playerId, itemId, currencyCache, virtualShopCache) {
        return Ajax.purchaseGoldShopItem(playerId, itemId).then(result => {
            if (result.result.result) {
                // Invalidate the currency for player.
                currencyCache.invalidate(playerId);

                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                return result.result.result;
            }

            return result.result.message;
        });
    }

    static purchaseGoldShopItemAsAdmin(adminId, playerId, itemId, currencyCache, virtualShopCache) {
        return Ajax.purchaseGoldShopItemAsAdmin(adminId, playerId, itemId).then(result => {
            if (result.result.result) {
                // Invalidate the currency for player.
                currencyCache.invalidate(playerId);

                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                return result.result.result;
            }

            return result.result.message;
        });
    }

    /**
     * Result is bool on success, string on error.
     * @param {string} adminId
     * @param {string} playerId
     * @param {number} purchaseId
     * @param {Object} currencyCache
     * @param {Object} virtualShopCache
     * @returns {Promise<boolean|string>} True on success, the error message on error.
     */
    static refundGoldPurchase(adminId, playerId, purchaseId, currencyCache, virtualShopCache) {
        return Ajax.refundGoldPurchase(adminId, purchaseId).then(result => {
            if (result.result.result) {
                // Invalidate the currency for player.
                currencyCache.invalidate(playerId);

                // Invalidate the virtual shop for player.
                virtualShopCache.invalidate(playerId);

                return true;
            }

            return result.result.message;
        });
    }

    static getShopStockUpOptions(playerId, missingGold, missingDiamonds) {
        return Ajax.getShopStockUpOptions(playerId, missingGold, missingDiamonds).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Result is an object containing Adminlog[] on success, a string on error.
     * @param {string} adminId
     * @param {string[]|null} adminIds
     * @param {string[]|null} actions
     * @param {string[]|null} targetIds
     * @param {number|null} afterTime
     * @param {number} offset
     * @param {number} limit
     * @returns {Promise<Object|string>} Object with admin logs on success, the error message on error.
     */
    static getAdminLogs(adminId, adminIds, actions, targetIds, afterTime, offset, limit) {
        return Ajax.getAdminLogs(adminId, adminIds, actions, targetIds, afterTime, offset, limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Resut is an object containing various statistics on success, string on error.
     * @param {string} adminId
     * @param {number|null} minTime Unix time in seconds.
     * @param {number|null} maxTime Unix time in seconds.
     * @returns {Promise<Object|string>} Object with admin statistics on success, the error message on error.
     */
    static getAdminStatistics(adminId, minTime, maxTime) {
        return Ajax.getAdminStatistics(adminId, minTime, maxTime).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    /**
     * Get admin roles assumed by the given player ids.
     * Only currently logged in players' admin roles can be retrieved.
     * @param {string[]} playerIds The player ids to retrieve admin roles for.
     * @returns {Promise<Object[]|boolean>} If successful, resolves to array of admin roles objects. Otherwise return false.
     */
    static getAdminRoles(playerIds) {
        return Ajax.getAdminRoles(playerIds).then(result => {
            return result.result.result ? result.result.data : false;
        });
    }

    static searchServerLogEntries(adminId, query, offset, limit) {
        return Ajax.searchServerLogEntries(adminId, query, offset, limit).then(result => {
            return result.result.result ? result.result.data : result.result.message;
        });
    }

    static addAchievementUnlockListener(callback, context) {
        Ajax.addAchievementUnlockListener(callback, context);
    }
}
