import { TankTrouble } from "../tanktrouble.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.MessageOverlay = {
    // jQuery objects.
    messageWrapper: null,
    messageHeadline: null,
    messageMessage: null,
    messageForm: null,
    messageSubmitInput: null,

    // State.
    initialised: false,
    canCancel: true,
    canClose: true,
    preserveOverlayQueue: false,

    _initialise() {
        this.messageWrapper = $("<div class='message centre'/>");
        this.messageHeadline = $("<div class='headline'>Important!</div>");
        this.messageMessage = $("<div class='messageSpacingTop messageSpacingBottom'></div>");
        this.messageForm = $("<form></form>");
        this.messageSubmitInput = $("<button class='medium' type='submit' tabindex='-1'>Gotcha!</button>");

        this.messageForm.append(this.messageHeadline);
        this.messageForm.append(this.messageMessage);
        Utils.addOverlayFormRow(this.messageForm, this.messageSubmitInput);

        this.messageWrapper.append(this.messageForm);

        this.initialised = true;
    },

    /** Expected params:
     * headline
     * message
     * [canCancel = true]
     * [canClose = true]
     * [preserveOverlayQueue = false]
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Set message content.
        this.messageHeadline.html(params.headline);
        this.messageMessage.html(params.message);

        // Set state.
        this.canCancel = true;
        if (params.canCancel !== undefined) {
            this.canCancel = params.canCancel;
        }
        this.canClose = true;
        if (params.canClose !== undefined) {
            this.canClose = params.canClose;
        }
        this.preserveOverlayQueue = false;
        if (params.preserveOverlayQueue !== undefined) {
            this.preserveOverlayQueue = params.preserveOverlayQueue;
        }

        if (this.canClose) {
            this.messageSubmitInput.show();
            this.messageForm.off("submit").on("submit", event => {
                OverlayManager.popOverlay(this.preserveOverlayQueue, false);
                return false;
            });
        } else {
            this.messageForm.off("submit");
            this.messageSubmitInput.hide();
        }
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.messageWrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return this.canCancel;
    }
};
