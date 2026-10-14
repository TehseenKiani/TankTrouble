import { Caches } from "./caches.js";

export class Ajax {
    static achievementUnlockListeners = [];

    static addAchievementUnlockListener(callback, context) {
        Ajax.achievementUnlockListeners.push({ callback, context });
    }

    static _notifyAchievementUnlockListeners(playerId, achievementId) {
        for (const listener of Ajax.achievementUnlockListeners) {
            listener.callback(listener.context, playerId, achievementId);
        }
    }

    static request(namespace, method, params) {
        return fetch("/ajax/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", method: `${namespace}.${method}`, id: 1, params })
        })
            .then(response => response.text().then(text => ({ response, text })))
            .then(
                ({ response, text }) => {
                    let result = null;
                    try {
                        result = JSON.parse(text);
                    } catch {
                        result = null;
                    }

                    if (result !== null && result.jsonrpc === "2.0" && result.error) {
                        return Promise.reject(result.error.message);
                    }
                    if (!response.ok || result === null || result.jsonrpc !== "2.0") {
                        return Promise.reject("Internal server error");
                    }

                    return result;
                },
                () => Promise.reject("Network error")
            );
    }

    static _promiseCall(method, params) {
        return this.request("tanktrouble", method, params).then(result => {
            // Check for unlocked achievements and unwrap the wrapped data field.
            Ajax._unwrapAchievementUnlocksFromData(result);

            return result;
        });
    }

    static _unwrapAchievementUnlocksFromData(result) {
        if (result.result.data) {
            if (result.result.data.achievementUnlocks !== undefined) {
                result.result.data.achievementUnlocks.forEach(element => {
                    // Invalidate unseen achievements cache.
                    Caches.getUnseenAchievementsCache().invalidate(element.playerId);
                    // Invalidate garage content cache.
                    Caches.getGarageContentCache().invalidate(element.playerId);
                    // Invalidate currency cache.
                    Caches.getCurrencyCache().invalidate(element.playerId);
                    // Invalidate virtual shop cache.
                    Caches.getVirtualShopCache().invalidate(element.playerId);
                    // Notify listeners of unlocked achievements.
                    Ajax._notifyAchievementUnlockListeners(element.playerId, element.achievementId);
                });

                // Unwrap data.
                result.result.data = result.result.data.data;
            }
        }
    }

    static authenticate(usernameOrEmail, password) {
        return this._promiseCall("account.authenticate", [usernameOrEmail, password]);
    }

    static deauthenticate(playerId) {
        return this._promiseCall("account.deauthenticate", [playerId]);
    }

    static getAdmissionToken() {
        return this._promiseCall("account.getAdmissionToken");
    }

    static signUp(username, password, confirmPassword, email, termsAccepted) {
        return this._promiseCall("account.signUp", [username, password, confirmPassword, email, termsAccepted]);
    }

    static createGuests(guestCount) {
        return this._promiseCall("account.createGuests", [guestCount]);
    }

    static signUpGuest(guestPlayerId, username, password, confirmPassword, email, termsAccepted) {
        return this._promiseCall("account.signUpGuest", [guestPlayerId, username, password, confirmPassword, email, termsAccepted]);
    }

    static checkUsername(username, playerId) {
        return this._promiseCall("account.checkUsername", [username, playerId]);
    }

    static checkPasswords(password, confirmPassword, username) {
        return this._promiseCall("account.checkPasswords", [password, confirmPassword, username]);
    }

    static checkEmail(email, checkIfTaken) {
        return this._promiseCall("account.checkEmail", [email, checkIfTaken]);
    }

    static deleteUser(playerId, password) {
        return this._promiseCall("account.deleteUser", [playerId, password]);
    }

    static deleteUserAsAdmin(adminId, playerId) {
        return this._promiseCall("account.deleteUserAsAdmin", [adminId, playerId]);
    }

    static cancelUserDeletion(adminId, playerId) {
        return this._promiseCall("account.cancelUserDeletion", [adminId, playerId]);
    }

    static deleteGuest(playerId) {
        return this._promiseCall("account.deleteGuest", [playerId]);
    }

    static requestUserRecovery(usernameOrEmail) {
        return this._promiseCall("account.requestUserRecovery", [usernameOrEmail]);
    }

    static updatePlayerDetails(playerId, username, newPassword, confirmNewPassword, email, currentPassword) {
        return this._promiseCall("account.updatePlayerDetails", [playerId, username, newPassword, confirmNewPassword, email, currentPassword]);
    }

    static setUsername(playerId, username) {
        return this._promiseCall("account.setUsername", [playerId, username]);
    }

    static setEmail(playerId, email) {
        return this._promiseCall("account.setEmail", [playerId, email]);
    }

    static setEmailAsAdmin(adminId, playerId, email) {
        return this._promiseCall("account.setEmailAsAdmin", [adminId, playerId, email]);
    }

    static resendVerificationEmail(playerId) {
        return this._promiseCall("account.resendVerificationEmail", [playerId]);
    }

    static verifyAccount(playerId, token) {
        return this._promiseCall("account.verifyAccount", [playerId, token]);
    }

    static checkUserRecoveryRequest(playerId, token) {
        return this._promiseCall("account.checkUserRecoveryRequest", [playerId, token]);
    }

    static recoverAccount(playerId, token, newPassword, confirmNewPassword) {
        return this._promiseCall("account.recoverAccount", [playerId, token, newPassword, confirmNewPassword]);
    }

    static revertAccountChangeWithToken(playerId, token) {
        return this._promiseCall("account.revertAccountChangeWithToken", [playerId, token]);
    }

    static unsubscribeNewsletter(playerId) {
        return this._promiseCall("account.unsubscribeNewsletter", [playerId]);
    }

    static getSuggestedUsername() {
        return this._promiseCall("account.getSuggestedUsername");
    }

    static getUnapprovedPlayerNames(limit) {
        return this._promiseCall("account.getUnapprovedPlayerNames", [limit]);
    }

    static getUnapprovedPlayerNamesCount(adminId) {
        return this._promiseCall("account.getUnapprovedPlayerNamesCount", [adminId]);
    }

    static getAIs() {
        return this._promiseCall("getAIs");
    }

    static getBackers() {
        return this._promiseCall("getBackers");
    }

    static getPlayerDetails(playerId) {
        return this._promiseCall("getPlayerDetails", [playerId]);
    }

    static getPlayerDetailsByUsername(username) {
        return this._promiseCall("getPlayerDetailsByUsername", [username]);
    }

    static getPlayerDetailsByEmail(adminId, email) {
        return this._promiseCall("getPlayerDetailsByEmail", [adminId, email]);
    }

    static getSensitivePlayerDetails(adminId, playerId) {
        return this._promiseCall("getSensitivePlayerDetails", [adminId, playerId]);
    }

    static getEmail(playerId) {
        return this._promiseCall("getEmail", [playerId]);
    }

    static getCurrency(playerId) {
        return this._promiseCall("getCurrency", [playerId]);
    }

    static getTutorialProgress(playerIds) {
        return this._promiseCall("getTutorialProgress", [playerIds]);
    }

    static updateTutorialProgress(playerId) {
        return this._promiseCall("updateTutorialProgress", [playerId]);
    }

    static setPlayerNamesApproved(adminId, playerIds, playerNames, approved) {
        return this._promiseCall("setPlayerNamesApproved", [adminId, playerIds, playerNames, approved]);
    }

    static setPlayerBanned(adminId, playerId, moderation) {
        return this._promiseCall("setPlayerBanned", [adminId, playerId, moderation]);
    }

    static resetAccountPassword(adminId, playerId) {
        return this._promiseCall("resetAccountPassword", [adminId, playerId]);
    }

    static revertAccountChange(adminId, accountChangeId) {
        return this._promiseCall("revertAccountChange", [adminId, accountChangeId]);
    }

    static resendVerificationEmailAsAdmin(adminId, playerId) {
        return this._promiseCall("resendVerificationEmailAsAdmin", [adminId, playerId]);
    }

    static recommendPlayerPromotion(adminId, playerId) {
        return this._promiseCall("recommendPlayerPromotion", [adminId, playerId]);
    }

    static setPlayerAdminLevel(adminId, playerId, adminLevel) {
        return this._promiseCall("setPlayerAdminLevel", [adminId, playerId, adminLevel]);
    }

    static retireAdmin(adminId, playerId) {
        return this._promiseCall("retireAdmin", [adminId, playerId]);
    }

    static acceptAdminGuidelines(adminId, accept) {
        return this._promiseCall("acceptAdminGuidelines", [adminId, accept]);
    }

    static getNewestTempBanValidities(playerIds) {
        return this._promiseCall("getNewestTempBanValidities", [playerIds]);
    }

    static getFavourites(playerId) {
        return this._promiseCall("getFavourites", [playerId]);
    }

    static setFavourited(favouriteId, value) {
        return this._promiseCall("setFavourited", [favouriteId, value]);
    }

    static getScraps(includeVelocity) {
        return this._promiseCall("getScraps", [includeVelocity]);
    }

    static getStatistics() {
        return this._promiseCall("getStatistics");
    }

    static getPrimaryContent(tab, path) {
        return this._promiseCall("getPrimaryContent", [tab, path]);
    }

    static setAccessory(playerId, type, number) {
        return this._promiseCall("garage.setAccessory", [playerId, type, number]);
    }

    static setColour(playerId, place, colour) {
        return this._promiseCall("garage.setColour", [playerId, place, colour]);
    }

    static getGarageContent(playerId) {
        return this._promiseCall("garage.getGarageContent", [playerId]);
    }

    static getMessages(playerIds, offset, limit) {
        return this._promiseCall("message.getMessages", [playerIds, offset, limit]);
    }

    static getMessagesAsAdmin(adminId, playerIds, offset, limit) {
        return this._promiseCall("message.getMessagesAsAdmin", [adminId, playerIds, offset, limit]);
    }

    static getMessagesAsAdminFromOldestUnseen(adminId, min) {
        return this._promiseCall("message.getMessagesAsAdminFromOldestUnseen", [adminId, min]);
    }

    static getMessagesAsAdminPlayerLookup(adminId, playerIds, min) {
        return this._promiseCall("message.getMessagesAsAdminPlayerLookup", [adminId, playerIds, min]);
    }

    static getPopularAndRecentMessageContent(adminId, playerIds, popularLimit, recentLimit) {
        return this._promiseCall("message.getPopularAndRecentMessageContent", [adminId, playerIds, popularLimit, recentLimit]);
    }

    static getUnseenMessagesCount(recipientIds) {
        return this._promiseCall("message.getUnseenMessagesCount", [recipientIds]);
    }

    static sendMessage(senderIds, recipientIds, body) {
        return this._promiseCall("message.sendMessage", [senderIds, recipientIds, body]);
    }

    static sendMessageByContentId(senderIds, recipientIds, contentId) {
        return this._promiseCall("message.sendMessageByContentId", [senderIds, recipientIds, contentId]);
    }

    static editMessageContent(adminId, id, subject, body) {
        return this._promiseCall("message.editMessageContent", [adminId, id, subject, body]);
    }

    static markMessagesAsSeen(messageIds, recipientIds) {
        return this._promiseCall("message.markMessagesAsSeen", [messageIds, recipientIds]);
    }

    static getForumThreads(timeStamp, pinned, direction, offset, limit) {
        return this._promiseCall("forum.getForumThreads", [timeStamp, pinned, direction, offset, limit]);
    }

    static getForumThreadsById(threadId, limit) {
        return this._promiseCall("forum.getForumThreadsById", [threadId, limit]);
    }

    static getForumReplies(threadId, replyId, direction, offset, limit) {
        return this._promiseCall("forum.getForumReplies", [threadId, replyId, direction, offset, limit]);
    }

    static createForumThread(header, message) {
        return this._promiseCall("forum.createForumThread", [header, message]);
    }

    static editForumThread(threadId, header, message) {
        return this._promiseCall("forum.editForumThread", [threadId, header, message]);
    }

    static createForumReply(threadId, message) {
        return this._promiseCall("forum.createForumReply", [threadId, message]);
    }

    static editForumReply(threadId, replyId, message) {
        return this._promiseCall("forum.editForumReply", [threadId, replyId, message]);
    }

    static setForumReplyApproved(threadId, replyId, value) {
        return this._promiseCall("forum.setForumReplyApproved", [threadId, replyId, value]);
    }

    static setForumReplyDeleted(threadId, replyId, value) {
        return this._promiseCall("forum.setForumReplyDeleted", [threadId, replyId, value]);
    }

    static setForumReplyBanned(threadId, replyId, value) {
        return this._promiseCall("forum.setForumReplyBanned", [threadId, replyId, value]);
    }

    static setForumReplyLiked(threadId, replyId, value) {
        return this._promiseCall("forum.setForumReplyLiked", [threadId, replyId, value]);
    }

    static setForumThreadApproved(threadId, value) {
        return this._promiseCall("forum.setForumThreadApproved", [threadId, value]);
    }

    static setForumThreadBanned(threadId, value) {
        return this._promiseCall("forum.setForumThreadBanned", [threadId, value]);
    }

    static setForumThreadDeleted(threadId, value) {
        return this._promiseCall("forum.setForumThreadDeleted", [threadId, value]);
    }

    static setForumThreadLocked(threadId, value) {
        return this._promiseCall("forum.setForumThreadLocked", [threadId, value]);
    }

    static setForumThreadPinned(threadId, value) {
        return this._promiseCall("forum.setForumThreadPinned", [threadId, value]);
    }

    static setForumThreadLiked(threadId, value) {
        return this._promiseCall("forum.setForumThreadLiked", [threadId, value]);
    }

    static getChatMessageById(adminId, id) {
        return this._promiseCall("chat.getChatMessageById", [adminId, id]);
    }

    static getChatMessagesByPlayerIds(adminId, playerIds, offset, limit) {
        return this._promiseCall("chat.getChatMessagesByPlayerIds", [adminId, playerIds, offset, limit]);
    }

    static getChatMessagesByTime(adminId, minTime, maxTime, serverName, gameId) {
        return this._promiseCall("chat.getChatMessagesByTime", [adminId, minTime, maxTime, serverName, gameId]);
    }

    static getUnmoderatedChatMessages(adminId) {
        return this._promiseCall("chat.getUnmoderatedChatMessages", [adminId]);
    }

    static getUnmoderatedChatMessagesCount(adminId) {
        return this._promiseCall("chat.getUnmoderatedChatMessagesCount", [adminId]);
    }

    static setChatMessageApproved(adminId, chatMessageId, approved) {
        return this._promiseCall("chat.setChatMessageApproved", [adminId, chatMessageId, approved]);
    }

    static getNewsPosts() {
        return this._promiseCall("news.getNewsPosts");
    }

    static getNewsPostById(id) {
        return this._promiseCall("news.getNewsPostById", [id]);
    }

    static getNewsPostPlaceholder() {
        return this._promiseCall("news.getNewsPostPlaceholder");
    }

    static createNewsPost(time, expiration, teaser, title, content, type, styles, script, teaserScript) {
        return this._promiseCall("news.createNewsPost", [time, expiration, teaser, title, content, type, styles, script, teaserScript]);
    }

    static editNewsPost(id, time, expiration, teaser, title, content, type, styles, script, teaserScript) {
        return this._promiseCall("news.editNewsPost", [id, time, expiration, teaser, title, content, type, styles, script, teaserScript]);
    }

    static deleteNewsPost(id) {
        return this._promiseCall("news.deleteNewsPost", [id]);
    }

    static getUploadedImages() {
        return this._promiseCall("news.getUploadedImages");
    }

    static getUploadedImage(id) {
        return this._promiseCall("news.getUploadedImage", [id]);
    }

    static deleteUploadedImage(id) {
        return this._promiseCall("news.deleteUploadedImage", [id]);
    }

    static getAchievements(playerId) {
        return this._promiseCall("achievement.getAchievements", [playerId]);
    }

    static getUnlockedAchievement(playerId, achievementId) {
        return this._promiseCall("achievement.getUnlockedAchievement", [playerId, achievementId]);
    }

    static getUnseenAchievements(playerId) {
        return this._promiseCall("achievement.getUnseenAchievements", [playerId]);
    }

    static markAchievementAsSeen(playerId, achievementId) {
        return this._promiseCall("achievement.markAchievementAsSeen", [playerId, achievementId]);
    }

    static getVirtualShopItems(playerId) {
        return this._promiseCall("shop.getVirtualShopItems", [playerId]);
    }

    static getVirtualShopItemsAsAdmin(adminId, playerId) {
        return this._promiseCall("shop.getVirtualShopItemsAsAdmin", [adminId, playerId]);
    }

    static getVirtualShopItemDetails(playerId, itemId) {
        return this._promiseCall("shop.getVirtualShopItemDetails", [playerId, itemId]);
    }

    static getVirtualShopItemDetailsAsAdmin(adminId, itemId) {
        return this._promiseCall("shop.getVirtualShopItemDetailsAsAdmin", [adminId, itemId]);
    }

    static editVirtualShopItem(adminId, id, name, quantity, description, priceGold, priceDiamonds, availability, visibility, durationStart, durationEnd) {
        return this._promiseCall("shop.editVirtualShopItem", [adminId, id, name, quantity, description, priceGold, priceDiamonds, availability, visibility, durationStart, durationEnd]);
    }

    static purchaseVirtualShopItem(playerId, itemId) {
        return this._promiseCall("shop.purchaseVirtualShopItem", [playerId, itemId]);
    }

    static purchaseVirtualShopItemAsAdmin(adminId, playerId, itemId) {
        return this._promiseCall("shop.purchaseVirtualShopItemAsAdmin", [adminId, playerId, itemId]);
    }

    static refundVirtualPurchase(adminId, purchaseId) {
        return this._promiseCall("shop.refundVirtualPurchase", [adminId, purchaseId]);
    }

    static getShopItems() {
        return this._promiseCall("shop.getShopItems");
    }

    static getShopItemsAsAdmin(adminId, playerId) {
        return this._promiseCall("shop.getShopItemsAsAdmin", [adminId, playerId]);
    }

    static refundPurchase(adminId, purchaseId) {
        return this._promiseCall("shop.refundPurchase", [adminId, purchaseId]);
    }

    static getShopItemDetails(itemId) {
        return this._promiseCall("shop.getShopItemDetails", [itemId]);
    }

    static getShopItemDetailsAsAdmin(adminId, itemId) {
        return this._promiseCall("shop.getShopItemDetailsAsAdmin", [adminId, itemId]);
    }

    static getShopItemPurchaseDetails(playerId, itemId, itemOption) {
        return this._promiseCall("shop.getShopItemPurchaseDetails", [playerId, itemId, itemOption]);
    }

    static purchaseShopItemAsAdmin(adminId, playerId, itemId, itemOption) {
        return this._promiseCall("shop.purchaseShopItemAsAdmin", [adminId, playerId, itemId, itemOption]);
    }

    static purchaseShopItem(playerId, itemId, itemOption, name, paymentId) {
        return this._promiseCall("shop.purchaseShopItem", [playerId, itemId, itemOption, name, paymentId]);
    }

    static getGoldShopItems() {
        return this._promiseCall("shop.getGoldShopItems");
    }

    static getGoldShopItemsAsAdmin(adminId, playerId) {
        return this._promiseCall("shop.getGoldShopItemsAsAdmin", [adminId, playerId]);
    }

    static getGoldShopItemAsAdmin(adminId, playerId, itemId) {
        return this._promiseCall("shop.getGoldShopItemAsAdmin", [adminId, playerId, itemId]);
    }

    static purchaseGoldShopItem(playerId, itemId) {
        return this._promiseCall("shop.purchaseGoldShopItem", [playerId, itemId]);
    }

    static purchaseGoldShopItemAsAdmin(adminId, playerId, itemId) {
        return this._promiseCall("shop.purchaseGoldShopItemAsAdmin", [adminId, playerId, itemId]);
    }

    static refundGoldPurchase(adminId, purchaseId) {
        return this._promiseCall("shop.refundGoldPurchase", [adminId, purchaseId]);
    }

    static getShopStockUpOptions(playerId, missingGold, missingDiamonds) {
        return this._promiseCall("shop.getShopStockUpOptions", [playerId, missingGold, missingDiamonds]);
    }

    static getAdminLogs(adminId, adminIds, actions, targetIds, afterTime, offset, limit) {
        return this._promiseCall("admin.getAdminLogs", [adminId, adminIds, actions, targetIds, afterTime, offset, limit]);
    }

    static getAdminStatistics(adminId, minTime, maxTime) {
        return this._promiseCall("admin.getAdminStatistics", [adminId, minTime, maxTime]);
    }

    static getAdminRoles(playerIds) {
        return this._promiseCall("admin.getAdminRoles", [playerIds]);
    }

    static searchServerLogEntries(adminId, query, offset, limit) {
        return this._promiseCall("searchServerLogEntries", [adminId, query, offset, limit]);
    }
}
