import { TankTrouble } from "../tanktrouble.js";
import { AdminUtils } from "../adminutils.js";
import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { OverlayManager } from "../overlaymanager.js";
import { UIConstants } from "../tt/ui/uiconstants.js";

TankTrouble.AdminAcceptGuidelinesOverlay = {
    // jQuery objects
    wrapper: null,
    navigation: null,
    header: null,
    content: null,
    reject: null,
    accept: null,

    // State
    adminId: null,
    initialised: false,
    page: null,

    _initialise() {
        this.wrapper = $('<div class="admin acceptGuidelines centre"/>');
        this.header = $("<div class='header'/>");
        this.content = $('<div class="content"/>');
        this.reject = $('<button class="small" type="button"/>');
        this.accept = $('<button class="small" type="button"/>');

        const buttons = $("<div/>").append(this.reject, this.accept);

        this.wrapper.append(this.header, this.content, buttons);

        this.reject.on("click", event => {
            Backend.acceptAdminGuidelines(this.adminId, false, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (result === true) {
                        OverlayManager.replaceOverlay(
                            TankTrouble.AdminAcceptGuidelinesOverlay,
                            { adminId: this.adminId, page: "reject" }
                        );
                    }
                });
        });

        this.initialised = true;
    },

    /**
     * Expects params.adminId
     * Expects params.page
     * @param {Object} params
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        this.adminId = params.adminId;
        this.page = params.page;

        this.content.empty();

        if (this.page === "intro") {
            this.header.empty();
            Backend.getPlayerDetails(this.adminId, Caches.getPlayerDetailsCache())
                .then(result => {
                    this.header.text(`Hello ${result.getUsername()}`);
                });
            this.content.append("<p>We have recognised you as a devoted and good-hearted player. That's why we have hand-picked you to join the team of admins that maintain TankTrouble as a fun and friendly place.</p>");
            this.content.append("<p>It's not an easy job. If you accept, it will take some time and it will require that you log in on a regular basis. Also, you will not be compensated - monetarily or otherwise. This is a voluntary position.</p>");
            this.reject.show().text("No thanks, I prefer to just blow up tanks");
            this.accept.text("Yes, I would like to be an admin");
            this.accept.addClass("warning");
            this.accept.off("click").on("click", event => {
                OverlayManager.replaceOverlay(
                    TankTrouble.AdminAcceptGuidelinesOverlay,
                    { adminId: this.adminId, page: "general" }
                );
            });
        }

        if (this.page === "general") {
            this.header.text("Great!");
            this.content.append("<p>Before you can begin, there are a few things that you must learn. Please read carefully.</p>");
            this.content.append(AdminUtils.getCodex());
            this.reject.hide();
            this.accept.text("I have read and understood this");
            this.accept.addClass("warning");
            this.accept.off("click").on("click", event => {
                OverlayManager.replaceOverlay(
                    TankTrouble.AdminAcceptGuidelinesOverlay,
                    { adminId: this.adminId, page: "forum" }
                );
            });
        }

        if (this.page === "forum") {
            this.header.empty();    // Forum guidelines comes with its own header
            this.content.append(AdminUtils.getForumGuidelines(UIConstants.ADMIN_LEVEL_ACCEPT_GUIDELINES + 1));
            this.reject.hide();
            this.accept.text("I have read and understood this");
            this.accept.addClass("warning");
            this.accept.off("click").on("click", event => {
                OverlayManager.replaceOverlay(
                    TankTrouble.AdminAcceptGuidelinesOverlay,
                    { adminId: this.adminId, page: "commit" }
                );
            });
        }

        if (this.page === "commit") {
            this.header.text("Are you sure?");
            this.content.append("<p>It is a big responsibility to be an admin. It is important that you only accept if you have the time and are ready to put in the effort.</p>");
            this.reject.show().text("No thanks, I prefer to just blow up tanks");
            this.accept.text("Yes, I'm ready to be an admin");
            this.accept.addClass("warning");
            this.accept.off("click").on("click", event => {
                Backend.acceptAdminGuidelines(this.adminId, true, Caches.getPlayerDetailsCache())
                    .then(result => {
                        if (result === true) {
                            OverlayManager.replaceOverlay(
                                TankTrouble.AdminAcceptGuidelinesOverlay,
                                { adminId: this.adminId, page: "welcome" }
                            );
                        }
                    });
            });
        }

        if (this.page === "welcome") {
            this.header.text("Welcome onboard");
            this.content.append("<p>You are now part of the admin team. From now on TankTrouble will look a little different to you. Take some time to familiarise yourself with the new admin stuff, and whenever you're in doubt about something, ask the more experienced admins - they're there to help you.</p>");
            this.content.append("<p>We are pleased to have you onboard.</p>");
            this.content.append("<p>Sincerely,<br><span class='signature'>Purup & bbc</span></p>");
            this.reject.hide();
            this.accept.text("Take me to the admin dashboard");
            this.accept.removeClass("warning");
            this.accept.off("click").on("click", event => {
                OverlayManager.replaceOverlay(
                    TankTrouble.AdminDashboardOverlay,
                    { adminId: this.adminId }
                );
            });
        }

        if (this.page === "reject") {
            this.header.text("No worries");
            this.content.append("<p>We respect your decision. Good luck blowing up them tanks.</p>");
            this.reject.hide();
            this.accept.text("Alright");
            this.accept.removeClass("warning");
            this.accept.off("click").on("click", event => {
                OverlayManager.popOverlay(true, false);
            });
        }
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
