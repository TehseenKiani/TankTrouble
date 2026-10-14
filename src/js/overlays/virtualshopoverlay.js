import { ArrayUtils } from "../tt/arrayutils.js";
import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { ButtonGroup } from "../buttongroup.js";
import { Caches } from "../caches.js";
import { Images } from "../images.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.VirtualShopOverlay = {
    wrapper: null,
    logo: null,
    navigation: null,
    itemList: null,
    form: null,
    submit: null,

    // State.
    initialised: false,
    showing: false,
    playerId: null,
    shopItems: null,

    // Events.
    eventListeners: [],
    EVENTS: {
        OPENED: "opened",
        CLOSED: "closed",
        ITEM_LIST_CHANGED: "item list changed"
    },

    _initialise() {
        this.wrapper = $("<div class='virtualShop centre'/>");
        this.logo = $(`<img class='logo' ${Images.attributes("virtualShop/dimitrisEmporium.png")}/>`);
        this.navigation = new ButtonGroup(["Today's special", "Dimitri's favourites", "Flags of the world"], this.updateItemList, this);
        this.itemList = $("<div></div>");
        this.form = $("<form></form>");
        this.submit = $("<button id='doneVirtualShopItemButton' class='medium' type='submit' tabindex='-1'>Done</button>");

        Utils.addOverlayFormRow(this.form, this.submit);

        this.wrapper.append(
            this.logo,
            $("<div/>").append(this.navigation.element),
            this.itemList,
            this.form
        );

        this.form.submit(event => {
            OverlayManager.popOverlay(true, false);
            return false;
        });

        this.initialised = true;
    },

    addEventListener(callback, context) {
        this.eventListeners.push({ callback, context });
    },

    removeEventListener(callback, context) {
        for (let i = 0; i < this.eventListeners.length; i++) {
            if (this.eventListeners[i].callback === callback && this.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                this.eventListeners.splice(i, 1);
                return;
            }
        }
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

        // Reset submit button.
        this.submit.prop("disabled", false);

        // Reset state.
        this.navigation.element.hide();
        this.shopItems = [];
        this.itemList.hide();
        this.itemList.empty();

        Backend.getVirtualShopItems(this.playerId, Caches.getVirtualShopCache())
            .then(result => {
                if (Array.isArray(result)) {
                    this.shopItems = result;
                    this.navigation.setSelection(0);
                } else {
                    TankTrouble.ErrorBox.show(result);

                    OverlayManager.popOverlay(false, true);
                }
            });

        this.showing = true;

        this._notifyEventListeners(TankTrouble.VirtualShopOverlay.EVENTS.OPENED, this.playerId);
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.showing = false;

        this._notifyEventListeners(TankTrouble.VirtualShopOverlay.EVENTS.CLOSED, this.playerId);
    },

    isShowing() {
        return this.showing;
    },

    getPlayerId() {
        return this.playerId;
    },

    getItemListLabel() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.navigation.getSelectionLabel();
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

    updateItemList(filter) {
        this.itemList.hide();
        this.itemList.empty();

        const promoted = [];
        const passed = [];

        for (let i = 0; i < this.shopItems.length; ++i) {
            let filterPassed = true;

            if (filter === 0) {
                // Special - everything that is not always available.
                filterPassed &= this.shopItems[i].availability !== "always";
            } else if (filter === 1) {
                // Dimitri's favourites - everything but flags.
                filterPassed &= !this.shopItems[i].tags.includes("flag");
                filterPassed &= !this.shopItems[i].soldOut;
            } else if (filter === 2) {
                // Flags of the world - only flags.
                filterPassed &= this.shopItems[i].tags.includes("flag");
                filterPassed &= !this.shopItems[i].soldOut;
            }

            if (filterPassed) {
                if (ArrayUtils.containsSome(this.shopItems[i].tags, ["mostPopular", "anniversary", "halloweenBox", "4thOfJuly"])) {
                    promoted.push(this.shopItems[i].html.virtualShopItem);
                } else {
                    passed.push(this.shopItems[i].html.virtualShopItem);
                }
            }
        }

        if (promoted.length + passed.length > 0) {
            this.itemList.append(promoted);
            this.itemList.append(passed);
        } else {
            this.itemList.html("It looks like you already bought everything in this category<br><br>Dimitri appreciates your patronage");
        }

        this.navigation.element.show();
        this.itemList.show();

        this._notifyEventListeners(TankTrouble.VirtualShopOverlay.EVENTS.ITEM_LIST_CHANGED, this.playerId);
    },

    _notifyEventListeners(evt, data) {
        for (let i = 0; i < this.eventListeners.length; i++) {
            this.eventListeners[i].callback(this.eventListeners[i].context, evt, data);
        }
    }
};
