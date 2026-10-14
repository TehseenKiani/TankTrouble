import { QualityManager } from "../../../qualitymanager.js";
import { UIConstants } from "../uiconstants.js";
import { UISparkParticle } from "./uisparkparticle.js";

export class UIShieldSparkEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 50);

        this.particleClass = UISparkParticle;
        this.makeParticles("game", ["shieldSpark"]);

        this.particleDrag.setTo(100, 100);
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

    emit(x, y, rotation) {
        this.revive();
        this.visible = true;

        const speedX = Math.cos(rotation) * UIConstants.SHIELD_SPARK_SPEED;
        const speedY = Math.sin(rotation) * UIConstants.SHIELD_SPARK_SPEED;

        this.minParticleSpeed.setTo(speedX - UIConstants.SHIELD_SPARK_RANDOM_SPEED, speedY - UIConstants.SHIELD_SPARK_RANDOM_SPEED);
        this.maxParticleSpeed.setTo(speedX + UIConstants.SHIELD_SPARK_RANDOM_SPEED, speedY + UIConstants.SHIELD_SPARK_RANDOM_SPEED);
        this.emitX = x;
        this.emitY = y;

        this.explode(1000, QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.SHIELD_SPARK_PARTICLES_PER_EMIT));
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
