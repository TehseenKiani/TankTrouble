import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { Images } from "../images.js";
import { OverlayManager } from "../overlaymanager.js";
import { Shop } from "../shop.js";
import { UIConstants } from "../tt/ui/uiconstants.js";
import { UITankIcon } from "../tt/ui/uitankicon.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.AccountOverlay = {
    // jQuery objects.
    accountWrapper: null,
    accountIcon: null,
    accountIconPlaceholder: null,
    accountHeadline: null,
    accountForm: null,
    accountUsernameInput: null,
    accountUsernameChangeMessage: null,
    accountNewPasswordInput: null,
    accountConfirmNewPasswordInput: null,
    accountEmailInput: null,
    accountVerificationEmailMessage: null,
    accountResendVerificationEmail: null,
    accountPasswordInput: null,
    accountSubmitInput: null,
    accountDeleteAccount: null,

    // Canvas element.
    iconCanvas: null,

    // State.
    initialised: false,
    showing: false,
    playerId: null,
    playerDetails: null,
    email: null,

    _initialise() {
        this.accountWrapper = $("<div class='account centre'/>");
        this.accountIcon = $("<canvas class='icon'></canvas>");
        this.iconCanvas = this.accountIcon[0];
        this.accountIconPlaceholder = $(`<img class='icon' src='${UITankIcon.getImageUrl("placeholder", UIConstants.TANK_ICON_SIZES.LARGE)}' alt=''/>`);
        this.accountHeadline = $("<div class='headline'>Account info</div>");
        this.accountForm = $("<form></form>");
        this.accountUsernameInput = $("<input class='username' placeholder='Username' type='text' name='username' autocomplete='username' maxlength='32'/>");
        this.accountUsernameChangeMessage = $(`<div class='messageSpacingBottom'><span class='price'>250<img class='currencyIcon' ${Images.attributes("virtualShop/diamond.png")}/></span><span class='big'> to change username</span></div>`);
        this.accountNewPasswordInput = $("<input placeholder='New password' name='password' type='password' autocomplete='new-password' maxlength='32'/>");
        this.accountConfirmNewPasswordInput = $("<input placeholder='Confirm new password' name='confirmpassword' type='password' autocomplete='new-password' maxlength='32'/>");
        this.accountEmailInput = $("<input placeholder='Email' name='email' type='text' autocomplete='email' maxlength='128'/>");
        this.accountVerificationEmailMessage = $("<div class='messageSpacingBottom'></div>");
        this.accountResendVerificationEmail = $("<button class='small' type='button' tabindex='-1' title='Resend verification email'>Verify</button>");
        this.accountPasswordInput = $("<input placeholder='Current password' name='password' type='password' maxlength='32'/>");
        this.accountSubmitInput = $("<button class='medium' type='submit' tabindex='-1'>Update account</button>");
        this.accountDeleteAccount = $("<button class='small warning' type='button' tabindex='-1' title='Delete account'>Delete</button>");

        Utils.restrictInput(this.accountUsernameInput, "-_", 32);
        Utils.restrictInput(this.accountEmailInput, "_+-&*%@.", 128);

        this.accountForm.append(this.accountHeadline);
        Utils.addOverlayFormRow(this.accountForm, this.accountUsernameInput);
        this.accountForm.append(this.accountUsernameChangeMessage);
        Utils.addOverlayFormRow(this.accountForm, this.accountNewPasswordInput);
        Utils.addOverlayFormRow(this.accountForm, this.accountConfirmNewPasswordInput);
        Utils.addSuffix(Utils.addOverlayFormRow(this.accountForm, this.accountEmailInput), this.accountResendVerificationEmail, true);
        this.accountForm.append(this.accountVerificationEmailMessage);
        Utils.addOverlayFormRow(this.accountForm, this.accountPasswordInput);
        Utils.addSuffix(Utils.addOverlayFormRow(this.accountForm, this.accountSubmitInput), this.accountDeleteAccount, true);

        this.accountWrapper.append(this.accountIcon);
        this.accountWrapper.append(this.accountIconPlaceholder);
        this.accountWrapper.append(this.accountForm);

        this.accountUsernameInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.accountNewPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.accountConfirmNewPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.accountEmailInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.accountResendVerificationEmail.tooltipster({ side: "right" });
        this.accountPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.accountDeleteAccount.tooltipster({ side: "right", theme: "tooltipster-error" });

        this.accountForm.submit(event => {
            this._sendAccountUpdate();
            return false;
        });

        this.accountUsernameInput.blur(event => {
            this._checkUsername();
        });

        this.accountUsernameInput.keydown(event => {
            return this._checkKeyDown(event, this.accountNewPasswordInput);
        });

        this.accountNewPasswordInput.blur(event => {
            this._checkPasswords();
        });

        this.accountNewPasswordInput.keydown(event => {
            return this._checkKeyDown(event, this.accountConfirmNewPasswordInput);
        });

        this.accountConfirmNewPasswordInput.blur(event => {
            this._checkPasswords();
        });

        this.accountConfirmNewPasswordInput.keydown(event => {
            return this._checkKeyDown(event, this.accountEmailInput);
        });

        this.accountEmailInput.blur(event => {
            this._checkEmail();
        });

        this.accountEmailInput.keydown(event => {
            return this._checkKeyDown(event, this.accountPasswordInput);
        });

        this.accountResendVerificationEmail.click(event => {
            // Resend verification email.
            Backend.resendVerificationEmail(this.playerId)
                .then(result => {
                    if (result === true) {
                        this.accountResendVerificationEmail.hide();
                        this._updateVerificationEmailMessage("We have sent you an email with verification instructions");
                    } else {
                        this._updateVerificationEmailMessage(result);
                    }
                });
        });

        this.accountPasswordInput.blur(event => {
            this.accountPasswordInput.removeClass("inputRejected");
            this._updateTooltip(this.accountPasswordInput, "");
        });

        this.accountPasswordInput.keydown(event => {
            return this._checkKeyDown(event, null);
        });

        this.accountDeleteAccount.click(event => {
            OverlayManager.pushOverlay(
                TankTrouble.DeleteAccountOverlay,
                { playerId: this.playerId }
            );
        });

        this.accountUsernameInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.accountNewPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.accountConfirmNewPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.accountEmailInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.accountPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        // Set the canvas size.
        this.iconCanvas.width = UIConstants.TANK_ICON_WIDTHS[UIConstants.TANK_ICON_SIZES.LARGE];
        this.iconCanvas.height = UIConstants.TANK_ICON_HEIGHTS[UIConstants.TANK_ICON_SIZES.LARGE];

        this.initialised = true;
    },

    /** Expected params:
     *  playerId
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store playerId.
        this.playerId = params.playerId;

        // Reset player details and email.
        this.playerDetails = null;
        this.email = null;

        this.showing = true;

        // Reset input values.
        this.accountUsernameInput.val("");
        this.accountNewPasswordInput.val("");
        this.accountConfirmNewPasswordInput.val("");
        this.accountEmailInput.val("");
        this.accountPasswordInput.val("");

        // Reset buttons.
        this.accountWrapper.find("button").prop("disabled", false);

        // Reset username change message.
        this.accountUsernameChangeMessage.css({ height: 0, opacity: 0 });

        // Reset email verification message. The linebreak is needed to prevent collapsing of the div.
        this.accountVerificationEmailMessage.html("<br>");

        // Reset resend email verification button.
        this.accountResendVerificationEmail.hide();

        // Show icon placeholder.
        this.accountIconPlaceholder.show();
        this.accountIcon.hide();

        // Prefill all info and update icon.
        Promise.all([
            Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache()),
            Backend.getEmail(this.playerId, Caches.getEmailCache())
        ])
            .then(([playerDetails, email]) => {
                if (this.showing) {
                    if (typeof playerDetails === "object") {
                        this.playerDetails = playerDetails;

                        this.accountUsernameInput.val(playerDetails.getUsername());
                        this.accountUsernameInput.addClass("inputAccepted");
                        this.accountNewPasswordInput.focus();

                        if (typeof email === "string") {
                            this.email = email;

                            if (playerDetails.getVerified()) {
                                this.accountVerificationEmailMessage.text("Verified");
                            } else {
                                this.accountVerificationEmailMessage.text("Your email is not verified. Verify it to use the chat and forum");
                                this.accountResendVerificationEmail.show();
                            }

                            this.accountEmailInput.val(email);
                            this.accountEmailInput.addClass("inputAccepted");
                        } else if (email === null) {
                            this.accountVerificationEmailMessage.text("Your email is not set");
                        } else {
                            TankTrouble.ErrorBox.show("Could not retrieve your information.<br/>Please try again.");

                            OverlayManager.popOverlay(false, true);
                        }

                        UITankIcon.loadPlayerTankIcon(this.iconCanvas, UIConstants.TANK_ICON_SIZES.LARGE, this.playerId).then(() => {
                            // Show icon.
                            this.accountIconPlaceholder.hide();
                            this.accountIcon.show();
                        });
                    } else {
                        TankTrouble.ErrorBox.show("Could not retrieve your information.<br/>Please try again.");

                        OverlayManager.popOverlay(false, true);
                    }
                }
            })
            .catch(message => {
                this.accountUsernameInput.focus();
            });
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.showing = false;

        this.accountUsernameInput.blur();
        this.accountNewPasswordInput.blur();
        this.accountConfirmNewPasswordInput.blur();
        this.accountEmailInput.blur();
        this.accountPasswordInput.blur();

        // Reset classes.
        this.accountUsernameInput.removeClass("inputAccepted inputRejected");
        this.accountNewPasswordInput.removeClass("inputAccepted inputRejected");
        this.accountConfirmNewPasswordInput.removeClass("inputAccepted inputRejected");
        this.accountEmailInput.removeClass("inputAccepted inputRejected");
        this.accountPasswordInput.removeClass("inputAccepted inputRejected");

        // Reset tooltips
        Utils.updateTooltip(this.accountUsernameInput, "");
        Utils.updateTooltip(this.accountNewPasswordInput, "");
        Utils.updateTooltip(this.accountConfirmNewPasswordInput, "");
        Utils.updateTooltip(this.accountEmailInput, "");
        Utils.updateTooltip(this.accountPasswordInput, "");
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.accountWrapper;
    },

    shouldHide() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.accountSubmitInput.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _sendAccountUpdate() {
        this.accountWrapper.find("button").prop("disabled", true);

        const username = this.accountUsernameInput.val().trim();
        let newPassword = this.accountNewPasswordInput.val().trim();
        let confirmNewPassword = this.accountConfirmNewPasswordInput.val().trim();
        const email = this.accountEmailInput.val().trim();
        let currentPassword = this.accountPasswordInput.val().trim();
        if (username !== "" && email !== "" && currentPassword !== "" &&
            ((newPassword === "" && confirmNewPassword === "") || (newPassword !== "" && confirmNewPassword !== ""))) {
            // Don't perform further input validation on the client,
            // to avoid inconsistencies between server and client
            // validation

            newPassword = Utils.utf8ToBase64(newPassword);
            confirmNewPassword = Utils.utf8ToBase64(confirmNewPassword);
            currentPassword = Utils.utf8ToBase64(currentPassword);

            // Submit
            Backend.updatePlayerDetails(this.playerId, username, newPassword, confirmNewPassword, email, currentPassword, Caches.getPlayerDetailsCache(), Caches.getEmailCache(), Caches.getCurrencyCache())
                .then(result => {
                    if (typeof result === "object") {
                        this._showErrorMessage(result.message, result.inputField, true);
                    } else {
                        // Send signal that username might have changed.
                        Users.updateUser(this.playerId, false, true);

                        // Hide account overlay.
                        OverlayManager.popOverlay(true, true);
                    }
                })
                .catch(message => {
                    this._showErrorMessage(message);
                });
        } else if (username === "") {
            this._showErrorMessage("Fill out username", "username", true);
        } else if (email === "") {
            this._showErrorMessage("Fill out email", "email", true);
        } else if (currentPassword === "") {
            this._showErrorMessage("Fill out password", "currentPassword", true);
        } else if (newPassword === "" && confirmNewPassword !== "") {
            this._showErrorMessage("Fill out password", "password", true);
        } else if (newPassword !== "" && confirmNewPassword === "") {
            this._showErrorMessage("Confirm password", "confirmPassword", true);
        }
    },

    _checkUsername() {
        const username = this.accountUsernameInput.val().trim();
        // Remove accepted class and do a check if username has been changed.
        if (this.playerDetails && this.playerDetails.getUsername() !== username) {
            this.accountUsernameInput.removeClass("inputAccepted inputRejected");
            // Do a check if still showing and field is not empty.
            if (this.showing && username !== "") {
                Backend.checkUsername(username, this.playerId)
                    .then(result => {
                        if (this.showing) {
                            if (result === true) {
                                this.accountUsernameInput.addClass("inputAccepted");
                                this._updateUsernameChangeMessage(true);
                                Utils.updateTooltip(this.accountUsernameInput, "");

                                // Trigger a check on password to see if the new username is too close to it.
                                this._checkPasswords();
                            } else {
                                this._updateUsernameChangeMessage(false);
                                this._showErrorMessage(result.message, result.inputField, false);
                            }
                        }
                    })
                    .catch(message => {
                        if (this.showing) {
                            this._updateUsernameChangeMessage(false);
                            this._showErrorMessage(message);
                        }
                    });
            } else {
                this._updateUsernameChangeMessage(false);
                Utils.updateTooltip(this.accountUsernameInput, "");
            }
        } else if (this.playerDetails && this.playerDetails.getUsername() === username) {
            this.accountUsernameInput.removeClass("inputRejected");
            this.accountUsernameInput.addClass("inputAccepted");
            this._updateUsernameChangeMessage(false);
            Utils.updateTooltip(this.accountUsernameInput, "");
        }
    },

    _checkPasswords() {
        this.accountNewPasswordInput.removeClass("inputAccepted inputRejected");
        this.accountConfirmNewPasswordInput.removeClass("inputAccepted inputRejected");
        Utils.updateTooltip(this.accountNewPasswordInput, "");
        Utils.updateTooltip(this.accountConfirmNewPasswordInput, "");
        let password = this.accountNewPasswordInput.val().trim();
        let confirmPassword = this.accountConfirmNewPasswordInput.val().trim();
        const username = this.accountUsernameInput.val().trim();
        // Do a check if still showing and field is not empty.
        if (this.showing && password !== "") {
            password = Utils.utf8ToBase64(password);
            confirmPassword = Utils.utf8ToBase64(confirmPassword);

            Backend.checkPasswords(password, confirmPassword, username)
                .then(result => {
                    if (this.showing) {
                        if (result === true) {
                            this.accountNewPasswordInput.addClass("inputAccepted");
                            this.accountConfirmNewPasswordInput.addClass("inputAccepted");
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

    _checkEmail() {
        const email = this.accountEmailInput.val().trim();
        // Remove accepted class and do a check if email has been changed.
        if (email === "") {
            this.accountEmailInput.removeClass("inputAccepted inputRejected");
            Utils.updateTooltip(this.accountEmailInput, "");
            this._updateVerificationEmailMessage("Please fill out your email");
        } else if (this.email && this.email !== email) {
            this.accountEmailInput.removeClass("inputAccepted inputRejected");
            Utils.updateTooltip(this.accountEmailInput, "");
            // Do a check if still showing and field is not empty.
            if (this.showing && email !== "") {
                Backend.checkEmail(email, true)
                    .then(result => {
                        if (this.showing) {
                            if (result === true) {
                                this.accountEmailInput.addClass("inputAccepted");
                                this._updateVerificationEmailMessage("A verification email will be sent to your new address");
                            } else {
                                this._showErrorMessage(result.message, result.inputField, false);
                                this._updateVerificationEmailMessage("Please fix the problem with your email");
                            }
                        }
                    })
                    .catch(message => {
                        if (this.showing) {
                            this._showErrorMessage(message);
                        }
                    });
            }
        } else if (this.email && this.email === email) {
            this.accountEmailInput.removeClass("inputRejected");
            this.accountEmailInput.addClass("inputAccepted");
            Utils.updateTooltip(this.accountEmailInput, "");
            this._updateVerificationEmailMessage();
        }
    },

    _checkKeyDown(event, moveToOnEnter) {
        if (event.which === 13) {
            if (moveToOnEnter) {
                moveToOnEnter.focus();
            } else if (this.accountSubmitInput.prop("disabled") === false) {
                event.currentTarget.blur();
                this.accountForm.submit();
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
                    this.accountUsernameInput.addClass("inputRejected");
                    Utils.updateTooltip(this.accountUsernameInput, message);
                    if (setFocus) {
                        this.accountUsernameInput.focus();
                    }
                    break;
                }
                case "password": {
                    this.accountNewPasswordInput.addClass("inputRejected");
                    Utils.updateTooltip(this.accountNewPasswordInput, message);
                    if (setFocus) {
                        this.accountNewPasswordInput.focus();
                    }
                    break;
                }
                case "confirmPassword": {
                    this.accountConfirmNewPasswordInput.addClass("inputRejected");
                    Utils.updateTooltip(this.accountConfirmNewPasswordInput, message);
                    if (setFocus) {
                        this.accountConfirmNewPasswordInput.focus();
                    }
                    break;
                }
                case "email": {
                    this.accountEmailInput.addClass("inputRejected");
                    Utils.updateTooltip(this.accountEmailInput, message);
                    if (setFocus) {
                        this.accountEmailInput.focus();
                    }
                    break;
                }
                case "currentPassword": {
                    this.accountPasswordInput.addClass("inputRejected");
                    Utils.updateTooltip(this.accountPasswordInput, message);
                    if (setFocus) {
                        this.accountPasswordInput.focus();
                    }
                    break;
                }
                case "stockUp": {
                    Shop.showStockUp(this.playerId, message);
                    break;
                }
            }
        }

        this.accountWrapper.find("button").prop("disabled", false);
    },

    _updateTooltip(element, message) {
        if (message === "") {
            element.tooltipster("disable");
        } else {
            if (element.tooltipster("content") !== message) {
                element.tooltipster("content", message);
            }
            element.tooltipster("enable");
            element.tooltipster("open");
        }
    },

    _updateUsernameChangeMessage(show) {
        const currentHeight = this.accountUsernameChangeMessage.height();
        const currentOpacity = this.accountUsernameChangeMessage.css("opacity");
        this.accountUsernameChangeMessage.stop(true);
        if (show) {
            const targetHeight = this.accountUsernameChangeMessage.removeAttr("style").height();
            this.accountUsernameChangeMessage.css({ height: currentHeight, opacity: currentOpacity });
            this.accountUsernameChangeMessage.animate({ height: targetHeight }, 200).animate({ opacity: 1 }, 200);
        } else {
            this.accountUsernameChangeMessage.animate({ opacity: 0 }, 200).animate({ height: 0 }, 200);
        }
    },

    _updateVerificationEmailMessage(message) {
        if (message === undefined) {
            if (this.playerDetails.getVerified()) {
                message = "Verified";
            } else {
                message = "Your email is not verified. Verify it to use the chat and forum";
            }
        }

        if (message !== this.accountVerificationEmailMessage.text()) {
            this.accountVerificationEmailMessage.stop().fadeOut({ duration: 200, complete() {
                $(this).text(message);
                $(this).fadeIn();
            } });
        }
    }
};
