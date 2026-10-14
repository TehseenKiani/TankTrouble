import { TTClient } from "./tt/ttclient.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { ClientManager } from "./clientmanager.js";
import { ResizeManager } from "./resizemanager.js";
import { Users } from "./users.js";

export class PremiumManager {
    static hasPremium = false;

    static loadPremiumPresent() {
        if (typeof g_initialPremiumPresent === "boolean") {
            PremiumManager.hasPremium = g_initialPremiumPresent;
        }
    }

    static init() {
        ClientManager.getClient().addEventListener(PremiumManager._clientEventHandler, PremiumManager);
        Users.addEventListener(PremiumManager._authenticationEventHandler, PremiumManager);
        PremiumManager._checkForPremium();
    }

    static isPremiumPresent() {
        return PremiumManager.hasPremium;
    }

    static _checkForPremium() {
        const playerIds = Users.getAuthenticatedPlayerIds();
        let hasPremium = false;

        const detailsPromises = playerIds.map(playerId => {
            return Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        if (result.getPremium()) {
                            hasPremium = true;
                        }
                    }
                })
                .catch(() => {});
        });

        // When we have all responses, check if any was premium.
        Promise.all(detailsPromises).then(() => {
            PremiumManager._updatePremium(hasPremium);
        });
    }

    static _updatePremium(hasPremium) {
        PremiumManager.hasPremium = hasPremium;

        if (hasPremium) {
            $("body").addClass("premium");
        } else {
            $("body").removeClass("premium");
        }
        ResizeManager.refresh();
    }

    static _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            case Users.EVENTS.PLAYER_UPDATED:
            {
                PremiumManager._checkForPremium();
                break;
            }
        }
    }

    static _clientEventHandler(self, evt, data) {
        switch (evt) {
            case TTClient.EVENTS.PLAYER_UPDATED:
            {
                if (Users.isAnyUser(data.getPlayerId())) {
                    PremiumManager._checkForPremium();
                }
                break;
            }
        }
    }
}
