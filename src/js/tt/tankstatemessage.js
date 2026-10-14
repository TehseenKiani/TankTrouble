import { Message } from "./message.js";
import { TankState } from "./tankstate.js";
import { MessageSchemas } from "./messageschemas.js";

export class TankStateMessage extends Message {
    static typeId = MessageSchemas.tankStateMessage.typeId;
    static schema = MessageSchemas.tankStateMessage.schema;

    tankState = null;

    setTankState(tankState) {
        this.tankState = tankState;
    }

    getTankState() {
        return this.tankState;
    }

    _toObject() {
        return {
            tankState: this.tankState.toObject()
        };
    }

    _fromObject(object) {
        this.setTankState(TankState.withObject(object.tankState));
    }
}
