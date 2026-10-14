import { UIConstants } from "../uiconstants.js";
import { UIWelderSparkParticle } from "./uiweldersparkparticle.js";

export class UIWelderSparkEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 100);

        this.particleClass = UIWelderSparkParticle;
        this.makeParticles();

        this.minParticleSpeed.setTo(UIConstants.WELDER_SPARK_MIN_X_SPEED, UIConstants.WELDER_SPARK_MIN_Y_SPEED);
        this.maxParticleSpeed.setTo(UIConstants.WELDER_SPARK_MAX_X_SPEED, UIConstants.WELDER_SPARK_MAX_Y_SPEED);
        // this.particleDrag.setTo(50, 50);
        this.setAlpha(0.5, 1.0);
        this.setRotation(0, 0);
        this.minParticleScale = 0.7;
        this.maxParticleScale = 1.0;
        this.gravity = 500;

        // State.
        this.emitterPointsOld = null;
        this.emitterPointsNew = null;
        this.floor = null;

        // Disable emitter.
        this.kill();
        this.visible = false;
    }

    update() {
        // Check if exists.
        if (!this.exists) {
            return;
        }

        // Call super.
        super.update();

        this.game.physics.arcade.collide(this, this.floor);

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

    spawn(tankIcon, floor, emitterPointsOld, emitterPointsNew) {
        // Revive and place the sprite.
        this.revive();
        this.visible = true;

        this.floor = floor;
        this.emitterPointsOld = emitterPointsOld;
        this.emitterPointsNew = emitterPointsNew;

        // Update the welder points.
        UIWelderSparkParticle.setSpawnPoints(tankIcon, this.emitterPointsOld, this.emitterPointsNew);

        this.flow(UIConstants.GARAGE_WELD_PARTICLE_TIME, 16, 1, UIConstants.GARAGE_WELD_SPARK_TIME / 16);
    }

    remove() {
        this.on = false;
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
