import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { ClientManager } from "../clientmanager.js";
import { OverlayManager } from "../overlaymanager.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.NewEmailOverlay = {
    // jQuery objects.
    wrapper: null,
    headline: null,
    usernameHeadline: null,
    message: null,
    form: null,
    newEmailInput: null,
    submitInput: null,

    // State.
    initialised: false,
    showing: false,
    playerId: null,

    _initialise() {
        this.wrapper = $("<div class='account centre'/>");
        this.headline = $("<div class='headline'>The email of <span class='username'></span> was deleted</div>");
        this.message = $("<div>You must have a valid email to play</div>");
        this.usernameHeadline = this.headline.find(".username");
        this.form = $("<form></form>");
        this.newEmailInput = $("<input placeholder='New email' name='email' type='text' autocomplete='email' maxlength='128'/>");
        this.submitInput = $("<button class='medium' type='submit' tabindex='-1'>Set my email</button>");

        Utils.restrictInput(this.newEmailInput, "_+-&*%@.", 128);

        this.form.append(this.headline, this.message);
        Utils.addOverlayFormRow(this.form, this.newEmailInput);
        Utils.addOverlayFormRow(this.form, this.submitInput);

        this.wrapper.append(this.form);

        this.newEmailInput.tooltipster({ side: "right", theme: "tooltipster-error" });

        this.form.submit(event => {
            this._sendChangeEmail();
            return false;
        });

        this.newEmailInput.blur(event => {
            this._checkEmail();
        });

        this.newEmailInput.keydown(event => {
            return this._checkKeyDown(event, null);
        });

        this.newEmailInput.focus(event => {
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
        this.newEmailInput.val("");

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

        this.newEmailInput.focus();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.showing = false;

        this.newEmailInput.blur();

        // Reset classes.
        this.newEmailInput.removeClass("inputAccepted inputRejected");

        // Reset tooltip
        Utils.updateTooltip(this.newEmailInput, "");
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

    _sendChangeEmail() {
        if (!this.initialised) {
            this._initialise();
        }

        this.submitInput.prop("disabled", true);

        const newEmail = this.newEmailInput.val().trim();
        if (newEmail !== "") {
            // Don't perform further input validation on the client,
            // to avoid inconsistencies between server and client
            // validation

            // Submit
            Backend.setEmail(this.playerId, newEmail, Caches.getEmailCache())
                .then(result => {
                    if (typeof result === "object") {
                        this._showErrorMessage(result.message, result.inputField, true);
                    } else {
                        OverlayManager.replaceOverlay(
                            TankTrouble.MessageOverlay,
                            { headline: "Alright!", message: "Your email has been set" },
                            true
                        );

                        Users.updateUser(this.playerId, false, false);
                    }
                })
                .catch(message => {
                    this._showErrorMessage(message);
                });
        } else {
            this._showErrorMessage("Fill out email", "email", true);
        }
    },

    _checkEmail() {
        this.newEmailInput.removeClass("inputAccepted inputRejected");
        Utils.updateTooltip(this.newEmailInput, "");
        const email = this.newEmailInput.val().trim();
        // Do a check if still showing and field is not empty.
        if (this.showing && email !== "") {
            Backend.checkEmail(email, true)
                .then(result => {
                    if (this.showing) {
                        if (result === true) {
                            this.newEmailInput.addClass("inputAccepted");
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
                case "email": {
                    this.newEmailInput.addClass("inputRejected");
                    Utils.updateTooltip(this.newEmailInput, message);
                    if (setFocus) {
                        this.newEmailInput.focus();
                    }
                    break;
                }
            }
        }
        this.submitInput.prop("disabled", false);
    }
};
