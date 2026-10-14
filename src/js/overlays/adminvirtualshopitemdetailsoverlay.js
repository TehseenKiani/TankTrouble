import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { ClientManager } from "../clientmanager.js";
import { Commands } from "../commands.js";
import { Images } from "../images.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.AdminVirtualShopItemDetailsOverlay = {

    init() {
        Commands.register("--admin-virtual-item.open", (button, data) => {
            OverlayManager.pushOverlay(TankTrouble.AdminVirtualShopItemDetailsOverlay, { adminId: button.attr("data-admin-id"), itemId: data.itemId });
        });
    },

    wrapper: null,
    navigation: null,
    shopItem: null,
    shopItemDetails: null,
    form: null,
    name: null,
    description: null,
    quantity: null,
    priceGold: null,
    priceDiamonds: null,
    availability: null,
    duration: null,
    durationStart: null,
    durationEnd: null,
    visibility: null,
    save: null,
    cancel: null,

    // State.
    initialised: false,
    adminId: null,
    itemId: null,
    item: null,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $('<div class="adminVirtualShopItemDetails"/>');
        this.navigation = new AdminOverlayNavigation();
        this.shopItem = $("<div/>");
        this.shopItemDetails = $("<div/>");
        this.form = $('<form class="admin"/>');
        this.name = $('<textarea name="name" rows="3" placeholder="Name"/>');
        this.description = $('<textarea name="description" rows="3" placeholder="Description"></textarea>');
        this.quantity = $('<input name="quantity" type="text" placeholder="Quantity"/>');
        this.priceGold = $('<input name="priceGold" type="text" placeholder="0"/>');
        this.priceDiamonds = $('<input name="priceDiamonds" type="text" placeholder="0"/>');
        this.availability = $('<select name="availability"/>');
        this.availability.append('<option value="always">Always available</option>');
        this.availability.append('<option value="during-duration">Available once</option>');
        this.availability.append('<option value="during-duration-every-week">Available every week</option>');
        this.availability.append('<option value="during-duration-every-month">Available every month</option>');
        this.availability.append('<option value="during-duration-every-year">Available every year</option>');
        this.availability.append('<option value="never">Never available</option>');
        this.duration = $("<span/>");
        this.durationStart = $('<input class="date" name="durationStart" type="datetime-local"/>');
        this.durationEnd = $('<input class="date" name="durationEnd" type="datetime-local"/>');
        this.visibility = $('<select name="visibility"/>');
        this.visibility.append('<option value="always">Always visible</option>');
        this.visibility.append('<option value="hidden">Hidden</option>');
        this.visibility.append('<option value="when-available">Visible when available</option>');
        this.visibility.append('<option value="one-day-before-available">Visible from one day before available</option>');
        this.visibility.append('<option value="three-days-before-available">Visible from three days before available</option>');
        this.visibility.append('<option value="one-week-before-available">Visible from one week before available</option>');
        this.visibility.append('<option value="two-weeks-before-available">Visible from two weeks before available</option>');
        this.save = $('<button class="small" type="submit">Save changes</button>');
        this.cancel = $('<button class="small" type="button">Cancel</button>');

        Utils.restrictInputToDigits(this.priceGold);
        Utils.restrictInputToDigits(this.priceDiamonds);

        this.form.append(
            this.name,
            this.description,
            "<br>",
            this.quantity,
            "<br>",
            this.priceGold,
            $(`<img ${Images.attributes("admin/gold.png")}/>`),
            this.priceDiamonds,
            $(`<img ${Images.attributes("admin/diamond.png")}/>`),
            "<br>",
            this.availability,
            this.duration.append(
                "from",
                this.durationStart,
                "to",
                this.durationEnd
            ),
            "<br>",
            this.visibility,
            "<br>",
            this.save,
            this.cancel
        );

        this.wrapper.append(this.navigation.element, this.shopItem, this.shopItemDetails, this.form);

        // Setup name text area.
        this.name.on("input", () => {
            this._hasChanged();
        });

        // Setup description text area.
        this.description.on("input", () => {
            this._hasChanged();
        });

        // Setup quantity input.
        this.quantity.on("input", () => {
            this._hasChanged();
        });

        // Set up gold price input.
        this.priceGold.on("input", () => {
            this._hasChanged();
        });

        // Setup diamond price input.
        this.priceDiamonds.on("input", () => {
            this._hasChanged();
        });

        // Setup availability.
        this.availability.on("change", () => {
            this._updateForm();
            this._hasChanged();
        });

        // Setup duration start input.
        this.durationStart.on("change", () => {
            this._hasChanged();
        });

        // Setup duration end input.
        this.durationEnd.on("change", () => {
            this._hasChanged();
        });

        // Setup visibility.
        this.visibility.on("change", () => {
            this._hasChanged();
        });

        // Setup cancel button.
        this.cancel.on("click", event => {
            OverlayManager.popOverlay(true, false);
        });

        // Setup form submit.
        this.form.on("submit", () => {
            this.form.find("input, textarea, select, button").prop("disabled", true);

            Backend.editVirtualShopItem(
                this.adminId,
                this.item.id,
                this.name.val(),
                this.quantity.val() !== "" ? this.quantity.val() : null,
                this.description.val() !== "" ? this.description.val() : null,
                Number(this.priceGold.val()),
                Number(this.priceDiamonds.val()),
                this.availability.val(),
                this.visibility.val(),
                Utils.dateTimeValueToEpoch(this.durationStart.val()),
                Utils.dateTimeValueToEpoch(this.durationEnd.val()),
                Caches.getVirtualShopCache()
            )
                .then(result => {
                    if (typeof result === "object") {
                        // Signal that virtual shop content was changed.
                        ClientManager.broadcastContentUpdated(this.adminId, true);

                        OverlayManager.popOverlay(true, true);
                    } else {
                        this._handleError(result, false);
                    }
                })
                .catch(message => {
                    this._handleError(message, true);
                });

            return false;
        });

        this.initialised = true;
    },

    /**
     * Show overlay.
     * Expects string params.adminId
     * Expects int params.itemId
     * @param {Object} params
     */
    show(params) {
        this._initialise();

        this.adminId = params.adminId;
        this.itemId = params.itemId;

        this.navigation.update(this.adminId);

        this.shopItem.empty();
        this.shopItemDetails.empty();
        this.form.hide();

        Backend.getVirtualShopItemDetailsAsAdmin(this.adminId, this.itemId)
            .then(result => {
                if (typeof result === "object") {
                    this.item = result;

                    this.shopItem.append(result.html.virtualShopItem);
                    this.shopItemDetails.append(result.html.virtualShopItemDetails);

                    this.name.val(result.name);
                    this.description.val(result.description);
                    this.quantity.val(result.quantity);
                    this.priceGold.val(result.priceGold);
                    this.priceDiamonds.val(result.priceDiamonds);
                    this.availability.val(result.availability);
                    if (result.durationStart === null) {
                        this.durationStart.val("");
                    } else {
                        this.durationStart.val(Utils.epochToDateTimeValue(result.durationStart));
                    }
                    if (result.durationEnd === null) {
                        this.durationEnd.val("");
                    } else {
                        this.durationEnd.val(Utils.epochToDateTimeValue(result.durationEnd));
                    }
                    this.visibility.val(result.visibility);

                    this.form.find("input, textarea, select, button").prop("disabled", false);
                    this.save.prop("disabled", true);

                    this._updateForm();

                    this.form.show();
                } else {
                    this._handleError(result, true);
                }
            })
            .catch(message => {
                this._handleError(message, true);
            });
    },

    hide() {
        this._initialise();
    },

    getContents() {
        this._initialise();

        return this.wrapper;
    },

    shouldHide() {
        return !this._hasChanged() || confirm("WARNING!\nChanges will be lost.");
    },

    canBeCancelled() {
        return true;
    },

    _updateForm() {
        switch (this.availability.val()) {
            case "always":
            case "never": {
                this.duration.hide();
                break;
            }
            case "during-duration": {
                this.durationStart.attr("placeholder", "now");
                this.durationEnd.attr("placeholder", "always");
                this.duration.show();
                break;
            }
            case "during-duration-every-week": {
                this.durationStart.attr("placeholder", "beginning of week");
                this.durationEnd.attr("placeholder", "end of week");
                this.duration.show();
                break;
            }
            case "during-duration-every-month": {
                this.durationStart.attr("placeholder", "beginning of month");
                this.durationEnd.attr("placeholder", "end of month");
                this.duration.show();
                break;
            }
            case "during-duration-every-year": {
                this.durationStart.attr("placeholder", "beginning of year");
                this.durationEnd.attr("placeholder", "end of year");
                this.duration.show();
                break;
            }
        }
    },

    _hasChanged() {
        let result = false;
        result ||= this.item.name !== this.name.val();
        result ||= this.item.description !== (this.description.val() !== "" ? this.description.val() : null);
        result ||= this.item.quantity !== (this.quantity.val() !== "" ? this.quantity.val() : null);
        result ||= this.item.priceGold !== Number(this.priceGold.val());
        result ||= this.item.priceDiamonds !== Number(this.priceDiamonds.val());
        result ||= this.item.availability !== this.availability.val();
        result ||= this.item.durationStart !== Utils.dateTimeValueToEpoch(this.durationStart.val());
        result ||= this.item.durationEnd !== Utils.dateTimeValueToEpoch(this.durationEnd.val());
        result ||= this.item.visibility !== this.visibility.val();

        this.save.prop("disabled", !result);

        return result;
    },

    _handleError(message, closeOverlay) {
        alert(message);
        if (closeOverlay) {
            OverlayManager.popOverlay(false, true);
        } else {
            this.form.find("input, textarea, select, button").prop("disabled", false);
        }
    }
};
