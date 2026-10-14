import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { OverlayManager } from "../overlaymanager.js";

TankTrouble.AccountVerificationOverlay = {
    // jQuery objects.
    accountVerificationWrapper: null,
    accountVerificationHeadline: null,
    accountVerificationMessage: null,

    // State.
    initialised: false,
    playerId: null,
    token: null,

    _initialise() {
        this.accountVerificationWrapper = $("<div class='account centre'/>");
        this.accountVerificationHeadline = $("<div class='headline'>Verifying account</div>");
        this.accountVerificationMessage = $("<div class='messageSpacingTop'>Please wait...</div>");

        this.accountVerificationWrapper.append(this.accountVerificationHeadline);
        this.accountVerificationWrapper.append(this.accountVerificationMessage);

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

        // First, get the player details to check if the player is already verified.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                let sendVerifyRequest = true;
                if (typeof result === "object") {
                    if (result.getVerified()) {
                        OverlayManager.replaceOverlay(
                            TankTrouble.MessageOverlay,
                            { headline: "Alright!", message: "Your account's email has already been verified" },
                            true
                        );

                        sendVerifyRequest = false;
                    }
                }

                if (sendVerifyRequest) {
                    // Send request to verify account using player id and token.
                    Backend.verifyAccount(this.playerId, this.token, Caches.getPlayerDetailsCache())
                        .then(verifyResult => {
                            OverlayManager.replaceOverlay(
                                TankTrouble.MessageOverlay,
                                { headline: verifyResult.headline, message: verifyResult.message },
                                true
                            );
                        })
                        .catch(message => {
                            OverlayManager.replaceOverlay(
                                TankTrouble.MessageOverlay,
                                { message },
                                true
                            );
                        });
                }
            })
            .catch(message => {
                OverlayManager.replaceOverlay(
                    TankTrouble.MessageOverlay,
                    { message },
                    true
                );
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

        return this.accountVerificationWrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return false;
    }
};
