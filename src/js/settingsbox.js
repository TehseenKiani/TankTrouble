import { TankTrouble } from "./tanktrouble.js";
import { Images } from "./images.js";
import { animate, utils } from "animejs";
import { ClientManager } from "./clientmanager.js";
import { GameSession } from "./gamesession.js";
import { QualityManager } from "./qualitymanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";

TankTrouble.SettingsBox = {
    // jQuery objects.
    settings: null,
    settingsContent: null,
    settingsTabTop: null,
    settingsServerTitleDiv: null,
    settingsServerForm: null,
    settingsServerSelect: null,
    settingsServerOptions: [],
    settingsQualityTitleDiv: null,
    settingsQualityForm: null,
    settingsQualitySelect: null,
    settingsQualityOptions: [],

    settingsBackground: null,

    refreshServerStatsInterval: null,

    // State.
    showing: false,

    init() {
        // FIXME Define this custom select menu somewhere else.
        // Create a custom select menu, called 'iconselectmenu', which defines a custom render function.
        $.widget("custom.iconselectmenu", $.ui.selectmenu, {
            _renderItem(ul, item) {
                const li = $("<li>");
                const wrapper = $("<div>", {
                    text: item.label
                });

                if (item.disabled) {
                    li.addClass("ui-state-disabled");
                }

                if (item.element.attr("data-image")) {
                    $(`<div><img ${Images.attributes(item.element.attr("data-image"))}/></div>`).addClass("ui-icon").appendTo(wrapper);
                }

                if (item.element.attr("data-description")) {
                    $(`<div style='font-size: 0.7em;'>${item.element.attr("data-description")}</div>`).appendTo(wrapper);
                }

                return li.append(wrapper).appendTo(ul);
            },

            refresh() {
                this._super();

                const selectedItem = this.element.find("option:selected");
                const selectedDescription = selectedItem.attr("data-description");

                if (selectedDescription) {
                    this.buttonItem.text(`${selectedItem.text()} ${selectedDescription}`);
                }
            }
        });

        this.settings = $("<div class='box noselect' id='settings'></div>");
        this.settingsContent = $("<div class='content'></div>");
        this.settingsTabTop = $("<div class='tab topRight'></div>");
        this.settingsServerTitleDiv = $("<div class='spaced'>Server:</div>");
        this.settingsServerForm = $("<form class='spaced'></form>");
        this.settingsServerSelect = $("<select/>");

        const servers = ClientManager.getAvailableServers();
        const serverIds = Object.keys(servers);
        for (let i = 0; i < serverIds.length; ++i) {
            const serverData = servers[serverIds[i]];
            const option = $(`<option disabled value='${serverIds[i]}' data-image='header/pingTimeNoConnection.png' data-description=' (N/A ms)'>${serverData.name}</option>`);

            this.settingsServerOptions.push(option);
        }

        this.settingsQualityTitleDiv = $("<div class='spaced'>Quality:</div>");
        this.settingsQualityForm = $("<form class='spaced'></form>");
        this.settingsQualitySelect = $("<select/>");

        this.settingsQualityOptions.push($(`<option selected value='auto' data-image='header/pingTimeNoConnection.png' data-description=' (N/A fps)'>Auto</option>`), $("<option value='high'>High</option>"), $("<option value='low'>Low</option>"));

        this.settingsBackground = $("<div class='boxbackground'></div>");

        for (let i = 0; i < this.settingsServerOptions.length; ++i) {
            this.settingsServerSelect.append(this.settingsServerOptions[i]);
        }

        this.settingsServerForm.append(this.settingsServerSelect);

        for (let i = 0; i < this.settingsQualityOptions.length; ++i) {
            this.settingsQualitySelect.append(this.settingsQualityOptions[i]);
        }

        this.settingsQualityForm.append(this.settingsQualitySelect);

        this.settingsContent.append(this.settingsTabTop);

        this.settingsContent.append(this.settingsServerTitleDiv);
        this.settingsContent.append(this.settingsServerForm);

        this.settingsContent.append(this.settingsQualityTitleDiv);
        this.settingsContent.append(this.settingsQualityForm);

        this.settings.append(this.settingsContent);

        $("body").append(this.settingsBackground);
        $("body").append(this.settings);

        this.settingsBackground.hide();
        this.settings.hide();

        this.settingsBackground.click(event => {
            if (this.showing) {
                this.hide();
            }
        });

        // Place content according to UI constants.
        this.settingsServerSelect.css("width", UIConstants.SETTINGS_WIDTH - 10);
        this.settingsServerSelect.css("height", UIConstants.SETTINGS_SERVER_SELECT_HEIGHT);
        this.settingsQualitySelect.css("width", UIConstants.SETTINGS_WIDTH - 10);
        this.settingsQualitySelect.css("height", UIConstants.SETTINGS_QUALITY_SELECT_HEIGHT);

        // Set the selected server.
        if (Cookies.get("multiplayerserverid")) {
            this.settingsServerSelect.val(Cookies.get("multiplayerserverid"));
        }

        // Set the selected quality.
        if (Cookies.get("quality")) {
            this.settingsQualitySelect.val(Cookies.get("quality"));
        }

        // Use custom jQuery UI icon select menu.
        this.settingsServerSelect.iconselectmenu({
            change: (event, ui) => { this._changeServer(event, ui); }
        }).iconselectmenu("menuWidget").addClass("ui-menu-icons").css("max-height", UIConstants.SETTINGS_SERVER_MAX_OPTION_HEIGHT);

        // Use custom jQuery UI icon select menu.
        this.settingsQualitySelect.iconselectmenu({
            change: (event, ui) => { this._changeQuality(event, ui); }
        }).iconselectmenu("menuWidget").addClass("ui-menu-icons").css("max-height", UIConstants.SETTINGS_QUALITY_MAX_OPTION_HEIGHT);

        this.initialised = true;

        QualityManager.addEventListener(this._qualityEventHandler, this);

        // Set correct state on quality select.
        this._setQuality(QualityManager.getQuality());

        // Refresh the server list every minute.
        this.refreshServerStatsInterval = setInterval(() => { this._refreshServerStats(); }, UIConstants.REFRESH_SERVER_STATS_INTERVAL);

        // Refresh it with a slight delay to get more accurate timings.
        setTimeout(() => { this._refreshServerStats(); }, UIConstants.INITIAL_SERVER_STATS_DELAY);
    },

    show(x, y, preferredRadius) {
        this.settings.show();
        this.settingsBackground.fadeIn(200);

        this.showing = true;

        this.settings.removeClass("left right top bottom");

        this.settings.position({ my: "right top", at: `left+${x + 35} top+${y + preferredRadius + 30}`, of: $(document), collision: "none" });  // +35 to account for position of tab, +30 to account for size of tab.
        this.settings.addClass("topRight");

        this.settings.css({ opacity: 0, transformOrigin: "225px -35px" });
        utils.set(this.settings[0], { scale: 0.1 });
        animate(this.settings[0], { scale: 1, duration: 300, ease: "outBack" });
        this.settings.animate({ opacity: 1 }, { duration: 200, queue: false });

        GameSession.disableGameInput();

        // Reset input values.
    },

    hide() {
        animate(this.settings[0], {
            scale: 0,
            duration: 200,
            ease: "inQuad",
            onComplete: () => {
                this.settings.hide();
                utils.set(this.settings[0], { scale: 1 });
            }
        });
        this.settings.animate({ opacity: 0 }, { duration: 200, queue: false });
        this.settingsBackground.fadeOut(200);

        TankTrouble.SettingsButton.close();

        this.settingsServerSelect.iconselectmenu("widget").blur();
        this.settingsQualitySelect.iconselectmenu("widget").blur();

        this.showing = false;

        GameSession.enableGameInput();
    },

    setServer(serverId) {
        if (this.settingsServerSelect) {
            this.settingsServerSelect.val(serverId);
            this.settingsServerSelect.iconselectmenu("refresh");
        }
    },

    enableServer(serverId, latency) {
        if (this.settingsServerSelect) {
            const option = this.settingsServerSelect.find(`option[value='${serverId}']`);

            option.removeAttr("disabled");
            option.attr("data-description", ` (${latency} ms)`);
            if (latency < UIConstants.MAXIMUM_GOOD_LATENCY) {
                option.attr("data-image", "header/pingTimeGood.png");
            } else if (latency < UIConstants.MAXIMUM_AVERAGE_LATENCY) {
                option.attr("data-image", "header/pingTimeAverage.png");
            } else {
                option.attr("data-image", "header/pingTimeBad.png");
            }

            this.settingsServerSelect.iconselectmenu("refresh");
        }
    },

    disableServer(serverId) {
        if (this.settingsServerSelect) {
            const option = this.settingsServerSelect.find(`option[value='${serverId}']`);

            option.attr("disabled", "disabled");
            option.attr("data-description", " Offline");
            option.attr("data-image", "header/pingTimeNoConnection.png");

            this.settingsServerSelect.iconselectmenu("refresh");
        }
    },

    _changeServer(event, ui) {
        this.hide();
        ClientManager.selectMultiplayerServer(ui.item.value);
    },

    _refreshServerStats() {
        ClientManager.getAvailableServerStats((success, serverId, latency, gameCount, playerCount, message) => {
            if (success) {
                // Enable server.
                this.enableServer(serverId, latency);
            } else {
                // Disable server.
                this.disableServer(serverId);
            }
        });
    },

    _setQuality(quality) {
        this.settingsQualitySelect.val(quality);
        this.settingsQualitySelect.iconselectmenu("refresh");
    },

    _updateFps(fps) {
        const option = this.settingsQualitySelect.find("option[value='auto']");
        if (fps) {
            option.attr("data-description", ` (${Math.floor(fps)} fps)`);
            if (fps > UIConstants.MINIMUM_GOOD_FPS) {
                option.attr("data-image", "header/pingTimeGood.png");
            } else if (fps > UIConstants.MINIMUM_AVERAGE_FPS) {
                option.attr("data-image", "header/pingTimeAverage.png");
            } else {
                option.attr("data-image", "header/pingTimeBad.png");
            }
        } else {
            option.attr("data-description", " (N/A fps)");
            option.attr("data-image", "header/pingTimeNoConnection.png");
        }

        this.settingsQualitySelect.iconselectmenu("refresh");
    },

    _changeQuality(event, ui) {
        this.hide();
        QualityManager.setQuality(ui.item.value);
    },

    _qualityEventHandler(self, evt, data) {
        switch (evt) {
            case QualityManager.EVENTS.QUALITY_SET:
            {
                self._setQuality(data);

                break;
            }
            case QualityManager.EVENTS.FPS_UPDATED:
            {
                self._updateFps(data);

                break;
            }
        }
    }
};
