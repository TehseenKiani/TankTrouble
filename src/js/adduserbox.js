import { TankTrouble } from "./tanktrouble.js";
import { animate, utils } from "animejs";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { GameSession } from "./gamesession.js";
import { OverlayManager } from "./overlaymanager.js";
import { Users } from "./users.js";
import { Utils } from "./utils.js";

TankTrouble.AddUserBox = {
    // jQuery objects.
    addUser: null,
    addUserContent: null,
    addUserTabLeft: null,
    addUserTabRight: null,
    addUserTabBottom: null,

    addUserGuest: null,

    addUserBackground: null,

    // State.
    initialised: false,
    showing: false,

    _initialise() {
        this.addUser = $("<div class='box noselect' id='adduser'></div>");
        this.addUserContent = $("<div class='content'></div>");
        this.addUserTabLeft = $("<div class='tab left'></div>");
        this.addUserTabRight = $("<div class='tab right'></div>");
        this.addUserTabBottom = $("<div class='tab bottom'></div>");
        this.addUserGuest = Utils.createFixedWidthButton("Play as guest", "medium", 198);
        
        
        
        this.addUserBackground = $("<div class='boxbackground'></div>");

        
        

        this.addUserContent.append(this.addUserTabLeft);
        this.addUserContent.append(this.addUserTabRight);
        this.addUserContent.append(this.addUserTabBottom);

        this.addUserContent.append(this.addUserGuest);
        this.addUserContent.append();

        this.addUser.append(this.addUserContent);

        $("body").append(this.addUserBackground);
        $("body").append(this.addUser);

        this.addUserBackground.hide();
        this.addUser.hide();

        

        this.addUserBackground.click(event => {
            if (this.showing) {
                this.hide();
            }
        });

        this.addUserGuest.click(event => {
            if (this.showing) {
                this.hide();
                Backend.createGuests(1, Caches.getPlayerDetailsCache())
                    .then(result => {
                        if (typeof result === "object") {
                            // Store player id of guest user in an
                            // easily accessible place
                            Users.addGuestUser(result.playerIds[0], result.multiplayerTokens[0]);
                        } else {
                            TankTrouble.ErrorBox.show(result);
                        }
                    });
            }
        });

        

        

        this.initialised = true;
    },

    show(x, y, preferredDirection, preferredRadius) {
        if (!this.initialised) {
            this._initialise();
        }

        // Update tool tips.
        

        this.addUser.show();
        this.addUserBackground.fadeIn(200);

        this.showing = true;

        GameSession.disableGameInput();

        this.addUser.removeClass("left right top bottom");

        if (preferredDirection === "right") {
            this.addUser.position({ my: "left top", at: `left+${x + preferredRadius + 30} top+${y - 35}`, of: $(document), collision: "none" });  // +30 to account for left tab size. -35 to account for vertical placement of tab.
            this.addUser.addClass("left");
            this.addUser.css({ transformOrigin: "-15% 35px" });
        } else if (preferredDirection === "left") {
            this.addUser.position({ my: "right top", at: `left+${x - preferredRadius - 30} top+${y - 35}`, of: $(document), collision: "none" });  // -30 to account for right tab size. -35 to account for vertical placement of tab.
            this.addUser.addClass("right");
            this.addUser.css({ transformOrigin: "115% 35px" });
        } else if (preferredDirection === "top") {
            this.addUser.position({ my: "center bottom", at: `left+${x} top+${y - preferredRadius - 30}`, of: $(document), collision: "none" });  // -30 to account for bottom tab size.
            this.addUser.addClass("bottom");
            this.addUser.css({ transformOrigin: "50% 130%" });
        }

        this.addUser.css({ opacity: 0 });
        utils.set(this.addUser[0], { scale: 0.1 });
        animate(this.addUser[0], { scale: 1, duration: 300, ease: "outBack" });
        this.addUser.animate({ opacity: 1 }, { duration: 200, queue: false });
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        animate(this.addUser[0], {
            scale: 0,
            duration: 200,
            ease: "inQuad",
            onComplete: () => {
                this.addUser.hide();
                utils.set(this.addUser[0], { scale: 1 });
            }
        });
        this.addUser.animate({ opacity: 0 }, { duration: 200, queue: false });
        this.addUserBackground.fadeOut(200);

        this.showing = false;

        GameSession.enableGameInput();
    }
};
