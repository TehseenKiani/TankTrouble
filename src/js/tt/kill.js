export class Kill {
    victimPlayerId = null;
    killerPlayerId = null;
    experience = 0;
    deadlyId = null;
    deadlyType = null; // Int with type of deadly

    constructor(victimPlayerId, killerPlayerId, experience, deadlyId, deadlyType) {
        this.victimPlayerId = victimPlayerId;
        this.killerPlayerId = killerPlayerId;
        this.experience = experience;
        this.deadlyId = deadlyId;
        this.deadlyType = deadlyType;
    }

    getVictimPlayerId() {
        return this.victimPlayerId;
    }

    getKillerPlayerId() {
        return this.killerPlayerId;
    }

    getExperience() {
        return this.experience;
    }

    getDeadlyId() {
        return this.deadlyId;
    }

    getDeadlyType() {
        return this.deadlyType;
    }
}
