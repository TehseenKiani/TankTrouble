import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UITankIcon } from "../uitankicon.js";
import { Users } from "../../../users.js";

export class UIGarageTankIconImage extends Phaser.Image {
    constructor(game, playerId, hitFunction, context) {
        // Call super.
        super(game,
            0,
            0,
            game.add.bitmapData(
                UIConstants.TANK_ICON_WIDTHS[UIConstants.TANK_ICON_SIZES.LARGE],
                UIConstants.TANK_ICON_HEIGHTS[UIConstants.TANK_ICON_SIZES.LARGE]
            ));

        this.playerId = playerId;

        this.size = UIConstants.TANK_ICON_SIZES.LARGE;

        this.anchor.setTo(0.5, 0.5);

        this.tankIconPlaceholder = this.addChild(new Phaser.Image(game, 0, 0, `tankiconplaceholder-${this.size}`));
        this.tankIconPlaceholder.anchor.setTo(0.5, 0.5);

        this.showingDetails = false;

        this.turretColour = null;
        this.treadColour = null;
        this.baseColour = null;
        this.accessories = {};

        this.spawnTween = null;
        this.removeTween = null;

        this.inputEnabled = true;
        this.events.onInputUp.add(hitFunction, context);

        // Disable icon.
        this.kill();
        this.scale.set(0.0, 0.0);

        // Send request for player details.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.turretColour = result.getTurretColour();
                    this.treadColour = result.getTreadColour();
                    this.baseColour = result.getBaseColour();
                    this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.TURRET] = result.getTurretAccessory();
                    this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BARREL] = result.getBarrelAccessory();
                    this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.FRONT] = result.getFrontAccessory();
                    this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BACK] = result.getBackAccessory();
                } else {
                    this.turretColour = UIConstants.TANK_UNAVAILABLE_COLOUR;
                    this.treadColour = UIConstants.TANK_UNAVAILABLE_COLOUR;
                    this.baseColour = UIConstants.TANK_UNAVAILABLE_COLOUR;
                    this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.TURRET] = null;
                    this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BARREL] = null;
                    this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.FRONT] = null;
                    this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BACK] = null;
                }

                this._updateIcon();

                this.showingDetails = true;
            });

        // Create log.
        this.log = new Log("UIGarageTankIconImage");
    }

    update() {
    }

    paintTurret(self, newColour) {
        if (newColour.rawValue !== self.turretColour.rawValue) {
            self.turretColour = newColour;

            self._storeColour("turret", newColour);

            self._updateIcon();
        }
    }

    paintTread(self, newColour) {
        if (newColour.rawValue !== self.treadColour.rawValue) {
            self.treadColour = newColour;

            self._storeColour("tread", newColour);

            self._updateIcon();
        }
    }

    paintBase(self, newColour) {
        if (newColour.rawValue !== self.baseColour.rawValue) {
            self.baseColour = newColour;

            self._storeColour("base", newColour);

            self._updateIcon();
        }
    }

    applyAccessory(newAccessoryType, newAccessoryNumber) {
        if (String(newAccessoryNumber) !== String(this.accessories[newAccessoryType])) {
            this.accessories[newAccessoryType] = newAccessoryNumber;

            this._storeAccessory(newAccessoryType, newAccessoryNumber);
        } else {
            delete this.accessories[newAccessoryType];

            this._storeAccessory(newAccessoryType, 0);
        }

        this._updateIcon();
    }

    getAccessory(accessoryType) {
        return this.accessories[accessoryType];
    }

    _storeColour(place, colour) {
        Backend.setColour(this.playerId, place, colour.rawValue, Caches.getPlayerDetailsCache())
            .then(result => {
                Users.updateUser(this.playerId, true, false);
            });
    }

    _storeAccessory(type, number) {
        Backend.setAccessory(this.playerId, type, number, Caches.getPlayerDetailsCache())
            .then(result => {
                Users.updateUser(this.playerId, true, false);
            });
    }

    _updateIcon() {
        UITankIcon.loadTankIcon(this.key.canvas, this.size, this.turretColour, this.treadColour, this.baseColour,
            this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.TURRET],
            this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BARREL],
            this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.FRONT],
            this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BACK], null, null, null).then(() => {
            // Clear placeholder and show icon.
            this.tankIconPlaceholder.kill();
            this.key.dirty = true;
        });
    }

    spawn(x, y) {
        // Revive and place the sprite.
        this.reset(x, y);

        if (this.removeTween) {
            this.removeTween.stop();
        }
        this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true);
    }

    getPlayerId() {
        return this.playerId;
    }

    disable() {
        this.inputEnabled = false;
    }

    enable() {
        this.inputEnabled = true;
        this.input.useHandCursor = true;
    }

    remove() {
        this.showingDetails = false;

        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        this.removeTween.onComplete.add(
            () => {
                // Kill the sprite.
                this.kill();
            },
            this
        );
    }

    retire() {
        // Kill the sprite.
        this.kill();
    }
}
