import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { ClientManager } from "../clientmanager.js";
import { Commands } from "../commands.js";
import { OverlayManager } from "../overlaymanager.js";
import { UIConstants } from "../tt/ui/uiconstants.js";
import { UIUtils } from "../tt/ui/uiutils.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.AdminPlayerLookupOverlay = {
    init() {
        Commands.register("--admin-player-lookup.cancel-account-deletion", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.cancelAccountDeletion(); });
        Commands.register("--admin-player-lookup.cancel-delete-email", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.cancelDeleteEmail(); });
        Commands.register("--admin-player-lookup.cancel-edit-email", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.cancelEditEmail(); });
        Commands.register("--admin-player-lookup.cancel-reset-password", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.cancelResetPassword(); });
        Commands.register("--admin-player-lookup.cancel-retire", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.cancelRetire(); });
        Commands.register("--admin-player-lookup.confirm-delete-email", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.confirmDeleteEmail(); });
        Commands.register("--admin-player-lookup.confirm-edit-email", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.confirmEditEmail(); });
        Commands.register("--admin-player-lookup.confirm-reset-password", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.confirmResetPassword(); });
        Commands.register("--admin-player-lookup.confirm-retire", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.confirmRetire(); });
        Commands.register("--admin-player-lookup.delete-account", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.deleteAccount(); });
        Commands.register("--admin-player-lookup.delete-account-cancel", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.deleteAccountCancel(); });
        Commands.register("--admin-player-lookup.delete-account-confirm", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.deleteAccountConfirm(); });
        Commands.register("--admin-player-lookup.enable-delete-email", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.enableDeleteEmail(); });
        Commands.register("--admin-player-lookup.enable-edit-email", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.enableEditEmail(); });
        Commands.register("--admin-player-lookup.enable-reset-password", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.enableResetPassword(); });
        Commands.register("--admin-player-lookup.enable-retire", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.enableRetire(); });
        Commands.register("--admin-player-lookup.recommend-player-promotion", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.recommendPlayerPromotion(); });
        Commands.register("--admin-player-lookup.resend-verification-email", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.resendVerificationEmail(); });
        Commands.register("--admin-player-lookup.set-player-banned", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.setPlayerBanned(data.value); });
        Commands.register("--admin-player-lookup.set-player-name-approved", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.setPlayerNameApproved(button.attr("data-username"), data.value); });
        Commands.register("--admin-player-lookup.set-player-admin-level", (button, data) => {
            const level = button.attr("data-level");
            TankTrouble.AdminPlayerLookupOverlay.setPlayerAdminLevel(level === "" ? null : Number(level));
        });
        Commands.register("--admin-player-lookup.refund-purchase", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.refundPurchase(data.purchaseId); });
        Commands.register("--admin-player-lookup.refund-gold-purchase", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.refundGoldPurchase(data.purchaseId); });
        Commands.register("--admin-player-lookup.refund-virtual-purchase", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.refundVirtualPurchase(data.purchaseId); });
        Commands.register("--admin-player-lookup.revert-account-change", (button, data) => { TankTrouble.AdminPlayerLookupOverlay.revertAccountChange(data.changeId); });
    },

    // jQuery objects.
    wrapper: null,
    navigation: null,
    details: null,
    adminLogs: null,

    // State.
    initialised: false,
    adminId: null,
    playerId: null,
    enabled: null,
    logs: null,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $("<div class='admin playerLookup'/>");
        this.navigation = new AdminOverlayNavigation();
        this.details = $("<div/>");
        this.adminLogs = $('<div class="section"/>');

        this.wrapper.append(
            this.navigation.element,
            this.details,
            this.adminLogs
        );

        this.initialised = true;
    },

    /**
     * Expects params.adminId and params.playerId
     * @param {Object} params
     */
    show(params) {
        this._initialise();

        this.adminId = params.adminId;
        this.playerId = params.playerId;
        this.enabled = [];

        this.navigation.update(this.adminId);

        this.wrapper.parent().on("scroll.tankIcon", () => {
            this._positionTankIcon();
        });

        this._update();
    },

    hide() {
        this._initialise();

        this.wrapper.parent().off("scroll.tankIcon");
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

    setPlayerNameApproved(playerName, approved) {
        this._disable();

        Backend.setPlayerNamesApproved(this.adminId, [this.playerId], [playerName], approved, Caches.getPlayerDetailsCache())
            .then(result => {
                if (result === true) {
                    this._update();
                    // Signal update to all to enable/disable username mask.
                    ClientManager.broadcastUpdateUserByAdmin(this.adminId, this.playerId, false, true, false);
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    setPlayerBanned(banned) {
        this._disable();

        Backend.setPlayerBanned(this.adminId, this.playerId, banned, Caches.getPlayerDetailsCache())
            .then(result => {
                if (result === true) {
                    this._update();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    recommendPlayerPromotion() {
        this._disable();

        Backend.recommendPlayerPromotion(this.adminId, this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (result === true) {
                    this._update();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    setPlayerAdminLevel(adminLevel) {
        this._disable();

        Backend.setPlayerAdminLevel(this.adminId, this.playerId, adminLevel, Caches.getPlayerDetailsCache())
            .then(result => {
                if (result === true) {
                    this._update();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    enableRetire() {
        this.details.find("button.retire.enable").prop("disabled", true);
        this.details.find("button.retire.cancel").show();
        this.details.find("button.retire.confirm").show();
    },

    cancelRetire() {
        this.details.find("button.retire.enable").prop("disabled", false);
        this.details.find("button.retire.cancel").hide();
        this.details.find("button.retire.confirm").hide();
    },

    confirmRetire() {
        this._disable();

        Backend.retireAdmin(this.adminId, this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (result === true) {
                    if (this.adminId === this.playerId) {
                        OverlayManager.replaceOverlay(
                            TankTrouble.MessageOverlay,
                            {
                                headline: "We are sad to see you go",
                                message: "<p>The laboratory is immensely grateful for all your services.</p><p>You have earned a permanent place in our cold scientist hearts, and we wish you all the best of luck in your future endeavours.</p><p>May they be destructive!</p><p>Sincerely,<br><span class='signature'>Purup & bbc</span></p>"
                            }
                        );
                    } else {
                        this._update();
                    }
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    enableResetPassword() {
        this.details.find("button.resetPassword.enable").prop("disabled", true);
        this.details.find("button.resetPassword.cancel").show();
        this.details.find("button.resetPassword.confirm").show();
    },

    cancelResetPassword() {
        this.details.find("button.resetPassword.enable").prop("disabled", false);
        this.details.find("button.resetPassword.cancel").hide();
        this.details.find("button.resetPassword.confirm").hide();
    },

    confirmResetPassword() {
        this._disable();

        Backend.resetAccountPassword(this.adminId, this.playerId)
            .then(result => {
                if (result === true) {
                    this._update();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    resendVerificationEmail() {
        this._disable();

        Backend.resendVerificationEmailAsAdmin(this.adminId, this.playerId)
            .then(result => {
                if (result === true) {
                    this._update();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    enableEditEmail() {
        this.details.find("button.editEmail.enable").prop("disabled", true);
        Utils.restrictInput(this.details.find("input.editEmail"), "-_.@", 128);
        this.details.find("input.editEmail").show();
        this.details.find("button.editEmail.cancel").show();
        this.details.find("button.editEmail.confirm").show();
    },

    cancelEditEmail() {
        this.details.find("button.editEmail.enable").prop("disabled", false);
        this.details.find("input.editEmail").val("").hide();
        this.details.find("button.editEmail.cancel").hide();
        this.details.find("button.editEmail.confirm").hide();
    },

    confirmEditEmail() {
        this._disable();

        Backend.setEmailAsAdmin(this.adminId, this.playerId, this.details.find("input.editEmail").val(), Caches.getEmailCache())
            .then(result => {
                if (result === true) {
                    this._update();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    enableDeleteEmail() {
        this.details.find("button.editEmail.enable").prop("disabled", true);
        this.details.find("button.deleteEmail.enable").prop("disabled", true);
        this.details.find("button.deleteEmail.cancel").show();
        this.details.find("button.deleteEmail.confirm").show();
    },

    cancelDeleteEmail() {
        this.details.find("button.editEmail.enable").prop("disabled", false);
        this.details.find("button.deleteEmail.enable").prop("disabled", false);
        this.details.find("button.deleteEmail.cancel").hide();
        this.details.find("button.deleteEmail.confirm").hide();
    },

    confirmDeleteEmail() {
        this._disable();

        Backend.setEmailAsAdmin(this.adminId, this.playerId, null, Caches.getEmailCache())
            .then(result => {
                if (result === true) {
                    this._update();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    deleteAccount() {
        this.details.find("button.deleteAccount.enable").prop("disabled", true);
        this.details.find("button.deleteAccount.cancel").show();
        this.details.find("button.deleteAccount.confirm").show();
    },

    deleteAccountCancel() {
        this.details.find("button.deleteAccount.enable").prop("disabled", false);
        this.details.find("button.deleteAccount.cancel").hide();
        this.details.find("button.deleteAccount.confirm").hide();
    },

    deleteAccountConfirm() {
        this._disable();

        Backend.deleteUserAsAdmin(this.adminId, this.playerId, Caches.getPlayerDetailsCache(), Caches.getPlayerDetailsByUsernameCache(), Caches.getEmailCache())
            .then(result => {
                if (result === true) {
                    if (Users.isAuthenticatedUser(this.playerId)) {
                        // Remove authenticated user.
                        Users.removeAuthenticatedUser(this.playerId);
                    } else if (Users.isGuestUser(this.playerId)) {
                        // Remove guest user.
                        Users.removeGuestUser(this.playerId);
                    }

                    OverlayManager.replaceOverlay(
                        TankTrouble.AdminDashboardOverlay,
                        { adminId: this.adminId }
                    );
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    cancelAccountDeletion() {
        this._disable();

        Backend.cancelUserDeletion(this.adminId, this.playerId)
            .then(result => {
                if (result === true) {
                    this._update();
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    revertAccountChange(accountChangeId) {
        this._disable();

        Backend.revertAccountChange(this.adminId, accountChangeId, Caches.getPlayerDetailsCache(), Caches.getEmailCache(), Caches.getCurrencyCache())
            .then(result => {
                if (result === true) {
                    this._update();
                    // Signal update.
                    ClientManager.broadcastUpdateUserByAdmin(this.adminId, this.playerId, false, true, false);
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    refundPurchase(purchaseId) {
        this._disable();

        Backend.refundPurchase(this.adminId, this.playerId, purchaseId, Caches.getPlayerDetailsCache(), Caches.getCurrencyCache(), Caches.getVirtualShopCache(), Caches.getGarageContentCache())
            .then(result => {
                if (result === true) {
                    this._update();
                    // Send signal that user was potentially updated.
                    ClientManager.broadcastUpdateUserByAdmin(this.adminId, this.playerId, false, false, true);
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    refundGoldPurchase(purchaseId) {
        this._disable();

        Backend.refundGoldPurchase(this.adminId, this.playerId, purchaseId, Caches.getCurrencyCache(), Caches.getVirtualShopCache())
            .then(result => {
                if (result === true) {
                    this._update();
                    // Send signal that user was potentially updated.
                    ClientManager.broadcastUpdateUserByAdmin(this.adminId, this.playerId, false, false, true);
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    refundVirtualPurchase(purchaseId) {
        this._disable();

        Backend.refundVirtualPurchase(this.adminId, this.playerId, purchaseId, Caches.getCurrencyCache(), Caches.getVirtualShopCache(), Caches.getGarageContentCache())
            .then(result => {
                if (result === true) {
                    this._update();
                    // Send signal that user was potentially updated.
                    ClientManager.broadcastUpdateUserByAdmin(this.adminId, this.playerId, false, false, true);
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    _update() {
        this.details.empty();
        this.adminLogs.empty();
        this.logs = [];

        // Get details.
        Backend.getSensitivePlayerDetails(this.adminId, this.playerId)
            .then(result => {
                if (typeof result === "object") {
                    this.details.append(result.data.html);
                    this.details.find("button.cancel, button.confirm, input.editEmail").hide();

                    this.details.find("#adminDetailsIcon").on("load", () => {
                        this._positionTankIcon();
                    });
                    const rank = this.details.find("#adminDetailsRank");
                    rank.text(UIConstants.RANK_TITLES[UIUtils.getRankLevelFromRank(Number(rank.attr("data-rank")))]);
                    const level = this.details.find("#adminDetailsLevel");
                    level.text(`Level ${UIUtils.getLevelFromXp(Number(level.attr("data-xp"))) + 1}`);
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });

        // Get admin logs where player is target id and where player is admin id.
        Promise.all([
            Backend.getAdminLogs(this.adminId, null, null, [this.playerId], null, 0, 100),
            Backend.getAdminLogs(this.adminId, [this.playerId], null, null, null, 0, 100)
        ])
            .then(([logsAsTarget, logsAsAdmin]) => {
                if (typeof logsAsTarget === "object" && typeof logsAsAdmin === "object") {
                    this.logs = [...logsAsTarget.adminLogs, ...logsAsAdmin.adminLogs];
                    this._showLogs();
                } else {
                    this._handleError(typeof logsAsTarget === "object" ? logsAsAdmin : logsAsTarget);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    _showLogs() {
        // Sort the logs, newest first.
        this.logs.sort((a, b) => {
            return b.id - a.id;
        });

        // Remove duplicates. Works because elements are sorted.
        this.logs = this.logs.filter((elm, index, array) => {
            return index === 0 || elm.id !== array[index - 1].id;
        });

        // Add sub header.
        if (this.logs.length > 100) {
            this.adminLogs.append(`<div class="subHeader">Log <span class="note">(Latest 100 of ${this.logs.length})</span></div>`);
        } else if (this.logs.length > 0) {
            this.adminLogs.append('<div class="subHeader">Log</div>');
        } else {
            this.adminLogs.append('<div class="subHeader">No log</div>');
        }

        // Show maximum 100 logs.
        this.logs.slice(0, 100);

        for (let i = 0; i < this.logs.length; i++) {
            this.adminLogs.append(this.logs[i].html);
        }
    },

    _positionTankIcon() {
        const icon = this.details.find(".icon");
        if (this.wrapper.position().top + icon.parent().height() - icon.height() - 20 < 0) {
            $(".admin.playerLookup .icon").removeClass("fixed");
        } else {
            $(".admin.playerLookup .icon").addClass("fixed");
        }
    },

    _disable() {
        this.enabled = this.details.find("button:enabled, input:enabled");
        this.enabled.prop("disabled", true);
    },

    _enable() {
        this.enabled.prop("disabled", false);
    },

    _handleError(message) {
        alert(message);

        this._enable();
    }
};
