import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { OverlayManager } from "./overlaymanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { Users } from "./users.js";
import { Utils } from "./utils.js";

export class AdminOverlayNavigation {
    /**
     * Creates admin navigation elements.
     * Call update to reveal navigation according to admin level.
     */
    constructor() {
        this.adminId = null;
        this.playerLookupSensitiveDetails = null;
        this.playerLookupInput = $("<input type='text'/>");
        this.dashboardButton = $("<button class='small' type='button' tabindex='-1'>Dashboard</button>");
        this.playerNamesButton = $("<button class='small' type='button' tabindex='-1'>Player names</button>");
        this.shopButton = $("<button class='small' type='button' tabindex='-1'>Shop</button>");
        this.newsButton = $("<button class='small' type='button' tabindex='-1'>News</button>");
        this.messagesButton = $("<button class='small' type='button' tabindex='-1'>Messages</button>");
        this.chatReportsButton = $("<button class='small' type='button' tabindex='-1'>Chat Reports</button>");
        this.statisticsButton = $("<button class='small' type='button' tabindex='-1'>Statistics</button>");
        this.logButton = $("<button class='small' type='button' tabindex='-1'>Log</button>");
        this.serverLogButton = $("<button class='small' type='button' tabindex='-1'>Server log</button>");

        this.playerNamesCounter = $("<div class='counter'/>");
        this.messagesCounter = $("<div class='counter'/>");
        this.chatReportsCounter = $("<div class='counter'/>");
        this.playerNamesButton.append(this.playerNamesCounter);
        this.messagesButton.append(this.messagesCounter);
        this.chatReportsButton.append(this.chatReportsCounter);

        this.playerLookupInput.tooltipster({ side: "right", theme: "tooltipster-error", triggerOpen: { mouseenter: false }, triggerClose: { mouseleave: false } });

        this.playerLookupInput.on("keyup", event => {
            if (event.keyCode === 13 && this.playerLookupInput.val() !== "") {
                this.playerLookupInput.removeClass("inputRejected");
                Utils.updateTooltip(this.playerLookupInput, "");

                if (!this.playerLookupInput.val().includes("@")) {
                    Backend.getPlayerDetailsByUsername(this.playerLookupInput.val(), Caches.getPlayerDetailsByUsernameCache())
                        .then(result => {
                            if (typeof result === "object") {
                                OverlayManager.replaceOverlay(
                                    TankTrouble.AdminPlayerLookupOverlay,
                                    { adminId: this.adminId, playerId: result.getPlayerId() }
                                );
                            } else {
                                this.playerLookupInput.addClass("inputRejected");
                                Utils.updateTooltip(this.playerLookupInput, "No such player");
                                this.playerLookupInput.focus();
                            }
                        })
                        .catch(message => {
                            AdminOverlayNavigation._handleError(message);
                        });
                } else {
                    Backend.getPlayerDetailsByEmail(this.adminId, this.playerLookupInput.val())
                        .then(result => {
                            if (typeof result === "object") {
                                OverlayManager.replaceOverlay(
                                    TankTrouble.AdminPlayerLookupOverlay,
                                    { adminId: this.adminId, playerId: result.getPlayerId() }
                                );
                            } else {
                                this.playerLookupInput.addClass("inputRejected");
                                Utils.updateTooltip(this.playerLookupInput, "No such player");
                                this.playerLookupInput.focus();
                            }
                        })
                        .catch(message => {
                            AdminOverlayNavigation._handleError(message);
                        });
                }
            }
        });

        this.playerLookupInput.blur(event => {
            this.playerLookupInput.removeClass("inputRejected");
            Utils.updateTooltip(this.playerLookupInput, "");
        });

        this.dashboardButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminDashboardOverlay, { adminId: this.adminId });
        });

        this.playerNamesButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminPlayerNamesOverlay, { adminId: this.adminId });
        });

        this.messagesButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminMessagesOverlay, { adminId: this.adminId });
        });

        this.newsButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminNewsOverlay, { adminId: this.adminId });
        });

        this.shopButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminShopOverlay, { adminId: this.adminId });
        });

        this.chatReportsButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminChatLogOverlay, { adminId: this.adminId });
        });

        this.statisticsButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminStatisticsOverlay, { adminId: this.adminId });
        });

        this.logButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminLogOverlay, { adminId: this.adminId });
        });

        this.serverLogButton.on("click", event => {
            OverlayManager.replaceOverlay(TankTrouble.AdminServerLogOverlay, { adminId: this.adminId });
        });

        this.element = $("<div class='admin navigation'/>");
        this.element.append(
            this.playerLookupInput,
            this.dashboardButton,
            this.playerNamesButton,
            this.shopButton,
            this.newsButton,
            this.messagesButton,
            this.chatReportsButton,
            this.statisticsButton,
            this.logButton,
            this.serverLogButton
        );
    }

    /**
     * Resets Admin Navigation and reveals it according to admin level.
     * @param {string} adminId
     */
    update(adminId) {
        this.adminId = adminId;

        this.playerLookupInput.val("");
        this.playerLookupInput.hide();
        this.dashboardButton.hide();
        this.playerNamesButton.hide();
        this.shopButton.hide();
        this.newsButton.hide();
        this.messagesButton.hide();
        this.chatReportsButton.hide();
        this.statisticsButton.hide();
        this.logButton.hide();
        this.serverLogButton.hide();

        Backend.getPlayerDetails(adminId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_DASHBOARD) {
                        this.dashboardButton.show();
                    }
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_MODERATE_PLAYER_NAME) {
                        this.updatePlayerNamesCounter(adminId);
                        this.playerNamesButton.show();
                    }
                    if (Users.hasSpecificUserAdminRole(adminId, UIConstants.ADMIN_ROLE_WRITE_MESSAGES)) {
                        this.updateMessagesCounter(adminId);
                        this.messagesButton.show();
                    }
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_EDIT_SHOP_ITEM) {
                        this.shopButton.show();
                    }
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_NEWS) {
                        this.newsButton.show();
                    }
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_RESOLVE_CHAT_MESSAGE_REPORT) {
                        this.updateChatReportsCounter(adminId);
                        this.chatReportsButton.show();
                    }
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_VIEW_STATISTICS) {
                        this.statisticsButton.show();
                    }
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_VIEW_LOG) {
                        this.logButton.show();
                    }
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_PLAYER_LOOKUP) {
                        const sensitiveDetails = result.getGmLevel() >= UIConstants.ADMIN_LEVEL_VIEW_SENSITIVE_PLAYER_DETAILS;
                        if (this.playerLookupSensitiveDetails !== sensitiveDetails) {
                            this.playerLookupSensitiveDetails = sensitiveDetails;
                            if (sensitiveDetails) {
                                this.playerLookupInput.attr("placeholder", "Player name or email");
                                Utils.restrictInput(this.playerLookupInput, "-_.@", 128);
                            } else {
                                this.playerLookupInput.attr("placeholder", "Player name");
                                Utils.restrictInput(this.playerLookupInput, "-_", 32);
                            }
                        }
                        this.playerLookupInput.show();
                        this.playerLookupInput.focus();
                    }
                    if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_SERVER_LOG) {
                        this.serverLogButton.show();
                    }
                } else {
                    AdminOverlayNavigation._handleError(result);
                }
            })
            .catch(message => {
                AdminOverlayNavigation._handleError(message);
            });

        this.element.find("button, input").prop("disabled", false);
    }

    updatePlayerNamesCounter(adminId) {
        Backend.getUnapprovedPlayerNamesCount(adminId)
            .then(result => {
                if (typeof result === "number") {
                    if (result === 0) {
                        this.playerNamesCounter.empty();
                    } else {
                        this.playerNamesCounter.text(result);
                    }
                } else {
                    AdminOverlayNavigation._handleError(result);
                    this.playerNamesCounter.text("?");
                }
            })
            .catch(message => {
                AdminOverlayNavigation._handleError(message);
                this.playerNamesCounter.text("?");
            });
    }

    updateMessagesCounter(adminId) {
        Backend.getUnseenMessagesCount([adminId])
            .then(result => {
                if (typeof result === "number") {
                    if (result === 0) {
                        this.messagesCounter.empty();
                    } else {
                        this.messagesCounter.text(result);
                    }
                } else {
                    AdminOverlayNavigation._handleError(result);
                    this.messagesCounter.text("?");
                }
            })
            .catch(message => {
                AdminOverlayNavigation._handleError(message);
                this.messagesCounter.text("?");
            });
    }

    updateChatReportsCounter(adminId) {
        Backend.getUnmoderatedChatMessagesCount(adminId)
            .then(result => {
                if (typeof result === "number") {
                    if (result === 0) {
                        this.chatReportsCounter.empty();
                    } else {
                        this.chatReportsCounter.text(result);
                    }
                } else {
                    AdminOverlayNavigation._handleError(result);
                    this.chatReportsCounter.text("?");
                }
            })
            .catch(message => {
                AdminOverlayNavigation._handleError(message);
                this.chatReportsCounter.text("?");
            });
    }

    static _handleError(message) {
        alert(message);
    }
}
