export class UIShieldSparkBoltImage extends Phaser.Image {
    constructor(game) {
        const randomBoltIndex = Math.floor(Math.random() * 3);

        // Call super.
        super(game, 0, 0, "game", `shieldSparkBolt${randomBoltIndex}`);

        this.anchor.setTo(0.5, 0.84);

        // Disable bolt.
        this.kill();
    }

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        this.alpha = Math.max(0.0, this.alpha - 0.035);

        // Disable when all faded out.
        if (this.alpha === 0.0) {
            this.kill();
        }
    }

    spawn(x, y, rotation) {
        // Revive and place the sprite.
        this.reset(x, y);
        this.alpha = 1.0;
        this.rotation = rotation + (Math.PI * 0.5); // The bolt graphics is rotated 90 degrees CCW
    }

    retire() {
        // Kill the image.
        this.kill();
    }
}
