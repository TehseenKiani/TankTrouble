import { Game } from "./game.js";
import { TankTrouble } from "../../../tanktrouble.js";
import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { Log } from "../../log.js";
import { OverlayManager } from "../../../overlaymanager.js";
import { UIButtonGroup } from "../uibuttongroup.js";
import { UIConstants } from "../uiconstants.js";
import { UIMenuBackgroundGroup } from "./uimenubackgroundgroup.js";
import { UIPlayerPanel } from "../playerpanel/uiplayerpanel.js";
import { Users } from "../../../users.js";

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - input - a reference to the Phaser.Input input manager
 *
*/
class UIMenuState {
    backgroundGroup = null;
    onePlayerButton = null;
    twoPlayerButton = null;
    threePlayerButton = null;
    buttonsScaledDown = false;
    addingGuests = false;
    log = null;

    preload() {}

    create() {
        // Create log.
        this.log = new Log("UIMenuState");

        this.backgroundGroup = this.game.add.existing(new UIMenuBackgroundGroup(this.game, 0, 0));

        this.onePlayerButton = this.game.add.existing(new UIButtonGroup(this.game, 0, 0, "", UIConstants.BUTTON_SIZES.LARGE, "1 player", this._onePlayer, this, UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.LARGE]));
        this.twoPlayerButton = this.game.add.existing(new UIButtonGroup(this.game, 0, 0, "", UIConstants.BUTTON_SIZES.LARGE, "2 players", this._twoPlayer, this, UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.LARGE]));
        this.threePlayerButton = this.game.add.existing(new UIButtonGroup(this.game, 0, 0, "", UIConstants.BUTTON_SIZES.LARGE, "3 players", this._threePlayer, this, UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.LARGE]));
        

        this.onePlayerButton.spawn();
        this.twoPlayerButton.spawn();
        this.threePlayerButton.spawn();
        

        // Add event listeners.
        Users.addEventListener(this._authenticationEventHandler, this);

        

        this.scale.onSizeChange.add(this._onSizeChangeHandler, this);

        // Handle scaling.
        this._onSizeChangeHandler();

        UIPlayerPanel.disableInput();

        // State.
        this.addingGuests = false;
    }

    shutdown() {
        this._retireUI();

        UIPlayerPanel.showLoginIcon();
        UIPlayerPanel.enableInput();

        // Remove event listeners.
        Users.removeEventListener(this._authenticationEventHandler, this);

        // Remove resize handler.
        this.scale.onSizeChange.remove(this._onSizeChangeHandler, this);
    }

    _onSizeChangeHandler() {
        this.log.debug("SIZE CHANGE!");

        const unscaledBackgroundWidth = this.backgroundGroup.getLocalBounds().width;
        const unscaledBackgroundHeight = this.backgroundGroup.getLocalBounds().height;

        // Do not scale up more than 1x.
        const backgroundScale = Math.min(1.0, Math.min(this.game.width / unscaledBackgroundWidth, (this.game.height * UIConstants.MENU_BACKGROUND_HEIGHT_RATIO) / unscaledBackgroundHeight));
        this.backgroundGroup.scale.setTo(backgroundScale);

        const backgroundTopMargin = Math.max(UIConstants.MENU_BACKGROUND_MIN_TOP_MARGIN, (this.game.height * UIConstants.MENU_BACKGROUND_Y_RATIO) - (this.backgroundGroup.height * 0.5));
        this.backgroundGroup.position.set(this.game.width * 0.5, backgroundTopMargin + (this.backgroundGroup.height * 0.5));

        const buttonAnchorY = backgroundTopMargin + (this.backgroundGroup.height * UIConstants.MENU_BUTTON_BACKGROUND_Y_RATIO);

        let scaleDown = false;
        scaleDown |= this.game.width < (3 * UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.LARGE]) + (4 * UIConstants.MENU_BUTTON_SPACINGS[UIConstants.BUTTON_SIZES.LARGE]);
        scaleDown |= this.game.height - buttonAnchorY < (UIConstants.BUTTON_HEIGHTS[UIConstants.BUTTON_SIZES.LARGE] * 0.5) + (2 * UIConstants.MENU_BUTTON_SPACINGS[UIConstants.BUTTON_SIZES.LARGE]);

        if (scaleDown && !this.buttonsScaledDown) {
            this.buttonsScaledDown = true;
            this.onePlayerButton.setSize(UIConstants.BUTTON_SIZES.MEDIUM);
            this.twoPlayerButton.setSize(UIConstants.BUTTON_SIZES.MEDIUM);
            this.threePlayerButton.setSize(UIConstants.BUTTON_SIZES.MEDIUM);
            
            this.onePlayerButton.setMinWidth(UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.MEDIUM]);
            this.twoPlayerButton.setMinWidth(UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.MEDIUM]);
            this.threePlayerButton.setMinWidth(UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.MEDIUM]);
            
        } else if (!scaleDown && this.buttonsScaledDown) {
            this.buttonsScaledDown = false;
            this.onePlayerButton.setSize(UIConstants.BUTTON_SIZES.LARGE);
            this.twoPlayerButton.setSize(UIConstants.BUTTON_SIZES.LARGE);
            this.threePlayerButton.setSize(UIConstants.BUTTON_SIZES.LARGE);
            
            this.onePlayerButton.setMinWidth(UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.LARGE]);
            this.twoPlayerButton.setMinWidth(UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.LARGE]);
            this.threePlayerButton.setMinWidth(UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.LARGE]);
            
        }

        // Move buttons.
        let buttonSpacing = UIConstants.MENU_BUTTON_SPACINGS[UIConstants.BUTTON_SIZES.LARGE];
        let playerButtonWidth = UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.LARGE];
        if (this.buttonsScaledDown) {
            buttonSpacing = UIConstants.MENU_BUTTON_SPACINGS[UIConstants.BUTTON_SIZES.MEDIUM];
            playerButtonWidth = UIConstants.MENU_BUTTON_WIDTHS[UIConstants.BUTTON_SIZES.MEDIUM];
        }

        this.twoPlayerButton.position.set(this.game.width * 0.5, buttonAnchorY);
        this.onePlayerButton.position.set((this.game.width * 0.5) - playerButtonWidth - buttonSpacing, buttonAnchorY);
        this.threePlayerButton.position.set((this.game.width * 0.5) + playerButtonWidth + buttonSpacing, buttonAnchorY);

        
    }

    _onePlayer() {
        this._addGuests(1);
    }

    _twoPlayer() {
        this._addGuests(2);
    }

    _threePlayer() {
        this._addGuests(3);
    }


    _addGuests(totalNumberOfPlayers) {
        this.addingGuests = true;

        this._updatePlayerButtons();

        Backend.createGuests(totalNumberOfPlayers, Caches.getPlayerDetailsCache())
            .then(result => {
                this.addingGuests = false;

                this._updatePlayerButtons();

                if (typeof result === "object") {
                    // Store player ids of guest users in an
                    // easily accessible place
                    Users.addGuestUsers(result.playerIds, result.multiplayerTokens);
                } else {
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    _authenticationEventHandler(self, evt, data) {
        if (Users.getAllPlayerIds().length > 0) {
            self.state.start("Lobby");
        }
    }

    _updatePlayerButtons() {
        if (this.addingGuests) {
            this.onePlayerButton.disable();
            this.twoPlayerButton.disable();
            this.threePlayerButton.disable();
            
        } else {
            this.onePlayerButton.enable();
            this.twoPlayerButton.enable();
            this.threePlayerButton.enable();
            
        }
    }


    _retireUI() {
        this.backgroundGroup.retire();
    }

    update() {}
}

Game.UIMenuState = UIMenuState;
