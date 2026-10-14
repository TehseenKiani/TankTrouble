import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { AdminUtils } from "../adminutils.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { UIConstants } from "../tt/ui/uiconstants.js";

TankTrouble.AdminDashboardOverlay = {
    // jQuery objects.
    wrapper: null,
    navigation: null,
    header: null,
    logs: null,
    forumGuidelines: null,

    // State.
    adminId: null,
    initialised: false,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $("<div class='admin dashboard'/>");
        this.navigation = new AdminOverlayNavigation();
        this.header = $("<div class='subHeader'>Important logs in the last 14 days</div>");
        this.logs = $("<div class='section'/>");
        this.forumGuidelines = $('<div class="section"/>');

        this.wrapper.append(
            this.navigation.element,
            '<div class="header">Dashboard</div>',
            $('<div class="section"/>').append(AdminUtils.getCodex()),
            this.header,
            this.logs,
            this.forumGuidelines
        );

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

        this.header.hide();
        this.logs.empty();
        this.forumGuidelines.empty();

        this.navigation.update(this.adminId);

        Backend.getAdminLogs(
            this.adminId,
            null,
            [
                UIConstants.ADMIN_LOG.ACTION_BAN_PLAYER,
                UIConstants.ADMIN_LOG.ACTION_REMOVE_PLAYER_BAN,
                UIConstants.ADMIN_LOG.ACTION_RECOMMEND_PLAYER_PROMOTION,
                UIConstants.ADMIN_LOG.ACTION_PROMOTE_PLAYER_FROM_RECOMMENDATIONS,
                UIConstants.ADMIN_LOG.ACTION_PROMOTE_PLAYER,
                UIConstants.ADMIN_LOG.ACTION_DEMOTE_PLAYER,
                UIConstants.ADMIN_LOG.ACTION_RETIRE_ADMIN,
                UIConstants.ADMIN_LOG.ACTION_ACCEPT_ADMIN_GUIDELINES,
                UIConstants.ADMIN_LOG.ACTION_REJECT_ADMIN_GUIDELINES,
                UIConstants.ADMIN_LOG.ACTION_DELETE_ACCOUNT
            ],
            null,
            Math.floor(Date.now() / 1000) - (14 * 24 * 60 * 60),      // 14 days back
            0,
            100
        )
            .then(result => {
                if (typeof result === "object") {
                    if (result.count > 0) {
                        this.header.show();
                        for (let i = 0; i < result.adminLogs.length; i++) {
                            this.logs.append(result.adminLogs[i].html);
                        }
                    }
                } else {
                    this._handleError(result, true);
                }
            })
            .catch(message => {
                this._handleError(message, true);
            });

        Backend.getPlayerDetails(this.adminId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.forumGuidelines.html(AdminUtils.getForumGuidelines(result.getGmLevel()));
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
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

    _handleError(message) {
        alert(message);
    }
};
