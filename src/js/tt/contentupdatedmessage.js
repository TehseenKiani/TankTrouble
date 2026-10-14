import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class ContentUpdatedMessage extends Message {
    static typeId = MessageSchemas.contentUpdatedMessage.typeId;

    adminId = "";
    token = "";
    clientId = "";
    virtualShopChanged = false;

    setAdminId(adminId) {
        this.adminId = adminId;
    }

    getAdminId() {
        return this.adminId;
    }

    setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    setClientId(clientId) {
        this.clientId = clientId;
    }

    getClientId() {
        return this.clientId;
    }

    setVirtualShopChanged(virtualShopChanged) {
        this.virtualShopChanged = virtualShopChanged;
    }

    getVirtualShopChanged() {
        return this.virtualShopChanged;
    }

    _toObject() {
        return {
            adminId: this.adminId,
            token: this.token,
            clientId: this.clientId,
            virtualShopChanged: this.virtualShopChanged
        };
    }

    _fromObject(object) {
        this.setAdminId(object.adminId);
        this.setToken(object.token);
        this.setClientId(object.clientId);
        this.setVirtualShopChanged(object.virtualShopChanged);
    }
}
