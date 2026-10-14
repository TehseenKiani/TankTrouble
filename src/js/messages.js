import { TankTrouble } from "./tanktrouble.js";
import { animate, utils } from "animejs";
import { Backend } from "./backend.js";
import { Commands } from "./commands.js";
import { OverlayManager } from "./overlaymanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { Users } from "./users.js";

TankTrouble.Messages = {
    marker: null,
    showing: false,

    init() {
        Commands.register("--messages.open", () => {
            if (Users.hasAdminRole(UIConstants.ADMIN_ROLE_WRITE_MESSAGES)) {
                OverlayManager.pushOverlay(
                    TankTrouble.AdminMessagesOverlay,
                    { adminId: Users.getAdminUserForRole(UIConstants.ADMIN_ROLE_WRITE_MESSAGES) }
                );
            } else {
                OverlayManager.pushOverlay(
                    TankTrouble.MessagesOverlay,
                    {}
                );
            }
        });

        this.marker = $("#messagesSnippet .marker");

        this.checkForUnseenMessages();

        Users.addEventListener(this._authenticationEventHandler, this);
    },

    checkForUnseenMessages() {
        const playerIds = Users.getAllPlayerIds();
        if (playerIds.length === 0) {
            this._hideMarker();
        } else {
            Backend.getUnseenMessagesCount(playerIds)
                .then(result => {
                    if (typeof result === "number") {
                        if (result > 0) {
                            this._showMarker();
                        } else {
                            this._hideMarker();
                        }
                    }
                });
        }
    },

    _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            case Users.EVENTS.GUEST_REMOVED:
            {
                self.checkForUnseenMessages();
                break;
            }
        }
    },

    _showMarker() {
        if (!this.showing) {
            this.showing = true;
            utils.remove(this.marker[0]);
            utils.set(this.marker[0], { scale: 0, rotate: 0 });
            this.marker.show();
            animate(this.marker[0], {
                keyframes: [
                    { scale: 1.5, rotate: 0, duration: 200 },
                    { scale: 1, rotate: 0, duration: 250 }
                ],
                ease: UIConstants.EASE_DEFAULT,
                onComplete: () => {
                    this._loopMarkerAnimation();
                }
            });
        }
    },

    _loopMarkerAnimation() {
        animate(this.marker[0], {
            keyframes: [{ rotate: 25 }, { rotate: -25 }],
            duration: 800,
            ease: UIConstants.EASE_DEFAULT,
            onComplete: () => {
                if (this.showing) {
                    this._loopMarkerAnimation();
                }
            }
        });
    },

    _hideMarker() {
        if (this.showing) {
            this.showing = false;
            utils.remove(this.marker[0]);
            animate(this.marker[0], {
                scale: 0,
                rotate: 0,
                duration: 200,
                ease: UIConstants.EASE_DEFAULT,
                onComplete: () => {
                    this.marker.hide();
                }
            });
        }
    }
};
