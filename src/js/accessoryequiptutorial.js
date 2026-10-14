import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { Images } from "./images.js";
import { Tutorial } from "./tutorial.js";
import { UIPlayerPanel } from "./tt/ui/playerpanel/uiplayerpanel.js";
import { Users } from "./users.js";

export class AccessoryEquipTutorial extends Tutorial {
    hatEquipped = false;

    begin() {
        // Check if tutorial has been completed already - if tutorial accessory has been equipped
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    if (Number(result.getTurretAccessory()) === 3) {
                        this.complete();
                        return;
                    }
                }
                this._begin();
            });
    }

    end() {
        this._clearPreviousMarker();

        TankTrouble.TankInfoBox.removeEventListener(this._tankInfoBoxEventHandler, this);
        TankTrouble.GarageOverlay.removeEventListener(this._garageOverlayEventHandler, this);
        Users.removeEventListener(this._usersEventHandler, this);
    }

    _begin() {
        TankTrouble.TankInfoBox.addEventListener(this._tankInfoBoxEventHandler, this);
        TankTrouble.GarageOverlay.addEventListener(this._garageOverlayEventHandler, this);
        Users.addEventListener(this._usersEventHandler, this);

        setTimeout(() => {
            this._updateStep();
        }, 1300);
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

    _garageOverlayEventHandler(self, evt, data) {
        switch (evt) {
            case TankTrouble.GarageOverlay.EVENTS.CLOSED:
            {
                if (data === self.playerId) {
                    if (self.hatEquipped) {
                        self.complete();
                    } else {
                        self._updateStep();
                    }
                }
                break;
            }
            case TankTrouble.GarageOverlay.EVENTS.OPENED:
            {
                if (data === self.playerId) {
                    self._updateStep();
                }
                break;
            }
        }
    }

    _usersEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_UPDATED:
            {
                if (data.playerId === self.playerId && data.iconChanged) {
                    Backend.getPlayerDetails(self.playerId, Caches.getPlayerDetailsCache())
                        .then(result => {
                            if (typeof result === "object") {
                                self.hatEquipped = Number(result.getTurretAccessory()) === 3;
                                self._updateStep();
                            }
                        });
                }
                break;
            }
        }
    }

    _updateStep() {
        // Set next step
        this.nextStep = 1;
        if (TankTrouble.TankInfoBox.isShowing() && TankTrouble.TankInfoBox.getPlayerId() === this.playerId) {
            this.nextStep = 2;
        }
        if (TankTrouble.GarageOverlay.isShowing() && TankTrouble.GarageOverlay.getPlayerId() === this.playerId) {
            if (!this.hatEquipped) {
                this.nextStep = 3;
            } else {
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
                this.marker.css({ left: 78 + 5, bottom: (guest ? 26 : 78) + 5, zIndex: 1 });
                const newMarker = this.marker;
                setTimeout(() => {
                    newMarker.addClass("active");
                }, 500);
                break;
            }
            case 3:
            {
                let positionInitialised = false;
                this.marker = $(`<img class='tutorialMarker' ${Images.attributes("tutorials/marker.png")}>`);
                const overlayContent = $("#overlay .garage");
                overlayContent.prepend(this.marker);
                this.markerPositionInterval = setInterval(() => {
                    const position = TankTrouble.GarageOverlay.getAccessoryPosition("turret", 3);
                    if (position) {
                        this.marker.addClass("active");
                        if (!positionInitialised) {
                            this.marker.css({ left: position.x, bottom: overlayContent.outerHeight() - (position.y - overlayContent.offset().top) });
                            positionInitialised = true;
                        } else {
                            this.marker.animate({ left: position.x, bottom: overlayContent.outerHeight() - (position.y - overlayContent.offset().top) }, { duration: 499, queue: false });
                        }
                    } else {
                        this.marker.removeClass("active");
                        positionInitialised = false;
                    }
                }, 700);
                break;
            }
            case 4:
            {
                this.marker = $(`<img class='tutorialMarker' ${Images.attributes("tutorials/marker.png")}>`);
                this.marker.css({ left: 36, bottom: 27, zIndex: 1 });
                const button = $("#overlay .garage form button").parent();
                button.prepend(this.marker);
                const newMarker = this.marker;
                setTimeout(() => {
                    newMarker.addClass("active");
                }, 1300);
                break;
            }
        }
    }
}
