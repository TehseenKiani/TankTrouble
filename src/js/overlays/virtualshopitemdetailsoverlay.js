import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.VirtualShopItemDetailsOverlay = {
    wrapper: null,
    itemDetails: null,
    form: null,
    back: null,

    // State.
    initialised: false,
    playerId: null,
    itemId: null,

    _initialise() {
        this.wrapper = $("<div class='virtualShopItemDetails centre'/>");

        this.itemDetails = $("<div></div>");

        this.form = $("<form></form>");
        this.back = $("<button id='backVirtualShopItemDetailsButton' class='medium' type='submit' tabindex='-1'>Back</button>");

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
     * playerId
     * itemId
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store playerId and itemId.
        this.playerId = params.playerId;
        this.itemId = params.itemId;

        // Reset submit button.
        this.back.prop("disabled", false);

        this.itemDetails.empty();

        Backend.getVirtualShopItemDetails(this.playerId, this.itemId)
            .then(result => {
                if (typeof result === "object") {
                    this.itemDetails.html(result.html.virtualShopItemDetails);
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

        return this.back.prop("disabled") === false;
    },

    canBeCancelled() {
        return true;
    }
};
