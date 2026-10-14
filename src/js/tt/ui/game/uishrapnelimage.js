import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UIShrapnelImage extends Phaser.Image {
    constructor(game, gameController) {
        // Call super.
        super(game, 0, 0, "game", "mineShrapnel");

        this.gameController = gameController;

        this.anchor.setTo(0.5, 0.5);

        // Disable shrapnel.
        this.kill();
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Update rotation.
        this.rotation += (this.rotationSpeed * this.game.time.delta) / 1000;

        // Update position from game model.
        const projectile = this.gameController.getProjectile(this.projectileId);
        if (projectile) {
            this.x = UIUtils.mpx(projectile.getX());
            this.y = UIUtils.mpx(projectile.getY());
        }
    }

    spawn(x, y, projectileId) {
        // Revive and place the image.
        this.reset(x, y);
        this.alpha = 1.0;

        this.rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (UIConstants.MINE_SHRAPNEL_MIN_ROTATION_SPEED + (Math.random() * (UIConstants.MINE_SHRAPNEL_MAX_ROTATION_SPEED - UIConstants.MINE_SHRAPNEL_MIN_ROTATION_SPEED)));

        // Store projectileId.
        this.projectileId = projectileId;
    }

    remove() {
        const projectile = this.gameController.getProjectile(this.projectileId);
        if (projectile) {
            if (projectile.done()) {
                // Fade out the image.
                this.rotationSpeed = 0.0;
                this.fadeOutTween = this.game.add.tween(this).to({ alpha: 0.0 }, 200, Phaser.Easing.Linear.None, true, 0);
                this.fadeOutTween.onComplete.add(() => {
                    this.kill();
                }, this);
            } else {
                // Kill the image.
                this.kill();
            }
        } else {
            // Kill the image.
            this.kill();
        }
    }

    retire() {
        if (this.fadeOutTween) {
            this.fadeOutTween.stop();
        }

        // Kill the image.
        this.kill();
    }
}
