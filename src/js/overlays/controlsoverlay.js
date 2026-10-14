import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { Inputs } from "../inputs.js";
import { OverlayManager } from "../overlaymanager.js";
import { UIConstants } from "../tt/ui/uiconstants.js";
import { UITankIcon } from "../tt/ui/uitankicon.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.ControlsOverlay = {
    // jQuery objects.
    controlsWrapper: null,

    controlsHeadline: null,
    controlsUsername: null,
    controlsIcon: null,
    controlsMessage: null,
    controlsForm: null,
    controlsOptionsDiv: null,

    // Canvas element.
    iconCanvas: null,

    // State.
    initialised: false,
    showing: false,
    controlsOptions: {},
    playerId: null,
    count: null,
    animationInterval: null,
    hideTimeout: null,

    _initialise() {
        this.controlsWrapper = $("<div class='controls centre'/>");
        this.controlsHeadline = $("<div class='headline'>Welcome back</div>");
        this.controlsUsername = $("<div class='username huge'></div>");
        this.controlsContent = $("<div class='content'></div>");
        this.controlsIcon = $("<canvas class='icon'></canvas>");
        this.iconCanvas = this.controlsIcon[0];
        this.controlsMessage = $("<div class='headline'>Select your controls</div>");
        this.controlsForm = $("<form></form>");
        this.controlsOptionsDiv = $("<div class='options'></div>");

        const inputSetIds = Inputs.getAllInputSetIds();
        for (let i = 0; i < inputSetIds.length; ++i) {
            const controlsOptionDiv = $("<div class='option'></div>");

            Utils.addImageWithClasses(controlsOptionDiv, "standard", `inputs/${inputSetIds[i]}.png`);
            Utils.addImageWithClasses(controlsOptionDiv, "down", `inputs/${inputSetIds[i]}Down.png`);
            Utils.addImageWithClasses(controlsOptionDiv, "active", `inputs/${inputSetIds[i]}Active.png`);
            Utils.addImageWithClasses(controlsOptionDiv, "selected", `inputs/${inputSetIds[i]}Selected.png`);

            this.controlsOptions[inputSetIds[i]] = controlsOptionDiv;
            this.controlsOptionsDiv.append(controlsOptionDiv);
        }

        this.controlsForm.append(this.controlsMessage);
        this.controlsForm.append(this.controlsOptionsDiv);

        this.controlsWrapper.append(this.controlsHeadline);
        this.controlsWrapper.append(this.controlsUsername);
        this.controlsWrapper.append(this.controlsIcon);
        this.controlsWrapper.append(this.controlsForm);

        // Add click event handlers to all control options.
        const controlOptionIds = Object.keys(this.controlsOptions);
        for (let i = 0; i < controlOptionIds.length; ++i) {
            // Solution with closure and anonymous function. More compact, but is it less readable?
            /*            (function(controlOptionId) {
                self.controlsOptions[controlOptionId].on("click", function(event) {
                    if (!$(this).hasClass("disabled")) {
                        Inputs.updateInputManager(self.playerId, controlOptionId);
                        self._updateOptions();
                    }
                });
            })(controlOptionIds[i]);*/

            // Solution with helper function.
            this._addOptionClick(controlOptionIds[i]);
        }

        // Set the canvas size.
        this.iconCanvas.width = UIConstants.TANK_ICON_WIDTHS[UIConstants.TANK_ICON_SIZES.LARGE];
        this.iconCanvas.height = UIConstants.TANK_ICON_HEIGHTS[UIConstants.TANK_ICON_SIZES.LARGE];

        // Add event listeners.
        Users.addEventListener(this._authenticationEventHandler, this);

        this.initialised = true;
    },

    /** Expected params:
     *  playerId
     * count
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store playerId.
        this.playerId = params.playerId;
        // Store count.
        if (params.count === undefined) {
            this.count = null;
        } else {
            this.count = params.count;
        }

        // Check if user has been signed out while someone else was choosing. Can happen when mp servers detect authentication problems.
        if (!Users.isAnyUser(this.playerId)) {
            OverlayManager.popOverlay(true, true);
            return;
        }

        this.showing = true;

        // Reset username. The linebreak is needed to prevent collapsing of the div.
        this.controlsUsername.html("<br>");

        // Update headline.
        this._updateHeadline();

        // Update options.
        this._updateOptions();

        // Add keyboard shortcuts.
        const controlOptionIds = Object.keys(this.controlsOptions);
        for (let i = 0; i < controlOptionIds.length; ++i) {
            this._addOptionShortcut(controlOptionIds[i]);
        }

        // Show icon.
        this.controlsIcon.hide();

        // Update icon.
        UITankIcon.loadPlayerTankIcon(this.iconCanvas, UIConstants.TANK_ICON_SIZES.LARGE, this.playerId).then(() => {
            // Show icon.
            this.controlsIcon.show();
        });

        // Animate options.
        this.animationInterval = setInterval(
            () => {
                this._animateOptions();
            },
            500
        );

        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.controlsUsername.text(result.getUsername());
                } else {
                    this.controlsUsername.text("<ERROR>");
                }
            });
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.showing = false;

        // Stop options animation.
        clearInterval(this.animationInterval);
        this.animationInterval = null;
        // Stop hide timeout.
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;

        // Remove any shortcut event handlers.
        $(document).off("keyup.controls");
        $(document).off("keydown.controls");
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.controlsWrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return false;
    },

    _addOptionClick(controlOptionId) {
        this.controlsOptions[controlOptionId].on("mouseup", event => {
            if (!$(event.currentTarget).hasClass("disabled")) {
                // Check if user has been signed out while choosing. Can happen when mp servers detect authentication problems.
                if (Users.isAnyUser(this.playerId)) {
                    Inputs.addInputManager(this.playerId, controlOptionId);
                    this._updateOptions();
                }

                clearTimeout(this.hideTimeout);
                this.hideTimeout = setTimeout(
                    () => {
                        OverlayManager.popOverlay(true, false);
                    },
                    UIConstants.CONTROL_SELECTED_WAIT_TIME
                );
            }
        });
    },

    _addOptionShortcut(controlOptionId) {
        // Add keyboard shortcut to keyboard type inputs.
        if (Inputs.getInputSetType(controlOptionId) === "keyboard") {
            const fireKey = Inputs.getFireKey(controlOptionId);
            $(document).on("keyup.controls", event => {
                if (!this.controlsOptions[controlOptionId].hasClass("disabled")) {
                    if (event.which === fireKey) {
                        this.controlsOptions[controlOptionId].removeClass("active");
                        // Check if user has been signed out while choosing. Can happen when mp servers detect authentication problems.
                        if (Users.isAnyUser(this.playerId)) {
                            Inputs.addInputManager(this.playerId, controlOptionId);
                            this._updateOptions();
                        }

                        clearTimeout(this.hideTimeout);
                        this.hideTimeout = setTimeout(
                            () => {
                                OverlayManager.popOverlay(true, false);
                            },
                            UIConstants.CONTROL_SELECTED_WAIT_TIME
                        );

                        event.preventDefault();
                    }
                }
            });

            $(document).on("keydown.controls", event => {
                if (!this.controlsOptions[controlOptionId].hasClass("disabled")) {
                    if (event.which === fireKey) {
                        this.controlsOptions[controlOptionId].addClass("active");
                        event.preventDefault();
                    }
                }
            });
        }
    },

    _updateHeadline() {
        let headline = "";
        if (this.count !== null) {
            headline += `Player ${this.count}:<br/>`;
        }
        if (Users.isAuthenticatedUser(this.playerId)) {
            headline += "Welcome";
        } else {
            headline += "The scientists have named you";
        }
        this.controlsHeadline.html(headline);
    },

    _updateOptions() {
        // Reset classes.
        const controlOptionIds = Object.keys(this.controlsOptions);
        for (let i = 0; i < controlOptionIds.length; ++i) {
            this.controlsOptions[controlOptionIds[i]].removeClass("selected disabled");
        }

        /*        // Reset tooltips
        for (var i = 0; i < this.controlsOptions.length; ++i) {}*/

        // Set currently assigned controls as selected.
        const selectedInputSetId = Inputs.getAssignedInputSetId(this.playerId);
        if (selectedInputSetId !== undefined) {
            this.controlsOptions[selectedInputSetId].addClass("selected");
        }

        // Disable unavailable controls.
        const unavailableInputSetIds = Inputs.getUnavailableInputSetIds();
        for (let i = 0; i < unavailableInputSetIds.length; ++i) {
            this.controlsOptions[unavailableInputSetIds[i]].addClass("disabled");
        }
    },

    _animateOptions() {
        const controlOptionIds = Object.keys(this.controlsOptions);
        for (let i = 0; i < controlOptionIds.length; ++i) {
            this.controlsOptions[controlOptionIds[i]].toggleClass("down");
        }
    },

    _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            case Users.EVENTS.GUEST_REMOVED:
            {
                if (self.showing && data === self.playerId) {
                    OverlayManager.popOverlay(true, true);
                }

                break;
            }
        }
    }
};
