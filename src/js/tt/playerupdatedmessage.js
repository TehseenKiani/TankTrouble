import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class PlayerUpdatedMessage extends Message {
    static typeId = MessageSchemas.playerUpdatedMessage.typeId;

    playerId = "";
    iconChanged = false;
    usernameChanged = false;
    contentChanged = false;

    setPlayerId(playerId) {
        this.playerId = playerId;
    }

    getPlayerId() {
        return this.playerId;
    }

    setIconChanged(iconChanged) {
        this.iconChanged = iconChanged;
    }

    getIconChanged() {
        return this.iconChanged;
    }

    setUsernameChanged(usernameChanged) {
        this.usernameChanged = usernameChanged;
    }

    getUsernameChanged() {
        return this.usernameChanged;
    }

    setContentChanged(contentChanged) {
        this.contentChanged = contentChanged;
    }

    getContentChanged() {
        return this.contentChanged;
    }

    _toObject() {
        return {
            playerId: this.playerId,
            iconChanged: this.iconChanged,
            usernameChanged: this.usernameChanged,
            contentChanged: this.contentChanged
        };
    }

    _fromObject(object) {
        this.setPlayerId(object.playerId);
        this.setIconChanged(object.iconChanged);
        this.setUsernameChanged(object.usernameChanged);
        this.setContentChanged(object.contentChanged);
    }
}
