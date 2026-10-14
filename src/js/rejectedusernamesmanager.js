import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { OverlayManager } from "./overlaymanager.js";
import { Users } from "./users.js";

export class RejectedUsernamesManager {
    static init() {
        Users.addEventListener(RejectedUsernamesManager._authenticationEventHandler, RejectedUsernamesManager);

        // Check any authenticated players.
        const playerIds = Users.getAuthenticatedPlayerIds();
        for (let i = 0; i < playerIds.length; ++i) {
            RejectedUsernamesManager._checkUser(playerIds[i]);
        }
    }

    static _checkUser(playerId) {
        Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    if (result.getUsernameApproved() === false) {
                        OverlayManager.enqueueOverlay(
                            TankTrouble.NewUsernameOverlay,
                            { playerId }
                        );
                    }
                }
            });
    }

    static _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.GUEST_SIGNED_UP:
            {
                RejectedUsernamesManager._checkUser(data);

                break;
            }
            case Users.EVENTS.PLAYER_UPDATED:
            {
                RejectedUsernamesManager._checkUser(data.playerId);

                break;
            }
        }
    }
}
