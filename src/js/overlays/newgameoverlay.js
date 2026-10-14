import { Constants } from "../tt/constants.js";
import { TankTrouble } from "../tanktrouble.js";
import { ButtonGroup } from "../buttongroup.js";
import { Content } from "../content.js";
import { GameManager } from "../gamemanager.js";
import { OverlayManager } from "../overlaymanager.js";
import { PremiumManager } from "../premiummanager.js";
import { Users } from "../users.js";

TankTrouble.NewGameOverlay = {
    // jQuery objects.
    wrapper: null,
    modeSetting: null,
    maxNumberOfPlayersSetting: null,
    symmetricSetting: null,
    laserSetting: null,
    doubleBarrelSetting: null,
    shotgunSetting: null,
    homingMissileSetting: null,
    mineSetting: null,
    gatlingGunSetting: null,
    shieldSetting: null,
    crateSettings: null,
    getPremiumButton: null,
    getPremiumMessage: null,
    premiumSettings: null,
    startButton: null,

    // State.
    selectedMode: 0,
    selectedMaxNumberOfPlayers: 0,
    crateOverridesMap: {},

    _initialise() {
        if (this.initialised) {
            return;
        }

        this.wrapper = $("<div class='newGame centre'/>");
        this.modeSetting = new ButtonGroup(["Last Tank Standing", "Deathmatch"], this.setMode, this);
        this.modeSetting.element.addClass("setting");
        this.maxNumberOfPlayersSetting = new ButtonGroup(["2", "3", "4", "5", "6", "7", "8"], this.setNumberOfPlayers, this);
        this.maxNumberOfPlayersSetting.element.addClass("setting");
        this.gameSettings = $("<div class='setting grid'/>");
        this.symmetricSetting = $("<input id='symmetric' name='symmetric' type='checkbox' value='symmetric'/>");
        this.stormSetting = $("<input id='storm' name='storm' type='checkbox' value='storm'/>");
        this.laserSetting = $("<input id='laser' name='laser' type='checkbox' value='laser'/>");
        this.doubleBarrelSetting = $("<input id='doubleBarrel' name='doubleBarrel' type='checkbox' value='doubleBarrel'/>");
        this.shotgunSetting = $("<input id='shotgun' name='shotgun' type='checkbox' value='shotgun'/>");
        this.homingMissileSetting = $("<input id='homingMissile' name='homingMissile' type='checkbox' value='homingMissile'/>");
        this.mineSetting = $("<input id='mine' name='mine' type='checkbox' value='mine'/>");
        this.gatlingGunSetting = $("<input id='gatlingGun' name='gatlingGun' type='checkbox' value='gatlingGun'/>");
        this.shieldSetting = $("<input id='shield' name='shield' type='checkbox' value='shield'/>");
        this.crateSettings = $("<div class='setting grid'/>");
        
        this.getPremiumButton = $("<button class='medium' type='button' tabindex='-1'>Get premium membership</button>");
        this.getPremiumMessage = $("<div class='premiumMessage'>These settings require a premium membership</div>");
        this.premiumSettings = $("<div/>");
        this.startButton = $("<button class='large' type='button' tabindex='-1'>Start game</button>");

        this.wrapper.append(
            $("<div class='premium'>").append(
                this.premiumSettings.append(
                    "<div class='subheadline'>Game mode</div>",
                    this.modeSetting.element
                ),
                this.premiumSettings.append(
                    "<div class='subheadline'>Maximum number of tanks</div>",
                    this.maxNumberOfPlayersSetting.element
                ),
                this.premiumSettings.append(
                    this.crateSettings.append(
                        $("<div class='setting'/>").append(
                            this.laserSetting,
                            "<label for='laser' class='subheadline'>Laser</label>"
                        ),
                        $("<div class='setting'/>").append(
                            this.doubleBarrelSetting,
                            "<label for='doubleBarrel' class='subheadline'>Double barrel</label>"
                        ),
                        $("<div class='setting'/>").append(
                            this.shotgunSetting,
                            "<label for='shotgun' class='subheadline'>Shotgun</label>"
                        ),
                        $("<div class='setting'/>").append(
                            this.homingMissileSetting,
                            "<label for='homingMissile' class='subheadline'>Homing missile</label>"
                        ),
                        $("<div class='setting'/>").append(
                            this.mineSetting,
                            "<label for='mine' class='subheadline'>Booby trap</label>"
                        ),
                        $("<div class='setting'/>").append(
                            this.gatlingGunSetting,
                            "<label for='gatlingGun' class='subheadline'>Gatling gun</label>"
                        ),
                        $("<div class='setting'/>").append(
                            this.shieldSetting,
                            "<label for='shield' class='subheadline'>Shield</label>"
                        )
                    )
                ),
                this.premiumSettings.append(
                    this.gameSettings.append(
                        $("<div class='setting'/>").append(
                            this.symmetricSetting,
                            "<label for='symmetric' class='subheadline'>Symmetric maze</label>"
                        ),
                        $("<div class='setting'/>").append(
                            this.stormSetting,
                            "<label for='storm' class='subheadline'>Radioactive fog</label>"
                        )
                    )
                ),
                this.getPremiumMessage.append(
                    $("<div/>").append(this.getPremiumButton))
            ),
            this.startButton
        );

        this.symmetricSetting.change(event => {
            this._updateMaxNumberOfPlayersButtons();
        });

        this.laserSetting.change(event => {
            this.crateOverridesMap[Constants.COLLECTIBLE_TYPES.CRATE_LASER] = event.target.checked;
        });

        this.doubleBarrelSetting.change(event => {
            this.crateOverridesMap[Constants.COLLECTIBLE_TYPES.CRATE_DOUBLE_BARREL] = event.target.checked;
        });

        this.shotgunSetting.change(event => {
            this.crateOverridesMap[Constants.COLLECTIBLE_TYPES.CRATE_SHOTGUN] = event.target.checked;
        });

        this.homingMissileSetting.change(event => {
            this.crateOverridesMap[Constants.COLLECTIBLE_TYPES.CRATE_HOMING_MISSILE] = event.target.checked;
        });

        this.mineSetting.change(event => {
            this.crateOverridesMap[Constants.COLLECTIBLE_TYPES.CRATE_MINE] = event.target.checked;
        });

        this.gatlingGunSetting.change(event => {
            this.crateOverridesMap[Constants.COLLECTIBLE_TYPES.CRATE_GATLING_GUN] = event.target.checked;
        });

        this.shieldSetting.change(event => {
            this.crateOverridesMap[Constants.COLLECTIBLE_TYPES.CRATE_SHIELD] = event.target.checked;
        });

        this.getPremiumButton.click(event => {
            OverlayManager.popOverlay();
            Content.navigateToTab("shop", "/shop", {});
        });

        this.startButton.click(event => {
            OverlayManager.popOverlay(true, false);
            GameManager.createNewGame(false, this.symmetricSetting.prop("checked"), this.stormSetting.prop("checked"), this.selectedMode, this.selectedMaxNumberOfPlayers, this._getSelectedCrates());
        });

        this.initialised = true;
    },

    /**
     * Show overlay.
     * @param {Object} params
     */
    show(params) {
        this._initialise();

        // Highlight the default active players and current game mode.
        this.maxNumberOfPlayersSetting.setSelection(Constants.GAME.DEFAULT_ACTIVE_PLAYERS - 2);
        const d = new Date();
        if (d.getUTCHours() % 4 === 3) {
            this.modeSetting.setSelection(1);
        } else {
            this.modeSetting.setSelection(0);
        }
        this.selectedMode = Constants.GAME_MODES.CURRENT;

        this.symmetricSetting.prop("checked", false);
        this.stormSetting.prop("checked", true);

        if (PremiumManager.isPremiumPresent()) {
            this.premiumSettings.removeClass("note");
            this.modeSetting.enable();
            this._updateMaxNumberOfPlayersButtons();
            this.symmetricSetting.prop("disabled", false);
            this.stormSetting.prop("disabled", false);
            this.getPremiumMessage.hide();
        } else {
            this.premiumSettings.addClass("note");
            this.modeSetting.disable();
            this.maxNumberOfPlayersSetting.disable();
            this.symmetricSetting.prop("disabled", true);
            this.stormSetting.prop("disabled", true);
            this.getPremiumMessage.show();
        }

        this.crateOverridesMap = {};
        this._updateAvailableCrates(true);

        
    },

    setMode(index) {
        switch (index) {
            case 0:
            {
                this.selectedMode = Constants.GAME_MODES.CLASSIC;
                break;
            }
            case 1:
            {
                this.selectedMode = Constants.GAME_MODES.DEATHMATCH;
                break;
            }
        }

        this._updateMaxNumberOfPlayersButtons();
        this._updateAvailableCrates(false);
    },

    setNumberOfPlayers(index) {
        this.selectedMaxNumberOfPlayers = index + 2;
    },

    _updateMaxNumberOfPlayersButtons() {
        this.maxNumberOfPlayersSetting.disable();

        const mode = this._getSelectedMode();

        const minNumberOfActivePlayers = Math.max(Users.getAllPlayerIds().length, Constants.GAME_MODE_INFO[mode].MIN_PLAYERS);
        const maxNumberOfActivePlayers = this.symmetricSetting.prop("checked") ? Constants.GAME.SYMMETRIC_MAX_ACTIVE_PLAYERS : Constants.GAME.MAX_ACTIVE_PLAYERS;

        if (this.selectedMaxNumberOfPlayers < minNumberOfActivePlayers) {
            this.maxNumberOfPlayersSetting.setSelection(minNumberOfActivePlayers - 2);
        } else if (this.selectedMaxNumberOfPlayers > maxNumberOfActivePlayers) {
            this.maxNumberOfPlayersSetting.setSelection(maxNumberOfActivePlayers - 2);
        }

        for (let i = minNumberOfActivePlayers; i <= maxNumberOfActivePlayers; ++i) {
            this.maxNumberOfPlayersSetting.enableIndex(i - 2);
        }
    },

    _updateAvailableCrates(forceChecked) {
        const mode = this._getSelectedMode();
        const availableCrates = Constants.GAME_MODE_INFO[mode].DEFAULT_AVAILABLE_CRATES;
        this._updateCrate(this.laserSetting, Constants.COLLECTIBLE_TYPES.CRATE_LASER, forceChecked, availableCrates);
        this._updateCrate(this.doubleBarrelSetting, Constants.COLLECTIBLE_TYPES.CRATE_DOUBLE_BARREL, forceChecked, availableCrates);
        this._updateCrate(this.shotgunSetting, Constants.COLLECTIBLE_TYPES.CRATE_SHOTGUN, forceChecked, availableCrates);
        this._updateCrate(this.homingMissileSetting, Constants.COLLECTIBLE_TYPES.CRATE_HOMING_MISSILE, forceChecked, availableCrates);
        this._updateCrate(this.mineSetting, Constants.COLLECTIBLE_TYPES.CRATE_MINE, forceChecked, availableCrates);
        this._updateCrate(this.gatlingGunSetting, Constants.COLLECTIBLE_TYPES.CRATE_GATLING_GUN, forceChecked, availableCrates);
        this._updateCrate(this.shieldSetting, Constants.COLLECTIBLE_TYPES.CRATE_SHIELD, forceChecked, availableCrates);
    },

    _updateCrate(setting, crateType, forceChecked, availableCrates) {
        if (availableCrates.includes(crateType)) {
            setting.prop("checked", PremiumManager.isPremiumPresent() && !forceChecked && this.crateOverridesMap[crateType] !== undefined ? this.crateOverridesMap[crateType] : true);
            setting.prop("disabled", !PremiumManager.isPremiumPresent());
            setting.siblings("label").removeClass("note");
        } else {
            setting.prop("checked", false);
            setting.prop("disabled", true);
            setting.siblings("label").addClass("note");
        }
    },

    _getSelectedCrates() {
        const crateTypes = [];
        this._addCheckedCrate(this.laserSetting, Constants.COLLECTIBLE_TYPES.CRATE_LASER, crateTypes);
        this._addCheckedCrate(this.doubleBarrelSetting, Constants.COLLECTIBLE_TYPES.CRATE_DOUBLE_BARREL, crateTypes);
        this._addCheckedCrate(this.shotgunSetting, Constants.COLLECTIBLE_TYPES.CRATE_SHOTGUN, crateTypes);
        this._addCheckedCrate(this.homingMissileSetting, Constants.COLLECTIBLE_TYPES.CRATE_HOMING_MISSILE, crateTypes);
        this._addCheckedCrate(this.mineSetting, Constants.COLLECTIBLE_TYPES.CRATE_MINE, crateTypes);
        this._addCheckedCrate(this.gatlingGunSetting, Constants.COLLECTIBLE_TYPES.CRATE_GATLING_GUN, crateTypes);
        this._addCheckedCrate(this.shieldSetting, Constants.COLLECTIBLE_TYPES.CRATE_SHIELD, crateTypes);
        return crateTypes;
    },

    _addCheckedCrate(setting, crateType, selectedCrates) {
        if (setting.prop("checked")) {
            selectedCrates.push(crateType);
        }
    },

    _getSelectedMode() {
        let mode = this.selectedMode;
        if (mode === Constants.GAME_MODES.CURRENT) {
            const d = new Date();
            if (d.getUTCHours() % 4 === 3) {
                mode = Constants.GAME_MODES.DEATHMATCH;
            } else {
                mode = Constants.GAME_MODES.CLASSIC;
            }
        }

        return mode;
    },

    hide() {
        this._initialise();
    },

    getContents() {
        this._initialise();

        return this.wrapper;
    },

    shouldHide() {
        return true;
    },

    canBeCancelled() {
        return true;
    },

    _handleError(message) {
        alert(message);
    }
};
