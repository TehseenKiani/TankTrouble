import { TouchControls } from "./mobilecontrols.js";
import { fitGameLayout } from "./tt/ui/canvaslayout.js";

export class ResizeManager {
    static eventListeners = [];
    static EVENTS = {
        RESIZE: "resize",
        REFRESH: "refresh"
    };

    static addEventListener(callback, context) {
        ResizeManager.eventListeners.push({ callback, context });
    }

    static removeEventListener(callback, context) {
        for (let i = 0; i < ResizeManager.eventListeners.length; i++) {
            if (ResizeManager.eventListeners[i].callback === callback && ResizeManager.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                ResizeManager.eventListeners.splice(i, 1);
                return;
            }
        }
    }

    static init() {
        $(window).resize(() => {
            ResizeManager._resize();
        });
    }

    static refresh() {
        ResizeManager._updateSizes();
        ResizeManager._notifyEventListeners(ResizeManager.EVENTS.REFRESH, null);
    }

    static _resize() {
        ResizeManager._updateSizes();
        ResizeManager._notifyEventListeners(ResizeManager.EVENTS.RESIZE, null);
    }

    static _updateSizes() {
        if (TouchControls.isEnabled()) return;
        const availableHeight = $("#content").height();
        const panelGap = 8;
        const { width, gameHeight, panelHeight } = fitGameLayout($("#mainContent").width(), availableHeight, panelGap);
        $("#game").width(width);
        $("#game").height(gameHeight);
        $("#playerPanel").width(width);
        $("#playerPanel").height(panelHeight);
        $("#scrapyardSnippet .content").height($("#scrapyardSnippet .content").width() * 0.185);
    }

    static _notifyEventListeners(evt, data) {
        for (let i = 0; i < ResizeManager.eventListeners.length; i++) {
            ResizeManager.eventListeners[i].callback(ResizeManager.eventListeners[i].context, evt, data);
        }
    }
}
