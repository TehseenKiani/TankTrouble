import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { OverlayManager } from "../overlaymanager.js";
import { Users } from "../users.js";

TankTrouble.AccountReversalOverlay = {
    // jQuery objects.
    accountReversalWrapper: null,
    accountReversalHeadline: null,
    accountReversalMessage: null,

    // State.
    initialised: false,
    playerId: null,
    token: null,

    _initialise() {
        this.accountReversalWrapper = $("<div class='account centre'/>");
        this.accountReversalHeadline = $("<div class='headline'>Reverting account change</div>");
        this.accountReversalMessage = $("<div class='messageSpacingTop'>Please wait...</div>");

        this.accountReversalWrapper.append(this.accountReversalHeadline);
        this.accountReversalWrapper.append(this.accountReversalMessage);

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

        // Send request to revert account change using player id and token.
        Backend.revertAccountChangeWithToken(this.playerId, this.token, Caches.getPlayerDetailsCache(), Caches.getEmailCache(), Caches.getCurrencyCache())
            .then(result => {
                OverlayManager.replaceOverlay(
                    TankTrouble.MessageOverlay,
                    { headline: result.headline, message: result.message },
                    true
                );

                Users.updateUser(this.playerId, false, true);
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

        return this.accountReversalWrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return false;
    }
};
