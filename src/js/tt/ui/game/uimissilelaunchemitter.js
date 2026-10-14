import { MathUtils } from "../../mathutils.js";
import { QualityManager } from "../../../qualitymanager.js";
import { UIConstants } from "../uiconstants.js";
import { UISmokeParticle } from "./uismokeparticle.js";

export class UIMissileLaunchEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 40);

        this.particleClass = UISmokeParticle;
        this.makeParticles("game", ["smoke0", "smoke1", "smoke2"]);

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

    spawn(x, y, rotation) {
        // Revive and place the sprite.
        this.revive();
        this.visible = true;
        this.x = x;
        this.y = y;

        const speed = -MathUtils.randomRange(UIConstants.MISSILE_LAUNCH_MIN_SPEED, UIConstants.MISSILE_LAUNCH_MAX_SPEED);

        const speedX = Math.sin(rotation) * speed; // Normally it would be Math.cos(rotation), but the tank graphics is rotated 90 degrees CCW
        const speedY = -Math.cos(rotation) * speed; // Normally it would be Math.sin(rotation), but the tank graphics is rotated 90 degrees CCW

        this.minParticleSpeed.setTo(speedX - 65, speedY - 65);
        this.maxParticleSpeed.setTo(speedX + 65, speedY + 65);

        this.explode(2000, QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.MISSILE_LAUNCH_SMOKE_COUNT));
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
