import { Message } from "./message.js";
import { RoundState } from "./roundstate.js";
import { MessageSchemas } from "./messageschemas.js";

export class RoundStateMessage extends Message {
    static typeId = MessageSchemas.roundStateMessage.typeId;
    static schema = MessageSchemas.roundStateMessage.schema;

    roundState = null;

    setRoundState(roundState) {
        this.roundState = roundState;
    }

    getRoundState() {
        return this.roundState;
    }

    _toObject() {
        return {
            roundState: this.roundState.toObject()
        };
    }

    _fromObject(object) {
        this.setRoundState(RoundState.withObject(object.roundState));
    }
}
