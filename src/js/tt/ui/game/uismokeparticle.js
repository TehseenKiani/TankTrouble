export class UISmokeParticle extends Phaser.Particle {
    constructor(game, x, y, key, frame) {
        // Call super.
        super(game, x, y, key, frame);

        this.fadeSpeed = 0.025 - (Math.random() * 0.0166);

        // Kill particle.
        this.kill();
    }

    onEmit() {
        this.body.x += (this.body.velocity.x * ((Math.random() * 6.0) + 1.0)) / 15.0;
        this.body.y += (this.body.velocity.y * ((Math.random() * 6.0) + 1.0)) / 15.0;
        this.realAlpha = this.alpha;
        this.fadeInAlpha = 0.1;
    }

    update() {
        this.realAlpha -= this.fadeSpeed;
        this.fadeInAlpha += 0.1;
        this.alpha = Math.min(this.fadeInAlpha, this.realAlpha);
        this.scale.x += 0.0140;
        this.scale.y += 0.0140;
    }

    retire() {
        // Kill particle.
        this.kill();
    }
}
