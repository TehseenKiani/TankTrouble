import { Backend } from "../../backend.js";
import { Caches } from "../../caches.js";
import { GameManager } from "../../gamemanager.js";
import { Log } from "../log.js";
import { UIConstants } from "./uiconstants.js";
import { UIPlayerPanel } from "./playerpanel/uiplayerpanel.js";
import { UIRankIconGroup } from "./uirankicongroup.js";
import { UIUtils } from "./uiutils.js";
import { Users } from "../../users.js";
import { Utils } from "../../utils.js";

export class UITankIconNameGroup extends Phaser.Group {
    constructor(game, maxNameWidth, iconsBelow) {
        // Call super.
        super(game, null);

        this.maxNameWidth = maxNameWidth;
        this.iconsBelow = iconsBelow || false;

        this.favouriteStar = this.addChild(new Phaser.Image(game, 0, 0, "favourite"));
        this.favouriteStar.anchor.set(0.5, 0.5);
        this.favouriteStar.scale.setTo(0.0, 0.0);
        this.favouriteStar.kill();

        this.tankName = this.addChild(new Phaser.Text(game, 0, 0, "", { font: `${UIConstants.USERNAME_FONT_SIZE}px TankTrouble`, fill: "#fff", strokeThickness: UIConstants.USERNAME_STROKE_WIDTH }));
        this.tankName.anchor.setTo(0.5, 0.5);
        this.tankName.kill();

        this.rankIconGroup = this.addChild(new UIRankIconGroup(game));
        this.rankIconGroup.scale.setTo(0.0, 0.0);
        this.rankIconGroup.remove();

        this.playerId = null;
        this.favourite = false;
        this.showRank = false;
        this.fitScale = 1.0;

        this.spawnTween = null;
        this.removeTween = null;
        this.updateHideTween = null;
        this.updateShowTween = null;

        // Disable group.
        this.scale.set(0.0, 0.0);
        this.exists = false;
        this.visible = false;

        // Create log.
        this.log = new Log("UITankIconNameGroup");
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.update();
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    spawn(x, y, playerId, targetScale, showRank) {
        // Revive and place the group.
        this.exists = true;
        this.visible = true;
        this.x = x;
        this.y = y;

        // Store playerId and set showRank.
        this.playerId = playerId;
        this.showRank = false;

        this.fitScale = 1.0;
        this.targetScale = targetScale || 1.0;

        this.rankIconGroup.scale.setTo(0.0, 0.0);
        this.rankIconGroup.remove();

        this.favouriteStar.scale.setTo(0.0, 0.0);
        this.favouriteStar.kill();

        this.tankName.setText("");

        if (this.removeTween) {
            this.removeTween.stop();
            this.removeTween = null;
        }
        if (this.spawnTween) {
            this.spawnTween.stop();
            this.spawnTween = null;
        }

        // Send request for player details.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                // The group may have been destroyed while the request was in flight.
                if (!this.game) {
                    return;
                }

                if (typeof result === "object") {
                    const username = Utils.maskUnapprovedUsername(result);
                    this._updateUsernameAndRankLevel(username, result.getRank());
                    this._updateRanked(showRank);
                }

                // Check if I'm a favourite.
                this._updateFavouriteStatus();
            });
    }

    refresh(x, y, targetScale, showRank) {
        if (x !== undefined) {
            this.game.add.tween(this).to({ x }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
        if (y !== undefined) {
            this.game.add.tween(this).to({ y }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
        if (showRank !== undefined) {
            this._updateRanked(showRank);
        }
        if (targetScale !== undefined) {
            this.targetScale = targetScale;
            this.game.add.tween(this.scale).to({ x: this.fitScale * this.targetScale, y: this.fitScale * this.targetScale }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);

            if (this.favourite) {
                this.game.add.tween(this.favouriteStar.scale).to({ x: 1.0 / this.fitScale / this.targetScale, y: 1.0 / this.fitScale / this.targetScale }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
            }
            if (this.showRank) {
                this.game.add.tween(this.rankIconGroup.scale).to({ x: 1.0 / this.fitScale / this.targetScale, y: 1.0 / this.fitScale / this.targetScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true);
            }
        }

        // Check if I'm a favourite.
        this._updateFavouriteStatus();
    }

    updateName() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        // Only update if we are not in the process of removing name.
        if (!this.removeTween) {
            if (this.updateHideTween) {
                this.updateHideTween.stop();
            }
            if (this.updateShowTween) {
                this.updateShowTween.stop();
            }
            this.updateHideTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None);

            this.updateHideTween.onComplete.add(
                () => {
                    // Send request for player details.
                    Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
                        .then(result => {
                            if (typeof result === "object") {
                                const username = Utils.maskUnapprovedUsername(result);
                                this._updateUsernameAndRankLevel(username, result.getRank());
                            }

                            // Check if I'm a favourite.
                            this._updateFavouriteStatus();

                            this.updateShowTween = this.game.add.tween(this.scale).to({ x: this.fitScale * this.targetScale, y: this.fitScale * this.targetScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out);
                            this.updateShowTween.start();
                        });
                },
                this
            );

            this.updateHideTween.start();
        }
    }

    // The reason rank (before change) is passed along to updateRank is that we cannot ask the backend for it since we don't know if it has been stored or not, yet.
    // The rank before change value passed in is not reliable if a user plays on multiple servers at once.
    updateRank(rank, rankChange) {
        this._updateUsernameAndRankLevel(this.tankName.text, rank, rankChange);
        this._updateRanked(this.showRank);
    }

    _updateUsernameAndRankLevel(username, rank, rankChange) {
        this.tankName.revive();
        this.tankName.setText(username);

        this.fitScale = Math.min(1.0, this.maxNameWidth / (this.tankName.width + UIConstants.FAVOURITE_ICON_WIDTH + UIConstants.RANK_ICON_WIDTH));

        if (!this.spawnTween) {
            const delay = 50 + (Math.random() * 200);

            this.spawnTween = this.game.add.tween(this.scale).to({ x: this.fitScale * this.targetScale, y: this.fitScale * this.targetScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
        }

        let centerX = 0;
        if (this.favourite) {
            centerX += UIConstants.FAVOURITE_ICON_WIDTH / 2.0 / this.fitScale / this.targetScale;
        }
        if (!this.iconsBelow && this.showRank) {
            centerX -= UIConstants.RANK_ICON_WIDTH / 2.0 / this.fitScale / this.targetScale;
        }

        if (rankChange) {
            rank += rankChange;

            // Show rank change.
            GameManager.showRankChange(rankChange, UIPlayerPanel.getTankIconPosition(this.playerId));
        }

        const newRankLevel = UIUtils.getRankLevelFromRank(rank);
        this.rankIconGroup.updateRankLevel(newRankLevel);

        if (!this.iconsBelow) {
            this.tankName.x = centerX;
            this.favouriteStar.x = centerX - (this.tankName.width / 2.0) - (UIConstants.FAVOURITE_ICON_WIDTH / this.fitScale / this.targetScale / 2.0);
            this.rankIconGroup.x = centerX + (this.tankName.width / 2.0) + (UIConstants.RANK_ICON_WIDTH / this.fitScale / this.targetScale / 2.0);
        } else {
            this.tankName.x = 0;
            this.favouriteStar.x = centerX - ((UIConstants.RANK_ICON_WIDTH + UIConstants.FAVOURITE_ICON_WIDTH) / this.fitScale / this.targetScale / 2.0);
            this.rankIconGroup.x = centerX;

            this.favouriteStar.y = (this.tankName.height / 3.0) + (UIConstants.FAVOURITE_ICON_HEIGHT / this.fitScale / this.targetScale / 2.0);
            this.rankIconGroup.y = (this.tankName.height / 3.0) + (UIConstants.RANK_ICON_HEIGHT / this.fitScale / this.targetScale / 2.0);
        }
    }

    _updateRanked(newShowRank) {
        if (newShowRank && !this.showRank) {
            this.rankIconGroup.spawn();
            this.game.add.tween(this.rankIconGroup.scale).to({ x: 1.0 / this.fitScale / this.targetScale, y: 1.0 / this.fitScale / this.targetScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true);
        } else if (!newShowRank && this.showRank) {
            this.game.add.tween(this.rankIconGroup.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        }

        this.showRank = newShowRank;

        let centerX = 0;
        if (this.favourite) {
            centerX += UIConstants.FAVOURITE_ICON_WIDTH / 2.0 / this.fitScale / this.targetScale;
        }
        if (!this.iconsBelow && this.showRank) {
            centerX -= UIConstants.RANK_ICON_WIDTH / 2.0 / this.fitScale / this.targetScale;
        }

        if (!this.iconsBelow) {
            this.game.add.tween(this.tankName).to({ x: centerX }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
            this.game.add.tween(this.favouriteStar).to({ x: centerX - (this.tankName.width / 2.0) - (UIConstants.FAVOURITE_ICON_WIDTH / this.fitScale / this.targetScale / 2.0) }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
            this.game.add.tween(this.rankIconGroup).to({ x: centerX + (this.tankName.width / 2.0) + (UIConstants.RANK_ICON_WIDTH / this.fitScale / this.targetScale / 2.0) }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
        } else {
            this.game.add.tween(this.tankName).to({ x: 0 }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
            this.game.add.tween(this.favouriteStar).to({ x: centerX - (((this.showRank ? UIConstants.RANK_ICON_WIDTH : 0) + UIConstants.FAVOURITE_ICON_WIDTH) / this.fitScale / this.targetScale / 2.0) }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
            this.game.add.tween(this.rankIconGroup).to({ x: centerX }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
        }
    }

    _updateFavouriteStatus() {
        if (!this.playerId) {
            return;
        }

        this.favourite = false;

        // Check for all authenticated users if this tank is a favourite.
        const playerIds = Users.getAuthenticatedPlayerIds();
        const favouritePlayerIds = [];

        const favouritesPromises = playerIds.map(playerId => {
            return Backend.getFavourites(playerId, Caches.getFavouritesCache())
                .then(result => {
                    if (Array.isArray(result)) {
                        favouritePlayerIds.push(...result);
                    }
                })
                .catch(() => {});
        });

        // When we have all responses, check if the tank is a favourite.
        Promise.all(favouritesPromises).then(() => {
            // The group may have been destroyed while the requests were in flight.
            if (!this.game) {
                return;
            }

            for (let j = 0; j < favouritePlayerIds.length; ++j) {
                if (favouritePlayerIds[j] === this.playerId) {
                    this.favourite = true;
                    break;
                }
            }

            let centerX = 0;
            if (this.favourite) {
                centerX += UIConstants.FAVOURITE_ICON_WIDTH / 2.0 / this.fitScale / this.targetScale;
            }
            if (!this.iconsBelow && this.showRank) {
                centerX -= UIConstants.RANK_ICON_WIDTH / 2.0 / this.fitScale / this.targetScale;
            }

            if (this.favourite) {
                // Resurrect the sprite.
                this.favouriteStar.revive();
                this.game.add.tween(this.favouriteStar.scale).to({ x: 1.0 / this.fitScale / this.targetScale, y: 1.0 / this.fitScale / this.targetScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true);
            } else {
                this.game.add.tween(this.favouriteStar.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true).onComplete.add(
                    () => {
                        // Kill the sprite.
                        this.favouriteStar.kill();
                    },
                    this.favouriteStar
                );
            }

            if (!this.iconsBelow) {
                this.game.add.tween(this.tankName).to({ x: centerX }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
                this.game.add.tween(this.favouriteStar).to({ x: centerX - (this.tankName.width / 2.0) - (UIConstants.FAVOURITE_ICON_WIDTH / this.fitScale / this.targetScale / 2.0) }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
                this.game.add.tween(this.rankIconGroup).to({ x: centerX + (this.tankName.width / 2.0) + (UIConstants.RANK_ICON_WIDTH / this.fitScale / this.targetScale / 2.0) }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
            } else {
                this.game.add.tween(this.tankName).to({ x: 0 }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
                this.game.add.tween(this.favouriteStar).to({ x: centerX - (((this.showRank ? UIConstants.RANK_ICON_WIDTH : 0) + UIConstants.FAVOURITE_ICON_WIDTH) / this.fitScale / this.targetScale / 2.0) }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
                this.game.add.tween(this.rankIconGroup).to({ x: centerX }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.Out, true);
            }
        });
    }

    remove() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        if (this.updateHideTween) {
            this.updateHideTween.stop();
        }

        if (this.updateShowTween) {
            this.updateShowTween.stop();
        }

        this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        this.removeTween.onComplete.add(
            () => {
                // Kill the group.
                this.exists = false;
                this.visible = false;
                // Kill the children.
                this.favouriteStar.kill();
                this.rankIconGroup.remove();
                this.tankName.kill();
            },
            this
        );
    }

    retire() {
        // Kill the group.
        this.exists = false;
        this.visible = false;
        this.favouriteStar.kill();
        this.rankIconGroup.retire();
        this.tankName.kill();
    }
}
