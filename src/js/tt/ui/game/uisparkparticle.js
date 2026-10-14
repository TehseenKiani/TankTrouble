export class UISparkParticle extends Phaser.Particle {
    constructor(game, x, y, key, frame) {
        // Call super.
        super(game, x, y, key, frame);

        this.fadeSpeed = 0.02 - (Math.random() * 0.01);

        // Kill particle.
        this.kill();
    }

    update() {
        this.alpha -= this.fadeSpeed;
    }

    retire() {
        // Kill particle.
        this.kill();
    }
}
