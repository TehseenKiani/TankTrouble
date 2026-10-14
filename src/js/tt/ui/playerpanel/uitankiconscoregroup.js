import { GameModel } from "../../gamemodel.js";
import { TTClient } from "../../ttclient.js";
import { ClientManager } from "../../../clientmanager.js";
import { GameSession } from "../../../gamesession.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UIScoreExplosionEmitter } from "./uiscoreexplosionemitter.js";
import { UIScoreExplosionFragmentSprite } from "./uiscoreexplosionfragmentsprite.js";

export class UITankIconScoreGroup extends Phaser.Group {
    constructor(game) {
        // Call super.
        super(game, null);

        // Register for game events to get notified when game state changes and when game ends.
        GameSession.addGameEventListener(this._gameEventHandler, this);
        // Register for client state changes to get notified when losing the connection.
        ClientManager.getClient().addStateChangeListener(this._clientStateChangeHandler, this);

        // Add item group.
        this.itemGroup = this.game.add.group(this);

        // Add fragment group.
        this.fragmentGroup = this.game.add.group(this);

        // Add pool of fragments.
        for (let i = 0; i < UIConstants.SCORE_FRAGMENT_POOL_SIZE; ++i) {
            this.fragmentGroup.add(new UIScoreExplosionFragmentSprite(game));
        }

        // Add letter explosion smoke.
        this.emitter = this.addChild(new UIScoreExplosionEmitter(game));

        this.playerId = null;

        this.removeTween = null;

        // Disable group.
        this.scale.set(0.0, 0.0);
        this.exists = false;
        this.visible = false;

        // State.
        this.latestGameState = null;
        this.items = null; // Array of items {category, type, displayObject, spawnTween, removeTween}
        this.centreIndex = null; // Index of item that is the centre.

        // Create log.
        this.log = new Log("UITankIconScoreGroup");
    }

    _gameEventHandler(self, id, evt, data) {
        switch (evt) {
            case GameModel._EVENTS.GAME_STATE_CHANGED:
            {
                // Store latest game data for use when spawning.
                self.latestGameState = data;
                self._updateItemsWithLatestGameState();

                break;
            }
            case GameModel._EVENTS.GAME_ENDED:
            {
                self._clearItems();
                break;
            }
        }
    }

    _clientStateChangeHandler(self, oldState, newState, data, msg) {
        self.log.debug(`Client state: ${newState}: ${msg}`);
        switch (newState) {
            case TTClient.STATES.UNCONNECTED:
            {
                self._clearItems();
                break;
            }
        }
    }

    _updateItemsWithLatestGameState() {
        if (!this.game) {
            return;
        }

        if (this.latestGameState) {
            // Set up initial items.
            if (!this.items) {
                const info = UIConstants.GAME_MODE_SCORE_ITEM_INFO[this.latestGameState.getMode()];
                this.items = [];
                this.centreIndex = info.CENTRE_ITEM;
                for (let i = 0; i < info.ITEM_CONFIG.length; ++i) {
                    const config = info.ITEM_CONFIG[i];

                    let newDisplayObject = null;
                    switch (config.category) {
                        case UIConstants.SCORE_CATEGORIES.EMBLEM:
                        {
                            newDisplayObject = this.itemGroup.addChild(new Phaser.Image(this.game, 0, 0, "playerpanel", `emblem${config.type}`));
                            newDisplayObject.scale.setTo(0.0, 0.0);
                            break;
                        }
                        case UIConstants.SCORE_CATEGORIES.SCORE:
                        {
                            newDisplayObject = this.itemGroup.addChild(new Phaser.Text(this.game, 0, 0, "", { font: `${UIConstants.SCORE_FONT_SIZE}px Arial black`, fill: "#ffffff", stroke: "#000000", strokeThickness: UIConstants.SCORE_STROKE_WIDTH }));
                            break;
                        }
                        case UIConstants.SCORE_CATEGORIES.SEPARATOR:
                        {
                            newDisplayObject = this.itemGroup.addChild(new Phaser.Image(this.game, 0, 0, "playerpanel", "separator"));
                            break;
                        }
                    }

                    newDisplayObject.anchor.set(config.anchorX, 0.5);
                    newDisplayObject.y = UIConstants.SCORE_ITEM_INFO[config.category].offsetY;

                    this.items.push({ category: config.category, type: config.type, displayObject: newDisplayObject, spawnTween: null, removeTween: null });
                }

                // Compute initial x positions of all items.
                this._updateItemPositions(false);
            }

            for (let i = 0; i < this.items.length; ++i) {
                const item = this.items[i];
                switch (item.category) {
                    case UIConstants.SCORE_CATEGORIES.EMBLEM:
                    {
                        let emblemFound = false;
                        const emblemStates = this.latestGameState.getEmblemStates();
                        for (let j = 0; j < emblemStates.length; ++j) {
                            if (this.playerId === emblemStates[j].getPlayerId()) {
                                if (item.type === emblemStates[j].getType()) {
                                    emblemFound = true;
                                    break;
                                }
                            }
                        }
                        this._updateEmblem(item, emblemFound);
                        break;
                    }
                    case UIConstants.SCORE_CATEGORIES.SCORE:
                    {
                        const scoreStates = this.latestGameState.getScoreStates();
                        for (let j = 0; j < scoreStates.length; ++j) {
                            if (this.playerId === scoreStates[j].getPlayerId()) {
                                if (item.type === scoreStates[j].getType()) {
                                    this._updateScore(item, scoreStates[j].getValue());
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    case UIConstants.SCORE_CATEGORIES.SEPARATOR:
                    {
                        item.displayObject.revive();
                        break;
                    }
                }
            }

            this._updateItemPositions(true);
        }
    }

    _updateItemPositions(animate) {
        const centreItem = this.items[this.centreIndex];
        this._updateItemPosition(centreItem, 0, animate);
        const centreItemWidth = centreItem.displayObject.getLocalBounds().width;
        // Items left of centre.
        let offsetX = (-centreItemWidth * centreItem.displayObject.anchor.x) - UIConstants.SCORE_ITEM_INFO[centreItem.category].paddingX;
        for (let i = this.centreIndex - 1; i >= 0; --i) {
            const item = this.items[i];
            const itemWidth = item.displayObject.getLocalBounds().width;
            const itemPadding = UIConstants.SCORE_ITEM_INFO[item.category].paddingX;
            const itemX = offsetX - (itemWidth * (1.0 - item.displayObject.anchor.x)) - itemPadding;
            this._updateItemPosition(item, itemX, animate);
            offsetX -= itemWidth + (2 * itemPadding);
        }
        // Items right of centre.
        offsetX = (centreItemWidth * (1.0 - centreItem.displayObject.anchor.x)) + UIConstants.SCORE_ITEM_INFO[centreItem.category].paddingX;
        for (let i = this.centreIndex + 1; i < this.items.length; ++i) {
            const item = this.items[i];
            const itemWidth = item.displayObject.getLocalBounds().width;
            const itemPadding = UIConstants.SCORE_ITEM_INFO[item.category].paddingX;
            const itemX = offsetX + (itemWidth * item.displayObject.anchor.x) + itemPadding;
            this._updateItemPosition(item, itemX, animate);
            offsetX += itemWidth + (2 * itemPadding);
        }
    }

    _updateItemPosition(item, posX, animate) {
        if (animate) {
            this.game.add.tween(item.displayObject).to({ x: posX }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Quadratic.Out, true);
        } else {
            item.displayObject.x = posX;
        }
    }

    _updateScore(item, newValue) {
        const textField = item.displayObject;
        const oldValue = textField.text;
        if (String(newValue) !== oldValue && oldValue !== "") {
            const centreX = textField.x + ((0.5 - textField.anchor.x) * textField.width);
            // Explode the old score.
            this.emitter.spawn(centreX, UIConstants.SCORE_EXPLOSION_Y, textField.width);

            // Count number of letters in old score.
            const fragmentCount = Math.min(UIConstants.MAX_SCORE_FRAGMENTS_PER_EXPLOSION, (UIConstants.MIN_SCORE_FRAGMENTS_PER_LETTER * oldValue.length) + Math.floor(Math.random() * 3));

            for (let i = 0; i < fragmentCount; ++i) {
                const fragment = this.fragmentGroup.getFirstExists(false);
                if (fragment) {
                    fragment.spawn(centreX, UIConstants.SCORE_EXPLOSION_Y, textField.width);
                } else {
                    this.log.error("Could not create score fragment sprite. No sprite available.");
                }
            }
        }

        textField.setText(newValue);
    }

    _updateEmblem(item, show) {
        if (show) {
            if (item.removeTween) {
                item.removeTween.stop();
                item.removeTween = null;
            }
            item.spawnTween = this.game.add.tween(item.displayObject.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out);
            item.spawnTween.start();
        } else {
            if (item.spawnTween) {
                item.spawnTween.stop();
                item.spawnTween = null;
            }
            item.removeTween = this.game.add.tween(item.displayObject.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None);
            item.removeTween.start();
        }
    }

    _clearItems() {
        // Reset state.
        this.latestGameState = null;
        this.items = null;
        this.centreIndex = null;

        // Kill the items.
        this.itemGroup.setAll("pendingDestroy", true);
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

    spawn(x, y, playerId) {
        // Revive and place the group.
        this.exists = true;
        this.visible = true;
        this.x = x;
        this.y = y;

        // Store playerId.
        this.playerId = playerId;

        // Update items with latest information.
        this._updateItemsWithLatestGameState();

        const delay = 50 + (Math.random() * 200);

        if (this.removeTween) {
            this.removeTween.stop();
        }
        this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
    }

    refresh(x, y) {
        if (x !== undefined) {
            this.game.add.tween(this).to({ x }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
        if (y !== undefined) {
            this.game.add.tween(this).to({ y }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
    }

    remove() {
        this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        this.removeTween.onComplete.add(
            () => {
                // Clear items.
                this._clearItems();

                // Kill the group.
                this.exists = false;
                this.visible = false;
            },
            this
        );
    }

    retire() {
        // Clear items.
        this._clearItems();

        // Kill the group.
        this.exists = false;
        this.visible = false;

        // Remove event listeners.
        GameSession.removeGameEventListener(this._gameEventHandler, this);
        ClientManager.getClient().removeStateChangeListener(this._clientStateChangeHandler, this);
    }
}
