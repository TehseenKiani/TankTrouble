import { animate, utils } from "animejs";
import { UIConstants } from "../tt/ui/uiconstants.js";

customElements.define("achievement-reveal", class extends HTMLElement {
    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        const lockedElement = $(this).find("img.locked");
        const lockedKeyframes = [];
        for (let i = 1; i <= 16; i++) {
            lockedKeyframes.push({ scale: 1 + (i * 0.07), rotate: i % 2 === 1 ? 5 : -5, duration: 50 });
        }
        lockedKeyframes.push(
            { scale: 1.5, rotate: 0, duration: 100 },
            { scale: 3, opacity: 0, duration: 100 }
        );

        animate(lockedElement[0], {
            keyframes: lockedKeyframes,
            delay: 2000,
            ease: UIConstants.EASE_DEFAULT,
            onComplete: () => {
                lockedElement.remove();
            }
        });

        const unlockedElement = $(this).find("img.unlocked");
        utils.set(unlockedElement[0], { scale: 0, rotate: 0 });
        animate(unlockedElement[0], {
            keyframes: [
                { scale: 2, rotate: 5, duration: 100 },
                { scale: 1, rotate: 0, duration: 300 }
            ],
            delay: 2900,
            ease: UIConstants.EASE_DEFAULT,
            onComplete: () => {
                $(this).closest(".achievement").find(".shine").addClass("shiny");
                this.dispatchEvent(new Event("revealed", { bubbles: true }));
            }
        });
    }
});
