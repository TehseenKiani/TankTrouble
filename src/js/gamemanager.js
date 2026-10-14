import { Game } from "./tt/ui/game/game.js";
import { Assets } from "./assets.js";
import { Images } from "./images.js";
import { animate, utils } from "animejs";
import { AudioManager } from "./audiomanager.js";
import { ClientManager } from "./clientmanager.js";
import { GameSession } from "./gamesession.js";
import { ResizeManager } from "./resizemanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { UIPlayerPanel } from "./tt/ui/playerpanel/uiplayerpanel.js";

export class GameManager {
    static goldPickupAudio = null;
    static diamondPickupAudio = null;
    static goldOrDiamondLandAudio = null;

    static init() {
        GameManager.goldPickupAudio = new Audio(Assets.url("audio/GoldPickup.m4a"));
        GameManager.diamondPickupAudio = new Audio(Assets.url("audio/DiamondPickup.m4a"));
        GameManager.goldOrDiamondLandAudio = new Audio(Assets.url("audio/GoldOrDiamondLand.m4a"));
    }

    static initGame() {
        AudioManager.addEventListener(GameManager._audioEventHandler, this);
        ResizeManager.addEventListener(GameManager._resizeEventHandler, this);

        GameManager.insertGame($("#game"));
        UIPlayerPanel.insertPanel($("#playerPanel"));
    }

    static deinitGame() {
        AudioManager.removeEventListener(GameManager._audioEventHandler, this);
        ResizeManager.removeEventListener(GameManager._resizeEventHandler, this);

        AudioManager.leaveGame();

        GameManager.removeGame();
        UIPlayerPanel.removePanel();
    }

    static insertGame(parentElement) {
        parentElement.empty();

        const config = {
            width: parentElement.width(),
            height: parentElement.height(),
            renderer: Phaser.WEBGL,
            //multiTexture: true,
            parent: parentElement[0],
            transparent: true,
            enableDebug: false
        };
        const game = new Phaser.Game(config);
        GameSession.setGame(game);

        game.state.add("Boot", new Game.UIBootState());
        game.state.add("Preload", new Game.UIPreloadState());
        game.state.add("Menu", new Game.UIMenuState());
        game.state.add("Lobby", new Game.UILobbyState());
        game.state.add("Game", new Game.UIGameState());

        game.state.start("Boot");

        return game;
    }

    static removeGame() {
        const game = GameSession.getGame();
        if (game) {
            if (game.load) {
                game.load.reset(true, true);
            }
            game.destroy();
            GameSession.setGame(null);
        }

        // Leave game if inside an online one.
        if (ClientManager.getClient().getCurrentGameId()) {
            ClientManager.getClient().leaveGame(true);
        }

        GameSession.setGameController(null);
    }

    static showRankChange(rankChange, position) {
        if (rankChange === 0) {
            return;
        }

        if (position) {
            const updateDiv = $("<div class='rankChange'></div>");
            updateDiv.svg({ settings: { width: 80, height: 32 } });
            const updateSvg = updateDiv.svg("get");

            let fillColour = "#ffda00";
            if (rankChange < 0) {
                fillColour = "#e00000";
            }

            updateSvg.text(40, 30, `${rankChange}`, { textAnchor: "middle", fontFamily: "Arial Black", fontWeight: "normal", fontSize: 30, fill: "none", stroke: "black", strokeLineJoin: "round", strokeWidth: 4 });
            updateSvg.text(40, 30, `${rankChange}`, { textAnchor: "middle", fontFamily: "Arial Black", fontWeight: "normal", fontSize: 30, fill: fillColour, strokeLineJoin: "round" });

            updateDiv.css({ left: position.x - 40, top: position.y - 16 });
            utils.set(updateDiv[0], { scale: 0.1 });

            $("body").append(updateDiv);

            animate(updateDiv[0], {
                scale: 1,
                duration: 300,
                ease: "outBack",
                onComplete: () => {
                    animate(updateDiv[0], {
                        top: "-=25",
                        opacity: 0,
                        duration: 1000,
                        ease: "inOutSine",
                        onComplete: () => {
                            updateDiv.remove();
                        }
                    });
                }
            });
        }
    }

    static showXPChange(xpChange, position, delay) {
        if (xpChange === 0) {
            return;
        }

        if (position) {
            const updateDiv = $("<div class='rankChange'></div>");
            updateDiv.svg({ settings: { width: 60, height: 32 } });
            const updateSvg = updateDiv.svg("get");

            const fillColour = "#e600ff";

            updateSvg.text(30, 30, `${xpChange}`, { textAnchor: "middle", fontFamily: "Arial Black", fontWeight: "normal", fontSize: 30, fill: "none", stroke: "black", strokeLineJoin: "round", strokeWidth: 4 });
            updateSvg.text(30, 30, `${xpChange}`, { textAnchor: "middle", fontFamily: "Arial Black", fontWeight: "normal", fontSize: 30, fill: fillColour, strokeLineJoin: "round" });

            updateDiv.css({ left: position.x - 30,
                top: position.y - 16 });
            utils.set(updateDiv[0], { scale: 0.1 });

            $("body").append(updateDiv);

            animate(updateDiv[0], {
                scale: 1,
                duration: 300,
                delay,
                ease: "outBack",
                onComplete: () => {
                    animate(updateDiv[0], {
                        top: "-=25",
                        opacity: 0,
                        duration: 1000,
                        ease: "inOutSine",
                        onComplete: () => {
                            updateDiv.remove();
                        }
                    });
                }
            });
        }
    }

    static createNewGame(ranked, symmetric, storm, gameMode, maxActivePlayerCount, crateTypes) {
        const game = GameSession.getGame();
        if (game && game.state) {
            if (game.state.current === "Lobby") {
                game.state.getCurrentState().createNewGame(ranked, symmetric, storm, gameMode, maxActivePlayerCount, crateTypes);
            }
        }
    }

    static sendVictoryGoldToTank(playerId, goldAmount, tankPosition) {
        if (goldAmount === 0) {
            return;
        }

        const targetPosition = UIPlayerPanel.getLocalTankIconPosition(playerId);

        if (tankPosition && targetPosition) {
            AudioManager.playSound(GameManager.goldPickupAudio);
        }

        for (let i = 0; i < goldAmount; ++i) {
            if (tankPosition && targetPosition) {
                const goldIcon = $("<div class='goldIcon'></div>");
                const goldImage = $(`<img class='gold' ${Images.attributes("atlases/game/gold.png")}>`);

                goldIcon.data("done", false);

                goldIcon
                    .css({ left: tankPosition.x - 18,
                        top: tankPosition.y - 18 });
                utils.set(goldIcon[0], { scale: 0 });

                goldIcon.append(goldImage);
                $("body").append(goldIcon);

                let xOffset = 0;
                let yOffset = 0;

                // Offset gold slightly in a circle.
                if (goldAmount > 1) {
                    const angle = ((2.0 * Math.PI) / goldAmount) * i;
                    xOffset = Math.cos(angle) * 40.0;
                    yOffset = Math.sin(angle) * 40.0;
                }

                animate(goldIcon[0], {
                    scale: 2,
                    left: `+=${xOffset}`,
                    top: `+=${yOffset}`,
                    duration: 600,
                    delay: 300 * i,
                    ease: UIConstants.EASE_DEFAULT,
                    onComplete: () => {
                        animate(goldIcon[0], {
                            left: `${targetPosition.x - 18}px`,
                            top: { to: `${targetPosition.y - 18}px`, ease: "inBack" },
                            scale: 0.5,
                            duration: 800,
                            delay: 300,
                            ease: "inOutSine",
                            onComplete: () => {
                                goldIcon.remove();
                                goldIcon.data("done", true);
                                AudioManager.playSound(GameManager.goldOrDiamondLandAudio);
                            }
                        });
                    }
                });

                this._spawnGoldSparkle(goldIcon);
            }
        }
    }

    static sendGoldToTank(pickup, positionAngleScale) {
        AudioManager.playSound(GameManager.goldPickupAudio);

        const targetPosition = UIPlayerPanel.getLocalTankIconPosition(pickup.getPlayerId());
        if (positionAngleScale && targetPosition) {
            const goldIcon = $("<div class='goldIcon'></div>");
            const goldImage = $(`<img class='gold' ${Images.attributes("atlases/game/gold.png")}>`);

            goldIcon.data("done", false);

            goldIcon
                .css({ left: positionAngleScale.x - 18,
                    top: positionAngleScale.y - 18 });
            utils.set(goldIcon[0], { rotate: positionAngleScale.angle, scale: positionAngleScale.scale });

            goldIcon.append(goldImage);
            $("body").append(goldIcon);

            animate(goldIcon[0], {
                scale: 2,
                rotate: 0,
                duration: 600,
                ease: UIConstants.EASE_DEFAULT,
                onComplete: () => {
                    animate(goldIcon[0], {
                        left: `${targetPosition.x - 18}px`,
                        top: { to: `${targetPosition.y - 18}px`, ease: "inBack" },
                        scale: 0.5,
                        duration: 800,
                        delay: 300,
                        ease: "inOutSine",
                        onComplete: () => {
                            goldIcon.remove();
                            goldIcon.data("done", true);
                            AudioManager.playSound(GameManager.goldOrDiamondLandAudio);
                        }
                    });
                }
            });

            this._spawnGoldSparkle(goldIcon);
        }
    }

    static _spawnGoldSparkle(goldElement) {
        if (goldElement.data("done")) {
            return;
        }

        // 17 is half the radius of an unscaled coin.
        const distance = 17 - (Math.random() * 2);
        const angle = Math.random() * 2.0 * Math.PI;

        const sparkleX = -20 + 18 + (Math.cos(angle) * distance);
        const sparkleY = -20 + 18 + (Math.sin(angle) * distance);

        const sparkle = $(`<img class='sparkle' ${Images.attributes("atlases/game/sparkle.png")}>`);
        sparkle.css({ left: sparkleX, top: sparkleY });
        utils.set(sparkle[0], { scale: 0, rotate: Math.floor(Math.random() * 180) });

        goldElement.append(sparkle);

        animate(sparkle[0], {
            keyframes: [
                { scale: 1, rotate: "+=90" },
                { scale: 0, rotate: "+=90" }
            ],
            duration: 2 * UIConstants.SPARKLE_ANIMATION_TIME,
            ease: "linear",
            onComplete: () => {
                sparkle.remove();
            }
        });

        setTimeout(() => {
            this._spawnGoldSparkle(goldElement);
        }, UIConstants.GOLD_SPARKLE_MIN_INTERVAL_TIME + (Math.random() * (UIConstants.GOLD_SPARKLE_MAX_INTERVAL_TIME - UIConstants.GOLD_SPARKLE_MIN_INTERVAL_TIME)));
    }

    static sendDiamondToTank(pickup, positionAngleScale) {
        AudioManager.playSound(GameManager.diamondPickupAudio);

        const targetPosition = UIPlayerPanel.getLocalTankIconPosition(pickup.getPlayerId());
        if (positionAngleScale && targetPosition) {
            const diamondIcon = $("<div class='diamondIcon'></div>");
            const diamondImage = $(`<img class='diamond' ${Images.attributes("atlases/game/diamond.png")}>`);
            const diamondGlowImage = $(`<img class='glow' ${Images.attributes("atlases/game/diamondGlow.png")}>`);
            const diamondFirstRayImage = $(`<img class='ray' ${Images.attributes("atlases/game/diamondRays.png")}>`);
            const diamondSecondRayImage = $(`<img class='ray' ${Images.attributes("atlases/game/diamondRays.png")}>`);

            diamondIcon.data("done", false);

            diamondIcon
                .css({ left: positionAngleScale.x - 12,
                    top: positionAngleScale.y - 20 });
            utils.set(diamondIcon[0], { rotate: positionAngleScale.angle, scale: positionAngleScale.scale });

            utils.set(diamondGlowImage[0], { scale: positionAngleScale.extraInfo.glowScale.x });

            diamondFirstRayImage.css({ opacity: positionAngleScale.extraInfo.firstRayAlpha });
            utils.set(diamondFirstRayImage[0], { rotate: positionAngleScale.extraInfo.firstRayAngle });
            diamondSecondRayImage.css({ opacity: positionAngleScale.extraInfo.secondRayAlpha });
            utils.set(diamondSecondRayImage[0], { rotate: positionAngleScale.extraInfo.secondRayAngle });

            diamondIcon.append(diamondGlowImage);
            diamondIcon.append(diamondFirstRayImage);
            diamondIcon.append(diamondSecondRayImage);
            diamondIcon.append(diamondImage);
            $("body").append(diamondIcon);

            // Time to rotate 1080 degrees (including conversion from radians to degrees, and from s to ms).
            const firstRayRotationTime = (1080 / ((UIConstants.DIAMOND_FIRST_RAY_ROTATION_SPEED / Math.PI) * 180)) * 1000;
            const secondRayRotationTime = (1080 / ((UIConstants.DIAMOND_SECOND_RAY_ROTATION_SPEED / Math.PI) * 180)) * 1000;

            animate(diamondFirstRayImage[0], { rotate: "+=1080", duration: firstRayRotationTime, ease: "linear" });
            animate(diamondSecondRayImage[0], { rotate: "+=1080", duration: secondRayRotationTime, ease: "linear" });

            animate(diamondIcon[0], {
                scale: 2,
                rotate: 0,
                duration: 600,
                ease: UIConstants.EASE_DEFAULT,
                onComplete: () => {
                    animate(diamondIcon[0], {
                        left: `${targetPosition.x - 10}px`,
                        top: { to: `${targetPosition.y - 21}px`, ease: "inBack" },
                        scale: 0.5,
                        duration: 800,
                        delay: 300,
                        ease: "inOutSine",
                        onComplete: () => {
                            diamondIcon.remove();
                            diamondIcon.data("done", true);
                            AudioManager.playSound(GameManager.goldOrDiamondLandAudio);
                        }
                    });
                }
            });

            this._spawnDiamondSparkle(diamondIcon);
        }
    }

    static _spawnDiamondSparkle(diamondElement) {
        if (diamondElement.data("done")) {
            return;
        }

        // 19 is half the height of an unscaled diamond.
        const distance = 19 - 2 - (Math.random() * 2);
        const angle = Math.random() * 2.0 * Math.PI;

        // 20 is half the width of a sparkle.
        const sparkleX = -20 + 12 + (Math.cos(angle) * distance * 0.5);
        const sparkleY = -20 + 20 + (Math.sin(angle) * distance);

        const sparkle = $(`<img class='sparkle' ${Images.attributes("atlases/game/sparkle.png")}>`);
        sparkle.css({ left: sparkleX, top: sparkleY });
        utils.set(sparkle[0], { scale: 0, rotate: Math.floor(Math.random() * 180) });

        diamondElement.append(sparkle);

        animate(sparkle[0], {
            keyframes: [
                { scale: 1, rotate: "+=90" },
                { scale: 0, rotate: "+=90" }
            ],
            duration: 2 * UIConstants.SPARKLE_ANIMATION_TIME,
            ease: "linear",
            onComplete: () => {
                sparkle.remove();
            }
        });

        setTimeout(() => {
            this._spawnDiamondSparkle(diamondElement);
        }, UIConstants.DIAMOND_SPARKLE_MIN_INTERVAL_TIME + (Math.random() * (UIConstants.DIAMOND_SPARKLE_MAX_INTERVAL_TIME - UIConstants.DIAMOND_SPARKLE_MIN_INTERVAL_TIME)));
    }

    static _audioEventHandler(self, evt, data) {
        const game = GameSession.getGame();
        switch (evt) {
            case AudioManager.EVENTS.SOUND_ON:
            {
                if (game) {
                    game.sound.mute = false;
                    game.sound.volume = AudioManager.getSoundVolume();
                }

                break;
            }
            case AudioManager.EVENTS.SOUND_OFF:
            {
                if (game) {
                    game.sound.mute = true;
                }

                break;
            }
            case AudioManager.EVENTS.MUSIC_ON:
            case AudioManager.EVENTS.MUSIC_OFF:
            {
                break;
            }
        }
    }

    static _resizeEventHandler(self, evt, data) {
        switch (evt) {
            case ResizeManager.EVENTS.REFRESH:
            {
                const game = GameSession.getGame();
                if (game && game.scale) {
                    game.scale.refresh();
                }
                break;
            }
        }
    }
}
