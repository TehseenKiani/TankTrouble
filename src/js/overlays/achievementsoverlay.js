import { TankTrouble } from "../tanktrouble.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { Images } from "../images.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.AchievementsOverlay = {
    wrapper: null,
    trophy: null,
    betaWarning: null,
    achievementList: null,
    form: null,
    submitInput: null,

    // State.
    initialised: false,
    playerId: null,

    _initialise() {
        this.wrapper = $("<div class='achievements centre'/>");

        this.trophy = $(`<img class='logo' ${Images.attributes("achievements/trophy.png")}>`);
        this.betaWarning = $("<div>WARNING: These Achievements are for BETA testing only and they WILL BE RESET</div>");

        this.achievementList = $("<div></div>");
        this.achievementList.on("revealed", "achievement-reveal", event => {
            // Mark achievement as seen if overlay is still showing.
            if (OverlayManager.getCurrentOverlay() === TankTrouble.AchievementsOverlay) {
                const reveal = $(event.target);
                Backend.markAchievementAsSeen(reveal.attr("data-player-id"), reveal.attr("data-achievement-id"), Caches.getUnseenAchievementsCache());
            }
        });

        this.form = $("<form></form>");
        this.submitInput = $("<button class='medium' type='submit' tabindex='-1'>Done</button>");

        Utils.addOverlayFormRow(this.form, this.submitInput);

        this.wrapper.append(this.trophy);
        //this.wrapper.append(this.betaWarning);
        this.wrapper.append(this.achievementList);
        this.wrapper.append(this.form);

        this.form.submit(event => {
            OverlayManager.popOverlay(true, false);
            return false;
        });

        this.initialised = true;
    },

    /** Expected params:
     * playerId
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        // Store playerId.
        this.playerId = params.playerId;

        this.achievementList.empty();

        Backend.getAchievements(this.playerId)
            .then(result => {
                if (typeof result === "object") {
                    for (let i = 0; i < result.length; ++i) {
                        this.achievementList.append(result[i].html.achievement);
                    }
                }
            });
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.wrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return true;
    }
};
