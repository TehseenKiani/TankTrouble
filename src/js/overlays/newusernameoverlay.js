import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { ClientManager } from "../clientmanager.js";
import { OverlayManager } from "../overlaymanager.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.NewUsernameOverlay = {
    // jQuery objects.
    wrapper: null,
    headline: null,
    usernameHeadline: null,
    form: null,
    newUsernameInput: null,
    submitInput: null,

    // State.
    initialised: false,
    showing: false,
    playerId: null,

    _initialise() {
        this.wrapper = $("<div class='account centre'/>");
        this.headline = $("<div class='headline'>Your username <span class='username'></span> is not allowed</div>");
        this.usernameHeadline = this.headline.find(".username");
        this.form = $("<form></form>");
        this.newUsernameInput = $("<input class='username' placeholder='New username' name='username' type='text' autocomplete='username' maxlength='32'/>");
        this.submitInput = $("<button class='medium' type='submit' tabindex='-1'>Change my username</button>");

        Utils.restrictInput(this.newUsernameInput, "-_", 32);

        this.form.append(this.headline);
        Utils.addOverlayFormRow(this.form, this.newUsernameInput);
        Utils.addOverlayFormRow(this.form, this.submitInput);

        this.wrapper.append(this.form);

        this.newUsernameInput.tooltipster({ side: "right", theme: "tooltipster-error" });

        this.form.submit(event => {
            this._sendChangeUsername();
            return false;
        });

        this.newUsernameInput.blur(event => {
            this._checkUsername();
        });

        this.newUsernameInput.keydown(event => {
            return this._checkKeyDown(event, null);
        });

        this.newUsernameInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

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

        this.showing = true;

        // Reset values.
        this.usernameHeadline.text("");
        this.newUsernameInput.val("");

        // Reset submit button.
        this.submitInput.prop("disabled", false);

        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.usernameHeadline.text(result.getUsername());
                } else {
                    OverlayManager.popOverlay(false, true);
                }
            });

        // Leave game if inside an online one.
        if (ClientManager.getClient().getCurrentGameId()) {
            ClientManager.getClient().leaveGame(true);
        }

        this.newUsernameInput.focus();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.showing = false;

        this.newUsernameInput.blur();

        // Reset classes.
        this.newUsernameInput.removeClass("inputAccepted inputRejected");

        // Reset tooltip
        Utils.updateTooltip(this.newUsernameInput, "");
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.wrapper;
    },

    shouldHide() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.submitInput.prop("disabled") === false;
    },

    canBeCancelled() {
        return false;
    },

    _sendChangeUsername() {
        if (!this.initialised) {
            this._initialise();
        }

        this.submitInput.prop("disabled", true);

        const newUsername = this.newUsernameInput.val().trim();
        if (newUsername !== "") {
            // Don't perform further input validation on the client,
            // to avoid inconsistencies between server and client
            // validation

            // Submit
            Backend.setUsername(this.playerId, newUsername, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        this._showErrorMessage(result.message, result.inputField, true);
                    } else {
                        OverlayManager.replaceOverlay(
                            TankTrouble.MessageOverlay,
                            { headline: "Alright!", message: "Your username has been changed", preserveOverlayQueue: true },
                            true
                        );

                        Users.updateUser(this.playerId, false, true);
                    }
                })
                .catch(message => {
                    this._showErrorMessage(message);
                });
        } else {
            this._showErrorMessage("Fill out username", "username", true);
        }
    },

    _checkUsername() {
        this.newUsernameInput.removeClass("inputAccepted inputRejected");
        Utils.updateTooltip(this.newUsernameInput, "");
        const username = this.newUsernameInput.val().trim();
        // Do a check if still showing and field is not empty.
        if (this.showing && username !== "") {
            Backend.checkUsername(username, this.playerId)
                .then(result => {
                    if (this.showing) {
                        if (result === true) {
                            this.newUsernameInput.addClass("inputAccepted");
                        } else {
                            this._showErrorMessage(result.message, result.inputField, false);
                        }
                    }
                })
                .catch(message => {
                    if (this.showing) {
                        this._showErrorMessage(message);
                    }
                });
        }
    },

    _checkKeyDown(event, moveToOnEnter) {
        if (!this.initialised) {
            this._initialise();
        }

        if (event.which === 13) {
            if (moveToOnEnter) {
                moveToOnEnter.focus();
            } else if (this.submitInput.prop("disabled") === false) {
                event.currentTarget.blur();
                this.form.submit();
            }
            return false;
        }
        return true;
    },

    _showErrorMessage(message, inputField, setFocus) {
        // Set focus to relevant input field.
        if (inputField !== undefined) {
            switch (inputField) {
                case "username": {
                    this.newUsernameInput.addClass("inputRejected");
                    Utils.updateTooltip(this.newUsernameInput, message);
                    if (setFocus) {
                        this.newUsernameInput.focus();
                    }
                    break;
                }
            }
        }
        this.submitInput.prop("disabled", false);
    }
};
