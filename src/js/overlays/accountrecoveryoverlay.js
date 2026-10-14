import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { OverlayManager } from "../overlaymanager.js";

TankTrouble.AccountRecoveryOverlay = {
    // jQuery objects.
    accountRecoveryWrapper: null,
    accountRecoveryHeadline: null,
    accountRecoveryMessage: null,

    // State.
    initialised: false,
    playerId: null,
    token: null,

    _initialise() {
        this.accountRecoveryWrapper = $("<div class='account centre'/>");
        this.accountRecoveryHeadline = $("<div class='headline'>Recovering account</div>");
        this.accountRecoveryMessage = $("<div class='messageSpacingTop'>Please wait...</div>");

        this.accountRecoveryWrapper.append(this.accountRecoveryHeadline);
        this.accountRecoveryWrapper.append(this.accountRecoveryMessage);

        this.initialised = true;
    },

    /** Expected params:
     * playerId
     * token
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store playerId and token.
        this.playerId = params.playerId;
        this.token = params.token;

        // Send request to verify account using player id and token.
        Backend.checkUserRecoveryRequest(this.playerId, this.token)
            .then(result => {
                if (typeof result === "string") {
                    OverlayManager.replaceOverlay(
                        TankTrouble.NewPasswordOverlay,
                        { playerId: this.playerId, token: this.token, username: result },
                        true
                    );
                } else {
                    OverlayManager.replaceOverlay(
                        TankTrouble.MessageOverlay,
                        { headline: result.headline, message: result.message },
                        true
                    );
                }
            });
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

        return this.accountRecoveryWrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return false;
    }
};
