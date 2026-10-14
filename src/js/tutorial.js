import { Log } from "./tt/log.js";

export class Tutorial {
    playerId = null;
    manager = null;
    currentStep = 0;
    nextStep = 0;
    marker = null;
    markerPositionInterval = null;
    log = null;

    constructor(playerId, manager) {
        this.playerId = playerId;
        this.manager = manager;
        this.log = new Log("Tutorial");
    }

    begin() {
        this.log.error("Attempt to call Tutorial.begin. begin() must be overridden in subclasses");
    }

    end() {
        this.log.error("Attempt to call Tutorial.end. end() must be overridden in subclasses");
    }

    complete() {
        this.manager.completeTutorial(this.playerId);
    }

    _clearPreviousMarker() {
        // Remove marker
        if (this.marker) {
            this.marker.removeClass("active");
            const oldMarker = this.marker;
            setTimeout(() => {
                oldMarker.remove();
            }, 200);
        }
        // Clear marker position interval
        if (this.markerPositionInterval) {
            clearInterval(this.markerPositionInterval);
            this.markerPositionInterval = null;
        }
    }
}
