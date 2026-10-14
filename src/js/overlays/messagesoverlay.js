import { ArrayUtils } from "../tt/arrayutils.js";
import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { OverlayManager } from "../overlaymanager.js";
import { UIConstants } from "../tt/ui/uiconstants.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.MessagesOverlay = {
    // jQuery objects.
    wrapper: null,
    showOlderButton: null,
    messages: null,
    headline: null,
    text: null,
    form: null,
    textarea: null,
    submitButton: null,

    // State.
    initialised: false,
    totalMessageShowing: null,

    _initialise() {
        this.wrapper = $("<div class='messages centre'/>");
        this.showOlderButton = $("<button class='medium' type='button' tabindex='-1'>Show older</button>");
        this.messages = $("<div></div>");
        this.headline = $("<div class='headline'></div>");
        this.text = $("<div></div>");
        this.form = $("<form></form>");
        this.textarea = $("<textarea rows='2' placeholder='Message'></textarea>");
        this.submitButton = $("<button class='medium' type='submit' tabindex='-1'>Send message</button>");

        Utils.addAutomaticTextAreaResize(this.textarea);

        Utils.addOverlayFormRow(this.form, this.textarea);
        Utils.addOverlayFormRow(this.form, this.submitButton);

        this.wrapper.append(this.showOlderButton, this.messages, this.headline, this.text, this.form);

        this.textarea.tooltipster({ side: "right", theme: "tooltipster-error", triggerOpen: { mouseenter: false }, triggerClose: { mouseleave: false } });
        this.submitButton.tooltipster({ side: "right", theme: "tooltipster-error", triggerOpen: { mouseenter: false }, triggerClose: { mouseleave: false } });

        this.showOlderButton.on("click", event => {
            $(event.currentTarget).prop("disabled", true);
            this._getMessages();
        });

        this.textarea.blur(event => {
            this.textarea.removeClass("inputRejected");
            Utils.updateTooltip(this.textarea, "");
        });

        this.submitButton.mousedown(event => {
            Utils.updateTooltip(this.submitButton, "");
        });

        this.form.submit(event => {
            this._sendMessage();
            return false;
        });

        this.initialised = true;
    },

    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Reset textarea to correct size after previous message was sent.
        this.textarea.trigger("input.resize");

        this.showOlderButton.hide();
        this.messages.empty();
        this.headline.empty();
        this.text.empty();
        this.form.hide();

        this.totalMessageShowing = 0;

        this._getMessages();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        // Reset classes
        this.textarea.removeClass("inputRejected");

        // Reset tooltips
        Utils.updateTooltip(this.textarea, "");
        Utils.updateTooltip(this.submitButton, "");
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

        return this.submitButton.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _getMessages() {
        const initialLoad = this.totalMessageShowing === 0;

        Backend.getMessages(Users.getAllPlayerIds(), this.totalMessageShowing, 10)
            .then(result => {
                if (typeof result === "object") {
                    // Ignore the result if the returned offset does not match the expected offset  - if not, the returned data is old.
                    if (result.offset === this.totalMessageShowing) {
                        this._showMessages(result.messages, result.totalMessages);
                        if (initialLoad) {
                            this._showOptions();
                        }
                        TankTrouble.Messages.checkForUnseenMessages();
                    }
                } else {
                    OverlayManager.popOverlay(false, true);
                    TankTrouble.ErrorBox.show("Your messages could not be found.");
                }
            })
            .catch(message => {
                OverlayManager.popOverlay(false, true);
                TankTrouble.ErrorBox.show("Your messages could not be found.");
            });
    },

    _showMessages(messages, totalMessages) {
        const playerIds = Users.getAllPlayerIds();

        // Show messages if not already shown. This could happen if the user has sent another message since the last messages were loaded.
        for (let i = 0; i < messages.length; i++) {
            if (this.messages.find(`[data-id = ${messages[i].id}]`).length === 0) {
                // Style messages sent to the player ids.
                const html = $(messages[i].html);
                if (ArrayUtils.containsSome(messages[i].recipientIds, playerIds)) {
                    html.addClass("important");
                }

                this.messages.prepend(html);
                this.totalMessageShowing++;
            }
        }

        // Show show older button.
        if (this.totalMessageShowing < totalMessages) {
            this.showOlderButton.prop("disabled", false).show();
        } else {
            this.showOlderButton.hide();
        }
    },

    _showOptions() {
        this.headline.html("Send a message to the laboratory");
        if (Users.getAllPlayerIds().length === 0) {
            this.text.html("Got ideas, found a bug, need help or just love trouble? Let the scientists know!<br><span class='warning'>Because you are not logged in, the scientists are not able to reply to your message.</span>");
        } else {
            this.text.html("Got ideas, found a bug, need help or just love trouble? Let the scientists know!");
        }

        // Show send message form.
        this.form.show();
        this.textarea.focus();
    },

    _sendMessage() {
        Utils.updateTooltip(this.submitButton, "");
        this.wrapper.find("button, textarea").prop("disabled", true);

        Backend.sendMessage(Users.getAllPlayerIds(), [], this.textarea.val().trim())
            .then(result => {
                if (typeof result === "string") {
                    setTimeout(() => {
                        this.textarea.val("");
                        this.wrapper.find("button, textarea").prop("disabled", false);
                    }, UIConstants.OVERLAY_FADE_TIME);
                    OverlayManager.replaceOverlay(
                        TankTrouble.MessageOverlay,
                        { headline: "Your message is on the way!", message: result, canCancel: true },
                        true
                    );
                } else if (result.message && result.element) {
                    this._showErrorMessage(result.message, result.element, true);
                } else {
                    this._showErrorMessage("Whoops, something went wrong!", "submitButton");
                }
            })
            .catch(message => {
                this._showErrorMessage("Whoops, something went wrong!", "submitButton");
            });
    },

    _showErrorMessage(message, element, setFocus) {
        this.wrapper.find("button, textarea").prop("disabled", false);
        if (element !== undefined) {
            switch (element) {
                case "textarea": {
                    this.textarea.addClass("inputRejected");
                    Utils.updateTooltip(this.textarea, message);
                    if (setFocus) {
                        this.textarea.focus();
                    }
                    break;
                }
                case "submitButton": {
                    Utils.updateTooltip(this.submitButton, message);
                    break;
                }
            }
        }
    }
};
