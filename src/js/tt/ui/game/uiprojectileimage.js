import { UIUtils } from "../uiutils.js";

export class UIProjectileImage extends Phaser.Image {
    constructor(game, gameController) {
        // Call super.
        super(game, 0, 0, "game", "");

        this.gameController = gameController;

        this.anchor.setTo(0.5, 0.5);

        // Disable bullet.
        this.kill();
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Update position from game model.
        const projectile = this.gameController.getProjectile(this.projectileId);
        if (projectile) {
            this.x = UIUtils.mpx(projectile.getX());
            this.y = UIUtils.mpx(projectile.getY());
        }
    }

    spawn(x, y, projectileId, frameName) {
        this.frameName = frameName;

        // Revive and place the image.
        this.reset(x, y);

        // Store projectileId.
        this.projectileId = projectileId;
    }

    remove() {
        // Kill the image.
        this.kill();
    }

    retire() {
        // Kill the image.
        this.kill();
    }
}
