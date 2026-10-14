import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { OverlayManager } from "../overlaymanager.js";

TankTrouble.NewsletterUnsubscriptionOverlay = {
    // jQuery objects.
    newsletterUnsubscriptionWrapper: null,

    newsletterUnsubscriptionHeadline: null,
    newsletterUnsubscriptionMessage: null,

    // State.
    initialised: false,
    playerId: null,

    _initialise() {
        this.newsletterUnsubscriptionWrapper = $("<div class='account centre'/>");
        this.newsletterUnsubscriptionHeadline = $("<div class='headline'>Unsubscribing</div>");
        this.newsletterUnsubscriptionMessage = $("<div class='messageSpacingTop'>Please wait...</div>");

        this.newsletterUnsubscriptionWrapper.append(this.newsletterUnsubscriptionHeadline);
        this.newsletterUnsubscriptionWrapper.append(this.newsletterUnsubscriptionMessage);

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

        // First, get the player details to check if the player is already unsubscribed.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                let sendUnsubscribeRequest = true;
                if (typeof result === "object") {
                    if (result.getNewsSubscriber() === null) {
                        OverlayManager.replaceOverlay(
                            TankTrouble.MessageOverlay,
                            { headline: "Alright!", message: "Your account's email was never subscribed for the TankTrouble newsletter" },
                            true
                        );

                        sendUnsubscribeRequest = false;
                    } else if (!result.getNewsSubscriber()) {
                        OverlayManager.replaceOverlay(
                            TankTrouble.MessageOverlay,
                            { headline: "Alright!", message: "Your account's email has already been unsubscribed from the TankTrouble newsletter" },
                            true
                        );

                        sendUnsubscribeRequest = false;
                    }
                }

                if (sendUnsubscribeRequest) {
                    // Send request to unsubscribe newsletter using player id.
                    Backend.unsubscribeNewsletter(this.playerId, Caches.getPlayerDetailsCache())
                        .then(unsubscribeResult => {
                            OverlayManager.replaceOverlay(
                                TankTrouble.MessageOverlay,
                                { headline: unsubscribeResult.headline, message: unsubscribeResult.message },
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

        return this.newsletterUnsubscriptionWrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return false;
    }
};
