import { UIConstants } from "./tt/ui/uiconstants.js";

export class IFrameManager {
    static iframed = false;
    static lastNagTime = 0;

    static init() {
        IFrameManager.iframed = window.self !== window.top;
    }

    static loadNagInformation() {
        if (Cookies.get("nag")) {
            IFrameManager.lastNagTime = parseInt(Cookies.get("nag"), 10);
        }
    }

    static isIFramed() {
        return IFrameManager.iframed;
    }

    static shouldNag() {
        if (!IFrameManager.isIFramed()) {
            return false;
        }

        const now = Date.now();
        return IFrameManager.lastNagTime + UIConstants.NAG_RELIEF_TIME <= now;
    }

    static updateLastNagTime() {
        IFrameManager.lastNagTime = Date.now();
        Cookies.set("nag", IFrameManager.lastNagTime, { expires: 365 });
    }
}
