import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class RoundCreatedMessage extends Message {
    static typeId = MessageSchemas.roundCreatedMessage.typeId;

    ranked = false;

    setRanked(ranked) {
        this.ranked = ranked;
    }

    getRanked() {
        return this.ranked;
    }

    _toObject() {
        return {
            ranked: this.ranked
        };
    }

    _fromObject(object) {
        this.setRanked(object.ranked);
    }
}
