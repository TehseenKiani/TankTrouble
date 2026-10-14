export class PlayerState {
    data = {
        playerId: "",
        queued: false,
        enqueueTime: null,
        team: 0
    };

    static withState(playerId, queued, enqueueTime, team) {
        const instance = new this();
        instance.data.playerId = playerId;
        instance.data.queued = queued;
        instance.data.enqueueTime = enqueueTime;
        instance.data.team = team;
        return instance;
    }

    static withObject(object) {
        const instance = new this();
        instance.data = object;
        return instance;
    }

    getPlayerId() {
        return this.data.playerId;
    }

    getQueued() {
        return this.data.queued;
    }

    getEnqueueTime() {
        return this.data.enqueueTime;
    }

    getTeam() {
        return this.data.team;
    }

    toObject() {
        return this.data;
    }
}
