import { UISmokeParticle } from "./uismokeparticle.js";

export class UISmokeEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game, targetSprite) {
        // Call super.
        super(game, 0, 0, 15);

        this.targetSprite = targetSprite;

        this.particleClass = UISmokeParticle;
        this.makeParticles("game", ["smoke0", "smoke1", "smoke2"]);

        this.minParticleSpeed.setTo(-40, -40);
        this.maxParticleSpeed.setTo(40, 40);
        this.particleDrag.setTo(50, 50);
        this.setAlpha(0.85, 1.0);
        this.setRotation(0, 0);
        this.minParticleScale = 0.66;
        this.maxParticleScale = 1.0;
        this.gravity = 0;

        // Disable emitter.
        this.kill();
        this.visible = false;
    }

    preUpdate() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return false;
        }

        // Call super.
        return super.preUpdate();
    }

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        // Call super.
        super.update();

        // Update position.
        this.x = this.targetSprite.x;
        this.y = this.targetSprite.y;

        if (this.on && !this.targetSprite.exists) {
            this.on = false;
        } else if (this.on && this.targetSprite.exists && this.targetSprite.alpha < 1.0) {
            this.setAlpha(0.85 * this.targetSprite.alpha, 1.0 * this.targetSprite.alpha);
        }

        // Disable when all children are dead.
        if (this.countLiving() === 0) {
            this.kill();
            this.visible = false;
        }
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    spawn(x, y) {
        // Revive and place the sprite.
        this.revive();
        this.visible = true;
        this.x = x;
        this.y = y;
        this.setAlpha(0.85, 1.0);
        this.explode(2000, 1); // Spawn a single particle to ensure that countLiving() in update does not return 0 right away.
        this.start(false, 2000, 134, 0, false);
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
