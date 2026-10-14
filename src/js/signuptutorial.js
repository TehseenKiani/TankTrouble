import { RoundModel } from "./tt/roundmodel.js";
import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { GameSession } from "./gamesession.js";
import { Images } from "./images.js";
import { Tutorial } from "./tutorial.js";
import { UIPlayerPanel } from "./tt/ui/playerpanel/uiplayerpanel.js";

export class SignUpTutorial extends Tutorial {
    hasExperience = false;

    begin() {
        // Check if tutorial has been completed already - if player has signed up
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    if (!result.getGuest()) {
                        this.complete();
                        return;
                    }
                }
                this._begin();
            });
    }

    end() {
        this._clearPreviousMarker();

        GameSession.removeRoundEventListener(this._roundEventHandler, this);
        TankTrouble.TankInfoBox.removeEventListener(this._tankInfoBoxEventHandler, this);
        TankTrouble.SignUpOverlay.removeEventListener(this._signUpOverlayEventHandler, this);
    }

    _begin() {
        GameSession.addRoundEventListener(this._roundEventHandler, this);
        TankTrouble.TankInfoBox.addEventListener(this._tankInfoBoxEventHandler, this);
        TankTrouble.SignUpOverlay.addEventListener(this._signUpOverlayEventHandler, this);

        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    if (result.getKills() >= 10) {
                        setTimeout(() => {
                            this.hasExperience = true;
                            this._updateStep();
                        }, 500);
                    }
                }
            });
    }

    _roundEventHandler(self, id, evt, data) {
        switch (evt) {
            case RoundModel._EVENTS.TANK_KILLED:
            {
                if (data.getKillerPlayerId() === self.playerId && data.getVictimPlayerId() !== self.playerId) {
                    Backend.getPlayerDetails(self.playerId, Caches.getPlayerDetailsCache())
                        .then(result => {
                            if (typeof result === "object") {
                                if (result.getKills() >= 10) {
                                    setTimeout(() => {
                                        self.hasExperience = true;
                                        self._updateStep();
                                    }, 6900);   // Wait for achievement unlocked animation to finish
                                }
                            }
                        });
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

    _signUpOverlayEventHandler(self, evt, data) {
        switch (evt) {
            case TankTrouble.SignUpOverlay.EVENTS.OPENED:
            case TankTrouble.SignUpOverlay.EVENTS.CLOSED:
            {
                if (data === self.playerId) {
                    self.complete();
                }
                break;
            }
        }
    }

    _updateStep() {
        // Set next step
        if (this.hasExperience) {
            this.nextStep = 1;
            if (TankTrouble.TankInfoBox.isShowing() && TankTrouble.TankInfoBox.getPlayerId() === this.playerId) {
                this.nextStep = 2;
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
                this.marker.css({ left: 99, bottom: 56 + 27, zIndex: 1 });
                const newMarker = this.marker;
                setTimeout(() => {
                    newMarker.addClass("active");
                }, 500);
                break;
            }
        }
    }
}
