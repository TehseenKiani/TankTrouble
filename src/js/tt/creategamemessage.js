import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class CreateGameMessage extends Message {
    static typeId = MessageSchemas.createGameMessage.typeId;

    ranked = false;
    symmetric = false;
    storm = false;
    gameMode = -1;
    maxActivePlayerCount = 0;
    crateTypes = [];

    setRanked(ranked) {
        this.ranked = ranked;
    }

    getRanked() {
        return this.ranked;
    }

    setSymmetric(symmetric) {
        this.symmetric = symmetric;
    }

    getSymmetric() {
        return this.symmetric;
    }

    setStorm(storm) {
        this.storm = storm;
    }

    getStorm() {
        return this.storm;
    }

    setGameMode(gameMode) {
        this.gameMode = gameMode;
    }

    getGameMode() {
        return this.gameMode;
    }

    setMaxActivePlayerCount(maxActivePlayerCount) {
        this.maxActivePlayerCount = maxActivePlayerCount;
    }

    getMaxActivePlayerCount() {
        return this.maxActivePlayerCount;
    }

    setCrateTypes(crateTypes) {
        this.crateTypes = crateTypes;
    }

    getCrateTypes() {
        return this.crateTypes;
    }

    _toObject() {
        return {
            ranked: this.ranked,
            symmetric: this.symmetric,
            storm: this.storm,
            gameMode: this.gameMode,
            maxActivePlayerCount: this.maxActivePlayerCount,
            crateTypes: this.crateTypes
        };
    }

    _fromObject(object) {
        this.setRanked(object.ranked);
        this.setSymmetric(object.symmetric);
        this.setStorm(object.storm);
        this.setGameMode(object.gameMode);
        this.setMaxActivePlayerCount(object.maxActivePlayerCount);
        this.setCrateTypes(object.crateTypes);
    }
}
