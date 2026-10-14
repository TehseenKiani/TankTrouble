import { TankTrouble } from "../tanktrouble.js";
import { Images } from "../images.js";

TankTrouble.faqOverlay = {
    // jQuery objects.
    wrapper: null,

    // State.
    initialised: false,

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $("<div class='faq centre'/>");

        this.wrapper.append(
            "<div>F.A.Q</div>",
            $("<div/>").append(
                `<img ${Images.attributes("faq/hazmatSuit.png")}/>`,
                "<div class='question'>What is a crisis? What does it do, and when does it happen?</div>",
                $("<div class='answer'/>").append(
                    "A crisis is an event, which happens very rarely, and only for a short amount of time. Whenever a crisis in progress, hazmat suits will be handed out to all tankers, who logged onto Tank Trouble during it.<br>",
                    "The last time a crisis was called was in 2017.<br>",
                    "The next crisis is expected to be called on at any time in 2019 if we're lucky."
                )
            )
        );

        this.initialised = true;
    },

    show(params) {
        this._initialise();
    },

    hide() {
        this._initialise();
    },

    getContents() {
        this._initialise();

        return this.wrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return true;
    }
};
