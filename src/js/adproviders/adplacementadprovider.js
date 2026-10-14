import { Log } from "../tt/log.js";
import { AdvertisementManager } from "../advertisementmanager.js";

export class AdPlacementAdProvider {
    adsEnabled = false;
    adAlreadyRequested = false;
    log = null;

    constructor(musicOn) {
        // Create log.
        this.log = new Log("AdPlacementAdProvider");

        this.adsEnabled = this.areAdsEnabled();

        adConfig({
            sound: musicOn ? "on" : "off"
        });
    }

    requestAd() {
        if (this.adAlreadyRequested) {
            return;
        }
        if (!this.adsEnabled) {
            AdvertisementManager.dispatchEvent(AdvertisementManager.EVENTS.ADS_DISABLED, null);
            return;
        }

        try {
            this.adAlreadyRequested = true;
            adBreak({
                type: "start",
                name: "game_started",
                beforeAd: this._onBeforeAd,
                afterAd: this._onAfterAd,
                adBreakDone: this._onAdBreakDone
            });
        } catch (error) {
            AdvertisementManager.dispatchEvent(AdvertisementManager.EVENTS.AD_FAILED, `Ad failed: ${error.message}`);
        }
    }

    areAdsEnabled() {
        const test = $("<div>&nbsp;</div>");
        $("body").append(test);
        test.addClass("adsbox");
        const isEnabled = () => {
            let enabled = true;
            if (test.height() === 0) {
                enabled = false;
            }
            test.remove();
            return enabled;
        };
        const adsEnabled = isEnabled();
        window.setTimeout(adsEnabled, 100);
        return adsEnabled;
    }

    _onBeforeAd() {
        AdvertisementManager.dispatchEvent(AdvertisementManager.EVENTS.AD_STARTED, null);
    }

    _onAfterAd() {
        AdvertisementManager.dispatchEvent(AdvertisementManager.EVENTS.AD_FINISHED, null);
        this.adAlreadyRequested = false;
    }

    _onAdBreakDone(placementInfo) {
        switch (placementInfo.breakStatus) {
            case "notReady":
            case "timeout":
            case "invalid":
            case "error":
            case "noAdPreloaded":
            case "frequencyCapped":
            case "other": {
                AdvertisementManager.dispatchEvent(AdvertisementManager.EVENTS.AD_FAILED, `Ad failed: ${placementInfo.breakStatus}`);
                break;
            }
        }
    }
}
