import { TTClient } from "./tt/ttclient.js";
import { TankTrouble } from "./tanktrouble.js";
import { animate as animateElement } from "animejs";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { ClientManager } from "./clientmanager.js";
import { Commands } from "./commands.js";
import { Log } from "./tt/log.js";
import { OverlayManager } from "./overlaymanager.js";
import { UIPlayerPanel } from "./tt/ui/playerpanel/uiplayerpanel.js";
import { Users } from "./users.js";

export class ShopModel {
    itemListChangeListeners = [];
    currentShopItems = [];
    currentGoldShopItems = [];

    addItemListChangeListener(listener) {
        this.itemListChangeListeners.push(listener);
    }

    notifyItemListChangeListenersShopItemListChanged(animate) {
        for (let i = 0; i < this.itemListChangeListeners.length; i++) {
            this.itemListChangeListeners[i].shopItemListChanged(this.currentShopItems, animate);
        }
    }

    notifyItemListChangeListenersGoldShopItemListChanged(animate) {
        for (let i = 0; i < this.itemListChangeListeners.length; i++) {
            this.itemListChangeListeners[i].goldShopItemListChanged(this.currentGoldShopItems, animate);
        }
    }

    loadShopItems() {
        Backend.getShopItems()
            .then(result => {
                if (typeof result === "object") {
                    this.currentShopItems = result;
                    this.notifyItemListChangeListenersShopItemListChanged(false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    refreshShopItems() {
        Backend.getShopItems()
            .then(result => {
                if (typeof result === "object") {
                    this.currentShopItems = result;
                    this.notifyItemListChangeListenersShopItemListChanged(true);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    loadGoldShopItems() {
        Backend.getGoldShopItems()
            .then(result => {
                if (typeof result === "object") {
                    this.currentGoldShopItems = result;
                    this.notifyItemListChangeListenersGoldShopItemListChanged(false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    refreshGoldShopItems() {
        Backend.getGoldShopItems()
            .then(result => {
                if (typeof result === "object") {
                    this.currentGoldShopItems = result;
                    this.notifyItemListChangeListenersGoldShopItemListChanged(true);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }
}

export class ShopView {
    model = null;
    statusShowing = true;

    constructor(model) {
        // Store model reference
        this.model = model;
    }

    mergeShopItem(item, animate) {
        // Loop over divs displaying items
        let inserted = false;
        $("#shopItemsContainer").find(".shopItem").each((index, element) => {
            const it = $(element).data();
            if (item.id === it.id) {
                Shop.log.debug("VIEW SHOP ITEM UPDATE");
                // item is already stored here, so update it.
                const itemHtml = $(item.html.shopItem);
                const newBuyButton = itemHtml.find(".purchaseOption button.buy");
                const newInfoButton = itemHtml.find(".purchaseOption button.info");
                const newStatusLabel = itemHtml.find(".statusLabel");
                $(element).find(".purchaseOption button.buy").replaceWith(newBuyButton);
                $(element).find(".purchaseOption button.info").replaceWith(newInfoButton);
                $(element).find(".statusLabel").replaceWith(newStatusLabel);
                $(element).find("select").selectmenu("option", "disabled", false);
                $(element).removeClass("").addClass(itemHtml.attr("class"));

                $(element).data(item);

                inserted = true;
                return false;
            } else if (item.id < it.id) {
                Shop.log.debug("VIEW SHOP ITEM MERGE");
                // item is not stored here, so insert it.
                const itemHtml = $(item.html.shopItem);
                itemHtml.data(item);
                itemHtml.insertBefore($(element));
                itemHtml.find("select").selectmenu();

                if (animate) {
                    const insertedItemHeight = itemHtml.height();
                    itemHtml.css({ minHeight: 0, height: 0, opacity: 0 });
                    itemHtml.delay(300).animate({ height: insertedItemHeight }, 300).animate({ opacity: 1.0 }, 300, () => {
                        itemHtml.removeAttr("style");
                    });
                }

                inserted = true;
                return false;
            }
        });
        // We didn't find a place to put item, so simply put it in
        // the shopItemsContainer at the bottom.
        if (!inserted) {
            Shop.log.debug("VIEW SHOP ITEM BOTTOM");
            // item is not stored here, so insert it.
            const itemHtml = $(item.html.shopItem);
            itemHtml.data(item);
            itemHtml.appendTo("#shopItemsContainer");
            itemHtml.find("select").selectmenu();

            if (animate) {
                const insertedItemHeight = itemHtml.height();
                itemHtml.css({ minHeight: 0, height: 0, opacity: 0 });
                itemHtml.delay(300).animate({ height: insertedItemHeight }, 300).animate({ opacity: 1.0 }, 300, () => {
                    itemHtml.removeAttr("style");
                });
            }
        }
    }

    shopItemListChanged(itemList, animate) {
        for (let i = 0; i < itemList.length; i++) {
            this.mergeShopItem(itemList[i], animate);
        }
        $(".shop.panelWrapper").removeClass("pending");
        // Remove displayed items not in itemList.
        $("#shopItemsContainer").find(".shopItem").each((index, element) => {
            const it = $(element).data();
            for (let i = 0; i < itemList.length; i++) {
                if (itemList[i].id === it.id) {
                    // Found matching element
                    return;
                }
            }
            // We made it through the list without finding the dom element
            // in itemlist, so remove it
            if (animate) {
                $(element).css("height", $(element).height()).css("min-height", 0).animate({ opacity: 0.0 }, 300).animate({ height: 0 }, 300, () => { $(element).remove(); });
            } else {
                $(element).remove();
            }
        });
    }

    mergeGoldShopItem(item, animate) {
        // Loop over divs displaying items
        let inserted = false;
        $("#goldShopItemsContainer").find(".shopItem").each((index, element) => {
            const it = $(element).data();
            if (item.id === it.id) {
                Shop.log.debug("VIEW GOLD SHOP ITEM UPDATE");
                // item is already stored here, so update it.
                const itemHtml = $(item.html.goldShopItem);
                const newBuyButton = itemHtml.find(".purchaseOption button");
                const newStatusLabel = itemHtml.find(".statusLabel");
                $(element).find(".purchaseOption button").replaceWith(newBuyButton);
                $(element).find(".statusLabel").replaceWith(newStatusLabel);
                $(element).removeClass("").addClass(itemHtml.attr("class"));

                $(element).data(item);

                inserted = true;
                return false;
            } else if (item.id < it.id) {
                Shop.log.debug("VIEW GOLD SHOP ITEM MERGE");
                // item is not stored here, so insert it.
                const itemHtml = $(item.html.goldShopItem);
                itemHtml.data(item);
                itemHtml.insertBefore($(element));

                if (animate) {
                    const insertedItemHeight = itemHtml.height();
                    itemHtml.css({ minHeight: 0, height: 0, opacity: 0 });
                    itemHtml.delay(300).animate({ height: insertedItemHeight }, 300).animate({ opacity: 1.0 }, 300, () => {
                        itemHtml.removeAttr("style");
                    });
                }

                inserted = true;
                return false;
            }
        });
        // We didn't find a place to put item, so simply put it in
        // the shopItemsContainer at the bottom.
        if (!inserted) {
            Shop.log.debug("VIEW GOLD SHOP ITEM BOTTOM");
            // item is not stored here, so insert it.
            const itemHtml = $(item.html.goldShopItem);
            itemHtml.data(item);
            itemHtml.appendTo("#goldShopItemsContainer");

            if (animate) {
                const insertedItemHeight = itemHtml.height();
                itemHtml.css({ minHeight: 0, height: 0, opacity: 0 });
                itemHtml.delay(300).animate({ height: insertedItemHeight }, 300).animate({ opacity: 1.0 }, 300, () => {
                    itemHtml.removeAttr("style");
                });
            }
        }
    }

    goldShopItemListChanged(itemList, animate) {
        for (let i = 0; i < itemList.length; i++) {
            this.mergeGoldShopItem(itemList[i], animate);
        }
        // Remove displayed items not in itemList.
        $("#goldShopItemsContainer").find(".shopItem").each((index, element) => {
            const it = $(element).data();
            for (let i = 0; i < itemList.length; i++) {
                if (itemList[i].id === it.id) {
                    // Found matching element
                    return;
                }
            }
            // We made it through the list without finding the dom element
            // in itemlist, so remove it
            if (animate) {
                $(element).css("height", $(element).height()).css("min-height", 0).animate({ opacity: 0.0 }, 300).animate({ height: 0 }, 300, () => { $(element).remove(); });
            } else {
                $(element).remove();
            }
        });
    }
}

export class Shop {
    static log = new Log("Shop");
    static model = null;
    static view = null;
    static _stripeLoading = null;

    static updateContent() {
        Shop.model.refreshShopItems();
        Shop.model.refreshGoldShopItems();
    }

    static purchaseShopItem(playerId, itemId, itemOption) {
        $(".shopItem button").prop("disabled", true);
        $(".shopItem select").selectmenu("option", "disabled", true);
        $("#cancelShopStockUpButton").prop("disabled", true);

        // Prompt for payment information.
        Shop._loadStripe().then(() => {
            OverlayManager.pushOverlay(
                TankTrouble.ShopPurchaseOverlay,
                { playerId, itemId, itemOption },
                () => {
                    Shop.updateContent();
                }
            );
        }).catch(() => {
            Shop._stripeLoading = null;
            Shop.updateContent();
        });
    }

    static _loadStripe() {
        Shop._stripeLoading ??= new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://js.stripe.com/v3/";
            script.addEventListener("load", resolve);
            script.addEventListener("error", reject);
            document.head.append(script);
        });

        return Shop._stripeLoading;
    }

    static showShopItemDetails(itemId) {
        OverlayManager.pushOverlay(
            TankTrouble.ShopItemDetailsOverlay,
            { itemId }
        );
    }

    static purchaseGoldShopItem(playerId, itemId, elementToReplace) {
        $(".shopItem button").prop("disabled", true);
        $("#cancelShopStockUpButton").prop("disabled", true);

        Backend.purchaseGoldShopItem(playerId, itemId, Caches.getCurrencyCache(), Caches.getVirtualShopCache())
            .then(result => {
                if (typeof result === "boolean") {
                    if (result) {
                        Shop.sendPurchasedItemToTank(playerId, elementToReplace);
                    }

                    // Close overlay if gold purchase was initialised from virtual shop stock up overlay.
                    if (OverlayManager.isOverlayShowing()) {
                        OverlayManager.popOverlay(false, true);
                    }
                } else {
                    TankTrouble.ErrorBox.show(result);

                    // Close overlay if gold purchase was initialised from virtual shop stock up overlay.
                    if (OverlayManager.isOverlayShowing()) {
                        OverlayManager.popOverlay(false, true);
                    }
                }
            })
            .finally(() => {
                Shop.updateContent();
            });
    }

    static showStockUp(playerId, missingDiamonds) {
        OverlayManager.pushOverlay(
            TankTrouble.ShopStockUpOverlay,
            { playerId, missingGold: 0, missingDiamonds }
        );
    }

    static showUnverifiedExplanation(playerId) {
        OverlayManager.pushOverlay(
            TankTrouble.MessageOverlay,
            {
                headline: "You must verify your account before buying",
                message: `We have sent an email to your email address in order to verify that you entered it correctly.<br><br>` +
                `You need to find this email and click on the Verify link.<br><br>` +
                `If you cannot find the email, try checking in your spam filter.<br><br>` +
                `<button class="medium" command="--shop.resend-verification" data-player-id="${playerId}">Resend verification email</button>`,
                preserveOverlayQueue: true
            }
        );
    }

    static sendPurchasedItemToTank(playerId, elementToReplace) {
        // Spawn item and send it flying into the tank icon.
        const startPosition = elementToReplace.offset();
        const targetPosition = UIPlayerPanel.getLocalTankIconPosition(playerId);

        const width = elementToReplace.width();
        const height = elementToReplace.height();

        if (startPosition) {
            const itemIcon = $(`<img width='${width}' class='shopItemPurchaseIcon' src='${elementToReplace.attr("src")}'>`);
            itemIcon.css({ left: startPosition.left, top: startPosition.top });
            $("body").append(itemIcon);

            if (targetPosition) {
                animateElement(itemIcon[0], {
                    left: `${targetPosition.x - (width / 2)}px`,
                    top: { to: `${targetPosition.y - (height / 2)}px`, ease: "inBack" },
                    scale: 0.1,
                    duration: 800,
                    delay: 500,
                    ease: "inOutSine",
                    onComplete: () => {
                        itemIcon.remove();
                    }
                });
            } else {
                animateElement(itemIcon[0], {
                    scale: 0,
                    duration: 300,
                    delay: 500,
                    ease: "inBack",
                    onComplete: () => {
                        itemIcon.remove();
                    }
                });
            }
        }
    }

    static init() {
        Shop.model = new ShopModel();
        Shop.view = new ShopView(Shop.model);
        Shop.model.addItemListChangeListener(Shop.view);

        Commands.register("--shop.buy", Shop._buyCommandHandler);
        Commands.register("--shop.buy-gold", Shop._buyGoldCommandHandler);
        Commands.register("--shop.details", Shop._detailsCommandHandler);
        Commands.register("--shop.resend-verification", Shop._resendVerificationCommandHandler);
    }

    static initShop() {
        const shopData = $("#shopData").text();
        if (shopData) {
            Shop.updateShop(JSON.parse(shopData));
        }

        UIPlayerPanel.insertPanel($("#playerPanel"), null);

        ClientManager.getClient().addEventListener(Shop._clientEventHandler, this);
        Users.addEventListener(Shop._authenticationEventHandler, this);
    }

    static updateShop(data) {
        // FIXME Use data.tags!

        Shop.model.loadShopItems();
        Shop.model.loadGoldShopItems();
    }

    static deinitShop() {
        UIPlayerPanel.removePanel();

        ClientManager.getClient().removeEventListener(Shop._clientEventHandler, this);
        Users.removeEventListener(Shop._authenticationEventHandler, this);
    }

    static _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            case Users.EVENTS.GUEST_ADDED:
            case Users.EVENTS.GUESTS_ADDED:
            case Users.EVENTS.GUEST_REMOVED:
            case Users.EVENTS.GUEST_SIGNED_UP:
            case Users.EVENTS.PLAYER_UPDATED:
            {
                Shop.updateContent();
                break;
            }
        }
    }

    static _clientEventHandler(self, evt, data) {
        switch (evt) {
            case TTClient.EVENTS.PLAYER_UPDATED:
            {
                if (Users.isAnyUser(data.getPlayerId())) {
                    Shop.updateContent();
                }
                break;
            }
        }
    }

    static _buyCommandHandler(button, data) {
        const container = button.closest(".shopItem");
        const purchase = playerId => {
            const select = container.find("select");
            Shop.purchaseShopItem(playerId, data.itemId, select.length > 0 ? select.val() : null);
        };

        if (data.playerIds.length === 0) {
            Shop._showAddUserBox(button);
        } else if (data.playerIds.length === 1) {
            if (data.guestPlayerIds.length === 1) {
                OverlayManager.pushOverlay(TankTrouble.SignUpOverlay, { guestPlayerIdToSignUp: data.guestPlayerIds[0] });
            } else if (data.unverifiedPlayerIds.length === 1) {
                Shop.showUnverifiedExplanation(data.unverifiedPlayerIds[0]);
            } else if (OverlayManager.isOverlayShowing()) {
                purchase(data.buyerPlayerIds[0]);
            } else {
                Shop._showSelectUserBox(button, "Please confirm", "Buy", data.buyerPlayerIds, purchase);
            }
        } else {
            const multipleBuyers = data.buyerPlayerIds.length > 1;
            Shop._showSelectUserBox(button, multipleBuyers ? "Who is buying?" : "Please confirm", multipleBuyers ? "Select" : "Buy", data.buyerPlayerIds, selectedPlayerId => {
                if (data.guestPlayerIds.includes(selectedPlayerId)) {
                    OverlayManager.pushOverlay(TankTrouble.SignUpOverlay, { guestPlayerIdToSignUp: selectedPlayerId });
                } else if (data.unverifiedPlayerIds.includes(selectedPlayerId)) {
                    Shop.showUnverifiedExplanation(selectedPlayerId);
                } else {
                    purchase(selectedPlayerId);
                }
            });
        }
    }

    static _buyGoldCommandHandler(button, data) {
        const purchase = playerId => {
            Shop.purchaseGoldShopItem(playerId, data.itemId, button.closest(".shopItem").find(".preview"));
        };
        const purchaseOrStockUp = playerId => {
            if (data.affordables[playerId]) {
                purchase(playerId);
            } else {
                Shop.showStockUp(playerId, data.missingDiamonds[playerId]);
            }
        };

        if (data.playerIds.length === 0) {
            Shop._showAddUserBox(button);
        } else if (data.playerIds.length === 1) {
            purchaseOrStockUp(data.playerIds[0]);
        } else {
            Shop._showSelectUserBox(button, "Who is buying?", "Select", data.playerIds, purchaseOrStockUp);
        }
    }

    static _detailsCommandHandler(button, data) {
        Shop.showShopItemDetails(data.itemId);
    }

    static _resendVerificationCommandHandler(button, data) {
        Backend.resendVerificationEmail(button.attr("data-player-id"));
    }

    static _showAddUserBox(button) {
        TankTrouble.AddUserBox.show(button.offset().left + (button.outerWidth() * 0.5), button.offset().top + (button.outerHeight() * 0.5), "top", 25);
    }

    static _showSelectUserBox(button, message, buttonText, playerIds, selectionCallback) {
        TankTrouble.SelectUserBox.show(button.offset().left + (button.outerWidth() * 0.5), button.offset().top + (button.outerHeight() * 0.5), message, buttonText, playerIds, selectionCallback, "top", 25);
    }
}
