import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class ProjectileTimeoutMessage extends Message {
    static typeId = MessageSchemas.projectileTimeoutMessage.typeId;

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
