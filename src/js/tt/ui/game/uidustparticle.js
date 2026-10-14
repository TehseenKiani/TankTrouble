export class UIDustParticle extends Phaser.Particle {
    constructor(game, x, y, key, frame) {
        // Call super.
        super(game, x, y, key, frame);

        this.fadeSpeed = 0.018 - (Math.random() * 0.009);

        // Kill particle.
        this.kill();
    }

    onEmit() {
        this.body.x += (this.body.velocity.x * ((Math.random() * 6.0) + 1.0)) / 15.0;
        this.body.y += (this.body.velocity.y * ((Math.random() * 6.0) + 1.0)) / 15.0;
    }

    update() {
        this.alpha -= this.fadeSpeed;
        this.scale.x += 0.0083;
        this.scale.y += 0.0083;
    }

    retire() {
        // Kill particle.
        this.kill();
    }
}
