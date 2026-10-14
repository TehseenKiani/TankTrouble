import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.ShopStockUpOverlay = {
    wrapper: null,
    headline: null,
    itemList: null,
    form: null,
    cancel: null,

    // State.
    initialised: false,
    playerId: null,
    missingGold: 0,
    missingDiamonds: 0,
    stockUpOptions: null,

    _initialise() {
        this.wrapper = $("<div class='shopStockUp centre'/>");

        this.headline = $("<div class='headline'>Oh no!</div>");

        this.itemList = $("<div></div>");

        this.form = $("<form></form>");
        this.cancel = $("<button id='cancelShopStockUpButton' class='medium warning' type='submit' tabindex='-1'>Cancel</button>");

        Utils.addOverlayFormRow(this.form, this.cancel);

        this.wrapper.append(this.headline);
        this.wrapper.append(this.message);
        this.wrapper.append(this.itemList);
        this.wrapper.append(this.form);

        this.form.submit(event => {
            OverlayManager.popOverlay(true, false);

            return false;
        });

        this.initialised = true;
    },

    /** Expected params:
     * playerId
     * missingGold
     * missingDiamonds
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store playerId, missingGold and missingDiamonds.
        this.playerId = params.playerId;
        this.missingGold = params.missingGold;
        this.missingDiamonds = params.missingDiamonds;

        // Reset submit button.
        this.cancel.prop("disabled", false);

        // Reset state.
        this.stockUpOptions = [];

        let headline = "You need";
        if (this.missingGold > 0) {
            headline += ` ${this.missingGold} gold`;
        }
        if (this.missingGold > 0 && this.missingDiamonds > 0) {
            headline += " and";
        }
        if (this.missingDiamonds > 0) {
            headline += ` ${this.missingDiamonds} Dimitrium`;
        }

        this.headline.html(headline);

        this.itemList.empty();

        Backend.getShopStockUpOptions(this.playerId, this.missingGold, this.missingDiamonds)
            .then(result => {
                if (Array.isArray(result)) {
                    this.stockUpOptions = result;
                    this._updateItemList();
                } else {
                    TankTrouble.ErrorBox.show(result);

                    OverlayManager.popOverlay(false, true);
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

        return this.wrapper;
    },

    shouldHide() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.cancel.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    },

    _updateItemList() {
        this.itemList.hide();
        this.itemList.empty();
        for (let i = 0; i < this.stockUpOptions.length; ++i) {
            this.itemList.append(this.stockUpOptions[i].html.stockUpOption);
        }
        this.itemList.show();
    }
};
