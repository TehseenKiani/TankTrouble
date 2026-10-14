import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UITankIconImage } from "../uitankiconimage.js";
import { UITankIconNameGroup } from "../uitankiconnamegroup.js";

export class UIGameIconImage extends Phaser.Image {
    constructor(game) {
        // Call super.
        super(game, 0, 0, "gameicon", 0);

        this.anchor.setTo(0.5, 0.5);

        //FIXME Add title text?
        //this.gameTitle = this.addChild(new Phaser.BitmapText(this.game, 0, 0, 'tankcountfont', '', 32));

        // Add game mode icon.
        this.gameModeIcon = this.addChild(new Phaser.Sprite(this.game, 0, 0, "gamemodeicon", 0));
        this.gameModeIcon.anchor.setTo(0.5, 0.5);

        // Create tank icon group to hold all tank icons.
        this.tankIconGroup = this.game.add.group(this);
        this.tankIcons = {};

        // Add pool of tank icons
        for (let i = 0; i < UIConstants.GAME_ICON_TANK_COUNT; ++i) {
            this.tankIconGroup.add(new UITankIconImage(this.game, true, UIConstants.TANK_ICON_SIZES.SMALL));
        }

        // Create tank name group to hold all tank names.
        this.tankNameGroup = this.game.add.group(this);

        // Add pool of tank names.
        for (let i = 0; i < UIConstants.GAME_ICON_TANK_COUNT; ++i) {
            this.tankNameGroup.add(new UITankIconNameGroup(this.game, UIConstants.TANK_ICON_WIDTHS[UIConstants.TANK_ICON_SIZES.SMALL], true));
        }

        // Allocate placement array.
        this.tankIconPlacementsTaken = [];
        for (let i = 0; i < UIConstants.GAME_ICON_TANK_COUNT; ++i) {
            this.tankIconPlacementsTaken.push(false);
        }

        this.removeTween = null;

        // Disable icon.
        this.scale.set(0.0, 0.0);
        this.kill();

        // Create log.
        this.log = new Log("UIGameIconImage");
    }

    update() {
        if (!this.exists) {
            return;
        }

        for (const tankIconSpriteId in this.tankIcons) {
            this.tankIcons[tankIconSpriteId].icon.update();
            this.tankIcons[tankIconSpriteId].name.update();
        }
    }

    getTankIcons() {
        return this.tankIcons;
    }

    spawn(x, y, gameState, favouriteActiveQueuedCounts) {
        // Revive and place the sprite.
        this.reset(x, y);
        // Store gameId, mode, ranked, symmetric, premium and player states.
        this.gameId = gameState.getId();
        this.mode = gameState.getMode();
        this.ranked = gameState.getRanked();
        this.symmetric = gameState.getSymmetric();
        this.premium = gameState.getPremium();
        this.playerStates = gameState.getPlayerStates();
        this.favouriteActiveQueuedCounts = favouriteActiveQueuedCounts;

        this._updateUI();

        const delay = 50 + (Math.random() * 200);

        if (this.removeTween) {
            this.removeTween.stop();
        }

        this.game.add.tween(this.scale).to({ x: UIConstants.ASSET_SCALE, y: UIConstants.ASSET_SCALE }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
    }

    refresh(gameState, favouriteActiveQueuedCounts) {
        // Refresh mode, ranked, symmetric, premium and playerStates.
        this.mode = gameState.getMode();
        this.ranked = gameState.getRanked();
        this.symmetric = gameState.getSymmetric();
        this.premium = gameState.getPremium();
        this.playerStates = gameState.getPlayerStates();
        this.favouriteActiveQueuedCounts = favouriteActiveQueuedCounts;

        this._updateUI();
    }

    _updateUI() {
        // Update icon.
        this.frame = ((this.symmetric ? 1 : 0) * 2) + (this.premium ? 1 : 0);

        // Update mode icon.
        const iconFrame = UIConstants.GAME_MODE_NAME_INFO[this.mode].ICON;
        if (iconFrame < 0) {
            this.gameModeIcon.visible = false;
        } else {
            this.gameModeIcon.frame = (iconFrame * 2) + (this.premium ? 1 : 0);
            this.gameModeIcon.visible = true;
        }

        // Remove icons that should no longer show.
        for (const tankIconSpriteId in this.tankIcons) {
            let tankIconStillNeeded = false;
            for (let i = 0; i < this.playerStates.length; ++i) {
                if (tankIconSpriteId === this.playerStates[i].getPlayerId()) {
                    tankIconStillNeeded = true;
                    break;
                }
            }

            if (!tankIconStillNeeded) {
                this.tankIcons[tankIconSpriteId].icon.remove();
                this.tankIcons[tankIconSpriteId].name.remove();
                this.tankIconPlacementsTaken[this.tankIcons[tankIconSpriteId].placement] = false;
                delete this.tankIcons[tankIconSpriteId];
            }
        }

        // Update existing icons and show new ones.
        for (let i = 0; i < this.playerStates.length; ++i) {
            if (this.playerStates[i].getPlayerId() in this.tankIcons) {
                //Update tank icon sprite.
                this.tankIcons[this.playerStates[i].getPlayerId()].icon.refresh();
                this.tankIcons[this.playerStates[i].getPlayerId()].name.refresh(undefined, undefined, undefined, this.ranked);
            } else {
                const tankIconSprite = this.tankIconGroup.getFirstExists(false);
                const tankNameSprite = this.tankNameGroup.getFirstExists(false);
                if (tankIconSprite && tankNameSprite) {
                    // Compute the first available position.
                    let availablePosition = 0;
                    for (let j = 0; j < UIConstants.GAME_ICON_TANK_COUNT; ++j) {
                        if (!this.tankIconPlacementsTaken[j]) {
                            availablePosition = j;
                            break;
                        }
                    }
                    this.tankIconPlacementsTaken[availablePosition] = true;
                    this.tankIcons[this.playerStates[i].getPlayerId()] = { icon: tankIconSprite, name: tankNameSprite, placement: availablePosition };
                    tankIconSprite.spawn(UIConstants.TANK_ICON_PLACEMENTS[availablePosition].x, UIConstants.TANK_ICON_PLACEMENTS[availablePosition].y,
                        this.playerStates[i].getPlayerId(), UIConstants.TANK_ICON_PLACEMENTS[availablePosition].flipped, true);
                    tankNameSprite.spawn(UIConstants.TANK_NAME_PLACEMENTS[availablePosition].x, UIConstants.TANK_NAME_PLACEMENTS[availablePosition].y,
                        this.playerStates[i].getPlayerId(), undefined, this.ranked);
                } else {
                    this.log.error("Could not create tank icon sprite or tank name sprite. No sprite available.");
                }
            }
        }
    }

    remove() {
        this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        this.removeTween.onComplete.add(
            () => {
                // Kill the sprite.
                this.kill();
            },
            this
        );

        // Call remove on children.
        this.tankIconGroup.callAll("remove");
        this.tankNameGroup.callAll("remove");

        this.tankIcons = {};
        for (let i = 0; i < UIConstants.GAME_ICON_TANK_COUNT; ++i) {
            this.tankIconPlacementsTaken[i] = false;
        }
    }

    retire() {
        // Kill the sprite.
        this.kill();

        // Retire the children.
        this.tankIconGroup.callAll("retire");
        this.tankNameGroup.callAll("retire");
    }
}
