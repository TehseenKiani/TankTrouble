import { Scrapyard } from "./scrapyard.js";
import { Backend } from "../../../backend.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UIPlateImage } from "./uiplateimage.js";

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - input - a reference to the Phaser.Input input manager
 *
*/
class UIMainState {
    log = null;
    scraps = null;
    scrapsAtUpdate = null;
    velocity = null;
    plates = [];
    updateTime = 0;
    updateScraps = 0;
    initialised = false;

    create() {
        // Create log.
        this.log = new Log("UIMainState");

        // Create plates group
        this.platesGroup = this.game.add.group();

        // Get scraps and velocity
        this._getScraps(true);

        this.scale.onSizeChange.add(this._onSizeChangeHandler, this);
    }

    _onSizeChangeHandler() {
        this.log.debug("SIZE CHANGE!");

        const unscaledPlatesWidth = this.platesGroup.getLocalBounds().width;

        const plateScale = this.game.width / unscaledPlatesWidth;

        this.platesGroup.scale.setTo(plateScale);
    }

    update() {
        if (this.initialised) {
            // Estimate and display scraps - delay for realism!
            if (Math.random() > 0.8) {
                this.scraps = this.scrapsAtUpdate + ((this.game.time.now - this.updateTime) * this.velocity);
            }

            // Update digits
            // FIXME Make more robust to handle scraps with different number of digits
            const scraps = Math.floor(this.scraps).toString();
            for (let i = 0; i < scraps.length; i++) {
                // Check if plates matches desired scraps
                const digit = parseInt(scraps.charAt(i), 10);
                if (this.plates[i].digit !== digit) {
                    // Check if the plate is old enough to flip
                    if (this.game.time.now > this.plates[i].created + UIConstants.SCRAPYARD_FLIP_DELAY) {
                        // Spawn a new plate
                        const plate = this._getAvailablePlate();
                        const newDigit = (this.plates[i].digit + 1) % 10;
                        plate.spawn((UIConstants.SCRAPYARD_PLATE_WIDTH + UIConstants.SCRAPYARD_PLATE_SPACING) * i, UIConstants.SCRAPYARD_PLATE_HEIGHT / 2, newDigit, false, this.plates[i]);

                        // Flip old plate
                        this.plates[i].flip();

                        // Store references to new plate
                        this.plates[i] = plate;
                    }
                }
            }
        }
    }

    _getAvailablePlate() {
        // Get available plate from plates pool
        let plate = this.platesGroup.getFirstExists(false);

        // If there was no available plate we create a new one
        if (!plate) {
            plate = this.platesGroup.add(new UIPlateImage(this.game));
        }

        return plate;
    }

    _getScraps(includeVelocity) {
        Backend.getScraps(includeVelocity)
            .then(result => {
                // Initialise
                if (!this.initialised) {
                    this.scraps = result.scraps;
                    this._initialise();
                }

                // Set or calculate velocity
                if (result.velocity !== undefined) {
                    this.velocity = result.velocity / 1000;
                } else {
                    const deltaScraps = result.scraps - this.updateScraps;                            // Scraps since last update
                    const discrepancy = result.scraps - this.scraps;                                    // Difference between we are displaying and the actual scraps
                    const deltaTime = this.game.time.now - this.updateTime;                            // Ms since last update
                    this.velocity = Math.max(0, (deltaScraps + (discrepancy * 0.25)) / deltaTime);    // Scraps per ms
                }

                // Remember this update
                this.updateScraps = result.scraps;
                this.updateTime = this.game.time.now;
                this.scrapsAtUpdate = this.scraps;
            })
            .catch(message => {
                this.log.error(message);
            });
    }

    _initialise() {
        // Initialise plates
        const scraps = this.scraps.toString();
        for (let i = 0; i < scraps.length; i++) {
            const digit = parseInt(scraps.charAt(i), 10);

            // Add bottom plate
            const bottomPlate = this._getAvailablePlate();
            bottomPlate.spawn((UIConstants.SCRAPYARD_PLATE_WIDTH + UIConstants.SCRAPYARD_PLATE_SPACING) * i, UIConstants.SCRAPYARD_PLATE_HEIGHT / 2, digit, true);

            // Add top plate
            const topPlate = this._getAvailablePlate();
            topPlate.spawn((UIConstants.SCRAPYARD_PLATE_WIDTH + UIConstants.SCRAPYARD_PLATE_SPACING) * i, UIConstants.SCRAPYARD_PLATE_HEIGHT / 2, digit, false, bottomPlate);
            this.plates[i] = topPlate;
        }

        // Set up first update timer
        this.game.time.events.add(UIConstants.SCRAPYARD_FIRST_UPDATE, () => {
            this._getScraps(false);

            // Set up following updates timer
            this.game.time.events.loop(UIConstants.SCRAPYARD_FOLLOWING_UPDATES, () => {
                this._getScraps(false);
            }, this);
        }, this);

        this._onSizeChangeHandler();

        this.initialised = true;
    }
}

Scrapyard.UIMainState = UIMainState;
