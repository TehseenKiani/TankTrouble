import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class WeaponDestroyedMessage extends Message {
    static typeId = MessageSchemas.weaponDestroyedMessage.typeId;

    weaponId = "";
    playerId = "";

    setWeaponId(weaponId) {
        this.weaponId = weaponId;
    }

    getWeaponId() {
        return this.weaponId;
    }

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getPlayerId() {
        return this.playerId;
    }

    _toObject() {
        return {
            weaponId: this.weaponId,
            playerId: this.playerId
        };
    }

    _fromObject(object) {
        this.setWeaponId(object.weaponId);
        this.setPlayerId(object.playerId);
    }
}
