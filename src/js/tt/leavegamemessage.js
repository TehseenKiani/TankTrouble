import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class LeaveGameMessage extends Message {
    static typeId = MessageSchemas.leaveGameMessage.typeId;

    force = false;

    setForce(force) {
        this.force = force;
    }

    getForce() {
        return this.force;
    }

    _toObject() {
        return {
            force: this.force
        };
    }

    _fromObject(object) {
        this.setForce(object.force);
    }
}
