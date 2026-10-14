import { AIs } from "../../ais.js";
import { AdPlacementAdProvider } from "../../../adproviders/adplacementadprovider.js";
import { BootCampGameMode } from "../../bootcampgamemode.js";
import { Constants } from "../../constants.js";
import { Game } from "./game.js";
import { GameController } from "../../gamecontroller.js";
import { TTClient } from "../../ttclient.js";
import { TankTrouble } from "../../../tanktrouble.js";
import { AdvertisementManager } from "../../../advertisementmanager.js";
import { AudioManager } from "../../../audiomanager.js";
import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { ClientManager } from "../../../clientmanager.js";
import { Inputs } from "../../../inputs.js";
import { Log } from "../../log.js";
import { OverlayManager } from "../../../overlaymanager.js";
import { UIButtonGroup } from "../uibuttongroup.js";
import { UIConstants } from "../uiconstants.js";
import { UIDisconnectedIconGroup } from "./uidisconnectedicongroup.js";
import { UIGameButtonGroup } from "./uigamebuttongroup.js";
import { UIGameIconImage } from "./uigameiconimage.js";
import { Users } from "../../../users.js";
import { getSelectedTheme } from "../../../localtheme.js";

/*
 * Phaser fills in some properties:
 *  - game - a reference to the Phaser.Game
 *  - input - a reference to the Phaser.Input input manager
 *
*/
class UILobbyState {
    gameIconPlaceholderGroup = null;
    gameIconGroup = null;
    gameButtonGroup = null;
    disconnectedIconGroup = null;
    gameIcons = {};
    gameIconPlacementsTaken = [];
    randomGameButton = null;
    randomGameInfo = null;
    createGameButton = null;
    createGameInfo = null;
    favouritePlayerIds = [];
    joiningGame = false;
    allGamesActive = false;
    allGamesFull = false;
    refreshGameListEvent = null;
    log = null;

    preload() {}

    create() {
        // Create log.
        this.log = new Log("UILobbyState");

        // Create game icon place holder group to hold all game icon place holders.
        this.gameIconPlaceholderGroup = this.game.add.group();

        // Add game icon placeholders.
        for (let i = 0; i < UIConstants.GAME_ICON_COUNT; ++i) {
            const x = ((i / (UIConstants.GAME_ICON_COUNT - 1)) * (this.game.width - UIConstants.GAME_ICON_MARGIN - UIConstants.GAME_ICON_WIDTH)) + (UIConstants.GAME_ICON_WIDTH / 2.0) + (UIConstants.GAME_ICON_MARGIN / 2.0);

            const iconPlaceholder = this.gameIconPlaceholderGroup.add(this.game.make.sprite(x, UIConstants.GAME_ICON_Y, "gameiconplaceholder", 0));
            iconPlaceholder.anchor.setTo(0.5, 0.5);
            iconPlaceholder.width = UIConstants.GAME_ICON_WIDTH;
            iconPlaceholder.height = UIConstants.GAME_ICON_HEIGHT;
            iconPlaceholder.alpha = 0.2;
        }

        // Create game icon group to hold all game icons.
        this.gameIconGroup = this.game.add.group();

        // Add pool of game icons
        for (let i = 0; i < UIConstants.GAME_ICON_POOL_SIZE; ++i) {
            this.gameIconGroup.add(new UIGameIconImage(this.game));
        }

        // Create disconnected icon.
        this.disconnectedIconGroup = this.game.add.existing(new UIDisconnectedIconGroup(this.game));

        // Create game button group to hold all game buttons.
        this.gameButtonGroup = this.game.add.group();

        // Add pool of game buttons
        for (let i = 0; i < UIConstants.GAME_ICON_POOL_SIZE; ++i) {
            this.gameButtonGroup.add(new UIGameButtonGroup(this.game, this._joinGame, this));
        }

        // Allocate placement array.
        this.gameIconPlacementsTaken = [];
        for (let i = 0; i < UIConstants.GAME_ICON_COUNT; ++i) {
            this.gameIconPlacementsTaken.push(false);
        }

        // Add join random game button.
        this.randomGameButton = this.game.add.existing(new UIButtonGroup(this.game, this.game.width / 3.0, this.game.height / 2.0, "", UIConstants.BUTTON_SIZES.LARGE, "Random", this._joinRandomGame, this));

        this.randomGameInfo = this.game.add.text(this.game.width / 3.0, (this.game.height / 2.0) + UIConstants.RANDOM_GAME_BUTTON_INFO_Y, "", { font: `${UIConstants.BUTTON_INFO_FONT_SIZE}px Arial`, fill: "#999999" });
        this.randomGameInfo.anchor.setTo(0.5, 0.5);

        // FIXME Add check for if player has a premium account!
        // Add create game icon.
        this.createGameButton = this.game.add.existing(new UIButtonGroup(this.game, (this.game.width / 3.0) * 2.0, this.game.height / 2.0, "", UIConstants.BUTTON_SIZES.LARGE, "New game", this._createNewGame, this));

        this.createGameInfo = this.game.add.text((this.game.width / 3.0) * 2.0, (this.game.height / 2.0) + UIConstants.CREATE_GAME_BUTTON_INFO_Y, "", { font: `${UIConstants.BUTTON_INFO_FONT_SIZE}px Arial`, fill: "#999999" });
        this.createGameInfo.anchor.setTo(0.5, 0.5);


        // Add event listeners.
        ClientManager.getClient().addEventListener(this._clientEventHandler, this);
        ClientManager.getClient().addErrorListener(this._clientErrorHandler, this);
        ClientManager.getClient().addStateChangeListener(this._clientStateChangeHandler, this);

        Users.addEventListener(this._authenticationEventHandler, this);

        AdvertisementManager.addEventListener(this._adEventListener, this);

        this.scale.onSizeChange.add(this._onSizeChangeHandler, this);

        // Set correct offline/online UI.
        if (ClientManager.getClient().getState() !== TTClient.STATES.AUTHENTICATED) {
            this._goOfflineUI();
        } else {
            this._goOnlineUI();
            this._refreshGameList();
        }


        // Show interstitial ad.
        if (AdvertisementManager.shouldPresentAd()) {
            AdvertisementManager.setAdProvider(
                new AdPlacementAdProvider(AudioManager.isMusicOn())
            );

            AdvertisementManager.requestAd();
        }

        // State.
        this.joiningGame = false;
    }

    shutdown() {
        // Retire UI.
        this._retireUI();

        // Remove event listeners.
        ClientManager.getClient().removeEventListener(this._clientEventHandler, this);
        ClientManager.getClient().removeErrorListener(this._clientErrorHandler, this);
        ClientManager.getClient().removeStateChangeListener(this._clientStateChangeHandler, this);

        Users.removeEventListener(this._authenticationEventHandler, this);

        AdvertisementManager.removeEventListener(this._adEventListener, this);

        // Remove tick for refreshing game lists.
        if (this.refreshGameListEvent) {
            this.game.time.events.remove(this.refreshGameListEvent);
            this.refreshGameListEvent = null;
        }

        // Remove resize handler.
        this.scale.onSizeChange.remove(this._onSizeChangeHandler, this);
    }

    _onSizeChangeHandler() {
        this.log.debug("SIZE CHANGE!");

        // FIXME: Handle when game cannot show more than 2 game icons.
        let iconCount = UIConstants.GAME_ICON_COUNT;
        if (this.game.width < (UIConstants.GAME_ICON_WIDTH * 3) + UIConstants.GAME_ICON_MARGIN) {
            iconCount--;
        }
        if (this.game.width < (UIConstants.GAME_ICON_WIDTH * 2) + UIConstants.GAME_ICON_MARGIN) {
            iconCount--;
        }

        // Move game icon placeholders and game icons.
        for (let i = 0; i < UIConstants.GAME_ICON_COUNT; ++i) {
            if (i < iconCount) {
                const x = ((i / (iconCount - 1)) * (this.game.width - UIConstants.GAME_ICON_MARGIN - UIConstants.GAME_ICON_WIDTH)) + (UIConstants.GAME_ICON_WIDTH / 2.0) + (UIConstants.GAME_ICON_MARGIN / 2.0);

                this.gameIconPlaceholderGroup.getAt(i).x = x;
                this.gameIconPlaceholderGroup.getAt(i).visible = true;
            } else {
                this.gameIconPlaceholderGroup.getAt(i).visible = false;
            }
        }
        for (const gameIconSpriteId in this.gameIcons) {
            const { placement } = this.gameIcons[gameIconSpriteId];
            if (placement < iconCount) {
                const x = ((placement / (iconCount - 1)) * (this.game.width - UIConstants.GAME_ICON_MARGIN - UIConstants.GAME_ICON_WIDTH)) + (UIConstants.GAME_ICON_WIDTH / 2.0) + (UIConstants.GAME_ICON_MARGIN / 2.0);

                this.gameIcons[gameIconSpriteId].icon.x = x;
                this.gameIcons[gameIconSpriteId].button.x = x;
                this.gameIcons[gameIconSpriteId].icon.visible = true;
                this.gameIcons[gameIconSpriteId].button.visible = true;
            } else {
                this.gameIcons[gameIconSpriteId].icon.visible = false;
                this.gameIcons[gameIconSpriteId].button.visible = false;
            }
        }

        // Move offline message.
        this.disconnectedIconGroup.position.set(this.game.width / 2.0, UIConstants.DISCONNECTED_ICON_Y);

        // FIXME: Handle when game cannot show both buttons side by side. Either scale them down or place above each other. Also, handle y placement.

        // Move random and create game buttons.
        this.randomGameButton.x = this.game.width / 3.0;
        this.randomGameInfo.x = this.game.width / 3.0;
        this.createGameButton.x = (this.game.width / 3.0) * 2.0;
        this.createGameInfo.x = (this.game.width / 3.0) * 2.0;

        // FIXME: Do the rest of the adaptive layout.
    }

    _joinGame(gameId) {
        this.joiningGame = true;

        this._updateGameButtons();

        // Start an online battle.
        Constants.setMode(Constants.MODE_CLIENT_ONLINE);
        ClientManager.getClient().joinGame(gameId);
    }

    _joinRandomGame() {
        // Local edition: start a battle with a randomly generated maze.
        this._createLocalGame();
    }

    _createNewGame() {
        OverlayManager.pushOverlay(
            TankTrouble.NewGameOverlay,
            {}
        );
    }

    _createLocalGame() {
        this.joiningGame = true;

        this._updateGameButtons();

        // Start a local battle.
        Constants.setMode(Constants.MODE_CLIENT_LOCAL);

        const ttGame = new GameController(new BootCampGameMode(), false, false, false, Constants.CLIENT.MAX_PLAYERS, Constants.GAME_MODE_INFO[Constants.GAME_MODES.BOOT_CAMP].DEFAULT_AVAILABLE_CRATES, false, getSelectedTheme(Constants.MAZE_THEMES));

        const playerIds = Users.getAllPlayerIds();
        for (let i = 0; i < playerIds.length; ++i) {
            ttGame.addPlayer(playerIds[i]);
        }

        // Add an AI if only one local player.
        if (playerIds.length <= 1) {
            if (AIs.isReady()) {
                const aiId = AIs.getAvailableAIId(ttGame.getId());
                if (aiId) {
                    AIs.addAIManager(ttGame, aiId);
                    ttGame.addPlayer(aiId);
                }
            }
        }

        this.state.start("Game", true, false, ttGame);
    }

    createNewGame(ranked, symmetric, storm, gameMode, maxActivePlayerCount, crateTypes) {
        // Start an online battle.
        Constants.setMode(Constants.MODE_CLIENT_ONLINE);

        this.joiningGame = true;

        this._updateGameButtons();

        ClientManager.getClient().createGame(ranked, symmetric, storm, gameMode, maxActivePlayerCount, crateTypes); // FIXME Get settings from cookie?
    }

    _refreshGameList() {
        ClientManager.getClient().updateGameList();
    }

    update() {
        Inputs.update();
    }

    _removeUI() {
        this.disconnectedIconGroup.remove();
        // Clean up previous game icons.
        this.gameIconGroup.callAll("remove");
        this.gameButtonGroup.callAll("remove");
        this.gameIcons = {};
        this.randomGameButton.remove();
        this.randomGameInfo.setText("");
        this.createGameButton.remove();
        this.createGameInfo.setText("");
        // FIXME: Finish removal.
    }

    _retireUI() {
        this.disconnectedIconGroup.retire();
        // Clean up previous game icons.
        this.gameIconGroup.callAll("retire");
        this.gameButtonGroup.callAll("retire");
        this.gameIcons = {};
        this.gameIconPlaceholderGroup.callAll("kill");
        this.randomGameButton.retire();
        this.randomGameInfo.setText("");
        this.createGameButton.retire();
        this.createGameInfo.setText("");
        // FIXME: Finish retirement.
    }

    _goOfflineUI() {
        if (this.refreshGameListEvent) {
            // Remove tick for refreshing game lists every 10 seconds.
            this.game.time.events.remove(this.refreshGameListEvent);
            this.refreshGameListEvent = null;
        }

        this.disconnectedIconGroup.spawn(this.game.width / 2.0, UIConstants.DISCONNECTED_ICON_Y, UIConstants.DISCONNECTED_DELAY_TIME);
        // Clean up previous game icons.
        this.gameIconGroup.callAll("remove");
        this.gameButtonGroup.callAll("remove");
        this.gameIcons = {};
        this.randomGameButton.remove();
        this.randomGameInfo.setText("");
        this.createGameButton.remove();
        this.createGameInfo.setText("");
    }

    _goOnlineUI() {
        // Add tick for refreshing game lists every 10 seconds.
        this.refreshGameListEvent = this.game.time.events.loop(UIConstants.REFRESH_GAME_LIST_INTERVAL, this._refreshGameList, this);

        this.disconnectedIconGroup.remove();
        this.randomGameButton.spawn();
        this.createGameButton.spawn();
        this.gameIcons = {};
        for (let i = 0; i < UIConstants.GAME_ICON_COUNT; ++i) {
            this.gameIconPlacementsTaken[i] = false;
        }
    }

    _compareGameStates(gameStateA, gameStateB) {
        const statsA = this._countFavouritesActiveAndQueuedInGame(gameStateA);
        const statsB = this._countFavouritesActiveAndQueuedInGame(gameStateB);
        // First compare number of favourites.
        if (statsA[0] !== statsB[0]) {
            return statsB[0] - statsA[0];
        }
        // Then compare number of available seats.
        const seatsA = gameStateA.getMaxActivePlayerCount() - statsA[1];
        const seatsB = gameStateB.getMaxActivePlayerCount() - statsB[1];
        // If any of the games have available seats, we want to use that to sort them. Filled games should be sorted last. If both games have available seats, we don't care about the order.
        if (seatsA > 0 || seatsB > 0) {
            if (seatsA === 0) {
                return 1;
            } else if (seatsB === 0) {
                return -1;
            } else {
                return 0;
            }
        }
        // Then compare number of queued players.
        return statsA[2] - statsB[2];
    }

    _countFavouritesActiveAndQueuedInGame(gameState) {
        let favouritePlayerCount = 0;
        let activePlayerCount = 0;
        let queuedPlayerCount = 0;
        const playerStates = gameState.getPlayerStates();
        for (let i = 0; i < playerStates.length; i++) {
            const playerId = playerStates[i].getPlayerId();
            for (let j = 0; j < this.favouritePlayerIds.length; j++) {
                const favouritePlayerId = this.favouritePlayerIds[j];
                if (playerId === favouritePlayerId) {
                    ++favouritePlayerCount;
                }
            }
            const playerQueued = playerStates[i].getQueued();
            if (playerQueued) {
                ++queuedPlayerCount;
            } else {
                ++activePlayerCount;
            }
        }

        return [favouritePlayerCount, activePlayerCount, queuedPlayerCount];
    }

    _updateGameButtons() {
        if (this.allGamesActive) {
            this.createGameButton.disable();
            this.createGameInfo.setText("Server is full");
        } else if (this.joiningGame) {
            this.createGameButton.disable();
            this.createGameInfo.setText("");
        } else {
            this.createGameButton.enable();
            this.createGameInfo.setText("");
        }

        if (this.allGamesActive && this.allGamesFull) {
            this.randomGameButton.disable();
            this.randomGameInfo.setText("Server is full");
        } else if (this.joiningGame) {
            this.randomGameButton.disable();
            this.randomGameInfo.setText("");
        } else {
            this.randomGameButton.enable();
            this.randomGameInfo.setText("");
        }


        for (const gameIconId in this.gameIcons) {
            if (this.joiningGame) {
                this.gameIcons[gameIconId].button.disable();
            } else {
                this.gameIcons[gameIconId].button.enable();
            }
        }
    }

    _clientEventHandler(self, evt, data) {
        self.log.debug(`Client event: ${evt}: ${data}`);
        switch (evt) {
            case TTClient.EVENTS.GAME_LIST_CHANGED:
            {
                const gameStates = ClientManager.getClient().getAvailableGameStates();
                const gameCount = gameStates.length;

                self.allGamesActive = gameCount === Constants.SERVER.MAX_GAME_COUNT;
                self.allGamesFull = true;
                for (let i = 0; i < gameCount; ++i) {
                    if (gameStates[i].getPlayerStates().length < gameStates[i].getMaxActivePlayerCount() + Constants.GAME.MAX_QUEUED_PLAYERS) {
                        self.allGamesFull = false;
                        break;
                    }
                }

                self._updateGameButtons();

                // Get all favourites.
                const playerIds = Users.getAllPlayerIds();
                self.favouritePlayerIds = [];

                const favouritesPromises = playerIds.map(playerId => {
                    return Backend.getFavourites(playerId, Caches.getFavouritesCache())
                        .then(result => {
                            if (Array.isArray(result)) {
                                self.favouritePlayerIds = [...self.favouritePlayerIds, ...result];
                            }
                        })
                        .catch(() => {});
                });

                // When we have all responses, build up list of games we want to show.
                Promise.all(favouritesPromises).then(() => {
                    const sortedGameStates = ClientManager.getClient().getAvailableGameStates().toSorted(
                        // Create anonymous function to get correct context.
                        (a, b) => {
                            return self._compareGameStates(a, b);
                        }
                    );

                    // Remove icons that should no longer show.
                    for (const gameIconSpriteId in self.gameIcons) {
                        let gameIconStillNeeded = false;
                        for (let j = 0; j < Math.min(sortedGameStates.length, UIConstants.GAME_ICON_COUNT); ++j) {
                            if (gameIconSpriteId === sortedGameStates[j].getId()) {
                                gameIconStillNeeded = true;
                                break;
                            }
                        }

                        if (!gameIconStillNeeded) {
                            self.gameIcons[gameIconSpriteId].icon.remove();
                            self.gameIcons[gameIconSpriteId].button.remove();
                            self.gameIconPlacementsTaken[self.gameIcons[gameIconSpriteId].placement] = false;
                            delete self.gameIcons[gameIconSpriteId];
                        }
                    }

                    /*var index = 0;
                    var widthPerGameIcon = UIConstants.TANK_PANEL_MAX_WIDTH / iconCount;

                    for (var j = 0; j < UIConstants.GAME_ICON_COUNT; ++j) {
                        var x = (index + 0.5) * widthPerGameIcon;
                        if (this.localUsernames[j] in this.localTankIcons) {
                            //FIXME Update tank icon sprite position.
                            this.localTankIcons[this.localUsernames[j]].icon.refresh(x);
                            this.localTankIcons[this.localUsernames[j]].name.refresh(x);
                        } else {
                            var tankIconSprite = this.tankIconGroup.getFirstExists(false);
                            var tankNameSprite = this.tankNameGroup.getFirstExists(false);
                            if (tankIconSprite && tankNameSprite) {
                                this.localTankIcons[this.localUsernames[j]] = {icon: tankIconSprite, name: tankNameSprite};

                                tankIconSprite.spawn(x, (UIConstants.TANK_PANEL_MAX_HEIGHT - UIConstants.TANK_PANEL_ICON_BOTTOM_MARGIN) / 2.0, this.localUsernames[j], false);
                                tankNameSprite.spawn(x, 0.0, this.localUsernames[j]); // FIXME Handle guests.
                            } else {
                                this.log.error("Could not create tank icon sprite or tank name sprite. No sprite available.");
                            }
                        }
                        ++index;
                    }*/

                    // Update existing icons and show new ones.
                    for (let j = 0; j < Math.min(sortedGameStates.length, UIConstants.GAME_ICON_COUNT); ++j) {
                        if (sortedGameStates[j].getId() in self.gameIcons) {
                            //Update game icon sprite.
                            const counts = self._countFavouritesActiveAndQueuedInGame(sortedGameStates[j]);
                            self.gameIcons[sortedGameStates[j].getId()].icon.refresh(sortedGameStates[j], counts);
                            self.gameIcons[sortedGameStates[j].getId()].button.refresh(counts);
                        } else {
                            const gameIconSprite = self.gameIconGroup.getFirstExists(false);
                            const gameButton = self.gameButtonGroup.getFirstExists(false);
                            if (gameIconSprite && gameButton) {
                                // Compute the first available position.
                                let availablePosition = 0;
                                for (let k = 0; k < UIConstants.GAME_ICON_COUNT; ++k) {
                                    if (!self.gameIconPlacementsTaken[k]) {
                                        availablePosition = k;
                                        break;
                                    }
                                }
                                self.gameIconPlacementsTaken[availablePosition] = true;
                                self.gameIcons[sortedGameStates[j].getId()] = { icon: gameIconSprite, button: gameButton, placement: availablePosition };
                                const x = ((availablePosition / (UIConstants.GAME_ICON_COUNT - 1)) * (self.game.width - UIConstants.GAME_ICON_MARGIN - UIConstants.GAME_ICON_WIDTH)) + (UIConstants.GAME_ICON_WIDTH / 2.0) + (UIConstants.GAME_ICON_MARGIN / 2.0);
                                const counts = self._countFavouritesActiveAndQueuedInGame(sortedGameStates[j]);
                                gameIconSprite.spawn(x, UIConstants.GAME_ICON_Y, sortedGameStates[j], counts);
                                gameButton.spawn(x, UIConstants.JOIN_GAME_BUTTON_Y, sortedGameStates[j], counts, !self.joiningGame);
                            } else {
                                self.log.error("Could not create game icon sprite or game button. No sprite or button available.");
                            }
                        }
                    }
                });
                break;
            }
            case TTClient.EVENTS.PLAYER_UPDATED:
            {
                // Iterate over all game icons in search of the tank icon and name to update.
                for (const gameIconSpriteId in self.gameIcons) {
                    const gameIcon = self.gameIcons[gameIconSpriteId].icon;
                    const tankIcons = gameIcon.getTankIcons();
                    for (const tankIconSpriteId in tankIcons) {
                        if (tankIconSpriteId === data.getPlayerId()) {
                            if (data.getIconChanged()) {
                                tankIcons[tankIconSpriteId].icon.updateIcon();
                            }
                            if (data.getUsernameChanged()) {
                                tankIcons[tankIconSpriteId].name.updateName();
                            }
                            break;
                        }
                    }
                }

                break;
            }
            case TTClient.EVENTS.GAME_JOINED:
            {
                // It is important to use TTClient.getPlayerIds here, as the array reference makes round controller work correctly.
                const playerIds = ClientManager.getClient().getPlayerIds();

                const ttGame = GameController.withIds(data, playerIds);

                self.state.start("Game", true, false, ttGame);

                break;
            }
        }
    }

    _clientErrorHandler(self, error, msg) {
        self.log.debug(`Client error: ${error}: ${msg}`);
        switch (error) {
            case TTClient.ERRORS.JOIN_GAME:
            case TTClient.ERRORS.CREATE_GAME:
            {
                self.joiningGame = false;

                self._updateGameButtons();

                break;
            }
        }
    }

    _clientStateChangeHandler(self, oldState, newState, data, msg) {
        self.log.debug(`Client state: ${newState}: ${msg}`);
        switch (newState) {
            case TTClient.STATES.UNCONNECTED:
            {
                self.joiningGame = false;

                self._updateGameButtons();

                // Update UI to offline mode.
                self._goOfflineUI();
                break;
            }
            case TTClient.STATES.AUTHENTICATED:
            {
                // Update UI to online mode.
                self._goOnlineUI();
                self._refreshGameList();
                break;
            }
        }
    }

    _authenticationEventHandler(self, evt, data) {
        self.log.debug(`Authentication event: ${evt}: ${data}`);

        if (Users.getAllPlayerIds().length === 0) {
            self.state.start("Menu");
        }
    }

    _adEventListener(self, evt, data) {
        switch (evt) {
            case AdvertisementManager.EVENTS.AD_STARTED:
            {
                self.volumeSettingBeforeAd = AudioManager.getSoundVolumeSetting();
                AudioManager.turnSoundOff();
                break;
            }
            case AdvertisementManager.EVENTS.AD_FAILED:
            case AdvertisementManager.EVENTS.AD_FINISHED:
            {
                if (self.volumeSettingBeforeAd) {
                    AudioManager.turnSoundOn(self.volumeSettingBeforeAd);
                }
                break;
            }
            case AdvertisementManager.EVENTS.AD_PROGRESSION:
            case AdvertisementManager.EVENTS.AD_CLICKED:
            {
                break;
            }
            case AdvertisementManager.EVENTS.ADS_DISABLED:
            {
                OverlayManager.pushOverlay(
                    TankTrouble.MessageOverlay,
                    { headline: "Adblocker detected", message: "Ads help pay for the development and servers of TankTrouble.<br/>Get TankTrouble Premium to stop seeing ads and enjoy many other benefits.", canCancel: false }
                );

                break;
            }
        }
    }
}

Game.UILobbyState = UILobbyState;
