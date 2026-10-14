import { AccessoryEquipTutorial } from "./accessoryequiptutorial.js";
import { Backend } from "./backend.js";
import { PurchaseTutorial } from "./purchasetutorial.js";
import { SignUpTutorial } from "./signuptutorial.js";
import { Users } from "./users.js";

export class TutorialManager {
    static tutorials = null;
    static currentTutorials = {};

    static init() {
        Users.addEventListener(TutorialManager._usersEventHandler, TutorialManager);
        TutorialManager.tutorials = [PurchaseTutorial, AccessoryEquipTutorial, SignUpTutorial];
        TutorialManager._beginTutorial(Users.getAllPlayerIds());
    }

    static completeTutorial(playerId) {
        TutorialManager._endTutorial(playerId);
        // Update progress and begin next tutorial
        Backend.updateTutorialProgress(playerId)
            .then(result => {
                TutorialManager._beginTutorial([playerId]);
            });
    }

    static _beginTutorial(playerIds) {
        Backend.getTutorialProgress(playerIds)
            .then(result => {
                if (typeof result === "object") {
                    for (let i = 0; i < playerIds.length; ++i) {
                        const playerId = playerIds[i];
                        // Check if user left while getting tutorial progress
                        if (Users.isAnyUser(playerId)) {
                            const tutorialProgress = result[playerId];
                            if (tutorialProgress < TutorialManager.tutorials.length) {
                                const tutorial = new TutorialManager.tutorials[tutorialProgress](playerId, TutorialManager);
                                tutorial.begin();
                                TutorialManager.currentTutorials[playerId] = tutorial;
                            }
                        }
                    }
                }
            });
    }

    static _endTutorial(playerId) {
        const tutorial = TutorialManager.currentTutorials[playerId];
        if (tutorial) {
            tutorial.end();
            delete TutorialManager.currentTutorials[playerId];
        }
    }

    static _usersEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.GUEST_ADDED:
            {
                TutorialManager._beginTutorial([data]);
                break;
            }
            case Users.EVENTS.GUESTS_ADDED:
            {
                TutorialManager._beginTutorial(data);
                break;
            }
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            case Users.EVENTS.GUEST_REMOVED:
            {
                TutorialManager._endTutorial(data);
                break;
            }
        }
    }
}
