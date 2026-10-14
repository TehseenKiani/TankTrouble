import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.NewPasswordOverlay = {
    // jQuery objects.
    newPasswordWrapper: null,
    newPasswordHeadline: null,
    newPasswordUsername: null,
    newPasswordForm: null,
    newPasswordNewPasswordInput: null,
    newPasswordConfirmNewPasswordInput: null,
    newPasswordSubmitInput: null,

    // State.
    initialised: false,
    showing: false,
    playerId: null,
    token: null,

    _initialise() {
        this.newPasswordWrapper = $("<div class='account centre'/>");
        this.newPasswordHeadline = $("<div class='headline'>Recover the account of</div>");
        this.newPasswordUsername = $("<div class='username huge'></div>");
        this.newPasswordForm = $("<form></form>");
        this.newPasswordNewPasswordInput = $("<input placeholder='New password' name='password' type='password' autocomplete='new-password' maxlength='32'/>");
        this.newPasswordConfirmNewPasswordInput = $("<input placeholder='Confirm new password' name='confirmpassword' type='password' autocomplete='new-password' maxlength='32'/>");
        this.newPasswordSubmitInput = $("<button class='medium' type='submit' tabindex='-1'>Recover my account</button>");

        this.newPasswordForm.append(this.newPasswordHeadline);
        this.newPasswordForm.append(this.newPasswordUsername);
        Utils.addOverlayFormRow(this.newPasswordForm, this.newPasswordNewPasswordInput);
        Utils.addOverlayFormRow(this.newPasswordForm, this.newPasswordConfirmNewPasswordInput);
        Utils.addOverlayFormRow(this.newPasswordForm, this.newPasswordSubmitInput);

        this.newPasswordWrapper.append(this.newPasswordForm);

        this.newPasswordNewPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.newPasswordConfirmNewPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });

        this.newPasswordForm.submit(event => {
            this._sendRecoverAccount();
            return false;
        });

        this.newPasswordNewPasswordInput.blur(event => {
            this._checkPasswords();
        });

        this.newPasswordNewPasswordInput.keydown(event => {
            return this._checkKeyDown(event, this.newPasswordConfirmNewPasswordInput);
        });

        this.newPasswordConfirmNewPasswordInput.blur(event => {
            this._checkPasswords();
        });

        this.newPasswordConfirmNewPasswordInput.keydown(event => {
            return this._checkKeyDown(event, null);
        });

        this.newPasswordNewPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.newPasswordConfirmNewPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.initialised = true;
    },

    /** Expected params:
     * playerId
     * token
     * username
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store playerId, token and username.
        this.playerId = params.playerId;
        this.token = params.token;
        this.username = params.username;

        this.showing = true;

        // Reset input values.
        this.newPasswordNewPasswordInput.val("");
        this.newPasswordConfirmNewPasswordInput.val("");

        // Reset submit button.
        this.newPasswordSubmitInput.prop("disabled", false);

        this.newPasswordUsername.text(this.username);

        this.newPasswordNewPasswordInput.focus();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.showing = false;

        this.newPasswordNewPasswordInput.blur();
        this.newPasswordConfirmNewPasswordInput.blur();

        // Reset classes.
        this.newPasswordNewPasswordInput.removeClass("inputAccepted inputRejected");
        this.newPasswordConfirmNewPasswordInput.removeClass("inputAccepted inputRejected");

        // Reset tooltips
        Utils.updateTooltip(this.newPasswordNewPasswordInput, "");
        Utils.updateTooltip(this.newPasswordConfirmNewPasswordInput, "");
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.newPasswordWrapper;
    },

    shouldHide() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.newPasswordSubmitInput.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _sendRecoverAccount() {
        if (!this.initialised) {
            this._initialise();
        }

        this.newPasswordSubmitInput.prop("disabled", true);

        let newPassword = this.newPasswordNewPasswordInput.val().trim();
        let confirmNewPassword = this.newPasswordConfirmNewPasswordInput.val().trim();
        if (newPassword !== "" && confirmNewPassword !== "") {
            // Don't perform further input validation on the client,
            // to avoid inconsistencies between server and client
            // validation

            newPassword = Utils.utf8ToBase64(newPassword);
            confirmNewPassword = Utils.utf8ToBase64(confirmNewPassword);

            // Submit
            Backend.recoverAccount(this.playerId, this.token, newPassword, confirmNewPassword)
                .then(result => {
                    if (typeof result.inputField === "string") {
                        this._showErrorMessage(result.message, result.inputField, true);
                    } else {
                        OverlayManager.replaceOverlay(
                            TankTrouble.MessageOverlay,
                            { headline: result.headline, message: result.message },
                            true
                        );
                    }
                })
                .catch(message => {
                    this._showErrorMessage(message);
                });
        } else if (newPassword === "") {
            this._showErrorMessage("Fill out password", "password", true);
        } else if (confirmNewPassword === "") {
            this._showErrorMessage("Confirm password", "confirmPassword", true);
        }
    },

    _checkPasswords() {
        this.newPasswordNewPasswordInput.removeClass("inputAccepted inputRejected");
        this.newPasswordConfirmNewPasswordInput.removeClass("inputAccepted inputRejected");
        Utils.updateTooltip(this.newPasswordNewPasswordInput, "");
        Utils.updateTooltip(this.newPasswordConfirmNewPasswordInput, "");
        let password = this.newPasswordNewPasswordInput.val().trim();
        let confirmPassword = this.newPasswordConfirmNewPasswordInput.val().trim();
        // Do a check if still showing and field is not empty.
        if (this.showing && password !== "") {
            password = Utils.utf8ToBase64(password);
            confirmPassword = Utils.utf8ToBase64(confirmPassword);

            Backend.checkPasswords(password, confirmPassword, this.username)
                .then(result => {
                    if (result !== true) {
                        this._showErrorMessage(result.message, result.inputField, false);
                    }
                })
                .catch(message => {
                    this._showErrorMessage(message);
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
            } else if (this.newPasswordSubmitInput.prop("disabled") === false) {
                event.currentTarget.blur();
                this.newPasswordForm.submit();
            }
            return false;
        }
        return true;
    },

    _showErrorMessage(message, inputField, setFocus) {
        // Set focus to relevant input field.
        if (inputField !== undefined) {
            switch (inputField) {
                case "password": {
                    this.newPasswordNewPasswordInput.addClass("inputRejected");
                    Utils.updateTooltip(this.newPasswordNewPasswordInput, message);
                    if (setFocus) {
                        this.newPasswordNewPasswordInput.focus();
                    }
                    break;
                }
                case "confirmPassword": {
                    this.newPasswordConfirmNewPasswordInput.addClass("inputRejected");
                    Utils.updateTooltip(this.newPasswordConfirmNewPasswordInput, message);
                    if (setFocus) {
                        this.newPasswordConfirmNewPasswordInput.focus();
                    }
                    break;
                }
            }
        }
        this.newPasswordSubmitInput.prop("disabled", false);
    }
};
