import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class ZoneDestroyedMessage extends Message {
    static typeId = MessageSchemas.zoneDestroyedMessage.typeId;

    zoneId = "";

    setZoneId(zoneId) {
        this.zoneId = zoneId;
    }

    getZoneId() {
        return this.zoneId;
    }

    _toObject() {
        return {
            zoneId: this.zoneId
        };
    }

    _fromObject(object) {
        this.setZoneId(object.zoneId);
    }
}
