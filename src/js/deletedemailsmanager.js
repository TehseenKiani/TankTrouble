import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { OverlayManager } from "./overlaymanager.js";
import { Users } from "./users.js";

export class DeletedEmailsManager {
    static init() {
        Users.addEventListener(DeletedEmailsManager._authenticationEventHandler, DeletedEmailsManager);

        // Check any authenticated players.
        const playerIds = Users.getAuthenticatedPlayerIds();
        for (let i = 0; i < playerIds.length; ++i) {
            DeletedEmailsManager._checkUser(playerIds[i]);
        }
    }

    static _checkUser(playerId) {
        Backend.getEmail(playerId, Caches.getEmailCache())
            .then(result => {
                if (result === null) {
                    OverlayManager.enqueueOverlay(
                        TankTrouble.NewEmailOverlay,
                        { playerId }
                    );
                }
            });
    }

    static _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.GUEST_SIGNED_UP:
            {
                DeletedEmailsManager._checkUser(data);

                break;
            }
            case Users.EVENTS.PLAYER_UPDATED:
            {
                if (Users.isAuthenticatedUser(data.playerId)) {
                    DeletedEmailsManager._checkUser(data.playerId);
                }

                break;
            }
        }
    }
}
