import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { Commands } from "./commands.js";
import { OverlayManager } from "./overlaymanager.js";
import { Shop } from "./shop.js";

export class VirtualShop {
    static eventListeners = [];
    static EVENTS = {
        ITEM_PURCHASED: "item purchased"
    };

    static init() {
        Commands.register("--virtual-shop.buy", VirtualShop._buyCommandHandler);
        Commands.register("--virtual-shop.stock-up", VirtualShop._stockUpCommandHandler);
        Commands.register("--virtual-shop.details", VirtualShop._detailsCommandHandler);
    }

    static _buyCommandHandler(button, data) {
        const details = button.closest(".shopItemDetails");
        const elementToReplace = details.length > 0 ? details.find(".details") : button.closest(".shopItem").find(".preview");
        VirtualShop.purchaseVirtualShopItem(button.attr("data-player-id"), data.itemId, elementToReplace);
    }

    static _stockUpCommandHandler(button, data) {
        VirtualShop.showStockUp(button.attr("data-player-id"), data.missingGold, data.missingDiamonds);
    }

    static _detailsCommandHandler(button, data) {
        VirtualShop.showVirtualShopItemDetails(button.attr("data-player-id"), data.itemId);
    }

    static addEventListener(callback, context) {
        VirtualShop.eventListeners.push({ callback, context });
    }

    static removeEventListener(callback, context) {
        for (let i = 0; i < VirtualShop.eventListeners.length; i++) {
            if (VirtualShop.eventListeners[i].callback === callback && VirtualShop.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                VirtualShop.eventListeners.splice(i, 1);
                return;
            }
        }
    }

    static showVirtualShopItemDetails(playerId, itemId) {
        OverlayManager.pushOverlay(
            TankTrouble.VirtualShopItemDetailsOverlay,
            { playerId, itemId }
        );
    }

    static showStockUp(playerId, missingGold, missingDiamonds) {
        OverlayManager.pushOverlay(
            TankTrouble.ShopStockUpOverlay,
            { playerId, missingGold, missingDiamonds }
        );
    }

    static purchaseVirtualShopItem(playerId, itemId, elementToReplace) {
        $("#overlay .purchaseOption .buy").prop("disabled", true);
        $("#overlay .purchaseOption .info").prop("disabled", true);
        $("#doneVirtualShopItemButton").prop("disabled", true);
        $("#backVirtualShopItemDetailsButton").prop("disabled", true);

        Backend.purchaseVirtualShopItem(playerId, itemId, Caches.getCurrencyCache(), Caches.getVirtualShopCache(), Caches.getGarageContentCache())
            .then(result => {
                if (typeof result === "boolean") {
                    if (result) {
                        Shop.sendPurchasedItemToTank(playerId, elementToReplace);

                        VirtualShop._notifyEventListeners(VirtualShop.EVENTS.ITEM_PURCHASED, { playerId, itemId });
                    }

                    if (OverlayManager.isOverlayShowing()) {
                        OverlayManager.popOverlay(false, true);
                    }
                } else {
                    TankTrouble.ErrorBox.show(result);

                    if (OverlayManager.isOverlayShowing()) {
                        OverlayManager.popOverlay(false, true);
                    }
                }
            });
    }

    static _notifyEventListeners(evt, data) {
        for (let i = 0; i < VirtualShop.eventListeners.length; i++) {
            VirtualShop.eventListeners[i].callback(VirtualShop.eventListeners[i].context, evt, data);
        }
    }
}
