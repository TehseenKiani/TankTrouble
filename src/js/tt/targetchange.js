export class TargetChange {
    projectileId = null;
    targetId = null; // String with id of target

    constructor(projectileId, targetId) {
        this.projectileId = projectileId;
        this.targetId = targetId;
    }

    getProjectileId() {
        return this.projectileId;
    }

    getTargetId() {
        return this.targetId;
    }
}
