import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { AdminUtils } from "../adminutils.js";
import { Backend } from "../backend.js";
import { UIConstants } from "../tt/ui/uiconstants.js";

TankTrouble.AdminLogOverlay = {
    // jQuery objects.
    wrapper: null,
    navigation: null,
    filter: null,
    topPaginator: null,
    logs: null,
    bottomPaginator: null,

    // State.
    initialised: false,
    adminId: null,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $('<div class="admin log"/>');
        this.navigation = new AdminOverlayNavigation();
        this.filter = $('<select name="filter"/>');
        this.filter.append('<option value="all">Show all</option>');
        this.filter.append('<option value="approved-player-names">Approved player names</option>');
        this.filter.append('<option value="rejected-player-names">Rejected player names</option>');
        this.filter.append('<option value="forum">Forum</option>');
        this.filter.append('<option value="bans">Bans</option>');
        this.filter.append('<option value="kicks-for-cheating">Kicks for cheating</option>');
        this.filter.append('<option value="chat">Chat</option>');
        this.filter.append('<option value="messages">Messages</option>');
        this.filter.append('<option value="news">News</option>');
        this.filter.append('<option value="shop">Shop</option>');
        this.filter.append('<option value="account-changes">Account changes</option>');
        this.filter.append('<option value="admin-rights">Admin rights</option>');
        this.topPaginator = $("<div/>");
        this.logs = $('<div class="section"/>');
        this.bottomPaginator = $("<div/>");

        this.wrapper.append(
            this.navigation.element,
            '<div class="header">Log</div>',
            $('<div class="section"/>').append(this.filter),
            this.topPaginator,
            this.logs,
            this.bottomPaginator
        );

        this.filter.change(() => {
            this._getAdminLogs(0, 100);
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

        this.navigation.update(this.adminId);

        this.topPaginator.empty();
        this.logs.empty();
        this.bottomPaginator.empty();

        this._getAdminLogs(0, 100);
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

    _getAdminLogs(offset, limit, page) {
        // Disable relevant paginator buttons.
        page = page !== undefined ? page : 0;
        const disabled = this.wrapper.find(`.paginator button[data-page="${page}"]`);
        disabled.prop("disabled", true);

        // Filter logs.
        let actions = [];
        switch (this.filter.val()) {
            case "approved-player-names": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_APPROVE_USERNAME,
                    UIConstants.ADMIN_LOG.ACTION_UNDO_USERNAME_MODERATION
                ];
                break;
            }
            case "rejected-player-names": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_REJECT_USERNAME,
                    UIConstants.ADMIN_LOG.ACTION_UNDO_USERNAME_MODERATION
                ];
                break;
            }
            case "forum": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_APPROVE_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_UNAPPROVE_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_LOCK_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_UNLOCK_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_PIN_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_UNPIN_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_DELETE_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_UNDELETE_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_BAN_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_UNBAN_FORUM_THREAD,
                    UIConstants.ADMIN_LOG.ACTION_APPROVE_FORUM_REPLY,
                    UIConstants.ADMIN_LOG.ACTION_UNAPPROVE_FORUM_REPLY,
                    UIConstants.ADMIN_LOG.ACTION_DELETE_FORUM_REPLY,
                    UIConstants.ADMIN_LOG.ACTION_UNDELETE_FORUM_REPLY,
                    UIConstants.ADMIN_LOG.ACTION_BAN_FORUM_REPLY,
                    UIConstants.ADMIN_LOG.ACTION_UNBAN_FORUM_REPLY
                ];
                break;
            }
            case "bans": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_BAN_PLAYER,
                    UIConstants.ADMIN_LOG.ACTION_REMOVE_PLAYER_BAN
                ];
                break;
            }
            case "kicks-for-cheating": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_KICK_CHEATING_PLAYER
                ];
                break;
            }
            case "chat": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_APPROVE_CHAT_MESSAGE,
                    UIConstants.ADMIN_LOG.ACTION_BAN_CHAT_MESSAGE
                ];
                break;
            }
            case "messages": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_EDIT_MESSAGE_CONTENT
                ];
                break;
            }
            case "news": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_CREATE_NEWS_POST,
                    UIConstants.ADMIN_LOG.ACTION_EDIT_NEWS_POST,
                    UIConstants.ADMIN_LOG.ACTION_DELETE_NEWS_POST
                ];
                break;
            }
            case "shop": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_PURCHASE_VIRTUAL_SHOP_ITEM,
                    UIConstants.ADMIN_LOG.ACTION_REFUND_VIRTUAL_SHOP_ITEM,
                    UIConstants.ADMIN_LOG.ACTION_PURCHASE_GOLD_SHOP_ITEM,
                    UIConstants.ADMIN_LOG.ACTION_REFUND_GOLD_SHOP_ITEM,
                    UIConstants.ADMIN_LOG.ACTION_PURCHASE_SHOP_ITEM,
                    UIConstants.ADMIN_LOG.ACTION_REFUND_SHOP_ITEM,
                    UIConstants.ADMIN_LOG.ACTION_EDIT_SHOP_ITEM
                ];
                break;
            }
            case "account-changes": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_REVERT_ACCOUNT_CHANGE,
                    UIConstants.ADMIN_LOG.ACTION_RESET_ACCOUNT_PASSWORD,
                    UIConstants.ADMIN_LOG.ACTION_RESEND_VERIFICATION_EMAIL,
                    UIConstants.ADMIN_LOG.ACTION_DELETE_ACCOUNT,
                    UIConstants.ADMIN_LOG.ACTION_EDIT_EMAIL,
                    UIConstants.ADMIN_LOG.ACTION_DELETE_EMAIL,
                    UIConstants.ADMIN_LOG.ACTION_REMOVE_ACCOUNT_DELETION
                ];
                break;
            }
            case "admin-rights": {
                actions = [
                    UIConstants.ADMIN_LOG.ACTION_RECOMMEND_PLAYER_PROMOTION,
                    UIConstants.ADMIN_LOG.ACTION_PROMOTE_PLAYER_FROM_RECOMMENDATIONS,
                    UIConstants.ADMIN_LOG.ACTION_PROMOTE_PLAYER,
                    UIConstants.ADMIN_LOG.ACTION_DEMOTE_PLAYER,
                    UIConstants.ADMIN_LOG.ACTION_ACCEPT_ADMIN_GUIDELINES,
                    UIConstants.ADMIN_LOG.ACTION_REJECT_ADMIN_GUIDELINES,
                    UIConstants.ADMIN_LOG.ACTION_RETIRE_ADMIN
                ];
                break;
            }
        }

        Backend.getAdminLogs(this.adminId, null, actions, null, null, offset, limit)
            .then(result => {
                if (typeof result === "object") {
                    this.logs.empty();

                    for (let i = 0; i < result.adminLogs.length; i++) {
                        this.logs.append(result.adminLogs[i].html);
                    }

                    this.topPaginator.empty();
                    this.bottomPaginator.empty();

                    if (result.count > limit) {
                        const topPaginator = AdminUtils.createPaginator(offset, limit, result.count, (newOffset, newLimit, newPage) => {
                            this._getAdminLogs(newOffset, newLimit, newPage);
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

    _handleError(message) {
        alert(message);
    }
};
