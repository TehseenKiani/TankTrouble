import { TankTrouble } from "./tanktrouble.js";
import { GameSession } from "./gamesession.js";
import { UIConstants } from "./tt/ui/uiconstants.js";

export class OverlayManager {
    static initialOverlayParams = {};
    static overlayQueue = [];
    static overlay = null;
    static closeButton = null;
    static overlayShowing = false;
    static currentOverlay = null;
    static inTransition = false;
    static content = null;

    static init(hashString) {
        if (hashString.length > 0) {
            const overlayString = decodeURIComponent(hashString.slice(1));
            const overlayParams = overlayString.split("&");
            for (let i = 0; i < overlayParams.length; ++i) {
                const overlayParam = overlayParams[i].split("=");

                if (overlayParam.length === 2) {
                    OverlayManager.initialOverlayParams[overlayParam[0]] = overlayParam[1];
                }
            }
        }

        OverlayManager.overlay = $('<div id="overlay" class="noselect"/>');
        OverlayManager.closeButton = $('<button class="warning medium">×</button>');

        OverlayManager.overlay.append(OverlayManager.closeButton);

        $("body").append(OverlayManager.overlay);
    }

    static hasInitialOverlay() {
        return OverlayManager.initialOverlayParams.type !== undefined;
    }

    static isOverlayShowing() {
        return OverlayManager.overlayShowing;
    }

    static getCurrentOverlay() {
        return OverlayManager.currentOverlay;
    }

    static enqueueInitialOverlay() {
        const { initialOverlayParams } = OverlayManager;
        switch (initialOverlayParams.type) {
            case "verify":
            {
                if (initialOverlayParams.playerid !== undefined && initialOverlayParams.token !== undefined) {
                    OverlayManager.enqueueOverlay(
                        TankTrouble.AccountVerificationOverlay,
                        { playerId: initialOverlayParams.playerid, token: initialOverlayParams.token }
                    );
                }
                break;
            }
            case "recover":
            {
                if (initialOverlayParams.playerid !== undefined && initialOverlayParams.token !== undefined) {
                    OverlayManager.enqueueOverlay(
                        TankTrouble.AccountRecoveryOverlay,
                        { playerId: initialOverlayParams.playerid, token: initialOverlayParams.token }
                    );
                }
                break;
            }
            case "revert":
            {
                if (initialOverlayParams.playerid !== undefined && initialOverlayParams.token !== undefined) {
                    OverlayManager.enqueueOverlay(
                        TankTrouble.AccountReversalOverlay,
                        { playerId: initialOverlayParams.playerid, token: initialOverlayParams.token }
                    );
                }
                break;
            }
            case "unsubscribenewsletter":
            {
                if (initialOverlayParams.playerid !== undefined) {
                    OverlayManager.enqueueOverlay(
                        TankTrouble.NewsletterUnsubscriptionOverlay,
                        { playerId: initialOverlayParams.playerid }
                    );
                }
                break;
            }
            case "messages":
            {
                OverlayManager.enqueueOverlay(
                    TankTrouble.MessagesOverlay,
                    {}
                );
                break;
            }
        }
    }

    /**
     * Enqueues an overlay behind any existing.
     * Will always succeed.
     * This function should be used by non-user initiated events (e.g. NOT from a button).
     *
     * @param {Object} overlayClass
     * @param {Object} overlayParams
     * @param {Function} closeCallback
     */
    static enqueueOverlay(overlayClass, overlayParams, closeCallback) {
        OverlayManager.overlayQueue.push({
            overlay: overlayClass,
            params: overlayParams,
            closeCallback
        });

        // Show overlay if only one is in the queue.
        if (OverlayManager.overlayQueue.length === 1) {
            OverlayManager._showOverlay(0);
        }
    }

    /**
     * Pushes overlay in front of any existing.
     * Will fail if an existing overlay is in transition.
     * This function should be used by user-initiated events (e.g. button presses).
     *
     * @param {Object} overlayClass
     * @param {Object} overlayParams
     * @param {Function} closeCallback
     * @returns {boolean} Return whether the push succeeded or not.
     */
    static pushOverlay(overlayClass, overlayParams, closeCallback) {
        if (OverlayManager.inTransition) {
            return false;
        }

        if (OverlayManager.overlayQueue.length > 0) {
            const [currentOverlay] = OverlayManager.overlayQueue;
            currentOverlay.overlay.hide();
        }

        OverlayManager.overlayQueue.unshift({
            overlay: overlayClass,
            params: overlayParams,
            closeCallback
        });

        if (OverlayManager.overlayQueue.length >= 2) {
            OverlayManager._updateOverlay();
        } else {
            OverlayManager._showOverlay(0);
        }

        return true;
    }

    /**
     * Pops any existing overlay.
     * If preserveQueue is false, any queued overlays will be popped as well.
     * If force is false, the pop will fail if an existing overlay is in transition OR if the current overlay should not hide.
     * Force should never be true when calling this function from a user-initiated, repeatable event.
     *
     * @param {boolean} preserveQueue
     * @param {boolean} force
     * @returns {boolean} Return whether the pop succeeded or not.
     */
    static popOverlay(preserveQueue, force) {
        if (preserveQueue === undefined) {
            preserveQueue = false;
        }

        if (force === undefined) {
            force = false;
        }

        if (!force && OverlayManager.inTransition) {
            return false;
        }

        // Attempt to pop first overlay.
        if (OverlayManager._attemptToHideCurrentOverlay(force)) {
            OverlayManager.overlayQueue.shift();
        } else {
            return false;
        }

        if (!preserveQueue) {
            // Unravel entire queue.
            while (OverlayManager.overlayQueue.length > 0) {
                if (OverlayManager._attemptToHideCurrentOverlay(true)) {
                    OverlayManager.overlayQueue.shift();
                } else {
                    return false; // Should never happen, since force is true in above call.
                }
            }
        }

        // Show next overlay if any is in the queue or hide overlay.
        if (OverlayManager.overlayQueue.length > 0) {
            OverlayManager._updateOverlay();
        } else {
            OverlayManager._hideOverlay();
        }

        return true;
    }

    /**
     * Replaces existing overlay if one exists, otherwise just enqueues the given overlay.
     * See documentation for replaceOverlay
     */
    static replacePotentialOverlay(overlayClass, overlayParams, force, closeCallback) {
        if (OverlayManager.isOverlayShowing()) {
            OverlayManager.replaceOverlay(overlayClass, overlayParams, force, closeCallback);
        } else {
            OverlayManager.enqueueOverlay(overlayClass, overlayParams, closeCallback);
        }
    }

    /**
     * Replaces existing overlay.
     * If force is false, the replacement will fail if an existing overlay is in transition OR if the current overlay should not hide.
     * Force should never be true when calling this function from a user-initiated, repeatable event.
     *
     * @param {Object} overlayClass
     * @param {Object} overlayParams
     * @param {boolean} force
     * @param {Function} closeCallback
     * @returns {boolean} Return whether the replacement succeeded or not.
     */
    static replaceOverlay(overlayClass, overlayParams, force, closeCallback) {
        if (force === undefined) {
            force = false;
        }

        if (!force && OverlayManager.inTransition) {
            return false;
        }

        if (OverlayManager._attemptToHideCurrentOverlay(force)) {
            OverlayManager.overlayQueue.shift();
        } else {
            return false;
        }

        OverlayManager.overlayQueue.unshift({
            overlay: overlayClass,
            params: overlayParams,
            closeCallback
        });

        OverlayManager._updateOverlay();

        return true;
    }

    static _attemptToHideCurrentOverlay(force) {
        if (OverlayManager.overlayQueue.length > 0) {
            const [currentOverlay] = OverlayManager.overlayQueue;

            // Check if overlay should hide.
            if (force || currentOverlay.overlay.shouldHide()) {
                currentOverlay.overlay.hide();
                if (currentOverlay.closeCallback !== undefined) {
                    currentOverlay.closeCallback();
                }
            } else {
                // Cancel any further behaviour.
                return false;
            }

            return true;
        }

        return false;
    }

    static _updateOverlay() {
        OverlayManager.content.stop().fadeOut(UIConstants.OVERLAY_FADE_TIME);
        OverlayManager.closeButton.stop().fadeOut(UIConstants.OVERLAY_FADE_TIME);

        $(document).off("keyup.overlay");

        OverlayManager.closeButton.off("click.overlay");

        OverlayManager._showOverlay(UIConstants.OVERLAY_FADE_TIME);
    }

    static _showOverlay(delay) {
        OverlayManager.inTransition = true;

        const [newOverlay] = OverlayManager.overlayQueue;

        setTimeout(() => {
            if (OverlayManager.content) {
                OverlayManager.content.detach();
            }
            OverlayManager.content = newOverlay.overlay.getContents().hide();
            OverlayManager.overlay.prepend(OverlayManager.content);

            GameSession.disableGameInput();

            OverlayManager.overlayShowing = true;
            OverlayManager.currentOverlay = newOverlay.overlay;

            $("body").addClass("noscroll");

            OverlayManager.overlay.stop().fadeIn(UIConstants.OVERLAY_FADE_TIME);
            OverlayManager.content.stop().fadeIn(UIConstants.OVERLAY_FADE_TIME, () => {
                OverlayManager.inTransition = false;
            });

            newOverlay.overlay.show(newOverlay.params);

            if (newOverlay.overlay.canBeCancelled()) {
                OverlayManager.closeButton.stop().fadeIn(UIConstants.OVERLAY_FADE_TIME);

                $(document).on("keyup.overlay", event => {
                    if (event.which === 27) {
                        $(document).off("keyup.overlay");
                        OverlayManager.popOverlay(false, false);
                    }
                });

                OverlayManager.closeButton.on("click.overlay", event => {
                    OverlayManager.popOverlay(false, false);
                });
            } else {
                OverlayManager.closeButton.hide();
            }
        },
        delay);
    }

    static _hideOverlay() {
        OverlayManager.inTransition = true;

        OverlayManager.overlay.stop().fadeOut(UIConstants.OVERLAY_FADE_TIME, () => {
            OverlayManager.inTransition = false;
        });

        $(document).off("keyup.overlay");

        OverlayManager.closeButton.off("click.overlay");

        GameSession.enableGameInput();

        OverlayManager.overlayShowing = false;
        OverlayManager.currentOverlay = null;

        $("body").removeClass("noscroll");
    }
}
