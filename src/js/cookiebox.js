import { TankTrouble } from "./tanktrouble.js";
import { Utils } from "./utils.js";

TankTrouble.CookieBox = {
    // jQuery objects.
    cookie: null,
    cookieMessage: null,
    cookieWrapper: null,
    cookieButton: null,

    // State.
    initialised: false,

    _initialise() {
        this.cookie = $("<div id='cookie'/>");
        this.cookieMessage = $("<div><div>TankTrouble uses cookies. Without cookies the site cannot work &ndash; also what's life without cookies? <a class='managedNavigation' href='/privacy' aria-label='More info about cookies and privacy'>More info</a></div></div>");
        this.cookieWrapper = $("<div></div>");
        this.cookieButton = Utils.createFixedWidthButton("Got it!", "medium", 120);

        this.cookieWrapper.append(this.cookieButton);

        this.cookie.append(this.cookieMessage);
        this.cookie.append(this.cookieWrapper);

        $("body").append(this.cookie);

        this.cookieButton.click(event => {
            this.hide();
            this._storeCookie();
        });

        this.cookie.hide();

        this.initialised = true;
    },

    show() {
        if (!this.initialised) {
            this._initialise();
        }

        this.cookie.show();
        this.cookie.css("bottom", -this.cookie.outerHeight());
        this.cookie.delay(2000).animate({ bottom: 0 }, 500);
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.cookie.animate({ bottom: -this.cookie.outerHeight() }, 500, () => {
            this.cookie.hide();
        });
    },

    _storeCookie() {
        Cookies.set("consent", "dismiss", { expires: 365 });
    },

    checkForCookie() {
        return Cookies.get("consent") !== undefined;
    }
};
