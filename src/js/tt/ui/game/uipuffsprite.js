import { UIUtils } from "../uiutils.js";

export class UIPuffSprite extends Phaser.Sprite {
    constructor(game) {
        const randomPuffIndex = Math.floor(Math.random() * 3);

        // Call super.
        super(game, 0, 0, "game", `puff${randomPuffIndex}`);

        // Disable puff.
        this.kill();
    }

    spawn(x, y, speedX, speedY) {
        // Revive and place the sprite.
        this.reset(x, y);

        // Set up UI Physics body.
        this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.dynamic = true;
        this.body.fixedRotation = true;
        this.body.damping = 0.1;

        this.alpha = 0.2 + (Math.random() * (0.3 - 0.2));
        this.scale.set(0.5 + Math.random());
        this.body.setRectangle(this.width, this.height);
        this.body.setMaterial(UIUtils.puffMaterial);
        this.body.setCollisionGroup(UIUtils.puffCollisionGroup);
        this.body.collides(UIUtils.wallCollisionGroup);
        this.body.velocity.x = speedX + (Math.random() * 250.0) - 125.0;
        this.body.velocity.y = speedY + (Math.random() * 250.0) - 125.0;
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Check if game is frozen.
        if (this.game.physics.arcade.isPaused) {
            return;
        }

        // Call super.
        super.update();

        this.alpha = Math.max(0.0, this.alpha - (0.03 - (Math.random() * 0.0083)));
        this.scale.set(this.scale.x + 0.0415, this.scale.y + 0.0415);

        if (this.alpha === 0.0) {
            this.kill();
        }
    }

    retire() {
        // Kill sprite.
        this.kill();
    }
}
