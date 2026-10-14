import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { AdminUtils } from "../adminutils.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { ClientManager } from "../clientmanager.js";
import { Commands } from "../commands.js";
import { OverlayManager } from "../overlaymanager.js";
import { UIConstants } from "../tt/ui/uiconstants.js";

TankTrouble.AdminShopOverlay = {

    init() {
        Commands.register("--admin-shop.open", (button, data) => { OverlayManager.replaceOverlay(TankTrouble.AdminShopOverlay, { adminId: button.attr("data-admin-id"), playerId: button.attr("data-player-id") }); });
        Commands.register("--admin-shop.unlock-item", (button, data) => {
            const select = button.closest(".shopItem").find("select");
            TankTrouble.AdminShopOverlay.unlockShopItem(data.itemId, select.length > 0 ? select.val() : null);
        });
        Commands.register("--admin-shop.unlock-gold-item", (button, data) => { TankTrouble.AdminShopOverlay.unlockGoldShopItem(data.itemId); });
        Commands.register("--admin-shop.unlock-virtual-item", (button, data) => { TankTrouble.AdminShopOverlay.unlockVirtualShopItem(data.itemId); });
        Commands.register("--admin-shop.edit-virtual-item", (button, data) => { TankTrouble.AdminShopOverlay.showVirtualShopItemDetails(data.itemId); });
    },

    // jQuery objects.
    wrapper: null,
    navigation: null,
    header: null,
    shopItems: null,
    goldShopItems: null,
    virtualShopItems: null,

    // State.
    initialised: false,
    adminId: null,
    playerId: null,

    _initialise() {
        this.wrapper = $('<div class="admin shop"/>');

        this.navigation = new AdminOverlayNavigation();

        this.header = $("<div class='header'/>");
        this.shopItems = $("<span/>");
        this.goldShopItems = $("<span/>");
        this.virtualShopItems = $("<span/>");

        this.wrapper.append(this.navigation.element, this.header, this.shopItems, this.goldShopItems, this.virtualShopItems);

        this.initialised = true;
    },

    /**
     * Show overlay.
     * Expects string params.adminId
     * Optional string params.playerId = null
     * If set that player's shop will be loaded. Otherwise all shop items are loaded.
     * @param {Object} params
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        this.adminId = params.adminId;
        this.playerId = params.playerId !== undefined ? params.playerId : null;

        this.navigation.update(this.adminId);

        this.header.empty();
        this.shopItems.empty();
        this.goldShopItems.empty();
        this.virtualShopItems.empty();

        if (this.playerId) {
            // Set header.
            AdminUtils.createPlayerNamesWithLookupByPlayerIds([this.playerId], this.adminId).then(result => {
                this.header.append(result, "'s shop");
            });

            // Look up admin's gmLevel and only fetch relevant item types.
            Backend.getPlayerDetails(this.adminId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        if (this.playerId) {
                            if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_PURCHASE_SHOP_ITEM) {
                                this._getShopItems();
                            }
                            if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_PURCHASE_GOLD_SHOP_ITEM) {
                                this._getGoldShopItems();
                            }
                            if (result.getGmLevel() >= UIConstants.ADMIN_LEVEL_PURCHASE_VIRTUAL_SHOP_ITEM) {
                                this._getVirtualShopItems();
                            }
                        }
                    }
                });
        } else {
            this._getShopItems();
            this._getGoldShopItems();
            this._getVirtualShopItems();
        }
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
    },

    unlockShopItem(itemId, option) {
        this.wrapper.find("button, input").prop("disabled", true);

        Backend.purchaseShopItemAsAdmin(this.adminId, this.playerId, itemId, option, Caches.getPlayerDetailsCache(), Caches.getCurrencyCache(), Caches.getVirtualShopCache(), Caches.getGarageContentCache())
            .then(result => {
                if (result === true) {
                    // Send signal that user was potentially updated.
                    ClientManager.broadcastUpdateUserByAdmin(this.adminId, this.playerId, false, false, true);

                    OverlayManager.replaceOverlay(
                        TankTrouble.AdminShopOverlay,
                        { adminId: this.adminId, playerId: this.playerId }
                    );
                }
            });
    },

    unlockGoldShopItem(itemId) {
        this.wrapper.find("button, input").prop("disabled", true);

        Backend.purchaseGoldShopItemAsAdmin(this.adminId, this.playerId, itemId, Caches.getCurrencyCache(), Caches.getVirtualShopCache())
            .then(result => {
                if (result === true) {
                    // Send signal that user was potentially updated.
                    ClientManager.broadcastUpdateUserByAdmin(this.adminId, this.playerId, false, false, true);

                    OverlayManager.replaceOverlay(
                        TankTrouble.AdminShopOverlay,
                        { adminId: this.adminId, playerId: this.playerId }
                    );
                }
            });
    },

    unlockVirtualShopItem(itemId) {
        this.wrapper.find("button, input").prop("disabled", true);

        Backend.purchaseVirtualShopItemAsAdmin(this.adminId, this.playerId, itemId, Caches.getVirtualShopCache(), Caches.getGarageContentCache())
            .then(result => {
                if (result === true) {
                    // Send signal that user was potentially updated.
                    ClientManager.broadcastUpdateUserByAdmin(this.adminId, this.playerId, false, false, true);

                    OverlayManager.replaceOverlay(
                        TankTrouble.AdminShopOverlay,
                        { adminId: this.adminId, playerId: this.playerId }
                    );
                }
            });
    },

    showVirtualShopItemDetails(itemId) {
        OverlayManager.pushOverlay(
            TankTrouble.AdminVirtualShopItemDetailsOverlay,
            { adminId: this.adminId, itemId }
        );
    },

    _getShopItems() {
        Backend.getShopItemsAsAdmin(this.adminId, this.playerId)
            .then(result => {
                if (Array.isArray(result)) {
                    for (let i = 0; i < result.length; i++) {
                        this.shopItems.append(result[i].html.shopItem);
                    }
                }
            });
    },

    _getGoldShopItems() {
        Backend.getGoldShopItemsAsAdmin(this.adminId, this.playerId)
            .then(result => {
                if (Array.isArray(result)) {
                    for (let i = 0; i < result.length; i++) {
                        this.goldShopItems.append(result[i].html.goldShopItem);
                    }
                }
            });
    },

    _getVirtualShopItems() {
        Backend.getVirtualShopItemsAsAdmin(this.adminId, this.playerId)
            .then(result => {
                if (Array.isArray(result)) {
                    for (let i = 0; i < result.length; i++) {
                        this.virtualShopItems.append(result[i].html.virtualShopItem);
                    }
                }
            });
    }
};
