import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.RecoverAccountOverlay = {
    // jQuery objects.
    recoverAccountWrapper: null,

    recoverAccountHeadline: null,
    recoverAccountMessage: null,
    recoverAccountForm: null,
    recoverAccountUsernameOrEmailInput: null,
    recoverAccountSubmitInput: null,

    // State.
    initialised: false,

    _initialise() {
        this.recoverAccountWrapper = $("<div class='account centre'/>");
        this.recoverAccountHeadline = $("<div class='headline'>Forgot your username or password?</div>");
        this.recoverAccountMessage = $("<div class='messageSpacingBottom'>Enter your username or email to recover your account</div>");
        this.recoverAccountForm = $("<form></form>");
        this.recoverAccountUsernameOrEmailInput = $("<input placeholder='Username or email' name='username' type='text' autocomplete='username' maxlength='128'/>");
        this.recoverAccountSubmitInput = $("<button class='medium' type='submit' tabindex='-1'>Recover account</button>");

        Utils.restrictInput(this.recoverAccountUsernameOrEmailInput, "_+-&*%@.", 128);

        this.recoverAccountForm.append(this.recoverAccountHeadline);
        this.recoverAccountForm.append(this.recoverAccountMessage);
        Utils.addOverlayFormRow(this.recoverAccountForm, this.recoverAccountUsernameOrEmailInput);
        Utils.addOverlayFormRow(this.recoverAccountForm, this.recoverAccountSubmitInput);

        this.recoverAccountWrapper.append(this.recoverAccountForm);

        this.recoverAccountUsernameOrEmailInput.tooltipster({ side: "right", theme: "tooltipster-error" });

        this.recoverAccountForm.submit(event => {
            this._requestUserRecovery();
            return false;
        });

        this.recoverAccountUsernameOrEmailInput.keydown(event => {
            return this._checkKeyDown(event, null);
        });

        this.recoverAccountUsernameOrEmailInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.initialised = true;
    },

    /** Expected params:
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Reset input values.
        this.recoverAccountUsernameOrEmailInput.val("");

        // Reset submit button.
        this.recoverAccountSubmitInput.prop("disabled", false);

        this.recoverAccountUsernameOrEmailInput.focus();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.recoverAccountUsernameOrEmailInput.blur();

        // Reset classes.
        this.recoverAccountUsernameOrEmailInput.removeClass("inputAccepted inputRejected");

        // Reset tooltips
        Utils.updateTooltip(this.recoverAccountUsernameOrEmailInput, "");
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.recoverAccountWrapper;
    },

    shouldHide() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.recoverAccountSubmitInput.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _requestUserRecovery() {
        if (!this.initialised) {
            this._initialise();
        }

        this.recoverAccountSubmitInput.prop("disabled", true);

        const usernameOrEmail = this.recoverAccountUsernameOrEmailInput.val().trim();
        if (usernameOrEmail !== "") {
            // Don't perform further input validation on the client,
            // to avoid inconsistencies between server and client
            // validation

            // Submit
            Backend.requestUserRecovery(usernameOrEmail)
                .then(result => {
                    if (result === true) {
                        OverlayManager.replaceOverlay(
                            TankTrouble.MessageOverlay,
                            { headline: "Important!", message: "We have sent you an email with recovery instructions" },
                            true
                        );
                    } else {
                        this._showErrorMessage(result);
                    }
                })
                .catch(message => {
                    this._showErrorMessage(message);
                });
        } else {
            this._showErrorMessage("Fill out username or email");
        }
    },

    _checkKeyDown(event, moveToOnEnter) {
        if (!this.initialised) {
            this._initialise();
        }

        if (event.which === 13) {
            if (moveToOnEnter) {
                moveToOnEnter.focus();
            } else if (this.recoverAccountSubmitInput.prop("disabled") === false) {
                event.currentTarget.blur();
                this.recoverAccountForm.submit();
            }
            return false;
        }
        return true;
    },

    _showErrorMessage(message) {
        this.recoverAccountUsernameOrEmailInput.addClass("inputRejected");
        Utils.updateTooltip(this.recoverAccountUsernameOrEmailInput, message);
        this.recoverAccountUsernameOrEmailInput.focus();

        this.recoverAccountSubmitInput.prop("disabled", false);
    }
};
