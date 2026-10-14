import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class HandshakeMessage extends Message {
    static typeId = MessageSchemas.handshakeMessage.typeId;

    clientId = "";
    version = "";

    setClientId(clientId) {
        this.clientId = clientId;
    }

    getClientId() {
        return this.clientId;
    }

    setVersion(version) {
        this.version = version;
    }

    getVersion() {
        return this.version;
    }

    _toObject() {
        return {
            clientId: this.clientId,
            version: this.version
        };
    }

    _fromObject(object) {
        this.setClientId(object.clientId);
        this.setVersion(object.version);
    }
}
