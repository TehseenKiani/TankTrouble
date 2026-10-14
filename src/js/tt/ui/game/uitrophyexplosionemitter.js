import { UIConstants } from "../uiconstants.js";
import { UITrophyExplosionParticle } from "./uitrophyexplosionparticle.js";

export class UITrophyExplosionEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 80);

        this.particleClass = UITrophyExplosionParticle;
        this.makeParticles("celebration", ["explosion0", "explosion1", "explosion2"]);

        this.minParticleSpeed.setTo(UIConstants.TROPHY_EXPLOSION_MIN_X_SPEED, UIConstants.TROPHY_EXPLOSION_MIN_Y_SPEED);
        this.maxParticleSpeed.setTo(UIConstants.TROPHY_EXPLOSION_MAX_X_SPEED, UIConstants.TROPHY_EXPLOSION_MAX_Y_SPEED);
        this.particleDrag.setTo(UIConstants.TROPHY_EXPLOSION_DRAG_X, UIConstants.TROPHY_EXPLOSION_DRAG_Y);
        this.setAlpha(0.8, 1.0);
        this.setRotation(-60, 60);
        this.minParticleScale = 0.7;
        this.maxParticleScale = 1.0;
        this.gravity = 0;

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
        this.explode(2500, 80);
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
