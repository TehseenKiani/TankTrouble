import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";

TankTrouble.AdminServerLogOverlay = {
    // jQuery objects.
    wrapper: null,
    navigation: null,
    searchInput: null,
    searchButton: null,
    log: null,

    // State.
    initialised: false,
    adminId: null,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $('<div class="admin serverLog"/>');
        this.navigation = new AdminOverlayNavigation();
        this.searchInput = $('<input type="text"/>');
        this.searchButton = $('<button class="small" type="button" tabindex="-1">Search</button>');
        this.log = $('<div class="section"/>');

        this.wrapper.append(
            this.navigation.element,
            '<div class="header">Server Log</div>',
            $('<div class="section"/>').append(
                this.searchInput,
                this.searchButton
            ),
            this.log
        );

        this.searchInput.on("keyup", event => {
            if (event.keyCode === 13 && this.searchInput.val() !== "") {
                this._search();
            }
        });

        this.searchButton.on("click", () => {
            this._search();
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

        this.searchInput.focus();
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

    _search() {
        this.log.html('<div class="subHeader">Loading...</div>');

        /*
        var offset = 0;
        var limit = 100;
        self = this;
        Backend.searchServerLogEntries(
            function(result) {
                if (Array.isArray(result)) {
                    if (result.length === 0) {
                        self.log.append($('<div>No logs found</div>'));
                    } else {
                        // Generate new results
                        var logSearchResultsHeaderDiv = $('<div style="display: table-header-group;"><div style="display: table-cell;">Time</div><div style="display: table-cell;">Host</div><div style="display: table-cell;">Message</div></div>');
                        self.log.append(logSearchResultsHeaderDiv);
                        for (var i = 0; i < result.length; ++i) {
                            var value = result[i];
                            var timestampSpan = $('<div style="width: 25%; display: table-cell;">' + value.timestamp + '</div>');
                            var servernameSpan = $('<div style="width: 19%; display: table-cell;">' + value.sourceServer + '</div>');
                            var messageSpan = $('<div style="width: 66%; display: table-cell;">' + value.message.replace(/\n/g, "<br>") + '</div>');
                            var resultDiv = $('<div style="border: 1px solid white; border-radius: 3px; margin-bottom: 5px; width: 75%; display: table-row;"/>');
                            resultDiv.append(
                                timestampSpan,
                                servernameSpan,
                                messageSpan);
                            self.log.append(resultDiv);
                        }
                    }
                } else {
                    self._handleError(result, true);
                }
            },
            function(result) {
                self._handleError(result, true);
            },
            null,
            self.adminId,
            self.searchInput.val(),
            offset,
            limit
        );*/
    },

    _handleError(message) {
        alert(message);
    }
};
