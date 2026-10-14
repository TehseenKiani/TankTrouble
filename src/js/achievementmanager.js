import { TTClient } from "./tt/ttclient.js";
import { animate, utils } from "animejs";
import { Backend } from "./backend.js";
import { ClientManager } from "./clientmanager.js";
import { OverlayManager } from "./overlaymanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { UIPlayerPanel } from "./tt/ui/playerpanel/uiplayerpanel.js";

export class AchievementManager {
    static initialAchievementUnlocks = [];
    static achievementUnlocksQueue = [];
    static achievementUnlockNotification = null;

    static loadInitialAchievementUnlocks() {
        if (Array.isArray(g_initialAchievementUnlocks)) {
            AchievementManager.initialAchievementUnlocks = g_initialAchievementUnlocks;
        }
    }

    static init() {
        AchievementManager.achievementUnlockNotification = $("<div class='achievementUnlock'></div>");
        AchievementManager.achievementUnlockNotification.css({ top: "-100px" });

        $("body").append(AchievementManager.achievementUnlockNotification);

        ClientManager.getClient().addEventListener(AchievementManager._clientEventHandler, this);
        Backend.addAchievementUnlockListener(AchievementManager._achievementUnlockHandler, this);
    }

    static enqueueInitialAchievementUnlocks() {
        for (let i = 0; i < AchievementManager.initialAchievementUnlocks.length; ++i) {
            const achievementUnlock = AchievementManager.initialAchievementUnlocks[i];
            AchievementManager.enqueueAchievementUnlock(achievementUnlock.playerId, achievementUnlock.achievementId);
        }
    }

    static enqueueAchievementUnlock(playerId, achievementId) {
        AchievementManager.achievementUnlocksQueue.push({ playerId, achievementId });
        // Show achievement unlock if only one is in the queue.
        if (AchievementManager.achievementUnlocksQueue.length === 1) {
            AchievementManager._getUnlock();
        }
    }

    static hideAchievementUnlock(delay) {
        setTimeout(() => {
            utils.remove(AchievementManager.achievementUnlockNotification[0]);
            animate(AchievementManager.achievementUnlockNotification[0], {
                top: "-100px",
                duration: 300,
                ease: UIConstants.EASE_DEFAULT,
                onComplete: () => {
                    AchievementManager._popAchievementUnlock();
                }
            });
        },
        delay);
    }

    static _popAchievementUnlock() {
        AchievementManager.achievementUnlocksQueue.shift();

        // Get next achievement unlock in the queue.
        if (AchievementManager.achievementUnlocksQueue.length > 0) {
            AchievementManager._getUnlock();
        }
    }

    static _getUnlock() {
        const [newUnlock] = AchievementManager.achievementUnlocksQueue;

        Backend.getUnlockedAchievement(newUnlock.playerId, newUnlock.achievementId)
            .then(result => {
                if (typeof result === "object") {
                    AchievementManager._showUnlock(result);
                } else {
                    AchievementManager._popAchievementUnlock();
                }
            });
    }

    static _delayUnlock(achievement) {
        // FIXME Since we don't currently have an event for closing a general overlay, we must poll for now.
        setTimeout(() => {
            AchievementManager._showUnlock(achievement);
        }, 1000);
    }

    static _showUnlock(achievement) {
        // Check if overlay is showing. If so, wait a little to show achievement unlock.
        if (OverlayManager.isOverlayShowing()) {
            AchievementManager._delayUnlock(achievement);
        } else {
            AchievementManager.achievementUnlockNotification.html(achievement.html.achievement);
            AchievementManager.achievementUnlockNotification.find("achievement-reveal").on("revealed", event => {
                AchievementManager.hideAchievementUnlock(3000);

                const reveal = $(event.currentTarget);
                const unlockedIcon = reveal.find("img.unlocked");

                setTimeout(() => {
                    const targetPosition = UIPlayerPanel.getLocalTankIconPosition(reveal.attr("data-player-id"));
                    if (targetPosition) {
                        const iconPosition = unlockedIcon.offset();
                        const iconForAnimation = unlockedIcon.clone().removeAttr("id").attr("class", "achievementUnlockIcon");
                        iconForAnimation.css({ left: iconPosition.left, top: iconPosition.top });
                        unlockedIcon.hide();
                        $("body").append(iconForAnimation);

                        animate(iconForAnimation[0], {
                            left: `${targetPosition.x - 60}px`,
                            top: { to: `${targetPosition.y - 60}px`, ease: "inBack" },
                            scale: 0.3,
                            duration: 800,
                            ease: "inOutSine",
                            onComplete: () => {
                                iconForAnimation.remove();
                            }
                        });
                    }
                }, 1500);
            });
            animate(AchievementManager.achievementUnlockNotification[0], { top: "70px", duration: 300, ease: "outBack" });
        }
    }

    static _achievementUnlockHandler(self, playerId, achievementId) {
        AchievementManager.enqueueAchievementUnlock(playerId, achievementId);
    }

    static _clientEventHandler(self, evt, data) {
        switch (evt) {
            case TTClient.EVENTS.ACHIEVEMENT_UNLOCKED:
            {
                AchievementManager.enqueueAchievementUnlock(data.getPlayerId(), data.getAchievementId());
                break;
            }
        }
    }
}
