import { TankTrouble } from "./tanktrouble.js";
import { animate, utils } from "animejs";
import { GameSession } from "./gamesession.js";
import { UIConstants } from "./tt/ui/uiconstants.js";

TankTrouble.ErrorBox = {
    // jQuery objects.
    error: null,
    errorContent: null,
    errorTitleDiv: null,
    errorMessageDiv: null,
    errorForm: null,
    errorSubmitInput: null,

    errorBackground: null,

    // State.
    initialised: false,
    showing: false,

    _initialise() {
        this.error = $("<div class='box noselect' id='error'></div>");
        this.errorContent = $("<div class='content'></div>");
        this.errorTitleDiv = $("<div class='spaced title'>Whoops!</div>");
        this.errorMessageDiv = $("<div class='spaced'></div>");
        this.errorForm = $("<form></form>");
        this.errorSubmitInput = $("<button class='medium' type='submit'>Ok</button>");
        this.errorBackground = $("<div class='boxbackground'></div>");

        this.errorForm.append(this.errorSubmitInput);

        this.errorContent.append(this.errorTitleDiv);
        this.errorContent.append(this.errorMessageDiv);
        this.errorContent.append(this.errorForm);

        this.error.append(this.errorContent);

        $("body").append(this.errorBackground);
        $("body").append(this.error);

        this.errorBackground.hide();
        this.error.hide();

        this.errorBackground.click(event => {
            if (this.showing) {
                this.hide();
            }
        });

        this.errorForm.submit(event => {
            if (this.showing) {
                this.hide();
            }
            return false;
        });

        // Place content according to UI constants.
        this.errorContent.css("width", UIConstants.ERROR_WIDTH);

        this.initialised = true;
    },

    show(message, title) {
        if (!this.initialised) {
            this._initialise();
        }

        if (title === undefined) {
            title = "Whoops!";
        }

        this.error.show();
        this.errorBackground.fadeIn(200);

        this.showing = true;

        // Set message.
        this.errorMessageDiv.html(message);

        // Set title.
        this.errorTitleDiv.html(title);

        // -50% are needed since the animation overwrites the previous -50% translate applied to the box.
        this.error.css({ opacity: 0 });
        utils.set(this.error[0], { scale: 0.1, x: "-50%", y: "-50%" });
        animate(this.error[0], { scale: 1, duration: 300, ease: "outBack" });
        this.error.animate({ opacity: 1 }, { duration: 200, queue: false });

        GameSession.disableGameInput();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        animate(this.error[0], {
            scale: 0,
            duration: 200,
            ease: "inQuad",
            onComplete: () => {
                this.error.hide();
                utils.set(this.error[0], { scale: 1 });
            }
        });
        this.error.animate({ opacity: 0 }, { duration: 200, queue: false });
        this.errorBackground.fadeOut(200);

        this.showing = false;

        GameSession.enableGameInput();
    }
};
