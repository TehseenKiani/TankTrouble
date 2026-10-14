export class UIScoreExplosionParticle extends Phaser.Particle {
    constructor(game, x, y, key, frame) {
        // Call super.
        super(game, x, y, key, frame);

        // Kill particle.
        this.kill();
    }

    onEmit() {
        this.body.x += (this.body.velocity.x * ((Math.random() * 6.0) + 1.0)) / 15.0;
        this.body.y += (this.body.velocity.y * ((Math.random() * 6.0) + 1.0)) / 15.0;
    }

    update() {
        this.alpha = Math.max(0.0, this.alpha - (0.0094 - (Math.random() * 0.004)));
        this.scale.set(this.scale.x + 0.02, this.scale.y + 0.02);
    }

    retire() {
        // Kill particle.
        this.kill();
    }
}
