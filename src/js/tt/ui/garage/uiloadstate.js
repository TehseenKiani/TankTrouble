import { Garage } from "./garage.js";
import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { Images } from "../../../images.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UITankIcon } from "../uitankicon.js";
import { UIWaitingIconGroup } from "../uiwaitingicongroup.js";
import { Users } from "../../../users.js";

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - input - a reference to the Phaser.Input input manager
 *
*/
class UILoadState {
    playerId = null;
    waitingIconGroup = null;
    accessoryToWelderPoints = {};
    itemAlreadyQueuedForLoad = {};
    playerIdToGarageContent = {};
    log = null;

    constructor(playerId) {
        if (playerId !== undefined) {
            this.playerId = playerId;
        }
    }

    preload() {}

    create() {
        // Create log.
        this.log = new Log("UILoadState");

        // Create waiting icon.
        this.waitingIconGroup = this.game.add.existing(new UIWaitingIconGroup(this.game));
        this.waitingIconGroup.spawn(this.game.width / 2.0, this.game.height / 3.0, true, "Loading accessories");

        this.load.onFileError.add(this._onFileError, this);

        // Clear map from player id to garage content.
        this.playerIdToGarageContent = {};

        this.load.onLoadComplete.addOnce(
            () => {
                // FIXME Move this computation into update and do one accessory per frame if it becomes too sluggish.
                const welderSpotsBitmapData = this.game.make.bitmapData(UIConstants.TANK_ICON_WIDTHS[UIConstants.TANK_ICON_SIZES.LARGE], UIConstants.TANK_ICON_HEIGHTS[UIConstants.TANK_ICON_SIZES.LARGE]);
                const welderSpotsCellCountX = Math.floor(welderSpotsBitmapData.width / UIConstants.WELDER_SAMPLE_CELL_SIZE);
                const welderSpotsCellCountY = Math.floor(welderSpotsBitmapData.height / UIConstants.WELDER_SAMPLE_CELL_SIZE);

                for (const playerId in this.playerIdToGarageContent) {
                    const content = this.playerIdToGarageContent[playerId];

                    for (let i = 0; i < content.boxes.length; ++i) {
                        const box = content.boxes[i];
                        for (let j = 0; j < box.accessories.length; ++j) {
                            const accessory = box.accessories[j];
                            if (!this.accessoryToWelderPoints[accessory.type + accessory.value]) {
                                this.accessoryToWelderPoints[accessory.type + accessory.value] = [];

                                const image = this.game.cache.getImage(`${accessory.type + accessory.value}preprocess`);
                                welderSpotsBitmapData.clear();
                                welderSpotsBitmapData.draw(image, 0, 0);
                                welderSpotsBitmapData.update();

                                for (let x = 0; x < welderSpotsCellCountX; ++x) {
                                    for (let y = 0; y < welderSpotsCellCountY; ++y) {
                                        const sampleX = Math.floor(((x + 0.5) * UIConstants.WELDER_SAMPLE_CELL_SIZE) + (((Math.random() * 2.0) - 1.0) * UIConstants.WELDER_SAMPLE_JITTER_SIZE));
                                        const sampleY = Math.floor(((y + 0.5) * UIConstants.WELDER_SAMPLE_CELL_SIZE) + (((Math.random() * 2.0) - 1.0) * UIConstants.WELDER_SAMPLE_JITTER_SIZE));

                                        const sample = welderSpotsBitmapData.getPixel32(sampleX, sampleY);

                                        if (((sample >> 24) & 0xff) > 0) {
                                            const point = { x: (sampleX / welderSpotsBitmapData.width) - 0.5,
                                                y: (sampleY / welderSpotsBitmapData.height) - 0.5 };
                                            this.accessoryToWelderPoints[accessory.type + accessory.value].push(point);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                welderSpotsBitmapData.destroy();
                this.state.start("Main", true, false, this.playerIdToGarageContent, this.accessoryToWelderPoints);
            },
            this
        );

        let playerIds = [];
        // If a player id was specified, only load that player.
        // Otherwise, for each user, queue up loading of the garage content.
        if (this.playerId !== null) {
            playerIds.push(this.playerId);
        } else {
            playerIds = Users.getAllPlayerIds();
        }

        const garageContentPromises = [];
        for (let i = 0; i < playerIds.length; ++i) {
            garageContentPromises.push(Backend.getGarageContent(playerIds[i], Caches.getGarageContentCache())
                .then(result => {
                    // Store resulting content in map.
                    this.playerIdToGarageContent[result.playerId] = result;

                    for (let j = 0; j < result.boxes.length; ++j) {
                        const box = result.boxes[j];

                        // Queue up box icon assets.
                        if (!this.itemAlreadyQueuedForLoad[`box${box.id}`]) {
                            this.itemAlreadyQueuedForLoad[`box${box.id}`] = true;
                            this.load.spritesheet(`box${box.id}`, Images.url(`boxes/box${box.id}.png`), 280, 280);
                        }

                        for (let k = 0; k < box.accessories.length; ++k) {
                            const accessory = box.accessories[k];
                            // Queue up accessory icon assets.
                            if (!this.itemAlreadyQueuedForLoad[accessory.type + accessory.value]) {
                                this.itemAlreadyQueuedForLoad[accessory.type + accessory.value] = true;
                                this.load.image(accessory.type + accessory.value, Images.url(`accessories/${accessory.type}${accessory.value}Icon.png`));
                                // Queue up accessory assets for preprocessing in onLoadComplete.
                                this.load.image(`${accessory.type + accessory.value}preprocess`, UITankIcon.getImageUrl(`accessories/${accessory.type}${accessory.value}`, UIConstants.TANK_ICON_SIZES.LARGE));
                            }
                        }

                        for (let k = 0; k < box.sprayCans.length; ++k) {
                            const sprayCan = box.sprayCans[k];
                            if (sprayCan.colour.type === "image") {
                                // Queue up image colours.
                                const colourValue = sprayCan.colour.imageValue;
                                if (!this.itemAlreadyQueuedForLoad[`colour${colourValue}`]) {
                                    this.itemAlreadyQueuedForLoad[`colour${colourValue}`] = true;
                                    this.load.image(`colour${colourValue}`, Images.url(`colours/colour${colourValue}Icon.png`));
                                }
                            }
                        }
                    }
                })
                .catch(message => {
                    // FIXME Handle error and stop going further to main state.
                })
            );
        }

        // When we have all responses, start the asset loader.
        Promise.all(garageContentPromises).then(() => {
            this.load.start();
        });

        Users.addEventListener(this._authenticationEventHandler, this);

        this.scale.onSizeChange.add(this._onSizeChangeHandler, this);
    }

    shutdown() {
        this._retireUI();

        Users.removeEventListener(this._authenticationEventHandler, this);

        this.scale.onSizeChange.remove(this._onSizeChangeHandler, this);

        this.load.onFileError.remove(this._onFileError, this);
    }

    _onSizeChangeHandler() {
        this.log.debug("SIZE CHANGE!");

        this.waitingIconGroup.position.set(this.game.width / 2.0, this.game.height / 3.0);
    }

    _onFileError(key, file) {
        this.log.debug(`File error ${key}: ${file}`);
    }

    _authenticationEventHandler(self, evt, data) {
        self.log.debug(`Authentication event: ${evt}: ${data}`);
        switch (evt) {
            case Users.EVENTS.GUEST_ADDED:
            case Users.EVENTS.GUESTS_ADDED:
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            {
                self.load.reset(false, true);
                self.state.restart();

                break;
            }
            case Users.EVENTS.GUEST_REMOVED:
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            {
                // Check if no players are left.
                if (Users.getAllPlayerIds().length === 0) {
                    self.state.start("NoUsers");
                }
                break;
            }
        }
    }

    update() {}

    _retireUI() {}

    _cleanUp() {}
}

Garage.UILoadState = UILoadState;
