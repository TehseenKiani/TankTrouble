import { ArrayUtils } from "../tt/arrayutils.js";
import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { AdminUtils } from "../adminutils.js";
import { Backend } from "../backend.js";
import { Commands } from "../commands.js";
import { OverlayManager } from "../overlaymanager.js";
import { UIConstants } from "../tt/ui/uiconstants.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.AdminMessagesOverlay = {

    init() {
        Commands.register("--admin-messages.open", (button, data) => { OverlayManager.replaceOverlay(TankTrouble.AdminMessagesOverlay, { adminId: button.attr("data-admin-id"), playerId: button.attr("data-player-id") }); });
        Commands.register("--admin-messages.send", (button, data) => { TankTrouble.AdminMessagesOverlay._sendMessageByContentId(data.contentId); });
        Commands.register("--admin-messages.enable-edit", (button, data) => { TankTrouble.AdminMessagesOverlay._enableEditContent(data.contentId); });
        Commands.register("--admin-messages.cancel-edit", (button, data) => { TankTrouble.AdminMessagesOverlay._cancelEditContent(data.contentId); });
        Commands.register("--admin-messages.confirm-edit", (button, data) => { TankTrouble.AdminMessagesOverlay._confirmEditContent(data.contentId); });
    },

    // jQuery objects.
    wrapper: null,
    navigation: null,
    header: null,
    messagesHeader: null,
    showOlderButton: null,
    messages: null,
    markAsSeenButton: null,
    markAllAsSeenButton: null,
    optionsHeader: null,
    popular: null,
    morePopularButton: null,
    recent: null,
    moreRecentButton: null,
    form: null,
    textarea: null,
    submitButton: null,

    // State.
    initialised: false,
    adminId: null,
    playerId: null,
    totalMessageShowing: null,
    unseenMessage: null,
    contextMessages: [],
    scrollToUnseen: null,
    popularLimit: null,
    recentLimit: null,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $("<div class='admin messages'/>");
        this.navigation = new AdminOverlayNavigation();
        this.header = $("<div class='header'/>");
        this.messagesHeader = $("<div class='subHeader'/>");
        this.showOlderButton = $("<button class='small' type='button' tabindex='-1'>Show older</button>");
        this.messages = $('<div class="section"/>');
        this.markAsSeenButton = $("<button class='warning small' type='button' tabindex='-1'>Mark as seen</button>");
        this.markAllAsSeenButton = $("<button class='warning small' type='button' tabindex='-1'>Mark all as seen</button>");
        this.optionsHeader = $("<div class='subHeader'/>");
        this.popular = $("<div class='popular'/>");
        this.morePopularButton = $("<button class='small' type='button' tabindex='-1'>Show more popular</button>");
        this.recent = $("<div class='recent'/>");
        this.moreRecentButton = $("<button class='small' type='button' tabindex='-1'>Show more recent</button>");
        this.form = $('<form class="section"/>');
        this.textarea = $("<textarea placeholder='Message'/>");
        this.submitButton = $("<button class='small' type='submit' tabindex='-1'>Send message</button>");

        Utils.addAutomaticTextAreaResize(this.textarea);

        this.wrapper.append(
            this.navigation.element,
            this.header,
            this.messagesHeader,
            $('<div class="section"/>').append(
                this.showOlderButton
            ),
            this.messages,
            $('<div class="section"/>').append(
                this.markAsSeenButton,
                this.markAllAsSeenButton
            ),
            this.optionsHeader,
            $('<div class="section"/>').append(
                this.popular,
                this.morePopularButton
            ),
            $('<div class="section"/>').append(
                this.recent,
                this.moreRecentButton
            ),
            this.form.append(
                this.textarea,
                "<br>",
                this.submitButton
            )
        );

        this.textarea.tooltipster({ side: "right", theme: "tooltipster-admin", triggerOpen: { mouseenter: false }, triggerClose: { mouseleave: false }, updateAnimation: null });

        this.showOlderButton.on("click", event => {
            this._getOlderMessages();
        });

        this.morePopularButton.on("click", event => {
            this.popularLimit += 100;
            this._showPopularAndRecent();
        });

        this.moreRecentButton.on("click", event => {
            this.recentLimit += 100;
            this._showPopularAndRecent();
        });

        this.textarea.blur(event => {
            Utils.updateTooltip(this.textarea, "");
        });

        this.form.submit(event => {
            this._sendMessage();
            return false;
        });

        this.markAsSeenButton.on("click", event => {
            this._markAsSeen();
        });

        this.markAllAsSeenButton.on("click", event => {
            this._markAllAsSeen();
        });

        this.initialised = true;
    },

    /**
     * Show overlay.
     * Expects string params.adminId
     * Optional string|null params.playerId = null
     * If set that player's messages will be loaded. Otherwise the oldest unseen message (and related messages) from any player will be loaded.
     * @param {Object} params
     */
    show(params) {
        this._initialise();

        this.adminId = params.adminId;
        this.playerId = params.playerId !== undefined ? params.playerId : null;

        this.navigation.update(this.adminId);

        this._getMessages();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }
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

    _getMessages() {
        this.header.empty();
        this.messagesHeader.empty();
        this.showOlderButton.hide();
        this.messages.empty();
        this.optionsHeader.empty();
        this.popular.hide();
        this.morePopularButton.hide();
        this.recent.hide();
        this.moreRecentButton.hide();
        this.form.hide();
        this.markAsSeenButton.hide();
        this.markAllAsSeenButton.hide();

        this.unseenMessage = null;
        this.contextMessages = [];
        this.totalMessageShowing = 0;
        this.scrollToUnseen = true;
        this.popularLimit = 10;
        this.recentLimit = 10;

        if (!this.playerId) {
            Backend.getMessagesAsAdminFromOldestUnseen(this.adminId, 10)
                .then(result => {
                    if (typeof result === "object") {
                        this.unseenMessage = result.unseenMessage;
                        this.contextMessages = result.messages;
                        this._showMessages(result.messages, result.totalMessages);
                        this._showOptions();
                    } else {
                        this._handleError(result);
                    }
                })
                .catch(message => {
                    this._handleError(message);
                });
        } else {
            Backend.getMessagesAsAdminPlayerLookup(this.adminId, [this.playerId], 10)
                .then(result => {
                    if (typeof result === "object") {
                        this.unseenMessage = result.unseenMessage;
                        this.contextMessages = result.messages;
                        this._showMessages(result.messages, result.totalMessages);
                        this._showOptions();
                    } else {
                        this._handleError(result);
                    }
                })
                .catch(message => {
                    this._handleError(message);
                });
        }
    },

    _getOlderMessages() {
        this.showOlderButton.prop("disabled", true);

        Backend.getMessagesAsAdmin(this.adminId, this.playerId ? [this.playerId] : (this.unseenMessage ? this.unseenMessage.senderIds : []), this.totalMessageShowing, 10)
            .then(result => {
                if (typeof result === "object") {
                    this._showMessages(result.messages, result.totalMessages);
                } else {
                    this._handleError(result);
                    this.showOlderButton.prop("disabled", false);
                }
            })
            .catch(message => {
                this._handleError(message);
                this.showOlderButton.prop("disabled", false);
            });
    },

    _showMessages(messages, totalMessages) {
        // Show messages if not already shown. This could happen if the user has sent another message since the last messages were loaded.
        for (let i = 0; i < messages.length; i++) {
            if (this.messages.find(`[data-id = ${messages[i].id}]`).length === 0) {
                // Style messages sent to the admin.
                const html = $(messages[i].html);
                if (messages[i].recipientIds.includes(this.adminId)) {
                    html.addClass("important");
                }

                this.messages.prepend(html);
                this.totalMessageShowing++;
            }
        }

        // Show older button.
        if (this.totalMessageShowing < totalMessages) {
            this.showOlderButton.prop("disabled", false).show();
        } else {
            this.showOlderButton.hide();
        }
    },

    _showOptions() {
        // Update message header.
        if (!this.playerId) {
            this.header.text("Messages");
            if (this.totalMessageShowing > 0) {
                if (this.unseenMessage.senderIds.length > 0) {
                    AdminUtils.createPlayerNamesWithLookupByPlayerIds(this.unseenMessage.senderIds, this.adminId).then(result => {
                        this.messagesHeader.append("New message from ", result);
                    });
                } else {
                    this.messagesHeader.html("New message from unknown sender");
                }
            } else {
                this.messagesHeader.html("No unseen messages");
            }
        } else {
            AdminUtils.createPlayerNamesWithLookupByPlayerIds([this.playerId], this.adminId).then(result => {
                this.header.append(result, "'s messages");
                if (this.totalMessageShowing === 0) {
                    this.messagesHeader.text("No messages");
                }
            });
        }

        if (Users.hasSpecificUserAdminRole(this.adminId, UIConstants.ADMIN_ROLE_WRITE_MESSAGES)) {
            // Show reply options.
            if ((this.unseenMessage && this.unseenMessage.senderIds.length > 0) || this.playerId) {
                AdminUtils.createPlayerNamesWithLookupByPlayerIds(this.unseenMessage ? this.unseenMessage.senderIds : [this.playerId], this.adminId).then(result => {
                    this.optionsHeader.append("Send message to ", result).show();
                });
                this._showPopularAndRecent();
                this.form.show();
            }

            if (this.unseenMessage) {
                // Highlight the unseen message.
                this.messages.find(`[data-id='${this.unseenMessage.id}']`).addClass("highlight");

                // Show mark as seen buttons.
                this.markAsSeenButton.show();
                this.markAllAsSeenButton.show();
            }
        }

        // Enable inputs.
        this.wrapper.find("button, input, textarea").prop("disabled", false);

        if (Users.hasSpecificUserAdminRole(this.adminId, UIConstants.ADMIN_ROLE_WRITE_MESSAGES)) {
            if (this.unseenMessage) {
                // Determine if mark all as seen should be disabled.
                // We disable it if there is only one unseen message or if any unseen, context message has a sender, which is not contained in the senders of the current unseen message.
                const { senderIds } = this.unseenMessage;
                let unseenCount = 0;
                let anyOtherSenders = false;
                for (let i = 0; i < this.contextMessages.length; i++) {
                    const unseen = !this.contextMessages[i].seenByIds.includes(this.adminId);
                    const otherSenders = !ArrayUtils.containsAll(senderIds, this.contextMessages[i].senderIds);
                    const sentToAdmin = this.contextMessages[i].recipientIds.includes(this.adminId);
                    if (unseen && sentToAdmin) {
                        unseenCount++;
                        anyOtherSenders |= otherSenders;
                    }
                }

                if (unseenCount === 1 || anyOtherSenders) {
                    this.markAllAsSeenButton.prop("disabled", true);
                }
            }
        }
    },

    // Get and replace all popular and recent messages up to the specified limits.
    // When changing the limits, a message could move from one list to the other, so we simply get and replace them all.
    _showPopularAndRecent() {
        // Disable all buttons, inputs and textareas in popular and recent messages.
        const disabled = this.popular.add(this.recent).find(":not(.navigation) button, :not(.navigation) input, textarea").add(this.morePopularButton).add(this.moreRecentButton);
        disabled.prop("disabled", true);

        Backend.getPopularAndRecentMessageContent(this.adminId, this.unseenMessage ? this.unseenMessage.senderIds : [this.playerId], this.popularLimit, this.recentLimit)
            .then(result => {
                if (typeof result === "object") {
                    // Show popular content.
                    if (result.popular.length === 0) {
                        this.popular.html('<div class="subHeader">No popular messages</div>');
                    } else {
                        this.popular.html('<div class="subHeader">Popular messages</div>');
                        for (let i = 0; i < result.popular.length; i++) {
                            const html = $(result.popular[i].html);
                            this.popular.append(html);
                        }
                    }
                    this.popular.show();
                    if (result.popular.length < result.popularCount) {
                        this.morePopularButton.prop("disabled", false).show();
                    } else {
                        this.morePopularButton.hide();
                    }

                    // Show recent content.
                    if (result.recent.length === 0) {
                        this.recent.html('<div class="subHeader">No recent messages</div>');
                    } else {
                        this.recent.html('<div class="subHeader">Recent messages</div>');
                        for (let i = 0; i < result.recent.length; i++) {
                            const html = $(result.recent[i].html);
                            this.recent.append(html);
                        }
                    }
                    this.recent.show();
                    if (result.recent.length < result.recentCount) {
                        this.moreRecentButton.prop("disabled", false).show();
                    } else {
                        this.moreRecentButton.hide();
                    }

                    // Scroll to the message just above the unseen message. The message just above provides useful context when answering messages.
                    // We scroll only if...
                    // - scroll hasn't been already been invoked. This prevents scroll when e.g. when loading more poular messages.
                    // - the user hasn't manually scrolled.
                    // - the unseen message is not one of the first two messages. Purely for looks.
                    if (this.unseenMessage && this.scrollToUnseen && this.wrapper.parent().scrollTop() === 0) {
                        const index = this.messages.find(".message").index(this.messages.find(`[data-id='${this.unseenMessage.id}']`));
                        if (index > 1) {
                            const scroll = this.messages.find(".message").eq(index - 1).offset().top;
                            this.wrapper.parent().scrollTop(scroll - 20);
                        }
                    }
                    this.scrollToUnseen = false;
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

    _sendMessage() {
        // Disable all buttons, inputs and textareas.
        const disabled = this.wrapper.find(":not(.navigation) button, :not(.navigation) input, textarea");
        disabled.prop("disabled", true);

        // Submit.
        Backend.sendMessage([this.adminId], this.unseenMessage ? this.unseenMessage.senderIds : [this.playerId], this.textarea.val().trim())
            .then(result => {
                if (typeof result === "string") {
                    this.textarea.val("").trigger("input.resize");
                    if (this.unseenMessage) {
                        this._markAsSeen();
                    } else {
                        this._getMessages();
                    }
                } else {
                    this._handleError(result.message);
                    disabled.prop("disabled", false);
                }
            })
            .catch(message => {
                this._handleError(message);
                disabled.prop("disabled", false);
            });
    },

    _sendMessageByContentId(id) {
        // Disable all buttons, inputs and textareas.
        const disabled = this.wrapper.find(":not(.navigation) button, :not(.navigation) input, textarea");
        disabled.prop("disabled", true);

        // Submit.
        Backend.sendMessageByContentId([this.adminId], this.unseenMessage ? this.unseenMessage.senderIds : [this.playerId], id)
            .then(result => {
                if (result === true) {
                    this.textarea.val("").trigger("input.resize");
                    if (this.unseenMessage) {
                        this._markAsSeen();
                    } else {
                        this._getMessages();
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

    _markAsSeen() {
        // Disable all buttons, inputs and textareas.
        const disabled = this.wrapper.find(":not(.navigation) button, :not(.navigation) input, textarea");
        disabled.prop("disabled", true);

        Backend.markMessagesAsSeen([this.unseenMessage.id], [this.adminId])
            .then(result => {
                if (result === true) {
                    TankTrouble.Messages.checkForUnseenMessages();
                    this.navigation.updateMessagesCounter(this.adminId);
                    this._getMessages();
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

    _markAllAsSeen() {
        // Disable all buttons, inputs and textareas.
        const disabled = this.wrapper.find(":not(.navigation) button, :not(.navigation) input, textarea");
        disabled.prop("disabled", true);

        const contextMessageIds = [];
        for (let i = 0; i < this.contextMessages.length; i++) {
            contextMessageIds.push(this.contextMessages[i].id);
        }

        Backend.markMessagesAsSeen(contextMessageIds, [this.adminId])
            .then(result => {
                if (result === true) {
                    TankTrouble.Messages.checkForUnseenMessages();
                    this.navigation.updateMessagesCounter(this.adminId);
                    this._getMessages();
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

    _enableEditContent(id) {
        const content = $(`.popular [data-id = ${id}], .recent [data-id = ${id}]`);
        Utils.addAutomaticTextAreaResize(content.find("textarea"));
        content.find(".subject, .send, .enable").hide();
        content.find("input").val(content.find(".subject").html()).show();
        content.find("textarea").val(content.find(".send").html()).show().trigger("input.resize");
        content.find(".attention, .cancel, .confirm").show();
    },

    _cancelEditContent(id) {
        const content = $(`.popular [data-id = ${id}], .recent [data-id = ${id}]`);
        content.find(".attention, input, textarea, .cancel, .confirm").hide();
        content.find(".subject, .send, .enable").show();
    },

    _confirmEditContent(id) {
        // Disable subject, content, save and cancel.
        const content = $(`.popular [data-id = ${id}], .recent [data-id = ${id}]`);
        const disabled = content.find("textarea, .cancel, .confirm").prop("disabled", true);
        disabled.prop("disabled", true);

        const subject = content.find("input").val();
        const body = content.find("textarea").val();

        Backend.editMessageContent(this.adminId, id, subject, body)
            .then(result => {
                if (result === true) {
                    this.messages.find(`.message[data-contentid = ${id}] .subject`).html(subject);
                    this.messages.find(`.message[data-contentid = ${id}] .body`).html(body);
                    content.find(".subject").html(subject);
                    content.find(".send").html(body);
                    content.find("textarea, .cancel, .confirm").prop("disabled", false);
                    this._cancelEditContent(id);
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
