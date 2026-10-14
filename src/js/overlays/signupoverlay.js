import { TankTrouble } from "../tanktrouble.js";
import { Assets } from "../assets.js";
import { AudioManager } from "../audiomanager.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { ClientManager } from "../clientmanager.js";
import { OverlayManager } from "../overlaymanager.js";
import { Typist } from "../typist.js";
import { UIConstants } from "../tt/ui/uiconstants.js";
import { UITankIcon } from "../tt/ui/uitankicon.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.SignUpOverlay = {
    // jQuery objects.
    signUpWrapper: null,
    signUpIcon: null,
    signUpIconPlaceholder: null,
    signUpHeadline: null,
    signUpForm: null,
    signUpUsernameMessageBefore: null,
    signUpUsernameInput: null,
    signUpUsernameTypist: null,
    signUpRandomUsername: null,
    signUpPasswordInput: null,
    signUpConfirmPasswordInput: null,
    signUpEmailInput: null,
    signUpTermsDiv: null,
    signUpTermsInput: null,
    signUpTermsLabel: null,
    signUpSubmitInput: null,

    // Canvas element.
    iconCanvas: null,

    // Other elements.
    deletingAudio: null,
    typingAudioArray: [],
    typingDoneAudio: null,

    // State.
    initialised: false,
    showing: false,
    guestPlayerIdToSignUp: null,
    nextTypingAudio: 0,
    randomizerDisabled: true,
    removeAnimationCounter: 0,
    previousRandomClass: null,
    animationInterval: null,
    doneTimeout: null,

    // Events.
    eventListeners: [],
    EVENTS: {
        OPENED: "opened",
        CLOSED: "closed"
    },

    _initialise() {
        this.signUpWrapper = $("<div class='signup centre'/>");
        this.signUpIcon = $("<canvas class='icon'></canvas>");
        this.iconCanvas = this.signUpIcon[0];
        this.signUpIconPlaceholder = $(`<img class='icon' src='${UITankIcon.getImageUrl("placeholder", UIConstants.TANK_ICON_SIZES.LARGE)}' alt=''/>`);
        this.signUpHeadline = $("<div class='headline'>Sign up</div>");
        this.signUpUsernameMessageBefore = $("<div class='messageSpacingTop'>Enter a username. The scientists suggest</div>");
        this.signUpForm = $("<form></form>");
        this.signUpUsernameInput = $("<input class='username' placeholder='Username' type='text' name='username' autocomplete='username' maxlength='32'/>");
        this.signUpRandomUsername = $("<div class='button random standard' title='Ask randomizer-3000'></div>");
        this.signUpPasswordInput = $("<input placeholder='Password' name='password' type='password' autocomplete='new-password' maxlength='32'/>");
        this.signUpConfirmPasswordInput = $("<input placeholder='Confirm password' name='confirmpassword' type='password' autocomplete='new-password' maxlength='32'/>");
        this.signUpEmailInput = $("<input placeholder='Email' name='email' type='text' autocomplete='email' maxlength='128'/>");
        this.signUpTermsDiv = $("<div/>");
        this.signUpTermsInput = $("<input id='terms' name='terms' type='checkbox' value='terms'/>");
        this.signUpTermsLabel = $("<label for='terms'>I have read and understood <a href='/privacy' target='_blank'>the rules of engagement</a></label>");
        this.signUpSubmitInput = $("<button class='medium' type='submit' tabindex='-1'>Sign up</button>");

        Utils.addImageWithClasses(this.signUpRandomUsername, "standard", "signUp/random.png");
        Utils.addImageWithClasses(this.signUpRandomUsername, "active", "signUp/randomActive.png");
        Utils.addImageWithClasses(this.signUpRandomUsername, "done", "signUp/randomDone.png");

        for (let i = 0; i < UIConstants.SIGNUP_RANDOM_OPTIONS; ++i) {
            Utils.addImageWithClasses(this.signUpRandomUsername, `random${i}`, `signUp/random${i}.png`);
        }

        Utils.addImageWithClasses(this.signUpRandomUsername, "cursor", "signUp/randomCursor.png");

        Utils.restrictInput(this.signUpUsernameInput, "-_", 32);
        Utils.restrictInput(this.signUpEmailInput, "_+-&*%@.", 128);

        this.signUpTermsDiv.append(this.signUpTermsInput);
        this.signUpTermsDiv.append(this.signUpTermsLabel);

        this.signUpForm.append(this.signUpHeadline);
        this.signUpForm.append(this.signUpUsernameMessageBefore);
        Utils.addSuffix(Utils.addOverlayFormRow(this.signUpForm, this.signUpUsernameInput), this.signUpRandomUsername, false);
        Utils.addOverlayFormRow(this.signUpForm, this.signUpPasswordInput);
        Utils.addOverlayFormRow(this.signUpForm, this.signUpConfirmPasswordInput);
        Utils.addOverlayFormRow(this.signUpForm, this.signUpEmailInput);
        Utils.addOverlayFormRow(this.signUpForm, this.signUpTermsDiv);
        Utils.addOverlayFormRow(this.signUpForm, this.signUpSubmitInput);

        this.signUpWrapper.append(this.signUpIcon);
        this.signUpWrapper.append(this.signUpIconPlaceholder);
        this.signUpWrapper.append(this.signUpForm);

        this.signUpUsernameInput.tooltipster({ side: "left", theme: "tooltipster-error" });
        this.signUpRandomUsername.tooltipster({ side: "right", distance: 2 });
        this.signUpPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.signUpConfirmPasswordInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.signUpEmailInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.signUpTermsLabel.tooltipster({ side: "left", theme: "tooltipster-error" });

        this.signUpForm.submit(event => {
            this._sendSignUp();
            return false;
        });

        this.signUpUsernameInput.blur(event => {
            this._checkUsername();
        });

        this.signUpUsernameInput.keydown(event => {
            return this._checkKeyDown(event, this.signUpPasswordInput);
        });

        this.signUpUsernameTypist = new Typist(this.signUpUsernameInput);
        this.signUpUsernameInput.on("start_remove.typist", event => {
            $(event.currentTarget).attr("placeholder", "");
            AudioManager.playSound(this.deletingAudio);
        });

        this.signUpUsernameInput.on("end_remove.typist", () => {
            AudioManager.stopSound(this.deletingAudio);
        });

        this.signUpUsernameInput.on("done_type.typist", event => {
            this.signUpRandomUsername.removeClass(`randomized ${this.previousRandomClass}`);
            this.signUpRandomUsername.addClass("done");
            this.previousRandomClass = "";

            $(event.currentTarget).attr("placeholder", "Username");
            AudioManager.playSound(this.typingDoneAudio);

            clearTimeout(this.doneTimeout);
            this.doneTimeout = setTimeout(
                () => {
                    this.signUpRandomUsername.removeClass("done");
                },
                1250
            );
        });

        this.signUpUsernameInput.on("stop_type.typist", event => {
            this.signUpRandomUsername.removeClass(`done randomized ${this.previousRandomClass}`);
            this.previousRandomClass = "";

            clearTimeout(this.doneTimeout);
            this.doneTimeout = null;

            $(event.currentTarget).attr("placeholder", "Username");
            AudioManager.stopSound(this.deletingAudio);
        });

        this.signUpUsernameInput.on("remove_tick.typist", () => {
            if (this.removeAnimationCounter === 0) {
                this.signUpRandomUsername.removeClass(this.previousRandomClass);
                this.previousRandomClass = `random${Math.floor(Math.random() * UIConstants.SIGNUP_RANDOM_OPTIONS)}`;
                this.signUpRandomUsername.addClass(`randomized ${this.previousRandomClass}`);
            }

            // Only animate on every third tick.
            this.removeAnimationCounter = (this.removeAnimationCounter + 1) % 3;
        });

        this.signUpUsernameInput.on("tick.typist", () => {
            this.signUpRandomUsername.removeClass(this.previousRandomClass);
            this.previousRandomClass = `random${Math.floor(Math.random() * UIConstants.SIGNUP_RANDOM_OPTIONS)}`;
            this.signUpRandomUsername.addClass(`randomized ${this.previousRandomClass}`);

            AudioManager.playSound(this.typingAudioArray[this.nextTypingAudio]);
            this.nextTypingAudio = (this.nextTypingAudio + 1) % UIConstants.SIGNUP_TYPING_SOUND_COUNT;
        });

        this.signUpRandomUsername.on("mouseup", event => {
            // Get a random suggested username.
            if (!this.randomizerDisabled) {
                this.randomizerDisabled = true;

                this.signUpRandomUsername.removeClass("done");

                Backend.getSuggestedUsername()
                    .then(result => {
                        if (this.showing) {
                            if (typeof result === "string") {
                                this.signUpUsernameInput.removeClass("inputAccepted inputRejected");
                                Utils.updateTooltip(this.signUpUsernameInput, "");
                                this.signUpUsernameInput.addClass("inputAccepted");

                                this.signUpUsernameTypist.stop();
                                this.signUpUsernameTypist.remove(this.signUpUsernameInput.val().length);

                                // Split suggested username by uppercase characters:
                                const splitUsername = result.split(/(?=[A-Z])/);
                                for (let i = 0; i < splitUsername.length; ++i) {
                                    this.signUpUsernameTypist.add(splitUsername[i]);
                                    if (i < splitUsername.length - 1) {
                                        this.signUpUsernameTypist.pause(UIConstants.SIGNUP_TYPING_PAUSE);
                                    }
                                }
                            } else {
                                // FIXME Show sad randomizer face.
                            }
                        }
                    })
                    .finally(() => {
                        this.randomizerDisabled = false;
                    });
            }
        });

        this.signUpPasswordInput.blur(event => {
            this._checkPasswords();
        });

        this.signUpPasswordInput.keydown(event => {
            return this._checkKeyDown(event, this.signUpConfirmPasswordInput);
        });

        this.signUpConfirmPasswordInput.blur(event => {
            this._checkPasswords();
        });

        this.signUpConfirmPasswordInput.keydown(event => {
            return this._checkKeyDown(event, this.signUpEmailInput);
        });

        this.signUpEmailInput.blur(event => {
            this._checkEmail();
        });

        this.signUpEmailInput.keydown(event => {
            return this._checkKeyDown(event, null);
        });

        this.signUpTermsInput.change(event => {
            $(event.currentTarget).removeClass("inputAccepted inputRejected");
            Utils.updateTooltip(this.signUpTermsLabel, "");
        });

        this.signUpUsernameInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.signUpPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.signUpConfirmPasswordInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.signUpEmailInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        // Set the canvas size.
        this.iconCanvas.width = UIConstants.TANK_ICON_WIDTHS[UIConstants.TANK_ICON_SIZES.LARGE];
        this.iconCanvas.height = UIConstants.TANK_ICON_HEIGHTS[UIConstants.TANK_ICON_SIZES.LARGE];

        this.deletingAudio = new Audio(Assets.url("audio/RandomizerDelete.m4a"));

        for (let i = 0; i < UIConstants.SIGNUP_TYPING_SOUND_COUNT; ++i) {
            this.typingAudioArray.push(new Audio(Assets.url("audio/RandomizerTyping.m4a")));
        }
        this.typingDoneAudio = new Audio(Assets.url("audio/RandomizerDone.m4a"));

        this.initialised = true;
    },

    addEventListener(callback, context) {
        this.eventListeners.push({ callback, context });
    },

    removeEventListener(callback, context) {
        for (let i = 0; i < this.eventListeners.length; i++) {
            if (this.eventListeners[i].callback === callback && this.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                this.eventListeners.splice(i, 1);
                return;
            }
        }
    },

    /** Expected params:
     * guestPlayerIdToSignUp
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store guestPlayerIdToSignUp.
        if (params.guestPlayerIdToSignUp === undefined) {
            this.guestPlayerIdToSignUp = null;
        } else {
            this.guestPlayerIdToSignUp = params.guestPlayerIdToSignUp;
        }

        this.previousRandomClass = "";

        this.showing = true;

        this.randomizerDisabled = true;

        // Reset input values.
        this.signUpUsernameInput.val("");
        this.signUpPasswordInput.val("");
        this.signUpConfirmPasswordInput.val("");
        this.signUpEmailInput.val("");
        this.signUpTermsInput.prop("checked", false);

        // Reset submit button.
        this.signUpSubmitInput.prop("disabled", false);

        if (this.guestPlayerIdToSignUp) {
            // Show icon placeholder.
            this.signUpIconPlaceholder.show();
            this.signUpIcon.hide();

            // Prefill username and update icon if guestPlayerIdToSignUp is set.
            Backend.getPlayerDetails(this.guestPlayerIdToSignUp, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (this.showing) {
                        if (typeof result === "object") {
                            this.signUpUsernameInput.val(result.getUsername());
                            this.signUpUsernameInput.addClass("inputAccepted");
                            this.signUpPasswordInput.focus();

                            UITankIcon.loadPlayerTankIcon(this.iconCanvas, UIConstants.TANK_ICON_SIZES.LARGE, this.guestPlayerIdToSignUp).then(() => {
                                // Show icon.
                                this.signUpIconPlaceholder.hide();
                                this.signUpIcon.show();
                            });
                        } else {
                            TankTrouble.ErrorBox.show("Could not retrieve your information.<br/>Please try again.");

                            OverlayManager.popOverlay(false, true);
                        }
                    }
                })
                .catch(message => {
                    this.signUpUsernameInput.focus();
                })
                .finally(() => {
                    this.randomizerDisabled = false;
                });
        } else {
            //Hide icon and placeholder.
            this.signUpIconPlaceholder.hide();
            this.signUpIcon.hide();

            // Get a random suggested username, otherwise.
            Backend.getSuggestedUsername()
                .then(result => {
                    if (this.showing) {
                        if (typeof result === "string") {
                            this.signUpUsernameInput.val(result);
                            this.signUpUsernameInput.addClass("inputAccepted");
                            this.signUpPasswordInput.focus();
                        } else {
                            this.signUpUsernameInput.focus();
                        }
                    }
                })
                .catch(message => {
                    this.signUpUsernameInput.focus();
                })
                .finally(() => {
                    this.randomizerDisabled = false;
                });
        }

        // Animate cursor.
        this.animationInterval = setInterval(
            () => {
                this.signUpRandomUsername.toggleClass("cursor");
            },
            500
        );

        // Leave game if inside an online one.
        if (ClientManager.getClient().getCurrentGameId()) {
            ClientManager.getClient().leaveGame(true);
        }

        this._notifyEventListeners(TankTrouble.SignUpOverlay.EVENTS.OPENED, this.guestPlayerIdToSignUp);
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.showing = false;

        this.signUpUsernameTypist.stop();

        this.signUpUsernameInput.blur();
        this.signUpPasswordInput.blur();
        this.signUpConfirmPasswordInput.blur();
        this.signUpEmailInput.blur();
        this.signUpTermsInput.blur();

        // Reset classes.
        this.signUpUsernameInput.removeClass("inputAccepted inputRejected");
        this.signUpPasswordInput.removeClass("inputAccepted inputRejected");
        this.signUpConfirmPasswordInput.removeClass("inputAccepted inputRejected");
        this.signUpEmailInput.removeClass("inputAccepted inputRejected");
        this.signUpTermsInput.removeClass("inputAccepted inputRejected");

        // Reset tooltips
        Utils.updateTooltip(this.signUpUsernameInput, "");
        Utils.updateTooltip(this.signUpPasswordInput, "");
        Utils.updateTooltip(this.signUpConfirmPasswordInput, "");
        Utils.updateTooltip(this.signUpEmailInput, "");
        Utils.updateTooltip(this.signUpTermsLabel, "");

        // Stop cursor animation.
        clearInterval(this.animationInterval);
        this.animationInterval = null;

        this._notifyEventListeners(TankTrouble.SignUpOverlay.EVENTS.CLOSED, this.guestPlayerIdToSignUp);
    },

    isShowing() {
        return this.showing;
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.signUpWrapper;
    },

    shouldHide() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.signUpSubmitInput.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _sendSignUp() {
        this.signUpSubmitInput.prop("disabled", true);

        const username = this.signUpUsernameInput.val().trim();
        let password = this.signUpPasswordInput.val().trim();
        let confirmPassword = this.signUpConfirmPasswordInput.val().trim();
        const email = this.signUpEmailInput.val().trim();
        const termsAccepted = this.signUpTermsInput.prop("checked");
        if (username !== "" && password !== "" && confirmPassword !== "" && email !== "" && termsAccepted) {
            // Don't perform further input validation on the client,
            // to avoid inconsistencies between server and client
            // validation

            password = Utils.utf8ToBase64(password);
            confirmPassword = Utils.utf8ToBase64(confirmPassword);

            // Submit
            if (this.guestPlayerIdToSignUp !== null) {
                if (Users.isGuestUser(this.guestPlayerIdToSignUp)) {
                    // Submit sign up guest ajax request.
                    Backend.signUpGuest(this.guestPlayerIdToSignUp, username, password, confirmPassword, email, termsAccepted, Caches.getPlayerDetailsCache())
                        .then(result => {
                            if (typeof result === "object") {
                                this._showErrorMessage(result.message, result.inputField, true);
                            } else {
                                // Upgrade guest user to authenticated user.
                                Users.signUpGuestUser(this.guestPlayerIdToSignUp);

                                // Hide sign up overlay.
                                OverlayManager.popOverlay(true, true);
                            }
                        })
                        .catch(message => {
                            this._showErrorMessage(message);
                        });
                }
            } else {
                // Submit sign up ajax request.
                Backend.signUp(username, password, confirmPassword, email, termsAccepted, Caches.getPlayerDetailsCache())
                    .then(result => {
                        if (result.playerId !== undefined) {
                            // Store player id of authenticated user in an
                            // easily accessible place
                            Users.addAuthenticatedUser(result.playerId, result.multiplayerToken);

                            // Hide sign up overlay.
                            OverlayManager.popOverlay(true, true);
                        } else {
                            this._showErrorMessage(result.message, result.inputField, true);
                        }
                    })
                    .catch(message => {
                        this._showErrorMessage(message);
                    });
            }
        } else if (username === "") {
            this._showErrorMessage("Fill out username", "username", true);
        } else if (password === "") {
            this._showErrorMessage("Fill out password", "password", true);
        } else if (confirmPassword === "") {
            this._showErrorMessage("Confirm password", "confirmPassword", true);
        } else if (email === "") {
            this._showErrorMessage("Fill out email", "email", true);
        } else if (!termsAccepted) {
            this._showErrorMessage("Please read", "terms", true);
        }
    },

    _checkUsername() {
        this.signUpUsernameInput.removeClass("inputAccepted inputRejected");
        Utils.updateTooltip(this.signUpUsernameInput, "");
        const username = this.signUpUsernameInput.val().trim();
        // Do a check if still showing and field is not empty.
        if (this.showing && username !== "") {
            Backend.checkUsername(username, this.guestPlayerIdToSignUp)
                .then(result => {
                    if (this.showing) {
                        if (result === true) {
                            this.signUpUsernameInput.addClass("inputAccepted");
                            // Trigger a check on password to see if the new username is too close to it.
                            this._checkPasswords();
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

    _checkPasswords() {
        this.signUpPasswordInput.removeClass("inputAccepted inputRejected");
        this.signUpConfirmPasswordInput.removeClass("inputAccepted inputRejected");
        Utils.updateTooltip(this.signUpPasswordInput, "");
        Utils.updateTooltip(this.signUpConfirmPasswordInput, "");
        let password = this.signUpPasswordInput.val().trim();
        let confirmPassword = this.signUpConfirmPasswordInput.val().trim();
        const username = this.signUpUsernameInput.val().trim();
        // Do a check if still showing and field is not empty.
        if (this.showing && password !== "") {
            password = Utils.utf8ToBase64(password);
            confirmPassword = Utils.utf8ToBase64(confirmPassword);

            Backend.checkPasswords(password, confirmPassword, username)
                .then(result => {
                    if (this.showing) {
                        if (result === true) {
                            this.signUpPasswordInput.addClass("inputAccepted");
                            this.signUpConfirmPasswordInput.addClass("inputAccepted");
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
        this.signUpEmailInput.removeClass("inputAccepted inputRejected");
        Utils.updateTooltip(this.signUpEmailInput, "");
        const email = this.signUpEmailInput.val().trim();
        // Do a check if still showing and field is not empty.
        if (this.showing && email !== "") {
            Backend.checkEmail(email, true)
                .then(result => {
                    if (this.showing) {
                        if (result === true) {
                            this.signUpEmailInput.addClass("inputAccepted");
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
        if (event.which === 13) {
            if (moveToOnEnter) {
                moveToOnEnter.focus();
            } else if (this.signUpSubmitInput.prop("disabled") === false) {
                event.currentTarget.blur();
                this.signUpForm.submit();
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
                    this.signUpUsernameInput.addClass("inputRejected");
                    Utils.updateTooltip(this.signUpUsernameInput, message);
                    if (setFocus) {
                        this.signUpUsernameInput.focus();
                    }
                    break;
                }
                case "password": {
                    this.signUpPasswordInput.addClass("inputRejected");
                    Utils.updateTooltip(this.signUpPasswordInput, message);
                    if (setFocus) {
                        this.signUpPasswordInput.focus();
                    }
                    break;
                }
                case "confirmPassword": {
                    this.signUpConfirmPasswordInput.addClass("inputRejected");
                    Utils.updateTooltip(this.signUpConfirmPasswordInput, message);
                    if (setFocus) {
                        this.signUpConfirmPasswordInput.focus();
                    }
                    break;
                }
                case "email": {
                    this.signUpEmailInput.addClass("inputRejected");
                    Utils.updateTooltip(this.signUpEmailInput, message);
                    if (setFocus) {
                        this.signUpEmailInput.focus();
                    }
                    break;
                }
                case "terms": {
                    this.signUpTermsInput.addClass("inputRejected");
                    Utils.updateTooltip(this.signUpTermsLabel, message);
                    if (setFocus) {
                        this.signUpTermsInput.focus();
                    }
                    break;
                }
            }
        }
        this.signUpSubmitInput.prop("disabled", false);
    },

    _notifyEventListeners(evt, data) {
        for (let i = 0; i < this.eventListeners.length; i++) {
            this.eventListeners[i].callback(this.eventListeners[i].context, evt, data);
        }
    }
};
