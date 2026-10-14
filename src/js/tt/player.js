import { PlayerState } from "./playerstate.js";

export class Player {
    id = null; // String with id of player
    queued = false;
    enqueueTime = null;
    team = 0;

    constructor(id, queued, enqueueTime, team) {
        this.id = id;
        this.queued = queued;
        this.enqueueTime = enqueueTime;
        this.team = team;
    }

    setPlayerState(playerState) {
        this.id = playerState.getPlayerId();
        this.queued = playerState.getQueued();
        this.enqueueTime = playerState.getEnqueueTime();
        this.team = playerState.getTeam();
    }

    getPlayerState() {
        const playerState = PlayerState.withState(
            this.id,
            this.queued,
            this.enqueueTime,
            this.team
        );

        return playerState;
    }

    getId() {
        return this.id;
    }

    getEnqueueTime() {
        return this.enqueueTime;
    }

    getTeam() {
        return this.team;
    }

    setTeam(team) {
        this.team = team;
    }
}
