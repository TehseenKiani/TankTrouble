export class FocusManager {
    static focused = true;
    static eventListeners = [];
    static EVENTS = {
        FOCUS: "focus",
        BLUR: "blur"
    };

    static addEventListener(callback, context) {
        FocusManager.eventListeners.push({ callback, context });
    }

    static removeEventListener(callback, context) {
        for (let i = 0; i < FocusManager.eventListeners.length; i++) {
            if (FocusManager.eventListeners[i].callback === callback && FocusManager.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                FocusManager.eventListeners.splice(i, 1);
                return;
            }
        }
    }

    static init() {
        $(window).focus(() => {
            // Store focus state in convenient location.
            FocusManager.focus();
        });

        $(window).blur(() => {
            // Store focus state in convenient location.
            FocusManager.blur();
        });
    }

    static focus() {
        FocusManager.focused = true;

        FocusManager.clearTitle();

        FocusManager._notifyEventListeners(FocusManager.EVENTS.FOCUS);
    }

    static blur() {
        FocusManager.focused = false;

        FocusManager._notifyEventListeners(FocusManager.EVENTS.BLUR);
    }

    static isFocused() {
        return FocusManager.focused;
    }

    static showMessageInTitle(msg) {
        FocusManager.clearTitle();
        document.title += ` - ${msg}`;
    }

    static clearTitle() {
        document.title = "TankTrouble";
    }

    static _notifyEventListeners(evt, data) {
        for (let i = 0; i < FocusManager.eventListeners.length; i++) {
            FocusManager.eventListeners[i].callback(FocusManager.eventListeners[i].context, evt, data);
        }
    }
}
