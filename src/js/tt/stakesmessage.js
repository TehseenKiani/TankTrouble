import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class StakesMessage extends Message {
    static typeId = MessageSchemas.stakesMessage.typeId;

    stakes = [];

    setStakes(stakes) {
        this.stakes = stakes;
    }

    getStakes() {
        return this.stakes;
    }

    _toObject() {
        return {
            stakes: this.stakes
        };
    }

    _fromObject(object) {
        this.setStakes(object.stakes);
    }
}
