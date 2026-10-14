import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { AdminUtils } from "../adminutils.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { ClientManager } from "../clientmanager.js";
import { Commands } from "../commands.js";
import { OverlayManager } from "../overlaymanager.js";

TankTrouble.AdminChatLogOverlay = {

    init() {
        Commands.register("--admin-chat-log.open", (button, data) => {
            OverlayManager.replaceOverlay(TankTrouble.AdminChatLogOverlay, { adminId: button.attr("data-admin-id"), playerIds: data.playerIds, chatMessageId: data.chatMessageId });
        });
        Commands.register("--admin-chat-log.expand", button => {
            const message = button.closest(".chatMessage").data();
            TankTrouble.AdminChatLogOverlay._getChatMessagesByTime(message.id, message.created, message.serverName, message.gameId);
        });
        Commands.register("--admin-chat-log.approve", button => {
            TankTrouble.AdminChatLogOverlay._setChatMessageApproved(button.closest(".chatMessage").data("id"), true);
        });
        Commands.register("--admin-chat-log.ban", button => {
            TankTrouble.AdminChatLogOverlay._setChatMessageApproved(button.closest(".chatMessage").data("id"), false);
        });
    },

    // jQuery objects.
    wrapper: null,
    navigation: null,
    topPaginator: null,
    headline: null,
    bottomPaginator: null,
    chatMessages: null,

    // State.
    initialised: false,
    adminId: null,
    playerIds: null,
    chatMessageId: null,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $("<div class='admin chatLog'/>");
        this.navigation = new AdminOverlayNavigation();
        this.header = $("<div class='header'/>");
        this.topPaginator = $("<div/>");
        this.chatMessages = $("<div class='section'/>");
        this.bottomPaginator = $("<div/>");

        this.wrapper.append(
            this.navigation.element,
            this.header,
            this.topPaginator,
            this.chatMessages,
            this.bottomPaginator
        );

        this.initialised = true;
    },

    /**
     * Show overlay.
     * Expects string params.adminId
     * Optional array|null params.playerIds = null
     * Optional int|null params.chatMessageId = null
     * If player ids are defined those players' chat messages are loaded.
     * If chat message is defined (and player ids is undefined) that specific chat message is loaded.
     * If player ids and chat message id are not defined unmoderated chatmessages are loaded.
    */
    show(params) {
        this._initialise();

        this.adminId = params.adminId;
        this.playerIds = params.playerIds ?? null;
        this.chatMessageId = params.chatMessageId ?? null;

        this.header.empty();
        this.topPaginator.empty();
        this.chatMessages.empty();
        this.bottomPaginator.empty();

        this.navigation.update(this.adminId);

        // If player ids are defined load those players' chat messages.
        if (this.playerIds) {
            AdminUtils.createPlayerNamesWithLookupByPlayerIds(this.playerIds, this.adminId).then(result => {
                this.header.append(result, "'s chat log");
            });
            this._getChatMessagesByPlayerIds(0, 50);

        // If chat message id is defined load that specific chat message.
        } else if (this.chatMessageId) {
            this.header.html(`Chat message id ${this.chatMessageId}`);
            this._getChatMessageById();

        // If player ids and chat message id is not defined load unmoderated chat messages.
        } else {
            this.header.html("Chat reports");
            this._getUnmoderatedChatMessages();
        }
    },

    hide() {
        this._initialise();
    },

    getContents() {
        this._initialise();

        return this.wrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return true;
    },

    _getChatMessagesByPlayerIds(offset, limit, page) {
        // Disable relevant paginator buttons and all chat message buttons.
        page = page !== undefined ? page : 0;
        const disabled = this.wrapper.find(`:not(.navigation):not(.paginator) button, .paginator button[data-page="${page}"]`);
        disabled.prop("disabled", true);

        Backend.getChatMessagesByPlayerIds(this.adminId, this.playerIds, offset, limit)
            .then(result => {
                if (typeof result === "object") {
                    this.chatMessages.empty();

                    if (result.chatMessages.length === 0) {
                        this.chatMessages.append('<div class="subHeader">No chat messages</div>');
                    }

                    for (let i = 0; i < result.chatMessages.length; i++) {
                        const chatMessage = this._createChatMessage(result.chatMessages[i], result.chatMessages[i].serverName, result.chatMessages[i].gameId);
                        this.chatMessages.append(chatMessage);
                    }

                    this._updateButtonsAndDividers();

                    if (result.count > limit) {
                        const topPaginator = AdminUtils.createPaginator(offset, limit, result.count, (newOffset, newLimit, newPage) => {
                            this._getChatMessagesByPlayerIds(newOffset, newLimit, newPage);
                        });
                        this.topPaginator.replaceWith(topPaginator);
                        this.topPaginator = topPaginator;

                        const bottomPaginator = topPaginator.clone(true);
                        this.bottomPaginator.replaceWith(bottomPaginator);
                        this.bottomPaginator = bottomPaginator;
                    }
                } else {
                    this._handleError(result);
                    disabled.prop("disabled", false);
                }
            })
            .catch(message => {
                this._handleError(message);
                disabled.prop("disabled", false);
            });
    },

    _getChatMessageById() {
        Backend.getChatMessageById(this.adminId, this.chatMessageId)
            .then(result => {
                if (typeof result === "object") {
                    const chatMessage = this._createChatMessage(result, result.serverName, result.gameId);
                    this.chatMessages.append(chatMessage);

                    this._updateButtonsAndDividers();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    _getUnmoderatedChatMessages() {
        Backend.getUnmoderatedChatMessages(this.adminId)
            .then(result => {
                if (typeof result === "object") {
                    if (result.length === 0) {
                        this.chatMessages.append('<div class="subHeader">No unmoderated chat reports</div>');
                    }

                    for (let i = 0; i < result.length; i++) {
                        const chatMessage = this._createChatMessage(result[i], result[i].serverName, result[i].gameId);
                        this.chatMessages.append(chatMessage);
                    }

                    this._updateButtonsAndDividers();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    _getChatMessagesByTime(id, created, serverName, gameId) {
        const clickedChatMessageId = `chatMessage-${serverName}${gameId ? `-${gameId}` : ""}-${id}`;
        const pointer = $("<div/>");
        const disabled = this.chatMessages.find(`#${clickedChatMessageId} > button`).prop("disabled", true);
        this.chatMessages.find(`#${clickedChatMessageId}`).after(pointer);

        Backend.getChatMessagesByTime(this.adminId, created - 60, created + 60, serverName, gameId)
            .then(result => {
                if (typeof result === "object") {
                    for (let i = 0; i < result.length; i++) {
                        // If we are already showing this chat message, we move it instead of creating a new chat message.
                        const chatMessageId = `chatMessage-${serverName}${gameId ? `-${gameId}` : ""}-${result[i].id}`;
                        let chatMessage = this.chatMessages.find(`#${chatMessageId}`);

                        if (chatMessage.length === 0) {
                            // We use the server name and game id from the clicked chat message. That way a global message can appear in multiple contexts.
                            chatMessage = this._createChatMessage(result[i], serverName, gameId);
                        }

                        // If this is the clicked chat message and the first or last in context mark this message as first or last.
                        if (chatMessageId === clickedChatMessageId) {
                            if (i === 0) {
                                chatMessage.data("first", true);
                            }
                            if (i === result.length - 1) {
                                chatMessage.data("last", true);
                            }
                        }

                        // Store that this message has been expanded, so that expanded messages from the same context may appear in the same context.
                        if (i > 0 || i < result.length - 1) {
                            chatMessage.data("expanded", true);
                        }

                        // Add the new, or move the existing, chat message.
                        pointer.before(chatMessage);
                    }

                    // Remove the pointer.
                    pointer.remove();

                    this._updateButtonsAndDividers();
                } else {
                    this._handleError(result);
                    disabled.prop("disabled", false);
                }
            })
            .catch(message => {
                this._handleError(message);
                disabled.prop("disabled", false);
            });
    },

    _createChatMessage(chatMessage, contextServerName, contextGameId) {
        const html = $(chatMessage.html);

        // Give the chat message a unique id.
        // Because a global chat message can appear more than once we use context in which the chat message is shown.
        html.attr("id", `chatMessage-${contextServerName}${contextGameId ? `-${contextGameId}` : ""}-${chatMessage.id}`);

        // Store context.
        html.data("id", chatMessage.id);
        html.data("created", chatMessage.created);
        html.data("serverName", contextServerName);
        html.data("gameId", contextGameId);

        return html;
    },

    _updateButtonsAndDividers() {
        this.chatMessages.children().each((index, element) => {
            const current = $(element);
            const previous = current.prev();

            // Check if context changes from previous to current.
            if (current.data("serverName") !== previous.data("serverName")
                || current.data("gameId") !== previous.data("gameId")
                || !current.data("expanded")
                || !previous.data("expanded")
                || current.data("first")
                || previous.data("last")) {
                // Show divider.
                current.addClass("first");

                // Hide expand button for current chat message if chat message is known to be first in context.
                if (current.data("first")) {
                    current.find("button.expand").hide();
                } else {
                    current.find("button.expand").show();
                }

                // Hide expand button for previous chat message if chat message is known to be last in context.
                if (previous.data("last")) {
                    previous.find("button.expand").hide();
                } else {
                    previous.find("button.expand").show();
                }
            } else {
                // Hide divider.
                current.removeClass("first");

                // Hide expand button.
                current.find("button.expand").hide();
            }
        });

        // The last chat message is never "previous".
        // Therefore, check if the last chat message is last in its context and show/hide the expand button accordingly.
        if (!this.chatMessages.children().last().data("last")) {
            this.chatMessages.children().last().find("button.expand").show();
        } else {
            this.chatMessages.children().last().find("button.expand").hide();
        }
    },

    _setChatMessageApproved(id, approved) {
        // Disable approve and ban button.
        // The moderated chat message might appear more than once, if shown in different contexts.
        const disabled = this.chatMessages.children().filter((index, element) => {
            return $(element).data("id") === id;
        }).find("button.approve:enabled, button.ban:enabled");
        disabled.prop("disabled", "true");

        Backend.setChatMessageApproved(this.adminId, id, approved, Caches.getTempBanValidityCache())
            .then(result => {
                if (typeof result === "object") {
                    // Find moderated chatmessage(s).
                    // The chat message might appear more than once, if shown in different contexts.
                    this.chatMessages.children().filter((index, element) => {
                        return $(element).data("id") === id;
                    }).each((index, element) => {
                        // Create new chat message.
                        const chatMessage = this._createChatMessage(result.chatMessage, $(element).data("serverName"), $(element).data("gameId"));

                        // Copy data from the chat message being replaced.
                        chatMessage.data($(element).data());

                        // Replace chat message with new, moderated version.
                        $(element).replaceWith(chatMessage);
                    });

                    // Broadcast bans/unbans to all mp servers.
                    if (Array.isArray(result.bannedPlayerIds)) {
                        ClientManager.broadcastPlayersBanned(this.adminId, result.bannedPlayerIds);
                    }
                    if (Array.isArray(result.unbannedPlayerIds)) {
                        ClientManager.broadcastPlayersUnbanned(this.adminId, result.unbannedPlayerIds);
                    }

                    this._updateButtonsAndDividers();

                    this.navigation.updateChatReportsCounter(this.adminId);
                } else {
                    this._handleError(result);
                    disabled.prop("disabled", false);
                }
            })
            .catch(message => {
                this._handleError(message);
                disabled.prop("disabled", false);
            });
    },

    _handleError(message) {
        alert(message);
    }
};
