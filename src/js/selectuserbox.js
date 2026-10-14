import { Constants } from "./tt/constants.js";
import { TankTrouble } from "./tanktrouble.js";
import { animate, utils } from "animejs";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { GameSession } from "./gamesession.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { UITankIcon } from "./tt/ui/uitankicon.js";
import { Utils } from "./utils.js";

TankTrouble.SelectUserBox = {
    // jQuery objects.
    selectUser: null,
    selectUserMessage: null,
    selectUserIconContainers: [],
    selectUserIconPlaceholders: [],
    selectUserIcons: [],
    selectUserContent: null,
    selectUserTabLeft: null,
    selectUserTabRight: null,
    selectUserTabBottom: null,
    selectUserTabTop: null,
    selectUserOptions: [],
    selectUserNames: [],
    selectUserNameTexts: [],
    selectUserSelects: [],

    selectUserBackground: null,

    // Canvas elements.
    iconCanvases: [],

    // State.
    initialised: false,
    showing: false,
    playerIds: null,
    selectionCallback: null,

    _initialise() {
        this.selectUser = $("<div class='box noselect' id='selectuser'></div>");
        this.selectUserMessage = $("<div class='spaced'></div>");
        for (let i = 0; i < Constants.CLIENT.MAX_PLAYERS; ++i) {
            this.selectUserOptions.push($(`<div class='option option${i + 1}'></div>`));
            this.selectUserIconContainers.push($("<div class='iconContainer'></div>"));
            this.selectUserIcons.push($("<canvas class='icon'></canvas>"));
            this.iconCanvases.push(this.selectUserIcons[i][0]);
            this.selectUserIconPlaceholders.push($(`<img class='icon' src='${UITankIcon.getImageUrl("placeholder", UIConstants.TANK_ICON_SIZES.SMALL)}' alt=''/>`));
            this.selectUserNames.push($("<div class='username'></div>"));
            this.selectUserSelects.push(Utils.createFixedWidthButton("Select", "medium", 104));

            this.selectUserIconContainers[i].append(this.selectUserIcons[i]);
            this.selectUserIconContainers[i].append(this.selectUserIconPlaceholders[i]);

            this.selectUserOptions[i].append(this.selectUserIconContainers[i]);
            this.selectUserOptions[i].append(this.selectUserNames[i]);
            this.selectUserOptions[i].append(this.selectUserSelects[i]);
        }
        this.selectUserContent = $("<div class='content'></div>");
        this.selectUserTabLeft = $("<div class='tab left'></div>");
        this.selectUserTabRight = $("<div class='tab right'></div>");
        this.selectUserTabBottom = $("<div class='tab bottom'></div>");
        this.selectUserTabTop = $("<div class='tab top'></div>");

        this.selectUserBackground = $("<div class='boxbackground'></div>");

        this.selectUserContent.append(this.selectUserTabLeft);
        this.selectUserContent.append(this.selectUserTabRight);
        this.selectUserContent.append(this.selectUserTabBottom);
        this.selectUserContent.append(this.selectUserTabTop);

        this.selectUserContent.append(this.selectUserMessage);

        this.selectUserContent.append(this.selectUserOptions);

        this.selectUser.append(this.selectUserContent);

        $("body").append(this.selectUserBackground);
        $("body").append(this.selectUser);

        this.selectUserBackground.hide();
        this.selectUser.hide();

        $.each(this.selectUserIcons, (index, element) => { element.hide(); });

        this.selectUserBackground.click(event => {
            if (this.showing) {
                this.hide();
            }
        });

        for (let i = 0; i < Constants.CLIENT.MAX_PLAYERS; ++i) {
            // Solution with closure and anonymous function. More compact, but is it less readable?
            /*(function(index) {
               self.selectUserSelects[index].on("click", function (event) {
                   if (self.showing) {
                       self.hide();
                       self.selectionCallback(self.playerIds[index]);
                   }
               });
           })(i);*/

            // Solution with helper function.
            this._addSelectClick(i);
        }

        // Set the canvas sizes.
        for (let i = 0; i < Constants.CLIENT.MAX_PLAYERS; ++i) {
            this.iconCanvases[i].width = UIConstants.TANK_ICON_WIDTHS[UIConstants.TANK_ICON_SIZES.SMALL];
            this.iconCanvases[i].height = UIConstants.TANK_ICON_HEIGHTS[UIConstants.TANK_ICON_SIZES.SMALL];
        }

        // Place content according to UI constants.
        for (let i = 0; i < Constants.CLIENT.MAX_PLAYERS; ++i) {
            const nameText = $(`<stroked-text width='${UIConstants.SELECT_USER_WIDTH_PER_USER - 10}' height='33' font-size='24' stroke-width='4'/>`);
            this.selectUserNames[i].append(nameText);
            this.selectUserNameTexts.push(nameText);
        }

        this.initialised = true;
    },

    show(x, y, message, buttonText, playerIds, selectionCallback, preferredDirection, preferredRadius) {
        if (!this.initialised) {
            this._initialise();
        }

        this.playerIds = playerIds;
        this.selectionCallback = selectionCallback;

        this.selectUser.show();
        this.selectUserBackground.fadeIn(200);

        // Place content according to UI constants.
        this.selectUserContent.css("width", playerIds.length * UIConstants.SELECT_USER_WIDTH_PER_USER);

        // Set message and buttons.
        this.selectUserMessage.text(message);
        this.selectUser.find("button").text(buttonText);

        // Hide invalid options.
        this.selectUser.removeClass("users1 users2 users3").addClass(`users${playerIds.length}`);

        this.showing = true;

        this.selectUser.removeClass("left right top bottom");

        if (preferredDirection === "right") {
            this.selectUser.position({ my: "left top", at: `left+${x + preferredRadius + 30} top+${y - 35}`, of: $(document), collision: "none" });  // +30 to account for left tab size. -35 to account for vertical placement of tab.
            this.selectUser.addClass("left");
            this.selectUser.css({ transformOrigin: "-15% 35px" });
        } else if (preferredDirection === "left") {
            this.selectUser.position({ my: "right top", at: `left+${x - preferredRadius - 30} top+${y - 35}`, of: $(document), collision: "none" });  // -30 to account for right tab size. -35 to account for vertical placement of tab.
            this.selectUser.addClass("right");
            this.selectUser.css({ transformOrigin: "115% 35px" });
        } else if (preferredDirection === "top") {
            this.selectUser.position({ my: "center bottom", at: `left+${x} top+${y - preferredRadius - 30}`, of: $(document), collision: "none" });  // -30 to account for bottom tab size.
            this.selectUser.addClass("bottom");
            this.selectUser.css({ transformOrigin: "50% 120%" });
        } else if (preferredDirection === "bottom") {
            this.selectUser.position({ my: "center top", at: `left+${x} top+${y + preferredRadius + 30}`, of: $(document), collision: "none" });  // -30 to account for top tab size.
            this.selectUser.addClass("top");
            this.selectUser.css({ transformOrigin: "50% -20%" });
        }

        // Setting the scale to 0 causes issues with svg text scale, so we work around that by setting the scale to 0.1.
        this.selectUser.css({ opacity: 0 });
        utils.set(this.selectUser[0], { scale: 0.1 });
        animate(this.selectUser[0], { scale: 1, duration: 300, ease: "outBack" });
        this.selectUser.animate({ opacity: 1 }, { duration: 200, queue: false });

        $.each(this.selectUserIconPlaceholders, (index, element) => { element.show(); });
        $.each(this.selectUserIcons, (index, element) => { element.hide(); });

        // Send request for player details.
        for (let i = 0; i < this.playerIds.length; ++i) {
            // Solution with closure and anonymous function possible. More compact, but is it less readable?
            this._showPlayerDetails(i);
        }

        GameSession.disableGameInput();
    },

    _showPlayerDetails(index) {
        Backend.getPlayerDetails(this.playerIds[index], Caches.getPlayerDetailsCache())
            .then(result => {
                this.selectUserNameTexts[index].attr("text", "");

                UITankIcon.loadPlayerTankIcon(this.iconCanvases[index], UIConstants.TANK_ICON_SIZES.SMALL, this.playerIds[index]).then(() => {
                    // Show icon.
                    this.selectUserIconPlaceholders[index].hide();
                    this.selectUserIcons[index].show();
                });

                let username = "Scrapped";

                if (typeof result === "object") {
                    username = result.getUsername();
                }

                this.selectUserNameTexts[index].attr("text", username);
            });
    },

    _addSelectClick(index) {
        this.selectUserSelects[index].on("click", event => {
            if (this.showing) {
                this.hide();
                this.selectionCallback(this.playerIds[index]);
            }
        });
    },

    _loopButtonMarkerAnimation() {
        if (this.showing) {
            animate(this.infoAchievementsUnseenMarkerIcon[0], {
                keyframes: [{ rotate: 25 }, { rotate: -25 }],
                duration: 800,
                ease: UIConstants.EASE_DEFAULT,
                onComplete: () => {
                    if (this.showing) {
                        this._loopButtonMarkerAnimation();
                    }
                }
            });
        }
    },

    _loopShopButtonFlickerAnimation() {
        if (this.flickerTimeout) {
            clearTimeout(this.flickerTimeout);
            this.flickerTimeout = null;
        }

        if (this.showing) {
            this.flickerTimeout = setTimeout(() => {
                this.infoShop.toggleClass("flicker");
                let time = 0;
                const flickers = 3 + (Math.random() > 0.8 ? 2 : 0);
                for (let i = 0; i < flickers; ++i) {
                    time += 50 + Math.floor(Math.random() * 50);
                    setTimeout(() => {
                        this.infoShop.toggleClass("flicker");
                        if (this.showing) {
                            this._loopShopButtonFlickerAnimation();
                        }
                    }, time);
                }
            }, 4000 + Math.floor(Math.random() * 3000));
        }
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        animate(this.selectUser[0], {
            scale: 0,
            duration: 200,
            ease: "inQuad",
            onComplete: () => {
                this.selectUser.hide();
                utils.set(this.selectUser[0], { scale: 1 });
            }
        });
        this.selectUser.animate({ opacity: 0 }, { duration: 200, queue: false });

        this.selectUserBackground.fadeOut(200);

        this.showing = false;

        GameSession.enableGameInput();
    }
};
