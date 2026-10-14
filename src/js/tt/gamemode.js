import { Constants } from "./constants.js";
import { Log } from "./log.js";

export class GameMode {
    mode = null;
    ranked = false;
    symmetric = false;
    storm = false;
    crateTypes = [];
    gameController = null;
    roundController = null;
    log = null;

    constructor() {
        this.log = new Log("GameMode");
    }

    getMode() {
        return this.mode;
    }

    setRanked(ranked) {
        this.ranked = ranked;
    }

    setSymmetric(symmetric) {
        this.symmetric = symmetric;
    }

    setStorm(storm) {
        this.storm = storm;
    }

    setCrateTypes(crateTypes) {
        this.crateTypes = crateTypes;
    }

    setGameController(gameController) {
        this.gameController = gameController;
    }

    setRoundController(roundController) {
        this.roundController = roundController;
    }

    computeJoinPriority(joiningPlayerCount) {
        let priority = 0;
        // Prioritise to start a game that is waiting for players.
        if (this.gameController.getTotalPlayerCount() < Constants.GAME_MODE_INFO[this.mode].MIN_PLAYERS) {
            if (this.gameController.getTotalPlayerCount() + joiningPlayerCount >= Constants.GAME_MODE_INFO[this.mode].MIN_PLAYERS) {
                priority += Constants.JOIN_PRIORITY_START_GAME_WEIGHT;

                // Add time waiting between rounds to tie break.
                priority += this.gameController.getBetweenRoundsDuration();
            }
        }

        // Factor in that we want to fill up the game as much as possible to tie break.
        priority += this.gameController.getTotalPlayerCount() + joiningPlayerCount;

        return priority;
    }

    canRemovePlayer(playerId) {
        this.log.error("Attempt to call GameMode.canRemovePlayer. canRemovePlayer() must be overridden in subclasses");
    }

    getScoreStates(playerId) {
        this.log.error("Attempt to call GameMode.getScoreStates. getScoreStates() must be overridden in subclasses");
    }

    initialiseRound() {
        this.log.error("Attempt to call GameMode.initialiseRound. initialiseRound() must be overridden in subclasses");
    }

    getTeam(playerId) {
        this.log.error("Attempt to call GameMode.getTeam. getTeam() must be overridden in subclasses");
    }

    getMaze(playerIds, theme) {
        this.log.error("Attempt to call GameMode.getMaze. getMaze() must be overridden in subclasses");
    }

    getInitialWeaponState(playerId) {
        this.log.error("Attempt to call GameMode.getInitialWeaponState. getInitialWeaponState() must be overridden in subclasses");
    }

    getInitialUpgradeState(playerId) {
        this.log.error("Attempt to call GameMode.getInitialUpgradeState. getInitialUpgradeState() must be overridden in subclasses");
    }

    getRespawnWeaponState(playerId) {
        this.log.error("Attempt to call GameMode.getRespawnWeaponState. getRespawnWeaponState() must be overridden in subclasses");
    }

    getRespawnUpgradeState(playerId) {
        this.log.error("Attempt to call GameMode.getRespawnUpgradeState. getRespawnUpgradeState() must be overridden in subclasses");
    }

    update(deltaTime) {
        this.log.error("Attempt to call GameMode.update. update() must be overridden in subclasses");
    }

    isRoundOver() {
        this.log.error("Attempt to call GameMode.isRoundOver. isRoundOver() must be overridden in subclasses");
    }

    getWinnerPlayerIds() {
        this.log.error("Attempt to call GameMode.getWinnerPlayerIds. getWinnerPlayerIds() must be overridden in subclasses");
    }

    getVictoryExperience() {
        this.log.error("Attempt to call GameMode.getVictoryExperience. getVictoryExperience() must be overridden in subclasses");
    }

    getKillExperience() {
        this.log.error("Attempt to call GameMode.getKillExperience. getKillExperience() must be overridden in subclasses");
    }

    getVictoryGoldAmount() {
        this.log.error("Attempt to call GameMode.getVictoryGoldAmount. getVictoryGoldAmount() must be overridden in subclasses");
    }

    gameEventHandler(self, id, evt, data) {
        // Intentionally do nothing. Override behaviour in subclasses.
    }

    roundEventHandler(self, id, evt, data) {
        // Intentionally do nothing. Override behaviour in subclasses.
    }
}
