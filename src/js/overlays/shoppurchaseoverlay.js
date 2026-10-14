import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { OverlayManager } from "../overlaymanager.js";
import { Shop } from "../shop.js";
import { Users } from "../users.js";
import { Utils } from "../utils.js";

TankTrouble.ShopPurchaseOverlay = {
    wrapper: null,
    headline: null,
    username: null,
    form: null,
    nameInput: null,
    cardDiv: null,
    submit: null,
    stripeMessage: null,
    itemDetails: null,

    // Stripe.
    stripeCard: null,
    playerId: null,

    // State.
    initialised: false,
    stripe: null,
    itemId: null,
    itemOption: null,

    _initialise() {
        this.wrapper = $("<div class='shopPurchase centre'/>");

        this.headline = $("<div class='headline'>Payment info for</div>");
        this.username = $("<div class='username huge'></div>");

        this.form = $("<form></form>");

        this.itemDetails = $("<div></div>");
        this.nameInput = $("<input placeholder='Full name' name='name' type='text'/>");
        this.cardDiv = $("<div id='cardShopPurchase' class='card'></div>");
        this.submit = $("<button id='purchaseShopPurchaseButton' class='medium' type='submit' tabindex='-1'>Buy</button>");
        this.stripeMessage = $("<div class='note shopPurchaseVerticalCentring'>We use <a href='https://stripe.com' target='_blank'>Stripe</a> for secure handling of your payment</div>");

        Utils.addOverlayFormRow(this.form, this.nameInput);
        Utils.addOverlayFormRow(this.form, this.cardDiv);
        Utils.addOverlayFormRow(this.form, this.submit);

        this.wrapper.append(this.itemDetails);
        this.wrapper.append(this.headline);
        this.wrapper.append(this.username);
        this.wrapper.append(this.form);
        this.wrapper.append(this.stripeMessage);

        this.nameInput.tooltipster({ side: "right", theme: "tooltipster-error" });
        this.cardDiv.tooltipster({ side: "right", theme: "tooltipster-error" });

        this.form.submit(event => {
            this.nameInput.blur(); // Necessary to blur at this time, since the card input does not take focus. Therefore, the name input already has focus and fails to grab it again in error handling.
            this._createPaymentMethod();
            return false;
        });

        this.nameInput.blur(event => {
            this._checkName();
        });

        this.nameInput.keydown(event => {
            return this._checkKeyDown(event, this.stripeCard);
        });

        this.nameInput.focus(event => {
            $(event.currentTarget).select();
            $(event.currentTarget).tooltipster("open");
        });

        this.stripe = Stripe(g_stripeKey);
        const elements = this.stripe.elements();
        // ASGER TODO
        this.stripeCard = elements.create("card", {
            iconStyle: "solid",
            style: {
                base: {
                    color: "#FFFFFF",
                    iconColor: "#808080"
                }
            }
        });

        this.initialised = true;
    },

    /** Expected params:
     * playerId
     * itemId
     * itemOption
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        this.stripeCard.mount("#cardShopPurchase");

        // Store playerId, itemId and itemOption.
        this.playerId = params.playerId;
        this.itemId = params.itemId;
        this.itemOption = params.itemOption;

        this.showing = true;

        // Reset username. The linebreak is needed to prevent collapsing of the div.
        this.username.html("<br>");

        // Reset input values.
        this.nameInput.val("");

        // Reset submit button.
        this.submit.prop("disabled", false);

        this.itemDetails.empty();

        this.stripeCard.addEventListener("change", event => {
            const name = this.nameInput.val().trim();
            this._handleStripeOutcome(event, name);
        });

        this.nameInput.focus();

        Backend.getShopItemPurchaseDetails(this.playerId, this.itemId, this.itemOption)
            .then(result => {
                if (typeof result === "object") {
                    this.itemDetails.append(result.html.shopItemPurchaseDetails);
                } else {
                    TankTrouble.ErrorBox.show(result);

                    OverlayManager.popOverlay(false, true);
                }
            });

        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.username.text(result.getUsername());
                } else {
                    this.username.text("<ERROR>");
                }
            });
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.showing = false;

        this.nameInput.blur();
        this.stripeCard.blur();

        // Reset classes.
        this.nameInput.removeClass("inputAccepted inputRejected");
        this.cardDiv.removeClass("inputAccepted inputRejected");

        // Reset tooltips
        Utils.updateTooltip(this.nameInput, "");
        Utils.updateTooltip(this.cardDiv, "");

        this.stripeCard.removeEventListener("change");

        this.stripeCard.unmount();
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

        return this.submit.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _sendPurchaseShopItem(playerId, itemId, itemOption, name, paymentId) {
        Backend.purchaseShopItem(playerId, itemId, itemOption, name, paymentId, Caches.getPlayerDetailsCache(), Caches.getCurrencyCache(), Caches.getVirtualShopCache(), Caches.getGarageContentCache())
            .then(result => {
                if (typeof result === "object") {
                    this._showErrorMessage(result.message, result.inputField, true);
                } else if (typeof result === "string") {
                    // Need to handle card action.
                    this.stripe.handleCardAction(result).then(actionResult => {
                        this._handleStripeOutcome(actionResult, name);
                    });
                } else {
                    // Successful payment.
                    const elementToReplace = this.itemDetails.find(".preview img");
                    Shop.sendPurchasedItemToTank(playerId, elementToReplace);

                    // Send signal that user was potentially updated.
                    Users.updateUser(playerId, false, false);

                    OverlayManager.popOverlay(false, true);
                }
            })
            .catch(message => {
                this._showErrorMessage(message);
            });
    },

    _createPaymentMethod() {
        this.submit.prop("disabled", true);

        const name = this.nameInput.val().trim();
        if (name !== "") {
            // Don't perform further input validation on the client,
            // to avoid inconsistencies between server and client
            // validation

            this.stripe.createPaymentMethod("card", this.stripeCard, {
                billing_details: {
                    name
                }
            }).then(result => {
                this._handleStripeOutcome(result, name);
            });
        } else {
            this._showErrorMessage("Fill out name", "name", true);
        }
    },

    _checkName() {
        this.nameInput.removeClass("inputAccepted inputRejected");
        Utils.updateTooltip(this.nameInput, "");
        const name = this.nameInput.val().trim();
        // Do a check if still showing and field is not empty.
        if (this.showing && name !== "") {
            Utils.updateTooltip(this.nameInput, "");
            if (this.showing && name !== "") {
                this.nameInput.addClass("inputAccepted");
            }
        }
    },

    _handleStripeOutcome(result, name) {
        if (result.error) {
            this._showErrorMessage(result.error.message, "card", false);
        } else {
            this.cardDiv.removeClass("inputRejected");
            Utils.updateTooltip(this.cardDiv, "");

            if (result.paymentMethod) {
                this._sendPurchaseShopItem(this.playerId, this.itemId, this.itemOption, name, result.paymentMethod.id);
            } else if (result.paymentIntent) {
                this._sendPurchaseShopItem(this.playerId, this.itemId, this.itemOption, name, result.paymentIntent.id);
            } else if (result.complete) {
                this.cardDiv.addClass("inputAccepted");
            }
        }
    },

    _checkKeyDown(event, moveToOnEnter) {
        if (event.which === 13) {
            if (moveToOnEnter) {
                moveToOnEnter.focus();
            } else if (this.submit.prop("disabled") === false) {
                event.currentTarget.blur();
                this.form.submit();
            }
            return false;
        }
        return true;
    },

    _showErrorMessage(message, inputField, setFocus) {
        // Strip a trailing period as Stripe likes to add periods to their messages.
        if (message.at(-1) === ".") {
            message = message.slice(0, -1);
        }

        // Set focus to relevant input field.
        if (inputField !== undefined) {
            switch (inputField) {
                case "name": {
                    this.nameInput.addClass("inputRejected");
                    Utils.updateTooltip(this.nameInput, message);
                    if (setFocus) {
                        this.nameInput.focus();
                    }
                    break;
                }
                case "card": {
                    this.cardDiv.addClass("inputRejected");
                    Utils.updateTooltip(this.cardDiv, message);
                    if (setFocus) {
                        this.stripeCard.focus();
                    }
                    break;
                }
            }
            this.submit.prop("disabled", false);
        } else {
            TankTrouble.ErrorBox.show(message);

            OverlayManager.popOverlay(false, true);
        }
    }
};
