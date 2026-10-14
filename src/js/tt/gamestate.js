import { PlayerState } from "./playerstate.js";
import { ScoreState } from "./scorestate.js";
import { EmblemState } from "./emblemstate.js";

export class GameState {
    data = {
        playerStates: [],
        mode: null,
        maxActivePlayerCount: 0,
        theme: null,
        ranked: false,
        symmetric: false,
        storm: false,
        premium: false,
        scoreStates: [],
        emblemStates: [],
        id: null
    };

    static withState(playerStates, mode, maxActivePlayerCount, theme, ranked, symmetric, storm, premium, scoreStates, emblemStates, id) {
        const instance = new this();
        instance.data.playerStates = playerStates;
        instance.data.mode = mode;
        instance.data.maxActivePlayerCount = maxActivePlayerCount;
        instance.data.theme = theme;
        instance.data.ranked = ranked;
        instance.data.symmetric = symmetric;
        instance.data.storm = storm;
        instance.data.premium = premium;
        instance.data.scoreStates = scoreStates;
        instance.data.emblemStates = emblemStates;
        instance.data.id = id;
        return instance;
    }

    static withObject(object) {
        const instance = new this();
        instance.data = object;
        return instance;
    }

    setPlayerStates(playerStates) {
        this.data.playerStates = playerStates.map(playerState => playerState.toObject());
    }

    getPlayerStates() {
        return this.data.playerStates.map(playerStateObject => PlayerState.withObject(playerStateObject));
    }

    setMode(mode) {
        this.data.mode = mode;
    }

    getMode() {
        return this.data.mode;
    }

    setMaxActivePlayerCount(maxActivePlayerCount) {
        this.data.maxActivePlayerCount = maxActivePlayerCount;
    }

    getMaxActivePlayerCount() {
        return this.data.maxActivePlayerCount;
    }

    setTheme(theme) {
        this.data.theme = theme;
    }

    getTheme() {
        return this.data.theme;
    }

    setRanked(ranked) {
        this.data.ranked = ranked;
    }

    getRanked() {
        return this.data.ranked;
    }

    setSymmetric(symmetric) {
        this.data.symmetric = symmetric;
    }

    getSymmetric() {
        return this.data.symmetric;
    }

    setStorm(storm) {
        this.data.storm = storm;
    }

    getStorm() {
        return this.data.storm;
    }

    setPremium(premium) {
        this.data.premium = premium;
    }

    getPremium() {
        return this.data.premium;
    }

    setScoreStates(scoreStates) {
        this.data.scoreStates = scoreStates.map(scoreState => scoreState.toObject());
    }

    getScoreStates() {
        return this.data.scoreStates.map(scoreStateObject => ScoreState.withObject(scoreStateObject));
    }

    setEmblemStates(emblemStates) {
        this.data.emblemStates = emblemStates.map(emblemState => emblemState.toObject());
    }

    getEmblemStates() {
        return this.data.emblemStates.map(emblemStateObject => EmblemState.withObject(emblemStateObject));
    }

    setId(id) {
        this.data.id = id;
    }

    getId() {
        return this.data.id;
    }

    toObject() {
        return this.data;
    }
}
