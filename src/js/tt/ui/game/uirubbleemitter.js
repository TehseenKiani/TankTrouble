import { UIConstants } from "../uiconstants.js";
import { UIDustParticle } from "./uidustparticle.js";

export class UIRubbleEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 100);

        this.particleClass = UIDustParticle;
        this.makeParticles("game", ["dust0", "dust1", "dust2"]);

        this.particleDrag.setTo(300, 300);
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

    emit(x, y, rotation, speed) {
        this.revive();
        this.visible = true;

        let speedX = Math.sin(rotation) * speed; // Normally it would be Math.cos(rotation), but the tank graphics is rotated 90 degrees CCW
        let speedY = -Math.cos(rotation) * speed; // Normally it would be Math.sin(rotation), but the tank graphics is rotated 90 degrees CCW

        speedX *= -UIConstants.RUBBLE_SMOKE_SPEED_SCALE;
        speedY *= -UIConstants.RUBBLE_SMOKE_SPEED_SCALE;

        // Offset particle to either left or right tread.
        if (Math.random() < 0.5) {
            x += Math.cos(rotation) * -UIConstants.RUBBLE_TREAD_OFFSET * 0.5;
            y += Math.sin(rotation) * -UIConstants.RUBBLE_TREAD_OFFSET * 0.5;
        } else {
            x += Math.cos(rotation) * UIConstants.RUBBLE_TREAD_OFFSET * 0.5;
            y += Math.sin(rotation) * UIConstants.RUBBLE_TREAD_OFFSET * 0.5;
        }

        this.minParticleSpeed.setTo(speedX - UIConstants.RUBBLE_SMOKE_RANDOM_SPEED, speedY - UIConstants.RUBBLE_SMOKE_RANDOM_SPEED);
        this.maxParticleSpeed.setTo(speedX + UIConstants.RUBBLE_SMOKE_RANDOM_SPEED, speedY + UIConstants.RUBBLE_SMOKE_RANDOM_SPEED);
        this.emitX = x;
        this.emitY = y;
        this.emitParticle();
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
