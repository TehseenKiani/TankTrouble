import { ScoreState } from "./scorestate.js";
import { Log } from "./log.js";

export class Score {
    id = null;
    playerId = null;
    type = 0;
    value = 0;
    log = null;

    constructor(scoreState) {
        this.setScoreState(scoreState);
        this.log = new Log("Score");
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

    getValue() {
        return this.value;
    }

    setScoreState(scoreState) {
        this.id = scoreState.getId();
        this.playerId = scoreState.getPlayerId();
        this.type = scoreState.getType();
        this.value = scoreState.getValue();
    }

    getScoreState() {
        return ScoreState.withState(this.id, this.playerId, this.type, this.value);
    }
}
