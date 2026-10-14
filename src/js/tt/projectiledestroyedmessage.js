import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class ProjectileDestroyedMessage extends Message {
    static typeId = MessageSchemas.projectileDestroyedMessage.typeId;

    projectileId = "";

    setProjectileId(projectileId) {
        this.projectileId = projectileId;
    }

    getProjectileId() {
        return this.projectileId;
    }

    _toObject() {
        return {
            projectileId: this.projectileId
        };
    }

    _fromObject(object) {
        this.setProjectileId(object.projectileId);
    }
}
