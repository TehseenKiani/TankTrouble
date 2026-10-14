import { QualityManager } from "../../../qualitymanager.js";
import { UIDustParticle } from "./uidustparticle.js";

export class UIDustEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 40);

        this.particleClass = UIDustParticle;
        this.makeParticles("game", ["dust0", "dust1", "dust2"]);

        this.minParticleSpeed.setTo(-95, -95);
        this.maxParticleSpeed.setTo(95, 95);
        this.particleDrag.setTo(50, 50);
        this.setAlpha(0.8, 1.0);
        this.setRotation(0, 0);
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

    spawn(x, y) {
        // Revive and place the sprite.
        this.revive();
        this.visible = true;
        this.x = x;
        this.y = y;
        this.explode(2000, QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.CRATE_LAND_DUST_COUNT));
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
