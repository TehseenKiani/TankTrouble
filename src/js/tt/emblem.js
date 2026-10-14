import { EmblemState } from "./emblemstate.js";
import { Log } from "./log.js";

export class Emblem {
    id = null;
    playerId = null;
    type = 0;
    log = null;

    constructor(emblemState) {
        this.setEmblemState(emblemState);
        this.log = new Log("Emblem");
    }

    getId() {
        return this.id;
    }

    getPlayerId() {
        return this.playerId;
    }

    getType() {
        return this.type;
    }

    setEmblemState(emblemState) {
        this.id = emblemState.getId();
        this.playerId = emblemState.getPlayerId();
        this.type = emblemState.getType();
    }

    getEmblemState() {
        return EmblemState.withState(this.id, this.playerId, this.type);
    }
}
