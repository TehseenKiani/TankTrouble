import { ArrayUtils } from "./tt/arrayutils.js";
import { Constants } from "./tt/constants.js";
import { TTClient } from "./tt/ttclient.js";
import { TankTrouble } from "./tanktrouble.js";
import { Assets } from "./assets.js";
import { AudioManager } from "./audiomanager.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { ClientManager } from "./clientmanager.js";
import { FocusManager } from "./focusmanager.js";
import { GameSession } from "./gamesession.js";
import { Images } from "./images.js";
import { OverlayManager } from "./overlaymanager.js";
import { ResizeManager } from "./resizemanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { Users } from "./users.js";
import { Utils } from "./utils.js";

TankTrouble.ChatBox = {
    // jQuery objects.
    chat: null,
    chatContent: null,
    chatForm: null,
    chatBody: null,
    chatBodyResizeHandle: null,
    chatInput: null,
    chatStatus: null,
    chatStatusNew: null,

    // Other elements.
    chatSendAudio: null,
    chatNotificationAudio: null,

    // State.
    updateChatTimeout: null,
    resizeHandleTimeout: null,
    globalMessage: false,
    ignoredPlayerIds: [],
    ignoreeUsernames: [],
    addingToIgnoreList: false,
    recipientPlayerIds: [],
    recipientUsernames: [],
    lastPrivateSenderPlayerIds: null,
    nextZIndex: 1,
    messages: [],

    // Events.
    eventListeners: [],
    EVENTS: {
        CHAT_ACTIVITY: "chat activity",
        GLOBAL_CHAT: "global chat",
        CHAT: "chat",
        USER_CHAT: "user chat",
        REPORT_CHAT: "report chat",
        UNDO_CHAT_REPORT: "undo chat report"
    },

    init() {
        this.chat = $("<div id='chat'></div>");
        this.chatStatus = $(`<img class='status button' ${Images.attributes("chat/chatDisabled.png", "Chat")}/>`);
        this.chatStatusNew = $(`<img class='status button' ${Images.attributes("chat/newMessageMarker.png")}/>`);
        this.chatContent = $("<div class='content'></div>");
        this.chatForm = $("<form/>");
        this.chatInput = $("<textarea disabled rows='1' placeholder='Signal lost' maxlength='120'/>");

        this.chatForm.append(this.chatInput);

        this.chatBody = $("<div class='body'></div>");
        this.chatBodyResizeHandle = $(`<img class='ui-resizable-handle ui-resizable-se handle' ${Images.attributes("chat/resizeHandleBottomRight.png")}/>`);
        this.chatBodyResizeHandle.hide();

        this.chatBody.append(this.chatBodyResizeHandle);

        this.chatContent.append(this.chatForm);
        this.chatContent.append(this.chatBody);

        this.chat.append(this.chatStatus);
        this.chat.append(this.chatStatusNew);
        this.chat.append(this.chatContent);

        $("body").append(this.chat);

        this.chatInput.on("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();

                this.sendChat();
                return false;
            }
        });

        this.chatInput.focus(event => {
            this._notifyEventListeners(TankTrouble.ChatBox.EVENTS.CHAT_ACTIVITY);
            GameSession.disableGameInput();
        });

        this.chatInput.blur(event => {
            GameSession.enableGameInput();
        });

        this.chatInput.on("input", event => {
            this._notifyEventListeners(TankTrouble.ChatBox.EVENTS.CHAT_ACTIVITY);
            this._parseChat();

            $(event.currentTarget).outerHeight(16).outerHeight(event.currentTarget.scrollHeight);
        });

        this.chatStatus.click(event => {
            if ($(event.currentTarget).hasClass("noclick")) {
                $(event.currentTarget).removeClass("noclick");
            } else {
                this.toggle();
            }
        });

        this.chatStatusNew.click(event => {
            if ($(event.currentTarget).hasClass("noclick")) {
                $(event.currentTarget).removeClass("noclick");
            } else {
                this.toggle();
            }
        });

        this.chat.draggable({
            scroll: false,
            start: (event, ui) => {
                this.chatBody.addClass("dragging");
                this.chatStatus.addClass("noclick");
                this.chatStatusNew.addClass("noclick");
                this.chatBody.find("div>img").addClass("noclick");
                clearTimeout(this.resizeHandleTimeout);
                this.chatBodyResizeHandle.stop(true).show(200);
            },
            drag: (event, ui) => {
                ui.position.left = Math.max($("#content").offset().left + 34, Math.min(ui.position.left, $("#content").offset().left + $("#content").width() - 30 - this.chatBody.width()));
                ui.position.top = Math.max(20, Math.min(ui.position.top, $(window).height() - 40));
            },
            stop: (event, ui) => {
                setTimeout(() => {
                    this.chatStatus.removeClass("noclick");
                    this.chatStatusNew.removeClass("noclick");
                    this.chatBody.find("div>img").removeClass("noclick");
                }, 1);
                this.chatBody.removeClass("dragging");
                clearTimeout(this.resizeHandleTimeout);
                this.chatBodyResizeHandle.stop(true);
                this.resizeHandleTimeout = setTimeout(() => {
                    this.chatBodyResizeHandle.hide(200);
                }, 5000);
            }
        });

        this.chatBody.resizable({
            ghost: true,
            handles: { se: this.chatBodyResizeHandle },
            distance: 0,
            minWidth: 180,
            minHeight: 100,
            maxHeight: 500,
            start: (event, ui) => {
                ui.helper.find(".chatMessage").remove();
                ui.helper.css("border-radius", "3px");
                ui.helper.css("border", "2px dotted #aaaaaa");
                ui.helper.css("left", "-=2px");
                ui.helper.css("top", "-=2px");
                ui.originalElement.resizable("option", "maxWidth", $("#content").offset().left + $("#content").width() - 10 - ui.position.left);
                clearTimeout(this.resizeHandleTimeout);
                this.chatBodyResizeHandle.stop(true).hide();
            },
            stop: (event, ui) => {
                this._refreshChat(true);
                clearTimeout(this.resizeHandleTimeout);
                this.chatBodyResizeHandle.stop(true).show();
                this.resizeHandleTimeout = setTimeout(() => {
                    this.chatBodyResizeHandle.hide(200);
                }, 5000);
            }
        });

        this.chatStatusNew.hide();
        this.chatBody.hide();

        // Initial chat position.
        this.chat.css("left", $("#content").offset().left + 34);
        this.chat.css("top", 20);

        this.chatSendAudio = new Audio(Assets.url("audio/ChatSend.m4a"));
        this.chatNotificationAudio = new Audio(Assets.url("audio/ChatNotification.m4a"));

        // Add event listeners.
        ResizeManager.addEventListener(this._resizeEventHandler, this);
        Users.addEventListener(this._authenticationEventHandler, this);
        ClientManager.getClient().addEventListener(this._clientEventHandler, this);
        ClientManager.getClient().addStateChangeListener(this._clientStateHandler, this);
    },

    addEventListener(callback, context) {
        this.eventListeners.push({ callback, context });
    },

    removeEventListener(callback, context) {
        for (let i = 0; i < this.eventListeners.length; i++) {
            if (this.eventListeners[i].callback === callback && this.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                this.eventListeners.splice(i, 1);
                return;
            }
        }
    },

    toggle() {
        if (!this.chat.hasClass("open") && !this.chat.hasClass("opening")) {
            this.open();
        } else {
            this.close();
        }
    },

    open() {
        this.focus();

        if (!this.chat.hasClass("open") && !this.chat.hasClass("opening")) {
            this.chat.addClass("opening");

            this.chatBody.stop(true).delay(300).fadeIn(200, () => {
                this.chat.removeClass("opening").addClass("open");
            });//.show("slide", {direction:"up"}, 200);
            this.chatStatusNew.hide("scale", 50);

            // Wait until chat body has started fading in to render messages and remove messages that are too far down the list.
            this.updateChatTimeout = setTimeout(() => { this._refreshChat(false); }, 300);
        }
    },

    close() {
        if (this.chat.hasClass("open") || this.chat.hasClass("opening")) {
            this.chat.removeClass("open");
            this.chat.removeClass("opening");
            this.blur();

            this.chatBody.stop(true).fadeOut(200);//.hide("slide", {direction:"up"}, 200);//

            clearTimeout(this.updateChatTimeout);
        }
    },

    focus() {
        if (this.chatInput.prop("disabled")) {
            return;
        }

        this.chatInput.focus();
    },

    blur() {
        this.chatInput.blur();
    },

    addRecipient(playerId) {
        if (this.chatInput.prop("disabled")) {
            return;
        }

        // Get username from player details.
        Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    if (!this.recipientUsernames.includes(result.getUsername())) {
                        this.chatInput.val(`@${result.getUsername()} ${this.chatInput.val()}`);
                        this._parseChat();
                    }
                    this.focus();
                } else {
                    this.addSystemMessage([], "Could not find user");
                }
            });
    },

    addSystemMessage(playerIds, message, unignorable) {
        // Look up usernames from player ids.
        const usernameMap = {};
        for (let i = 0; i < playerIds.length; ++i) {
            usernameMap[playerIds[i]] = "<ERROR>";
        }

        const detailsPromises = playerIds.map(playerId => {
            return Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        const username = Utils.maskUnapprovedUsername(result);
                        usernameMap[result.getPlayerId()] = username;
                    }
                })
                .catch(() => {});
        });

        // When we have all responses, add the system message.
        // Messages without player ids take the same path, so mixed batches stay in order.
        Promise.all(detailsPromises).then(() => {
            this._addSystemMessage(playerIds, playerIds.length > 0 ? usernameMap : undefined, message, unignorable);
        });
    },

    addGlobalChatMessage(from, message, chatMessageId) {
        // Look up usernames from player ids.
        this._lookUpUsernamesAndAddChatMessage(from, null, false, "#68c5ff", "#333333", message, chatMessageId);
    },

    addChatMessage(from, message, chatMessageId) {
        // Look up usernames from player ids.
        this._lookUpUsernamesAndAddChatMessage(from, null, false, "#000000", "#ffffff", message, chatMessageId);
    },

    addUserChatMessage(from, to, message, chatMessageId) {
        // Check if one of the senders is a local player. If so, we also need to get the recipients usernames.
        let addRecipients = false;
        for (let i = 0; i < from.length; ++i) {
            if (Users.isAnyUser(from[i])) {
                addRecipients = true;
            }
        }

        this._lookUpUsernamesAndAddChatMessage(from, to, addRecipients, "#00ff02", "#333333", message, chatMessageId);
    },

    sendChat() {
        if (this.chatInput.prop("disabled")) {
            return;
        }

        const message = this._parseChat();

        // Look up player ids from usernames.
        if (this.ignoreeUsernames.length > 0) {
            const usernames = this.ignoreeUsernames;
            const adminPlayerIds = [];
            const playerIdsIgnoringThemselves = [];
            const newlyChangedIgnoreePlayerIds = [];
            const playerIdMap = {};
            for (let i = 0; i < usernames.length; ++i) {
                playerIdMap[usernames[i]] = null;
            }

            const correctlyCasedUsernames = [];
            const usernamePromises = usernames.map(username => {
                return Backend.getPlayerDetailsByUsername(username, Caches.getPlayerDetailsByUsernameCache())
                    .then(result => {
                        if (typeof result === "object") {
                            if (!Users.isAnyUser(result.getPlayerId())) {
                                playerIdMap[result.getUsername()] = result.getPlayerId();
                                if (result.getGmLevel() === null) {
                                    correctlyCasedUsernames.push(result.getUsername());
                                } else {
                                    adminPlayerIds.push(result.getPlayerId());
                                }
                            } else if (this.addingToIgnoreList) {
                                playerIdsIgnoringThemselves.push(result.getPlayerId());
                            }
                        } else {
                            this.addSystemMessage([], `Could not find user ${result}`);
                        }
                    })
                    .catch(() => {});
            });

            // When we have all responses, collect any player ids found and send chat message.
            Promise.all(usernamePromises).then(() => {
                // Since the usernames typed in might be wrongly cased, we use the "normalised" usernames that get back from the backend.
                for (let j = 0; j < correctlyCasedUsernames.length; ++j) {
                    if (playerIdMap[correctlyCasedUsernames[j]]) {
                        if (this.addingToIgnoreList) {
                            if (!this.ignoredPlayerIds.includes(playerIdMap[correctlyCasedUsernames[j]])) {
                                this.ignoredPlayerIds.push(playerIdMap[correctlyCasedUsernames[j]]);
                                newlyChangedIgnoreePlayerIds.push(playerIdMap[correctlyCasedUsernames[j]]);
                            }
                        } else if (this.ignoredPlayerIds.includes(playerIdMap[correctlyCasedUsernames[j]])) {
                            this.ignoredPlayerIds.splice(this.ignoredPlayerIds.indexOf(playerIdMap[correctlyCasedUsernames[j]]), 1);
                            newlyChangedIgnoreePlayerIds.push(playerIdMap[correctlyCasedUsernames[j]]);
                        }
                    }
                }

                // Let players know they cannot ignore admins.
                if (adminPlayerIds.length > 0) {
                    this.addSystemMessage(adminPlayerIds, "You cannot ignore admins ( @  )");
                }

                // Mock the players ignoring themselves.
                if (playerIdsIgnoringThemselves.length > 0) {
                    this.addSystemMessage(playerIdsIgnoringThemselves, "It's not healthy to ignore [yourself,|yourselves,] @ ");
                }

                if (newlyChangedIgnoreePlayerIds.length > 0) {
                    if (this.addingToIgnoreList) {
                        this.addSystemMessage(newlyChangedIgnoreePlayerIds, "You are now ignoring @ ", true);
                    } else {
                        this.addSystemMessage(newlyChangedIgnoreePlayerIds, "You can now hear @  again");
                    }
                }

                this.chatInput.val("");
                this.chatInput.outerHeight(16);
                this.blur();
                this._parseChat();
            });
        } else if (this.recipientUsernames.length > 0) {
            const usernames = this.recipientUsernames;
            const playerIdsTalkingToThemselves = [];
            const playerIdMap = {};
            for (let i = 0; i < usernames.length; ++i) {
                playerIdMap[usernames[i]] = null;
            }

            const correctlyCasedUsernames = [];
            const usernamePromises = usernames.map(username => {
                return Backend.getPlayerDetailsByUsername(username, Caches.getPlayerDetailsByUsernameCache())
                    .then(result => {
                        if (typeof result === "object") {
                            if (!Users.isAnyUser(result.getPlayerId())) {
                                playerIdMap[result.getUsername()] = result.getPlayerId();
                                correctlyCasedUsernames.push(result.getUsername());
                            } else {
                                playerIdsTalkingToThemselves.push(result.getPlayerId());
                            }
                        } else {
                            this.addSystemMessage([], `Could not find user ${result}`);
                        }
                    })
                    .catch(() => {});
            });

            // When we have all responses, collect any player ids found and send chat message.
            Promise.all(usernamePromises).then(() => {
                // Since the usernames typed in might be wrongly cased, we use the "normalised" usernames that get back from the backend.
                for (let j = 0; j < correctlyCasedUsernames.length; ++j) {
                    if (playerIdMap[correctlyCasedUsernames[j]]) {
                        if (!this.recipientPlayerIds.includes(playerIdMap[correctlyCasedUsernames[j]])) {
                            this.recipientPlayerIds.push(playerIdMap[correctlyCasedUsernames[j]]);
                        }
                    }
                }

                // Mock the players whispering to themselves.
                if (playerIdsTalkingToThemselves.length > 0) {
                    this.addSystemMessage(playerIdsTalkingToThemselves, "Why are you talking to [yourself,|yourselves,] @  ?");
                }

                // Only send the message if any non-local players are left.
                if (this.recipientPlayerIds.length > 0) {
                    this._sendChat(message);
                } else {
                    this.chatInput.val("");
                    this.chatInput.outerHeight(16);
                    this.blur();
                    this._parseChat();
                }
            });
        } else {
            this._sendChat(message);
        }
    },

    _sendChat(message) {
        if (message !== "") {
            // Play audio cue.
            AudioManager.playSound(this.chatSendAudio);
            this.chat.addClass("send");
            this._updateInputBackground(true);
            this.blur();
            this.chatInput.prop("disabled", true);
            if (this.globalMessage) {
                this._notifyEventListeners(TankTrouble.ChatBox.EVENTS.GLOBAL_CHAT, message);
            } else if (this.recipientPlayerIds.length > 0) {
                this._notifyEventListeners(TankTrouble.ChatBox.EVENTS.USER_CHAT, { recipientPlayerIds: this.recipientPlayerIds, message });
            } else {
                this._notifyEventListeners(TankTrouble.ChatBox.EVENTS.CHAT, message);
            }
        } else {
            this.blur();
        }
    },

    _parseChat() {
        // Clear ignoree usernames.
        this.ignoreeUsernames = [];
        // Clear recipient player ids and usernames.
        this.recipientPlayerIds = [];
        this.recipientUsernames = [];
        this.globalMessage = false;

        this.chat.removeClass("global user");

        const message = this.chatInput.val().trim();
        // First check if global message.
        if (message.charAt(0) === "#") {
            this.globalMessage = true;

            this.chat.addClass("global");

            return message.slice(1);
        } else if (message.slice(0, 2) === "/r" && this.lastPrivateSenderPlayerIds) {
            // Reply to last private message.
            this.recipientPlayerIds = this.lastPrivateSenderPlayerIds;

            this.chat.addClass("user");

            return message.slice(2);
        } else if ((message.slice(0, 2) === "/i" || message.slice(0, 2) === "/u") && message.length > 2) {
            // Add or remove players to ignore list.
            this.addingToIgnoreList = message.slice(0, 2) === "/i";
            const tokens = message.slice(2).split(" ");
            for (let i = 0; i < tokens.length; ++i) {
                const ignoree = tokens[i];
                if (ignoree !== "" && $.inArray(ignoree, this.ignoreeUsernames) === -1) {
                    this.ignoreeUsernames.push(ignoree);
                }
            }

            return "";
        } else {
            // Try to parse recipient tokens.
            const tokens = message.split(" ");

            let i = 0;
            for (; i < tokens.length; ++i) {
                const firstChar = tokens[i].charAt(0);
                if (firstChar === "@") {
                    const recipient = tokens[i].slice(1);
                    if (recipient !== "" && $.inArray(recipient, this.recipientUsernames) === -1) {
                        this.recipientUsernames.push(recipient);
                    }
                } else if (firstChar !== "") {
                    break;
                }
            }
            if (this.recipientPlayerIds.length > 0 || this.recipientUsernames.length > 0) {
                this.chat.addClass("user");
            }

            return tokens.slice(i).join(" ");
        }
    },

    _lookUpUsernamesAndAddChatMessage(from, to, addRecipients, textColour, strokeColour, message, chatMessageId) {
        // Determine which player ids to look up usernames for.
        let playerIds = from;
        if (addRecipients) {
            playerIds = [...playerIds, ...to];
        }

        const usernameMap = {};
        for (let i = 0; i < playerIds.length; ++i) {
            usernameMap[playerIds[i]] = "<ERROR>";
        }

        const detailsPromises = playerIds.map(playerId => {
            return Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        const username = Utils.maskUnapprovedUsername(result);
                        usernameMap[result.getPlayerId()] = username;
                    }
                })
                .catch(() => {});
        });

        // When we have all responses, add the message.
        Promise.all(detailsPromises).then(() => {
            this._addChatMessage(from, to, usernameMap, addRecipients, textColour, strokeColour, message, chatMessageId);
        });
    },

    _addSystemMessage(involvedPlayerIds, involvedUsernameMap, message, unignorable) {
        // Ignore messages from ignored players.
        if (!unignorable && ArrayUtils.containsSome(involvedPlayerIds, this.ignoredPlayerIds)) {
            return;
        }

        this.messages.push(
            { type: "system",
                involvedPlayerIds,
                involvedUsernameMap,
                message }
        );

        if (this.messages.length > UIConstants.CHAT_BOX_MAX_MESSAGE_COUNT) {
            this.messages.shift();
        }

        if (this.chat.hasClass("open")) {
            this._renderSystemMessage(involvedPlayerIds, involvedUsernameMap, message, true, true);
            // Wait until inserted message is full height to remove messages.
            setTimeout(() => {
                this._updateChat(false);
            }, 200);
        }
    },

    _addChatMessage(from, to, usernameMap, addRecipients, textColour, strokeColour, message, chatMessageId) {
        // Ignore messages from ignored players.
        if (ArrayUtils.containsSome(from, this.ignoredPlayerIds)) {
            return;
        }

        this.messages.push(
            { type: "chat",
                from,
                to,
                usernameMap,
                addRecipients,
                textColour,
                strokeColour,
                message,
                chatMessageId,
                reported: false }
        );

        if (this.messages.length > UIConstants.CHAT_BOX_MAX_MESSAGE_COUNT) {
            this.messages.shift();
        }

        if (this.chat.hasClass("open")) {
            this._renderChatMessage(from, to, usernameMap, addRecipients, textColour, strokeColour, message, chatMessageId, false, true, true);
            // Wait until inserted message is full height to remove messages.
            setTimeout(() => {
                this._updateChat(false);
            }, 200);
        }

        // If user message, also show exclamation mark.
        this._notifyNewMessage(Array.isArray(to) && ArrayUtils.containsSome(to, Users.getAllPlayerIds()));
    },

    _addChatLink(message, svg, playerId, username) {
        // Use [class=X] selector rather than .X to make it work in IE11 and Edge, which do not support getElementsByClassName on svg elements.
        const chatUser = $(`[class=${playerId}-messageUsername]`, svg.root());
        chatUser.click(event => {
            if (Users.getHighestGmLevel() >= UIConstants.ADMIN_LEVEL_PLAYER_LOOKUP) {
                if (event.shiftKey) {
                    OverlayManager.pushOverlay(TankTrouble.AdminPlayerLookupOverlay, {
                        adminId: Users.getHighestGmUser(),
                        playerId
                    });
                    return;
                }
            }
            if (!this.chatInput.prop("disabled")) {
                this.addRecipient(playerId);
            }
        });
        // jQuery 2 cannot addClass to svg element.
        chatUser.css("cursor", "pointer");

        chatUser.tooltipster({ content: `Whisper to ${username}`, side: "bottom", distance: 12 });
    },

    _renderSystemMessage(involvedPlayerIds, involvedUsernameMap, message, animateHeight, animateFadeIn) {
        const systemMessage = $("<div class='chatMessage'></div>");

        systemMessage.svg({ settings: { width: 0, height: 0 } });
        const systemSvg = systemMessage.svg("get");
        let wordX = 1;
        let wordY = 12;
        let svgWidth = 1;
        let svgHeight = wordY + 5;

        let involvedPlayerIdCounter = 0;

        const words = message.split(" ");

        for (let i = 0; i < words.length; ++i) {
            let wordWidth;

            if (involvedPlayerIds !== undefined && words[i] === "@") {
                // If the word is the involved users marker, insert individual username markers and connecting words.
                const newWords = [];
                for (let j = 0; j < involvedPlayerIds.length; ++j) {
                    newWords.push("*");
                    if (j === involvedPlayerIds.length - 2) {
                        newWords.push("__", "and");
                    } else if (j < involvedPlayerIds.length - 2) {
                        newWords.push("_", ",");
                    }
                }

                words.splice(i + 1, 0, ...newWords);

                involvedPlayerIdCounter = 0;

                continue;
            } else if (involvedPlayerIds !== undefined && words[i] === "*") {
                const playerId = involvedPlayerIds[involvedPlayerIdCounter];
                // If the word is the individual username marker, insert username and do not append a space.
                wordWidth = Utils.measureSVGText(involvedUsernameMap[playerId], { fontFamily: "Arial", fontWeight: "bold", fontSize: 12 });

                if (wordX + wordWidth > this.chatBody.width()) {
                    wordX = 1;
                    wordY += 14;
                    svgHeight = wordY + 5;
                }

                systemSvg.text(wordX, wordY, involvedUsernameMap[playerId], { class: `${playerId}-messageUsernameStroke`, fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "none", stroke: "white", strokeLineJoin: "round", strokeWidth: 3 });
                systemSvg.text(wordX, wordY, involvedUsernameMap[playerId], { class: `${playerId}-messageUsername`, fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "black" });

                ++involvedPlayerIdCounter;
            } else if (involvedPlayerIds !== undefined && words[i].charAt(0) === "[") {
                // If the word is the plurality marker, select the correct word based on the number of involved users and append a space.
                const pluralityVariations = words[i].split("|");
                let word = "";
                if (involvedPlayerIds.length === 1) {
                    word = pluralityVariations[0].slice(1);
                } else {
                    word = pluralityVariations[1].slice(0, -1);
                }

                wordWidth = Utils.measureSVGText(word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12 });

                if (wordX + wordWidth > this.chatBody.width()) {
                    wordX = 1;
                    wordY += 14;
                    svgHeight = wordY + 5;
                }

                // Append a space.
                wordWidth += 4;

                systemSvg.text(wordX, wordY, word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "none", stroke: "white", strokeLineJoin: "round", strokeWidth: 3 });
                systemSvg.text(wordX, wordY, word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "gray" });
            } else if (words[i] === "_") {
                // If the word is the small space marker, insert small space.
                wordWidth = 2;
            } else if (words[i] === "__") {
                // If the word is the space marker, insert space.
                wordWidth = 4;
            } else if (words[i] === "§") {
                // If the word is the newline marker, go to the next line and continue the loop.
                wordX = 1;
                wordY += 14;
                svgHeight = wordY + 5;
                continue;
            } else {
                // If the word is just a regular word.
                wordWidth = Utils.measureSVGText(words[i], { fontFamily: "Arial", fontWeight: "bold", fontSize: 12 });

                if (wordX + wordWidth > this.chatBody.width()) {
                    wordX = 1;
                    wordY += 14;
                    svgHeight = wordY + 5;
                }

                // Append a space.
                wordWidth += 4;

                systemSvg.text(wordX, wordY, words[i], { fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "none", stroke: "white", strokeLineJoin: "round", strokeWidth: 3 });
                systemSvg.text(wordX, wordY, words[i], { fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "gray" });
            }

            wordX += wordWidth;

            svgWidth = Math.max(wordX, svgWidth);
        }

        systemSvg.configure({ width: svgWidth, height: svgHeight });

        if (involvedPlayerIds !== undefined) {
            for (let i = 0; i < involvedPlayerIds.length; ++i) {
                const involvedPlayerId = involvedPlayerIds[i];
                if (!Users.isAnyUser(involvedPlayerId)) {
                    this._addChatLink(systemMessage, systemSvg, involvedPlayerId, involvedUsernameMap[involvedPlayerId]);
                }
            }
        }

        this.chatBody.prepend(systemMessage);

        systemMessage.css({ display: "none", opacity: 0, position: "relative", zIndex: this.nextZIndex++ });
        if (animateHeight) {
            systemMessage.show(200);
        } else {
            systemMessage.show();
        }
        if (animateFadeIn) {
            systemMessage.animate({ opacity: 1 }, 200);
        } else {
            systemMessage.css({ opacity: 1 });
        }

        if (involvedPlayerIds !== undefined) {
            this._updatePlayerDetails(involvedPlayerIds);
        }
    },

    _renderChatMessage(from, to, usernameMap, addRecipients, textColour, strokeColour, message, chatMessageId, reported, animateHeight, animateFadeIn) {
        const chatMessage = $(`<div class='chatMessage message-${chatMessageId}'></div>`);
        const urlRegex = /(https?:\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?)/;

        chatMessage.svg({ settings: { width: 0, height: 0 } });
        const chatSvg = chatMessage.svg("get");
        let wordX = 1;
        let wordY = 12;
        let svgWidth = 1;
        let svgHeight = wordY + 5;

        for (let i = 0; i < from.length; ++i) {
            const fromUser = from[i];
            let word = usernameMap[fromUser];
            if (i < from.length - 1) {
                word += ",";
            } else {
                word += addRecipients ? " @" : ":";
            }

            // Measure the username and a comma, colon or at.
            const wordWidth = Utils.measureSVGText(word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12 });

            if (wordX + wordWidth > this.chatBody.width()) {
                wordX = 1;
                wordY += 14;
                svgHeight = wordY + 5;
            }

            chatSvg.text(wordX, wordY, word, { class: `${fromUser}-messageUsernameStroke`, fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "none", stroke: "white", strokeLineJoin: "round", strokeWidth: 3 });
            chatSvg.text(wordX, wordY, word, { class: `${fromUser}-messageUsername`, fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "black" });

            // Append a space.
            wordX += wordWidth + 4;

            svgWidth = Math.max(wordX, svgWidth);
        }

        if (addRecipients) {
            for (let i = 0; i < to.length; ++i) {
                let word = usernameMap[to[i]];
                if (i < to.length - 1) {
                    word += ",";
                } else {
                    word += ":";
                }

                // Measure the username and a comma or colon.
                const wordWidth = Utils.measureSVGText(word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12 });

                if (wordX + wordWidth > this.chatBody.width()) {
                    wordX = 1;
                    wordY += 14;
                    svgHeight = wordY + 5;
                }

                chatSvg.text(wordX, wordY, word, { class: `${to[i]}-messageUsernameStroke`, fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "none", stroke: "white", strokeLineJoin: "round", strokeWidth: 3 });
                chatSvg.text(wordX, wordY, word, { class: `${to[i]}-messageUsername`, fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "black" });

                // Append a space.
                wordX += wordWidth + 4;

                svgWidth = Math.max(wordX, svgWidth);
            }
        }

        const words = [];
        for (const word of message.split(" ")) {
            const url = urlRegex.test(word) ? word : null;
            words.push({ word, url });
        }
        for (let i = 0; i < words.length; ++i) {
            let { word } = words[i];
            const { url } = words[i];
            let wordWidth = Utils.measureSVGText(word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12 });

            // First check if word is too long to fit on one line.
            if (wordWidth > this.chatBody.width()) {
                // Split word. Always peel off at least one character (the +1).
                const fract = Math.floor((((this.chatBody.width() - wordX) / wordWidth) * word.length) + 1);
                words.splice(i + 1, 0, { word: words[i].word.slice(fract), url });
                word = words[i].word.slice(0, fract);
                words[i] = { word, url };

                // Update wordWidth.
                wordWidth = Utils.measureSVGText(word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12 });
            }

            if (wordX + wordWidth > this.chatBody.width()) {
                wordX = 1;
                wordY += 14;
                svgHeight = wordY + 5;
            }

            const strokeText = chatSvg.text(wordX, wordY, word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: "none", stroke: strokeColour, strokeLineJoin: "round", strokeWidth: 3 });
            const fillText = chatSvg.text(wordX, wordY, word, { fontFamily: "Arial", fontWeight: "bold", fontSize: 12, fill: textColour });

            if (url) {
                strokeText.style.textDecoration = "underline";
                fillText.outerHTML = `<a href="${url}" target="_blank">${fillText.outerHTML}</a>`;
            }

            // Append a space.
            wordX += wordWidth + 4;

            svgWidth = Math.max(wordX, svgWidth);
        }

        chatSvg.configure({ width: svgWidth, height: svgHeight });

        this.chatBody.prepend(chatMessage);

        chatMessage.css({ display: "none", opacity: 0, position: "relative", zIndex: this.nextZIndex++ });
        if (animateHeight) {
            chatMessage.show(200);
        } else {
            chatMessage.show();
        }
        if (animateFadeIn) {
            chatMessage.animate({ opacity: 1 }, 200);
        } else {
            chatMessage.css({ opacity: 1 });
        }

        this._updatePlayerDetails(from);
        if (addRecipients) {
            this._updatePlayerDetails(to);
        }

        let foundForeignUser = false;
        for (let i = 0; i < from.length; ++i) {
            const fromUser = from[i];
            if (!Users.isAnyUser(fromUser)) {
                foundForeignUser = true;

                this._addChatLink(chatMessage, chatSvg, fromUser, usernameMap[fromUser]);
            }
        }

        if (addRecipients) {
            for (let i = 0; i < to.length; i++) {
                const toUser = to[i];

                this._addChatLink(chatMessage, chatSvg, toUser, usernameMap[toUser]);
            }
        }

        if (foundForeignUser) {
            const chatMessageWhistle = $(`<img class='whistle' ${Images.attributes("chat/report.png")} title=''/>`);

            chatMessageWhistle.css("left", `${wordX}px`);
            chatMessageWhistle.hide();
            chatMessageWhistle.tooltipster({ side: "right" });

            chatMessage.append(chatMessageWhistle);

            this._updateWhistle(chatMessageId, reported);
        }
    },

    _refreshChat(animate) {
        // Do an each on the children and fade them out.
        this.chatBody.find("div.chatMessage").each((index, element) => {
            if (animate) {
                $(element).stop(true).fadeOut(200, () => {
                    $(element).remove();
                });
            } else {
                $(element).remove();
            }
        });

        // Render all items again.
        if (animate) {
            setTimeout(() => {
                this._renderAllMessages(true);
                this._updateChat(false);
            }, 200);
        } else {
            this._renderAllMessages(false);
            this._updateChat(true);
        }
    },

    _renderAllMessages(animateFadeIn) {
        for (let i = 0; i < this.messages.length; ++i) {
            const message = this.messages[i];
            if (message.type === "chat") {
                this._renderChatMessage(message.from, message.to, message.usernameMap, message.addRecipients,
                    message.textColour, message.strokeColour, message.message, message.chatMessageId, message.reported, false, animateFadeIn);
            } else if (message.type === "system") {
                this._renderSystemMessage(message.involvedPlayerIds, message.involvedUsernameMap, message.message, false, animateFadeIn);
            }
        }

        this._updateChat(false);
    },

    _clearChat() {
        this.messages = [];

        // Do an each on the children and fade them out.
        this.chatBody.find("div.chatMessage").each((index, element) => {
            $(element).stop(true).fadeOut(200, () => {
                $(element).remove();
            });
        });
    },

    _updateChat(instantlyRemoveOldMessages) {
        // Do an each on the children and if their position is larger than the height of the body, fade them out.
        const bodyHeight = this.chatBody.height();
        this.chatBody.find("div.chatMessage").each((index, element) => {
            if ($(element).position().top + $(element).height() > bodyHeight) {
                if (instantlyRemoveOldMessages) {
                    $(element).remove();
                } else {
                    $(element).stop(true).fadeOut(200, () => {
                        $(element).remove();
                    });
                }
            }
        });
    },

    _notifyNewMessage(showNewStatus) {
        if (FocusManager.isFocused()) {
            // Shake status icon if closed.
            if (!this.chat.hasClass("open")) {
                this.chatStatus.show("scale", 1)
                    .animate({ height: "+=10px", width: "+=10px", top: "-=5px", left: "-=5px" }, 125)
                    .animate({ height: "-=10px", width: "-=10px", top: "+=5px", left: "+=5px" }, 125)
                    .animate({ height: "+=10px", width: "+=10px", top: "-=5px", left: "-=5px" }, 125)
                    .animate({ height: "-=10px", width: "-=10px", top: "+=5px", left: "+=5px" }, 125);
                if (showNewStatus) {
                    this.chatStatusNew.show("scale", 50)
                        .animate({ height: "+=10px", width: "+=10px", top: "-=5px", left: "-=5px" }, 125)
                        .animate({ height: "-=10px", width: "-=10px", top: "+=5px", left: "+=5px" }, 125)
                        .animate({ height: "+=10px", width: "+=10px", top: "-=5px", left: "-=5px" }, 125)
                        .animate({ height: "-=10px", width: "-=10px", top: "+=5px", left: "+=5px" }, 125);
                }
            }
        } else {
            // Play audio cue.
            AudioManager.playSound(this.chatNotificationAudio);

            // Show status icon if closed.
            if (!this.chat.hasClass("open") && showNewStatus) {
                this.chatStatusNew.show("scale", 50);
            }
        }
    },

    _updatePlayerDetails(playerIds) {
        for (let i = 0; i < playerIds.length; ++i) {
            Backend.getPlayerDetails(playerIds[i], Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        let baseColour = result.getBaseColour().numericValue;
                        // Reformat strings to be edible for canvas operations.
                        baseColour = baseColour.slice(2);
                        baseColour = `#${new Array(6 - baseColour.length + 1).join("0")}${baseColour}`;

                        $(`.${result.getPlayerId()}-messageUsername`).attr("fill", baseColour);

                        // Check if colour is so bright that we want a dark stroke.
                        const baseRed = parseInt(baseColour.slice(1, 3), 16);
                        const baseGreen = parseInt(baseColour.slice(3, 5), 16);
                        const baseBlue = parseInt(baseColour.slice(5, 7), 16);

                        const brightness = (0.299 * baseRed) + (0.587 * baseGreen) + (0.114 * baseBlue);
                        //0.2126 * Math.pow(baseRed/255.0, 2.2) + 0.7152 * Math.pow(baseGreen/255.0, 2.2) + 0.0722 * Math.pow(baseBlue/255.0, 2.2);

                        let strokeColour = "#ffffff";

                        if (brightness >= 145.0) {
                            strokeColour = "#333333";
                        }

                        $(`.${result.getPlayerId()}-messageUsernameStroke`).attr("stroke", strokeColour);
                    }
                });
        }
    },

    _updateMessageReported(chatMessageId, reported) {
        for (let i = 0; i < this.messages.length; ++i) {
            const message = this.messages[i];
            if (message.type === "chat" && message.chatMessageId === chatMessageId) {
                message.reported = reported;
                break;
            }
        }
    },

    _updateWhistle(chatMessageId, reported) {
        const chatMessage = $(`.chatMessage.message-${chatMessageId}`);

        if (chatMessage.length === 0) {
            return;
        }

        const whistle = chatMessage.find(".whistle");

        // Populate pretty usernames string.
        let prettyUsernames = "";
        for (let i = 0; i < this.messages.length; ++i) {
            const message = this.messages[i];
            if (message.type === "chat" && message.chatMessageId === chatMessageId) {
                for (let j = 0; j < message.from.length; ++j) {
                    const fromUser = message.from[j];
                    if (!Users.isAnyUser(fromUser)) {
                        prettyUsernames += message.usernameMap[fromUser];
                        if (j === message.from.length - 2) {
                            prettyUsernames += " and ";
                        } else if (j < message.from.length - 2) {
                            prettyUsernames += ", ";
                        }
                    }
                }
                break;
            }
        }

        if (reported) {
            whistle.on("click", event => {
                if ($(event.currentTarget).hasClass("noclick")) {
                    $(event.currentTarget).removeClass("noclick");
                } else {
                    this._notifyEventListeners(TankTrouble.ChatBox.EVENTS.UNDO_CHAT_REPORT, chatMessageId);

                    whistle.off("click");
                }
            });

            chatMessage.off("mouseenter mouseleave");

            whistle.show();

            const { width, height } = Assets.size("images/chat/reportSelected.png");
            whistle.attr({ src: Assets.url("images/chat/reportSelected.png"), width, height });

            // Set the tooltip content to get it to update.
            whistle.tooltipster("content", `You have reported ${prettyUsernames}`);
        } else {
            whistle.on("click", event => {
                if ($(event.currentTarget).hasClass("noclick")) {
                    $(event.currentTarget).removeClass("noclick");
                } else {
                    this._notifyEventListeners(TankTrouble.ChatBox.EVENTS.REPORT_CHAT, chatMessageId);

                    whistle.off("click");
                }
            });

            chatMessage.on("mouseenter", event => {
                whistle.stop(true).fadeIn(200);
            });

            chatMessage.on("mouseleave", event => {
                whistle.stop(true).fadeOut(200);
            });

            const { width, height } = Assets.size("images/chat/report.png");
            whistle.attr({ src: Assets.url("images/chat/report.png"), width, height });

            // Set the tooltip content to get it to update.
            whistle.tooltipster("content", `Report ${prettyUsernames}`);
        }
    },

    _notifyEventListeners(evt, data) {
        for (let i = 0; i < this.eventListeners.length; i++) {
            this.eventListeners[i].callback(this.eventListeners[i].context, evt, data);
        }
    },

    _clientEventHandler(self, evt, data) {
        switch (evt) {
            case TTClient.EVENTS.GLOBAL_CHAT_POSTED:
            {
                self._handleChatSendReceipt(data.getSendReceipt());
                self.addGlobalChatMessage(data.getFrom(), data.getMessage(), data.getChatMessageId());

                break;
            }
            case TTClient.EVENTS.CHAT_POSTED:
            {
                self._handleChatSendReceipt(data.getSendReceipt());
                self.addChatMessage(data.getFrom(), data.getMessage(), data.getChatMessageId());

                break;
            }
            case TTClient.EVENTS.USER_CHAT_POSTED:
            {
                self._handleChatSendReceipt(data.getSendReceipt());
                self.addUserChatMessage(data.getFrom(), data.getTo(), data.getMessage(), data.getChatMessageId());

                // Store latest private message sender if it came from someone else.
                let fromLocal = false;
                for (let i = 0; i < data.getFrom().length; ++i) {
                    if (Users.isAnyUser(data.getFrom()[i])) {
                        fromLocal = true;
                    }
                }
                if (!fromLocal) {
                    self.lastPrivateSenderPlayerIds = data.getFrom();
                }

                break;
            }
            case TTClient.EVENTS.SYSTEM_CHAT_POSTED:
            {
                self._handleChatSendReceipt(data.getSendReceipt());
                self.addSystemMessage(data.getInvolvedPlayerIds(), data.getMessage());

                break;
            }
            case TTClient.EVENTS.PLAYERS_BANNED:
            {
                self.addSystemMessage(data, "@  [was|were] temporarily banned");

                break;
            }
            case TTClient.EVENTS.PLAYERS_UNBANNED:
            {
                self.addSystemMessage(data, "@  [was|were] unbanned");

                break;
            }
            case TTClient.EVENTS.CHAT_REPORTED:
            {
                // Update chat message with reported information.
                self._updateMessageReported(data, true);

                // Update whistle.
                self._updateWhistle(data, true);
                break;
            }
            case TTClient.EVENTS.CHAT_REPORT_UNDONE:
            {
                // Clear chat message from reported information.
                self._updateMessageReported(data, false);

                // Update whistle.
                self._updateWhistle(data, false);

                break;
            }
            case TTClient.EVENTS.PLAYERS_AUTHENTICATED:
            {
                self._updateStatusMessageAndAvailability("", []);

                break;
            }
        }
    },

    _handleChatSendReceipt(sendReceipt) {
        if (sendReceipt === "") {
            return;
        }

        this.chat.removeClass("send");
        this._updateInputBackground(true);

        switch (sendReceipt) {
            case Constants.CHAT_SEND_RECEIPT.SUCCESS:
            case Constants.CHAT_SEND_RECEIPT.FAIL:
            {
                this.chatInput.val("");
                this.chatInput.outerHeight(16);
                this._parseChat();
                this._updateStatusMessageAndAvailability("", []);

                break;
            }
            case Constants.CHAT_SEND_RECEIPT.RETRY:
            {
                this._updateStatusMessageAndAvailability("", []);
                break;
            }
        }
    },

    _updateStatusMessageAndAvailability(systemMessageText, guestPlayerIds) {
        const playerIds = Users.getAllPlayerIds();
        if (playerIds.length === 0) {
            this.chatInput.attr("placeholder", "Join to transmit");
            this.chatInput.val("");
            this.chatInput.outerHeight(16);
            this.chatInput.prop("disabled", true);
            this._parseChat();
            if (systemMessageText !== "") {
                this.addSystemMessage([], systemMessageText);
            }
        } else {
            const authenticatedPlayerIds = Users.getAuthenticatedPlayerIds();
            if (authenticatedPlayerIds.length > 0) {
                const mpAuthenticatedPlayerIds = ClientManager.getClient().getAuthenticatedPlayerIds();
                // Only enable input if there are any authenticated players also authenticated on the mp server.
                if (mpAuthenticatedPlayerIds.length > 0 && ArrayUtils.containsSome(mpAuthenticatedPlayerIds, authenticatedPlayerIds)) {
                    this.chatInput.attr("placeholder", "Message");
                    this.chatInput.prop("disabled", this.chat.hasClass("send"));
                } else {
                    this.chatInput.attr("placeholder", "Please wait");
                    this.chatInput.val("");
                    this.chatInput.outerHeight(16);
                    this.chatInput.prop("disabled", true);
                }
            } else {
                this.chatInput.attr("placeholder", "Sign up to transmit");
                this.chatInput.val("");
                this.chatInput.outerHeight(16);
                this.chatInput.prop("disabled", true);
                this._parseChat();
            }
            if (guestPlayerIds.length > 0) {
                this.addSystemMessage(guestPlayerIds, `${systemMessageText}@  must sign up to chat`);
            } else if (systemMessageText !== "") {
                this.addSystemMessage([], systemMessageText);
            }
        }
    },

    _updateInputBackground(animate) {
        if (animate) {
            if (this.chat.hasClass("send")) {
                let backgroundColour = "#ffffff";
                let stripeColour = "#cccccc";

                if (this.chat.hasClass("global")) {
                    backgroundColour = "#68c5ff";
                    stripeColour = "#ffffff";
                } else if (this.chat.hasClass("user")) {
                    backgroundColour = "#00ff02";
                    stripeColour = "#ffffff";
                }
                this.chatForm.stop(true).delay(500).animate({ stripeValue: 100 }, { duration: 100, step: value => {
                    const b = (1 - (value / 100)) * 10;
                    this.chatForm.css("background", `repeating-linear-gradient(53deg, ${stripeColour} 0, ${stripeColour} ${10 - b}px, ${backgroundColour} ${10 - b}px, ${backgroundColour} ${30 + b}px, ${stripeColour} ${30 + b}px, ${stripeColour} 40px`);
                } });
            } else {
                let backgroundColour = "#ffffff";
                let stripeColour = "#cccccc";
                let valueScale = 1;

                if (this.chat.hasClass("global")) {
                    backgroundColour = "#68c5ff";
                    stripeColour = "#ffffff";
                    valueScale = -1;
                } else if (this.chat.hasClass("user")) {
                    backgroundColour = "#00ff02";
                    stripeColour = "#ffffff";
                    valueScale = -1;
                }

                this.chatForm.stop(true).animate({ stripeValue: 0 }, { duration: 100, step: value => {
                    const b = (1 - (value / 100)) * 10 * valueScale;
                    this.chatForm.css("background", `repeating-linear-gradient(53deg, ${stripeColour} 0, ${stripeColour} ${10 - b}px, ${backgroundColour} ${10 - b}px, ${backgroundColour} ${30 + b}px, ${stripeColour} ${30 + b}px, ${stripeColour} 40px`);
                }, complete: () => {
                    this.chatForm.removeAttr("style");
                } });
            }
        } else {
            if (this.chat.hasClass("send")) {
                this.chatForm.prop("stripeValue", 100);
            } else {
                this.chatForm.prop("stripeValue", 0);
            }
            this.chatForm.removeAttr("style");
        }
    },

    _removeLocalPlayersFromIgnored() {
        const removedLocalPlayerIds = [];

        this.ignoredPlayerIds = this.ignoredPlayerIds.filter(
            item => {
                const localPlayer = Users.getAllPlayerIds().includes(item);
                if (localPlayer) {
                    removedLocalPlayerIds.push(item);
                }
                return !localPlayer;
            }
        );

        if (removedLocalPlayerIds.length > 0) {
            this.addSystemMessage(removedLocalPlayerIds, "You cannot ignore [yourself,|yourselves,] @ ");
        }
    },

    _clientStateHandler(self, oldState, newState, data, msg) {
        switch (newState) {
            case TTClient.STATES.UNCONNECTED:
            {
                self._clearChat();
                self.chatStatus.attr("src", Images.url("chat/chatDisabled.png"));
                self.chatStatusNew.hide("scale", 50);

                self.chat.removeClass("send");
                self._updateInputBackground(false);

                self.chatInput.attr("placeholder", "Signal lost");
                self.chatInput.val("");
                self.chatInput.outerHeight(16);
                self.chatInput.prop("disabled", true);
                self._parseChat();

                break;
            }
            case TTClient.STATES.HANDSHAKED:
            {
                if (oldState === TTClient.STATES.CONNECTED) {
                    self.chatStatus.attr("src", Images.url("chat/chat.png"));
                    const guestPlayerIds = Users.getGuestPlayerIds();
                    self._updateStatusMessageAndAvailability("Welcome to TankTrouble Comms § § ", guestPlayerIds);
                }

                break;
            }
        }
    },

    _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.GUEST_ADDED:
            {
                self._removeLocalPlayersFromIgnored();
                self._updateStatusMessageAndAvailability("", [data]);
                break;
            }
            case Users.EVENTS.GUESTS_ADDED:
            {
                self._removeLocalPlayersFromIgnored();
                self._updateStatusMessageAndAvailability("", data);
                break;
            }
            default:
            {
                self._removeLocalPlayersFromIgnored();
                self._updateStatusMessageAndAvailability("", []);
                break;
            }
        }
    },

    _resizeEventHandler(self, evt, data) {
        switch (evt) {
            case ResizeManager.EVENTS.REFRESH:
            case ResizeManager.EVENTS.RESIZE:
            {
                self.chat.position({
                    my: "left top",
                    at: `left+${Math.min(
                        Math.max(
                            self.chat.position().left,
                            $("#content").offset().left + 34
                        ),
                        $("#content").offset().left + $("#content").width() - self.chatBody.width() - 30
                    )} top+${Math.min(self.chat.position().top, $(window).height() - 40)}`,
                    of: $(window)
                });

                break;
            }
        }
    }
};
