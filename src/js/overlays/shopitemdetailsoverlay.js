import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.ShopItemDetailsOverlay = {
    wrapper: null,
    itemDetails: null,
    form: null,
    back: null,

    // State.
    initialised: false,
    itemId: null,

    _initialise() {
        this.wrapper = $("<div class='shopItemDetails centre'/>");

        this.itemDetails = $("<div></div>");

        this.form = $("<form></form>");
        this.back = $("<button class='medium' type='submit' tabindex='-1'>Back</button>");

        Utils.addOverlayFormRow(this.form, this.back);

        this.wrapper.append(this.itemDetails);
        this.wrapper.append(this.form);

        this.form.submit(event => {
            OverlayManager.popOverlay(true, false);

            return false;
        });

        this.initialised = true;
    },

    /** Expected params:
     * itemId
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store itemId.
        this.itemId = params.itemId;

        this.itemDetails.empty();

        Backend.getShopItemDetails(this.itemId)
            .then(result => {
                if (typeof result === "object") {
                    this.itemDetails.html(result.html.shopItemDetails);
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
        return true;
    },

    canBeCancelled() {
        return true;
    }
};
