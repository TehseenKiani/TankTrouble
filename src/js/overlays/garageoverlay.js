import { Garage } from "../tt/ui/garage/garage.js";
import { TankTrouble } from "../tanktrouble.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.GarageOverlay = {
    // jQuery objects.
    garageWrapper: null,
    garagePhaser: null,
    garageForm: null,
    garageSubmitInput: null,

    // State.
    initialised: false,
    showing: false,
    playerId: null,
    phaserInstance: null,

    // Events.
    eventListeners: [],
    EVENTS: {
        OPENED: "opened",
        CLOSED: "closed"
    },

    _initialise() {
        this.garageWrapper = $("<div class='garage centre'/>");
        this.garagePhaser = $("<div class='phaser'></div>");
        this.garageForm = $("<form></form>");
        this.garageSubmitInput = $("<button class='medium' type='submit' tabindex='-1'>Done</button>");

        Utils.addOverlayFormRow(this.garageForm, this.garageSubmitInput);

        this.garageWrapper.append(this.garagePhaser);
        this.garageWrapper.append(this.garageForm);

        this.garageForm.submit(event => {
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

        this.garagePhaser.empty();

        if (this.phaserInstance === null) {
            const config = {
                width: this.garagePhaser.width(),
                height: $(window).height() * 0.9,
                renderer: Phaser.WEBGL,
                //multiTexture: true,
                parent: this.garagePhaser[0],
                transparent: true,
                enableDebug: false
            };
            this.phaserInstance = new Phaser.Game(config);

            this.phaserInstance.state.add("Boot", new Garage.UIBootState());
            this.phaserInstance.state.add("Preload", new Garage.UIPreloadState());
            this.phaserInstance.state.add("Load", new Garage.UILoadState(this.playerId));
            this.phaserInstance.state.add("Main", new Garage.UIMainState(this.playerId));

            this.phaserInstance.state.start("Boot");
        }

        this.showing = true;

        this._notifyEventListeners(TankTrouble.GarageOverlay.EVENTS.OPENED, this.playerId);
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        setTimeout(() => {
            this.phaserInstance.destroy();
            this.phaserInstance = null;
        }, 200);

        this.showing = false;

        this._notifyEventListeners(TankTrouble.GarageOverlay.EVENTS.CLOSED, this.playerId);
    },

    isShowing() {
        return this.showing;
    },

    getPlayerId() {
        return this.playerId;
    },

    getAccessoryPosition(type, number) {
        if (this.phaserInstance) {
            if (this.phaserInstance.state.current === "Main") {
                return this.phaserInstance.state.getCurrentState().getAccessoryPosition(type, number);
            }
        }
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.garageWrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return true;
    },

    _notifyEventListeners(evt, data) {
        for (let i = 0; i < this.eventListeners.length; i++) {
            this.eventListeners[i].callback(this.eventListeners[i].context, evt, data);
        }
    }
};
