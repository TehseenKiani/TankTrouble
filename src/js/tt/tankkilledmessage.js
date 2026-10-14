import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class TankKilledMessage extends Message {
    static typeId = MessageSchemas.tankKilledMessage.typeId;

    victimPlayerId = "";
    killerPlayerId = "";
    experience = 0;
    deadlyId = "";
    deadlyType = 0;

    setVictimPlayerId(victimPlayerId) {
        this.victimPlayerId = victimPlayerId;
    }

    getVictimPlayerId() {
        return this.victimPlayerId;
    }

    setKillerPlayerId(killerPlayerId) {
        this.killerPlayerId = killerPlayerId;
    }

    getKillerPlayerId() {
        return this.killerPlayerId;
    }

    setExperience(experience) {
        this.experience = experience;
    }

    getExperience() {
        return this.experience;
    }

    setDeadlyId(deadlyId) {
        this.deadlyId = deadlyId;
    }

    getDeadlyId() {
        return this.deadlyId;
    }

    setDeadlyType(deadlyType) {
        this.deadlyType = deadlyType;
    }

    getDeadlyType() {
        return this.deadlyType;
    }

    _toObject() {
        return {
            victimPlayerId: this.victimPlayerId,
            killerPlayerId: this.killerPlayerId,
            experience: this.experience,
            deadlyId: this.deadlyId,
            deadlyType: this.deadlyType
        };
    }

    _fromObject(object) {
        this.setVictimPlayerId(object.victimPlayerId);
        this.setKillerPlayerId(object.killerPlayerId);
        this.setExperience(object.experience);
        this.setDeadlyId(object.deadlyId);
        this.setDeadlyType(object.deadlyType);
    }
}
