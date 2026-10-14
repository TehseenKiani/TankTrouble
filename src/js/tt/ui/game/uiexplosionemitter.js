import { UIExplosionParticle } from "./uiexplosionparticle.js";

export class UIExplosionEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 5);

        this.particleClass = UIExplosionParticle;
        this.makeParticles("game", ["explosion0", "explosion1", "explosion2"]);

        this.minParticleSpeed.setTo(-120, -120);
        this.maxParticleSpeed.setTo(120, 120);
        this.particleDrag.setTo(80, 80);
        this.setAlpha(0.8, 1.0);
        this.setRotation(-100, 100);
        this.minParticleScale = 0.8;
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

    spawn(x, y, smokeCount) {
        // Revive and place the sprite.
        this.revive();
        this.visible = true;
        this.x = x;
        this.y = y;
        this.explode(3200, smokeCount);
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
