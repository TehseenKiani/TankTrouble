import { UIConstants } from "../uiconstants.js";
import { UIWelderSmokeParticle } from "./uiweldersmokeparticle.js";

export class UIWelderSmokeEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 300);

        this.particleClass = UIWelderSmokeParticle;
        this.makeParticles();

        this.minParticleSpeed.setTo(UIConstants.WELDER_SMOKE_MIN_X_SPEED, UIConstants.WELDER_SMOKE_MIN_Y_SPEED);
        this.maxParticleSpeed.setTo(UIConstants.WELDER_SMOKE_MAX_X_SPEED, UIConstants.WELDER_SMOKE_MAX_Y_SPEED);
        this.particleDrag.setTo(10, 10);
        this.setAlpha(0.5, 0.7);
        this.setRotation(0, 0);
        this.minParticleScale = 0.9;
        this.maxParticleScale = 1.1;
        this.gravity = 0;

        // State.
        this.emitterPointsOld = null;
        this.emitterPointsNew = null;
        this.tankIcon = null;

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

        // Update the spark colour of the welder smoke.
        UIWelderSmokeParticle.updateSpark(this.game);

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

    spawn(tankIcon, emitterPointsOld, emitterPointsNew) {
        // Revive and place the sprite.
        this.revive();

        this.emitterPointsOld = emitterPointsOld;
        this.emitterPointsNew = emitterPointsNew;

        // Update the welder points.
        UIWelderSmokeParticle.setSpawnPoints(tankIcon, this.emitterPointsOld, this.emitterPointsNew);

        this.flow(UIConstants.GARAGE_WELD_PARTICLE_TIME, 16, 5, (UIConstants.GARAGE_WELD_SMOKE_TIME / 16) * 5);
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
