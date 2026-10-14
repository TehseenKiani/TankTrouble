import { IFrameManager } from "./iframemanager.js";
import { PremiumManager } from "./premiummanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";

export class AdvertisementManager {
    static adProvider = null;
    static lastViewedAdTime = 0;
    static eventListeners = [];
    static EVENTS = {
        AD_STARTED: "ad started",
        AD_FINISHED: "ad finished",
        AD_PROGRESSION: "ad progression",
        AD_CLICKED: "ad clicked",
        AD_FAILED: "ad failed",
        ADS_DISABLED: "ads disabled"
    };

    static PROGRESSION_STATES = {
        START: "start",
        FIRST_QUARTILE: "first quartile",
        MIDPOINT: "midpoint",
        THIRD_QUARTILE: "third quartile",
        COMPLETE: "complete"
    };

    static addEventListener(callback, context) {
        AdvertisementManager.eventListeners.push({ callback, context });
    }

    static removeEventListener(callback, context) {
        for (let i = 0; i < AdvertisementManager.eventListeners.length; i++) {
            if (AdvertisementManager.eventListeners[i].callback === callback && AdvertisementManager.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                AdvertisementManager.eventListeners.splice(i, 1);
                return;
            }
        }
    }

    static loadAdInformation() {
        if (Cookies.get("ad")) {
            AdvertisementManager.lastViewedAdTime = parseInt(Cookies.get("ad"), 10);
        }
    }

    static _updateLastViewedAdTime() {
        AdvertisementManager.lastViewedAdTime = Date.now();
        Cookies.set("ad", AdvertisementManager.lastViewedAdTime, { expires: 365 });
    }

    static setAdProvider(provider) {
        AdvertisementManager.adProvider = provider;
    }

    static requestAd() {
        if (!AdvertisementManager.adProvider) {
            AdvertisementManager._notifyEventListeners(AdvertisementManager.EVENTS.AD_FAILED, "No provider specified");
            return false;
        }

        AdvertisementManager.adProvider.requestAd.apply(this.adProvider);
    }

    static requestBanner(element, slot, test) {
        element.empty();
        const ins = $("<ins class='adsbygoogle verticalAdSlot'></ins>");
        ins.attr("data-ad-client", "ca-pub-1567017029074145");
        ins.attr("data-ad-slot", slot);
        if (test) {
            ins.attr("data-ad-test", "on");
        }
        ins.attr("data-ad-format", "auto");

        element.append(ins);

        // Google throws an error if there isn't room
        if (ins.is(":visible")) {
            window.adsbygoogle.push({});
        }
    }

    static adsEnabled() {
        if (!AdvertisementManager.adProvider) {
            return false;
        }

        return AdvertisementManager.adProvider.adsEnabled;
    }

    static shouldPresentAd() {
        if (PremiumManager.isPremiumPresent()) {
            return false;
        }

        if (IFrameManager.isIFramed()) {
            return false;
        }

        const now = Date.now();
        return AdvertisementManager.lastViewedAdTime + UIConstants.AD_RELIEF_TIME <= now;
    }

    static shouldPresentBanner() {
        return !PremiumManager.isPremiumPresent() && !IFrameManager.isIFramed();
    }

    static dispatchEvent(evt, data) {
        if (evt === AdvertisementManager.EVENTS.AD_FINISHED || evt === AdvertisementManager.EVENTS.ADS_DISABLED) {
            AdvertisementManager._updateLastViewedAdTime();
        }

        AdvertisementManager._notifyEventListeners(evt, data);
    }

    static _notifyEventListeners(evt, data) {
        for (let i = 0; i < AdvertisementManager.eventListeners.length; i++) {
            AdvertisementManager.eventListeners[i].callback(AdvertisementManager.eventListeners[i].context, evt, data);
        }
    }
}
