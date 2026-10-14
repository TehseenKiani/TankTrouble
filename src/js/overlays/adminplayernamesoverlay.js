import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { AdminUtils } from "../adminutils.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { ClientManager } from "../clientmanager.js";

TankTrouble.AdminPlayerNamesOverlay = {
    // jQuery objects.
    wrapper: null,
    navigation: null,
    message: null,
    attention: null,
    approveAllButton: null,
    unapproved: null,
    historyHeader: null,
    history: null,
    playerNameWrapper: null,
    approveButton: null,
    rejectButton: null,
    undoButton: null,

    // State.
    adminId: null,
    initialised: false,
    playerIds: null,
    playerNames: null,
    playerNameWrappers: null,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $("<div class='admin playerNames'/>");
        this.navigation = new AdminOverlayNavigation();
        this.message = $('<div class="subHeader"/>');
        this.attention = $("<div class='attention'/>");
        this.attention.append("<p>Reject a player name if, and only if, it is intentionally provocative or offensive.</p>");
        this.attention.append("<p>Disregard all activities of the player and exclusively consider the player name itself.</p>");
        this.approveAllButton = $("<button class='small' type='button' tabindex='-1'>Approve all</button>");
        this.unapproved = $('<div class="unapproved"/>');
        this.historyHeader = $('<div class="subHeader">History</div>');
        this.history = $('<div class="section"/>');

        this.wrapper.append(
            this.navigation.element,
            '<div class="header">Player names</div>',
            $('<div class="section"/>').append(
                this.message,
                this.attention,
                this.unapproved,
                this.approveAllButton
            ),
            this.historyHeader,
            this.history
        );

        this.playerNameWrapper = $('<div class="listItem"/>');
        this.approveButton = $("<button class='approve small' type='button' tabindex='-1'>Approve</button>");
        this.rejectButton = $("<button class='reject small warning' type='button' tabindex='-1'>Reject</button>");
        this.undoButton = $("<button class='undo small' type='button' tabindex='-1'>Undo</button>").hide();
        this.playerNameWrapper.append(
            $('<div class="options left"/>').append(
                this.approveButton,
                this.rejectButton
            ),
            $('<div class="options right"/>').append(
                this.undoButton
            ),
            $('<div class="details"/>')
        );

        this.approveAllButton.on("click", event => {
            this._setPlayerNamesApproved([...this.playerIds], [...this.playerNames], [...this.playerNameWrappers], true);
        });

        this.initialised = true;
    },

    /**
     * Show overlay.
     * Expects string params.adminId
     * @param {Object} params
     */
    show(params) {
        this._initialise();

        this.adminId = params.adminId;

        this.playerIds = [];
        this.playerNames = [];
        this.playerNameWrappers = [];

        this.message.hide();
        this.attention.hide();
        this.unapproved.css("min-height", 0).empty();
        this.approveAllButton.hide();
        this.historyHeader.hide();
        this.history.empty();

        this.navigation.update(this.adminId);

        this._getUnapprovedPlayerNames();
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

    _getUnapprovedPlayerNames() {
        const playerIdsNow = new Set(this.playerIds);

        Backend.getUnapprovedPlayerNames(10)
            .then(result => {
                if (typeof result === "object") {
                    if (result.length === 0) {
                        this.message.text("No unmoderated player names").show();
                        this.attention.hide();
                        this.unapproved.css("min-height", 0);
                        this.approveAllButton.hide();
                    } else {
                        this.message.hide();
                        this.attention.show();
                        this.approveAllButton.show().prop("disabled", false);
                    }

                    for (let i = 0; i < result.length; i++) {
                        // Check that player ids was not listed at the time the backend call was made and that is not listed now,
                        if (!playerIdsNow.has(result[i].playerId) && !this.playerIds.includes(result[i].playerId) && this.playerIds.length < 10) {
                            (() => {
                                const { playerId } = result[i];
                                const { playerName } = result[i];
                                const playerNameMap = {};
                                playerNameMap[playerId] = playerName;

                                const playerNameWrapper = this.playerNameWrapper.clone();
                                playerNameWrapper.find(".details").html(AdminUtils.createPlayerNamesWithLookup([playerId], playerNameMap, this.adminId));

                                playerNameWrapper.find("button.approve").on("click", () => {
                                    this._setPlayerNamesApproved([playerId], [playerName], [playerNameWrapper], true);
                                });

                                playerNameWrapper.find("button.reject").on("click", () => {
                                    this._setPlayerNamesApproved([playerId], [playerName], [playerNameWrapper], false);
                                });

                                playerNameWrapper.find("button.undo").on("click", () => {
                                    this._setPlayerNamesApproved([playerId], [playerName], [playerNameWrapper], null);
                                });

                                this.unapproved.append(playerNameWrapper);

                                this.playerIds.push(playerId);
                                this.playerNames.push(playerName);
                                this.playerNameWrappers.push(playerNameWrapper);
                            })();
                        }
                    }

                    // Fix the height of the unapproved container so the below content doesn't jump when items move to history.
                    this.unapproved.css("min-height", this.unapproved.height());
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    _setPlayerNamesApproved(playerIds, playerNames, playerNameWrappers, approved) {
        // Immediately hide player names.
        for (let i = 0; i < playerNameWrappers.length; i++) {
            playerNameWrappers[i].hide();
        }

        // Disable approve all button if the unapproved list is empty.
        if (this.unapproved.find("> :visible").length === 0) {
            this.approveAllButton.prop("disabled", true);
        }

        Backend.setPlayerNamesApproved(this.adminId, playerIds, playerNames, approved, Caches.getPlayerDetailsCache())
            .then(result => {
                if (result === true) {
                    for (let i = 0; i < playerIds.length; i++) {
                        if (approved === null) {
                            playerNameWrappers[i].remove();
                        } else {
                            // Move player name to history and enable undo
                            playerNameWrappers[i].find("button.approve, button.reject").hide();
                            playerNameWrappers[i].find("button.undo").show();
                            playerNameWrappers[i].prependTo(this.history);
                            playerNameWrappers[i].find(".details").addClass(approved ? "" : "warning");
                            playerNameWrappers[i].find(".details").prepend(approved ? "Approved " : "Rejected ");
                            playerNameWrappers[i].show();

                            const index = this.playerIds.indexOf(playerIds[i]);
                            this.playerIds.splice(index, 1);
                            this.playerNames.splice(index, 1);
                            this.playerNameWrappers.splice(index, 1);
                        }

                        // Only show history header if there are any items in the history.
                        this.historyHeader.toggle(this.history.children().length > 0);

                        // Signal update to all to enable/disable username mask.
                        ClientManager.broadcastUpdateUserByAdmin(this.adminId, playerIds[i], false, true, false);
                    }

                    while (this.history.children().length > 10) {
                        this.history.children().last().remove();
                    }

                    if (this.playerIds.length < 10) {
                        this._getUnapprovedPlayerNames();
                    }

                    this.navigation.updatePlayerNamesCounter(this.adminId);
                } else {
                    this._handleError(result);

                    // Show player names again.
                    for (let i = 0; i < playerNameWrappers.length; i++) {
                        playerNameWrappers[i].show();
                    }

                    // Enable approve all button if the unapproved list is empty.
                    if (this.unapproved.find("> :visible").length > 0) {
                        this.approveAllButton.prop("disabled", false);
                    }
                }
            })
            .catch(message => {
                this._handleError(message);

                // Show  player names again.
                for (let i = 0; i < playerNameWrappers.length; i++) {
                    playerNameWrappers[i].show();
                }

                // Enable approve all button if the unapproved list is empty.
                if (this.unapproved.find("> :visible").length > 0) {
                    this.approveAllButton.prop("disabled", false);
                }
            });
    },

    _handleError(message) {
        alert(message);
    }
};
