import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { Backend } from "../backend.js";

TankTrouble.AdminStatisticsOverlay = {
    // jQuery objects.
    wrapper: null,
    navigation: null,
    period: null,
    forumStatistics: null,
    adminStatistics: null,

    // State.
    adminId: null,
    initialised: false,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $("<div class='admin statistics'/>");
        this.navigation = new AdminOverlayNavigation();
        this.period = $("<select/>");
        this.period.append("<option value='thisMonth'>This month</option>");
        this.period.append("<option value='lastMonth'>Last month</option>");
        this.period.append("<option value='thisYear'>This year</option>");
        this.period.append("<option value='lastYear'>Last year</option>");
        this.period.append("<option value='allTime'>All time</option>");
        this.forumStatistics = $('<div class="section"/>');
        this.adminStatistics = $("<div/>");
        this.adminStatistics.on("mouseenter mouseleave", "td", event => {
            const headerCells = this.adminStatistics.find("tr:first-child td");
            headerCells.removeClass("highlight");
            headerCells.eq($(event.currentTarget).index()).addClass("highlight");
        });

        this.wrapper.append(
            this.navigation.element,
            '<div class="header">Statistics</div>',
            $('<div class="section"/>').append(this.period),
            this.forumStatistics,
            this.adminStatistics
        );

        this.period.change(() => {
            this._getStatistics();
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

        this._getStatistics();
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

    _getStatistics() {
        this.forumStatistics.html('<div class="subHeader">Loading...</div>');
        this.adminStatistics.empty();

        let minTime = null;
        let maxTime = null;

        const date = new Date();
        switch (this.period.val()) {
            case "thisMonth": {
                minTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth()) / 1000;
                break;
            }
            case "lastMonth":
            {
                let year = date.getUTCFullYear();
                let month = date.getUTCMonth() - 1;
                if (month < 0) {
                    month += 12;
                    year--;
                }
                minTime = Date.UTC(year, month) / 1000;
                maxTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth()) / 1000;
                break;
            }
            case "thisYear": {
                minTime = Date.UTC(date.getUTCFullYear(), 0) / 1000;
                break;
            }
            case "lastYear": {
                minTime = Date.UTC(date.getUTCFullYear() - 1, 0) / 1000;
                maxTime = Date.UTC(date.getUTCFullYear(), 0) / 1000;
                break;
            }
        }

        Backend.getAdminStatistics(this.adminId, minTime, maxTime)
            .then(result => {
                if (typeof result === "object") {
                    this.forumStatistics.html(result.forumHtml);
                    this.adminStatistics.html(result.adminHtml);
                } else {
                    this._handleError(result);
                }
            })
            .catch(message => {
                this._handleError(message);
            });
    },

    _handleError(message) {
        alert(message);
        this.forumStatistics.empty();
    }
};
