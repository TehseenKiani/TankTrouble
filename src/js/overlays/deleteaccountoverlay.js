import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { OverlayManager } from "../overlaymanager.js";
import { UIConstants } from "../tt/ui/uiconstants.js";
import { UITankIcon } from "../tt/ui/uitankicon.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.DeleteAccountOverlay = {
    // jQuery objects.
    deleteAccountWrapper: null,
    deleteAccountIcon: null,
    deleteAccountIconPlaceholder: null,
    deleteAccountHeadline: null,
    deleteAccountForm: null,
    deleteAccountPasswordInput: null,
    deleteAccountSubmitInput: null,

    // Canvas element.
    iconCanvas: null,

    // State.
    initialised: false,
    playerId: null,
    playerDetails: null,

    _initialise() {
        this.deleteAccountWrapper = $("<div class='account centre'/>");
        this.deleteAccountIcon = $("<canvas class='icon'></canvas>");
        this.iconCanvas = this.deleteAccountIcon[0];
        this.deleteAccountIconPlaceholder = $(`<img class='icon' src='${UITankIcon.getImageUrl("placeholder", UIConstants.TANK_ICON_SIZES.LARGE)}' alt=''/>`);
        this.deleteAccountHeadline = $("<div class='headline'>Are you sure?</div>");
        this.deleteAccountForm = $("<form></form>");
        this.deleteAccountPasswordInput = $("<input placeholder='Password' name='password' type='password' autocomplete='new-password' maxlength='32'/>");
        this.deleteAccountSubmitInput = $("<button class='medium warning' type='submit' tabindex='-1'>Delete account</button>");

        this.deleteAccountForm.append(this.deleteAccountHeadline);
        Utils.addOverlayFormRow(this.deleteAccountForm, this.deleteAccountPasswordInput);
        Utils.addOverlayFormRow(this.deleteAccountForm, this.deleteAccountSubmitInput);

        this.deleteAccountWrapper.append(this.deleteAccountIcon);
        this.deleteAccountWrapper.append(this.deleteAccountIconPlaceholder);
        this.deleteAccountWrapper.append(this.deleteAccountForm);

        this.deleteAccountPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });

        this.deleteAccountForm.submit(event => {
            this._sendDeleteUser();
            return false;
        });

        this.deleteAccountPasswordInput.keydown(event => {
            return this._checkKeyDown(event, null);
        });

        this.deleteAccountPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        // Set the canvas size.
        this.iconCanvas.width = UIConstants.TANK_ICON_WIDTHS[UIConstants.TANK_ICON_SIZES.LARGE];
        this.iconCanvas.height = UIConstants.TANK_ICON_HEIGHTS[UIConstants.TANK_ICON_SIZES.LARGE];

        this.initialised = true;
    },

    /** Expected params:
     * playerId
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store playerId.
        this.playerId = params.playerId;

        // Reset player details.
        this.playerDetails = null;

        // Reset input values.
        this.deleteAccountPasswordInput.val("");

        // Reset submit button.
        this.deleteAccountSubmitInput.prop("disabled", false);

        // Show icon placeholder.
        this.deleteAccountIconPlaceholder.show();
        this.deleteAccountIcon.hide();

        // Prefill all info and update icon.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.playerDetails = result;

                    this.deleteAccountPasswordInput.focus();

                    UITankIcon.loadPlayerTankIcon(this.iconCanvas, UIConstants.TANK_ICON_SIZES.LARGE, this.playerId).then(() => {
                        // Show icon.
                        this.deleteAccountIconPlaceholder.hide();
                        this.deleteAccountIcon.show();
                    });
                } else {
                    TankTrouble.ErrorBox.show("Could not retrieve your information.<br/>Please try again.");

                    OverlayManager.popOverlay(false, true);
                }
            });
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.deleteAccountPasswordInput.blur();

        // Reset classes.
        this.deleteAccountPasswordInput.removeClass("inputAccepted inputRejected");

        // Reset tooltips
        Utils.updateTooltip(this.deleteAccountPasswordInput, "");
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.deleteAccountWrapper;
    },

    shouldHide() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.deleteAccountSubmitInput.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _sendDeleteUser() {
        if (!this.initialised) {
            this._initialise();
        }

        this.deleteAccountSubmitInput.prop("disabled", true);

        let password = this.deleteAccountPasswordInput.val().trim();
        if (password !== "") {
            // Don't perform further input validation on the client,
            // to avoid inconsistencies between server and client
            // validation

            password = Utils.utf8ToBase64(password);

            // Submit
            Backend.deleteUser(this.playerId, password)
                .then(result => {
                    if (result === true) {
                        // Remove authenticated user.
                        Users.removeAuthenticatedUser(this.playerId);

                        // Enqueue message overlay.
                        OverlayManager.pushOverlay(
                            TankTrouble.MessageOverlay,
                            {
                                headline: "Your tank will be scrapped in two weeks",
                                message: "All your purchases, progress and hard work will be gone. Forever!<br><br>If you change your mind, just log in to your account within two weeks to cancel the deletion."
                            }
                        );
                    } else {
                        this._showErrorMessage(result);
                    }
                })
                .catch(message => {
                    this._showErrorMessage(message);
                });
        } else {
            this._showErrorMessage("Fill out password");
        }
    },

    _checkKeyDown(event, moveToOnEnter) {
        if (!this.initialised) {
            this._initialise();
        }

        if (event.which === 13) {
            if (moveToOnEnter) {
                moveToOnEnter.focus();
            } else if (this.deleteAccountSubmitInput.prop("disabled") === false) {
                event.currentTarget.blur();
                this.deleteAccountForm.submit();
            }
            return false;
        }
        return true;
    },

    _showErrorMessage(message) {
        this.deleteAccountPasswordInput.addClass("inputRejected");
        Utils.updateTooltip(this.deleteAccountPasswordInput, message);
        this.deleteAccountPasswordInput.focus();

        this.deleteAccountSubmitInput.prop("disabled", false);
    }
};
