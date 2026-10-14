import { Constants } from "./tt/constants.js";
import { RoundModel } from "./tt/roundmodel.js";
import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { GameSession } from "./gamesession.js";
import { Images } from "./images.js";
import { Tutorial } from "./tutorial.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { UIPlayerPanel } from "./tt/ui/playerpanel/uiplayerpanel.js";
import { Users } from "./users.js";
import { VirtualShop } from "./virtualshop.js";

export class PurchaseTutorial extends Tutorial {
    hasGold = false;

    begin() {
        // Check if tutorial has been completed already - if tutorial accessory has been bought
        Backend.getGarageContent(this.playerId, Caches.getGarageContentCache())
            .then(result => {
                if (typeof result === "object") {
                    for (let i = 0; i < result.boxes.length; ++i) {
                        const box = result.boxes[i];
                        if (Number(box.id) === 1) {
                            for (let j = 0; j < box.accessories.length; ++j) {
                                const accessory = box.accessories[j];
                                if (accessory.type === "turret" && accessory.value === 3) {
                                    this.complete();
                                    return;
                                }
                            }
                        }
                    }
                }
                this._begin();
            });
    }

    end() {
        this._clearPreviousMarker();

        GameSession.removeRoundEventListener(this._roundEventHandler, this);
        TankTrouble.TankInfoBox.removeEventListener(this._tankInfoBoxEventHandler, this);
        TankTrouble.VirtualShopOverlay.removeEventListener(this._virtualShopOverlayEventHandler, this);
        VirtualShop.removeEventListener(this._virtualShopEventHandler, this);
    }

    _begin() {
        GameSession.addRoundEventListener(this._roundEventHandler, this);
        TankTrouble.TankInfoBox.addEventListener(this._tankInfoBoxEventHandler, this);
        TankTrouble.VirtualShopOverlay.addEventListener(this._virtualShopOverlayEventHandler, this);
        VirtualShop.addEventListener(this._virtualShopEventHandler, this);

        Backend.getCurrency(this.playerId, Caches.getCurrencyCache())
            .then(result => {
                if (typeof result === "object") {
                    if (result.getGold() > 0) {
                        this.hasGold = true;
                        this._updateStep();
                    }
                }
            });
    }

    _roundEventHandler(self, id, evt, data) {
        switch (evt) {
            case RoundModel._EVENTS.COLLECTIBLE_DESTROYED:
            {
                if (data.getPlayerId() === self.playerId) {
                    const gameController = GameSession.getGameController();
                    if (gameController) {
                        const collectible = gameController.getCollectible(data.getCollectibleId());
                        if (collectible) {
                            if (collectible.getType() === Constants.COLLECTIBLE_TYPES.GOLD) {
                                setTimeout(() => {
                                    self.hasGold = true;
                                    self._updateStep();
                                }, 1300);
                            }
                        }
                    }
                }

                break;
            }
            case RoundModel._EVENTS.ROUND_ENDED:
            {
                const playerIds = data.getPlayerIds();
                const goldAmount = data.getGoldAmountPerWinner();
                for (let i = 0; i < playerIds.length; ++i) {
                    const playerId = playerIds[i];
                    if (playerId === self.playerId && goldAmount > 0) {
                        const gameController = GameSession.getGameController();
                        if (gameController) {
                            if (Constants.GAME_MODE_INFO[gameController.getMode()].HAS_CELEBRATION) {
                                setTimeout(() => {
                                    self.hasGold = true;
                                    self._updateStep();
                                }, 1300 + (Constants.BETWEEN_ROUNDS_DURATION * 1000) + (UIConstants.CELEBRATION_PRIZE_HANDOUT_TIME * 1000));
                            } else {
                                setTimeout(() => {
                                    self.hasGold = true;
                                    self._updateStep();
                                }, 1300);
                            }
                        } else {
                            setTimeout(() => {
                                self.hasGold = true;
                                self._updateStep();
                            }, 1300);
                        }
                    }
                }
                break;
            }
        }
    }

    _tankInfoBoxEventHandler(self, evt, data) {
        switch (evt) {
            case TankTrouble.TankInfoBox.EVENTS.OPENED:
            case TankTrouble.TankInfoBox.EVENTS.CLOSED:
            {
                if (data === self.playerId) {
                    self._updateStep();
                }
                break;
            }
        }
    }

    _virtualShopOverlayEventHandler(self, evt, data) {
        switch (evt) {
            case TankTrouble.VirtualShopOverlay.EVENTS.OPENED:
            case TankTrouble.VirtualShopOverlay.EVENTS.CLOSED:
            case TankTrouble.VirtualShopOverlay.EVENTS.ITEM_LIST_CHANGED:
            {
                if (data === self.playerId) {
                    self._updateStep();
                }
                break;
            }
        }
    }

    _virtualShopEventHandler(self, evt, data) {
        switch (evt) {
            case VirtualShop.EVENTS.ITEM_PURCHASED:
            {
                if (data.playerId === self.playerId && data.itemId === 100) {
                    self.complete();
                }
                break;
            }
        }
    }

    _updateStep() {
        // Set next step
        if (this.hasGold) {
            this.nextStep = 1;
            if (TankTrouble.TankInfoBox.isShowing() && TankTrouble.TankInfoBox.getPlayerId() === this.playerId) {
                this.nextStep = 2;
            }
            if (TankTrouble.VirtualShopOverlay.isShowing() && TankTrouble.VirtualShopOverlay.getPlayerId() === this.playerId && TankTrouble.VirtualShopOverlay.getItemListLabel() !== "Dimitri's favourites") {
                this.nextStep = 3;
            }
            if (TankTrouble.VirtualShopOverlay.isShowing() && TankTrouble.VirtualShopOverlay.getPlayerId() === this.playerId && TankTrouble.VirtualShopOverlay.getItemListLabel() === "Dimitri's favourites") {
                this.nextStep = 4;
            }
        }

        if (this.nextStep === this.currentStep) {
            return;
        }

        this._clearPreviousMarker();

        this.currentStep = this.nextStep;

        // Create new marker
        switch (this.currentStep) {
            case 1:
            {
                let positionInitialised = false;
                this.marker = $(`<img class='tutorialMarker' ${Images.attributes("tutorials/marker.png")}>`);
                this.marker.css({ zIndex: 2 });
                $("body").prepend(this.marker);
                this.markerPositionInterval = setInterval(() => {
                    const position = UIPlayerPanel.getTankIconPosition(this.playerId);
                    if (position) {
                        this.marker.addClass("active");
                        if (!positionInitialised) {
                            this.marker.css({ left: position.x, bottom: $("body").height() - position.y });
                            positionInitialised = true;
                        } else {
                            this.marker.animate({ left: position.x, bottom: $("body").height() - position.y }, { duration: 499, queue: false });
                        }
                    } else {
                        this.marker.removeClass("active");
                        positionInitialised = false;
                    }
                }, 500);
                break;
            }
            case 2:
            {
                this.marker = $(`<img class='tutorialMarker' ${Images.attributes("tutorials/marker.png")}>`);
                $("#tankinfo .actions:not(.centred)").prepend(this.marker);
                const guest = Users.isGuestUser(this.playerId);
                this.marker.css({ left: 26 + 5, bottom: (guest ? 26 : 78) + 5, zIndex: 1 });
                const newMarker = this.marker;
                setTimeout(() => {
                    newMarker.addClass("active");
                }, 500);
                break;
            }
            case 3:
            {
                // Can't place it directly on the button group as it has overflow: hidden.
                let positionInitialised = false;
                this.marker = $(`<img class='tutorialMarker' ${Images.attributes("tutorials/marker.png")}>`);
                this.marker.css({ zIndex: 2 });
                const overlayContent = $("#overlay .virtualShop");
                overlayContent.prepend(this.marker);
                const button = $("#overlay .virtualShop .buttonGroup div:contains('Dimitri')");
                this.markerPositionInterval = setInterval(() => {
                    const position = button.offset();
                    if (position) {
                        this.marker.addClass("active");
                        if (!positionInitialised) {
                            this.marker.css({ left: position.left + (button.width() / 2), bottom: overlayContent.outerHeight() - (position.top + (button.height() / 2) - overlayContent.offset().top + overlayContent.scrollTop()) });
                            positionInitialised = true;
                        } else {
                            this.marker.animate({ left: position.left + (button.width() / 2), bottom: overlayContent.outerHeight() - (position.top + (button.height() / 2) - overlayContent.offset().top + overlayContent.scrollTop()) }, { duration: 499, queue: false });
                        }
                    } else {
                        this.marker.removeClass("active");
                        positionInitialised = false;
                    }
                }, 500);
                break;
            }
            case 4:
            {
                // Can't place directly on button as it will be removed instantly when changing item list.
                let positionInitialised = false;
                this.marker = $(`<img class='tutorialMarker' ${Images.attributes("tutorials/marker.png")}>`);
                this.marker.css({ zIndex: 2 });
                const overlayContent = $("#overlay .virtualShop");
                overlayContent.prepend(this.marker);
                const button = $("#virtualShopItem-100 .buy");
                this.markerPositionInterval = setInterval(() => {
                    const position = button.offset();
                    if (position) {
                        this.marker.addClass("active");
                        if (!positionInitialised) {
                            this.marker.css({ left: position.left + (button.width() / 2), bottom: overlayContent.outerHeight() - (position.top + (button.height() / 2) - overlayContent.offset().top + overlayContent.scrollTop()) });
                            positionInitialised = true;
                        } else {
                            this.marker.animate({ left: position.left + (button.width() / 2), bottom: overlayContent.outerHeight() - (position.top + (button.height() / 2) - overlayContent.offset().top + overlayContent.scrollTop()) }, { duration: 499, queue: false });
                        }
                    } else {
                        this.marker.removeClass("active");
                        positionInitialised = false;
                    }
                }, 500);
                break;
            }
        }
    }
}
