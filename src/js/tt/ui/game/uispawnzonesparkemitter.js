import { UIConstants } from "../uiconstants.js";
import { UISparkParticle } from "./uisparkparticle.js";

export class UISpawnZoneSparkEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 100);

        this.particleClass = UISparkParticle;
        this.makeParticles("game", ["spawnSpark0", "spawnSpark1"]);

        this.particleDrag.setTo(100, 100);
        this.setAlpha(0.6, 0.8);
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

    emit(radius, speedModifier, count) {
        this.revive();
        this.visible = true;

        const rotation = Math.random() * 2 * Math.PI;
        const speedX = Math.cos(rotation) * UIConstants.SPAWN_ZONE_SPARK_SPEED * speedModifier;
        const speedY = Math.sin(rotation) * UIConstants.SPAWN_ZONE_SPARK_SPEED * speedModifier;
        const posX = Math.cos(rotation) * radius;
        const posY = Math.sin(rotation) * radius;

        this.minParticleSpeed.setTo(speedX - UIConstants.SPAWN_ZONE_SPARK_RANDOM_SPEED, speedY - UIConstants.SPAWN_ZONE_SPARK_RANDOM_SPEED);
        this.maxParticleSpeed.setTo(speedX + UIConstants.SPAWN_ZONE_SPARK_RANDOM_SPEED, speedY + UIConstants.SPAWN_ZONE_SPARK_RANDOM_SPEED);
        this.emitX = posX;
        this.emitY = posY;

        this.explode(1200, count);
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
