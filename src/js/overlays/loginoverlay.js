import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { OverlayManager } from "../overlaymanager.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.LoginOverlay = {
    // jQuery objects.
    loginWrapper: null,
    loginHeadline: null,
    loginForm: null,
    loginUsernameOrEmailInput: null,
    loginPasswordInput: null,
    loginRecoverAccount: null,
    loginSubmitInput: null,

    // State.
    initialised: false,

    _initialise() {
        this.loginWrapper = $("<div class='login centre'/>");
        this.loginHeadline = $("<div class='headline'>Log in</div>");
        this.loginForm = $("<form></form>");
        this.loginUsernameOrEmailInput = $("<input class='username' placeholder='Username or email' type='text' name='username' autocomplete='username' maxlength='128'/>");
        this.loginPasswordInput = $("<input placeholder='Password' name='password' type='password' autocomplete='current-password' maxlength='32'/>");
        this.loginRecoverAccount = $("<button class='small' type='button' tabindex='-1' title='Recover your username or password'>Forgot?</button>");
        this.loginSubmitInput = $("<button class='medium' type='submit' tabindex='-1'>Log in</button>");

        Utils.restrictInput(this.loginUsernameOrEmailInput, "-_.@", 128);

        this.loginForm.append(this.loginHeadline);
        Utils.addOverlayFormRow(this.loginForm, this.loginUsernameOrEmailInput);
        Utils.addSuffix(Utils.addOverlayFormRow(this.loginForm, this.loginPasswordInput), this.loginRecoverAccount, true);
        Utils.addOverlayFormRow(this.loginForm, this.loginSubmitInput);

        this.loginWrapper.append(this.loginForm);

        this.loginUsernameOrEmailInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.loginPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.loginRecoverAccount.tooltipster({ side: "right" });

        this.loginForm.submit(event => {
            this._sendLogin();
            return false;
        });

        this.loginUsernameOrEmailInput.blur(event => {
            this.loginUsernameOrEmailInput.removeClass("inputRejected");
            Utils.updateTooltip(this.loginUsernameOrEmailInput, "");
        });

        this.loginUsernameOrEmailInput.keydown(event => {
            return this._checkKeyDown(event, this.loginPasswordInput);
        });

        this.loginPasswordInput.blur(event => {
            this.loginPasswordInput.removeClass("inputRejected");
            Utils.updateTooltip(this.loginPasswordInput, "");
        });

        this.loginPasswordInput.keydown(event => {
            return this._checkKeyDown(event, null);
        });

        this.loginRecoverAccount.click(event => {
            OverlayManager.pushOverlay(
                TankTrouble.RecoverAccountOverlay,
                {}
            );
        });

        this.loginUsernameOrEmailInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.loginPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.initialised = true;
    },

    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Reset input values.
        this.loginUsernameOrEmailInput.val("");
        this.loginPasswordInput.val("");

        // Reset buttons.
        this.loginWrapper.find("button").prop("disabled", false);

        this.loginUsernameOrEmailInput.focus();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.loginUsernameOrEmailInput.blur();
        this.loginPasswordInput.blur();

        // Reset classes.
        this.loginUsernameOrEmailInput.removeClass("inputRejected");
        this.loginPasswordInput.removeClass("inputRejected");

        // Reset tooltips
        Utils.updateTooltip(this.loginUsernameOrEmailInput, "");
        Utils.updateTooltip(this.loginPasswordInput, "");
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.loginWrapper;
    },

    shouldHide() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.loginSubmitInput.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _sendLogin() {
        if (!this.initialised) {
            this._initialise();
        }

        this.loginWrapper.find("button").prop("disabled", true);

        const usernameOrEmail = this.loginUsernameOrEmailInput.val().trim();
        let password = this.loginPasswordInput.val().trim();
        if (usernameOrEmail !== "" && password !== "") {
            password = Utils.utf8ToBase64(password);

            // Submit
            Backend.authenticate(usernameOrEmail, password, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        // Store player id of authenticated user in an
                        // easily accessible place
                        Users.addAuthenticatedUser(result.playerId, result.multiplayerToken);

                        if (result.deletionRequestRemoved) {
                            // Show notification that deletion request was removed.
                            OverlayManager.enqueueOverlay(
                                TankTrouble.MessageOverlay,
                                {
                                    headline: "Phew, your tank has been saved from the crusher",
                                    message: "Your deletion request has been cancelled."
                                }
                            );
                        }

                        // Hide login overlay.
                        OverlayManager.popOverlay(true, true);
                    } else {
                        this._showErrorMessage(result);
                    }
                })
                .catch(message => {
                    this._showErrorMessage(message);
                });
        } else if (usernameOrEmail === "") {
            this._showErrorMessage("Fill out username or email", "usernameOrEmail", true);
        } else if (password === "") {
            this._showErrorMessage("Fill out password", "password", true);
        }
    },

    _checkKeyDown(event, moveToOnEnter) {
        if (!this.initialised) {
            this._initialise();
        }

        if (event.which === 13) {
            if (moveToOnEnter) {
                moveToOnEnter.focus();
            } else if (this.loginSubmitInput.prop("disabled") === false) {
                event.currentTarget.blur();
                this.loginForm.submit();
            }
            return false;
        }
        return true;
    },

    _showErrorMessage(message, inputField, setFocus) {
        // Set focus to relevant input field.
        if (inputField !== undefined) {
            switch (inputField) {
                case "usernameOrEmail": {
                    this.loginUsernameOrEmailInput.addClass("inputRejected");
                    Utils.updateTooltip(this.loginUsernameOrEmailInput, message);
                    if (setFocus) {
                        this.loginUsernameOrEmailInput.focus();
                    }
                    break;
                }
                case "password": {
                    this.loginPasswordInput.addClass("inputRejected");
                    Utils.updateTooltip(this.loginPasswordInput, message);
                    if (setFocus) {
                        this.loginPasswordInput.focus();
                    }
                    break;
                }
            }
        } else {
            this.loginUsernameOrEmailInput.addClass("inputRejected");
            this.loginPasswordInput.addClass("inputRejected");
            Utils.updateTooltip(this.loginUsernameOrEmailInput, message);
            this.loginUsernameOrEmailInput.focus();
        }
        this.loginWrapper.find("button").prop("disabled", false);
    }
};
