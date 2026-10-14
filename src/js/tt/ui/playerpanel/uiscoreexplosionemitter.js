import { UIConstants } from "../uiconstants.js";
import { UIScoreExplosionParticle } from "./uiscoreexplosionparticle.js";

export class UIScoreExplosionEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 60);

        this.particleClass = UIScoreExplosionParticle;
        this.makeParticles("playerpanel", ["smoke0", "smoke1", "smoke2"]);

        this.minParticleSpeed.setTo(UIConstants.SCORE_EXPLOSION_MIN_X_SPEED, UIConstants.SCORE_EXPLOSION_MIN_Y_SPEED);
        this.maxParticleSpeed.setTo(UIConstants.SCORE_EXPLOSION_MAX_X_SPEED, UIConstants.SCORE_EXPLOSION_MAX_Y_SPEED);
        this.particleDrag.setTo(UIConstants.SCORE_EXPLOSION_DRAG, UIConstants.SCORE_EXPLOSION_DRAG);
        this.setAlpha(0.8, 1.0);
        this.setRotation(-100, 100);
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

    spawn(x, y, width) {
        // Revive and place the sprite.
        this.revive();
        this.visible = true;
        this.x = x;
        this.y = y;
        this.width = width;
        this.explode(2500, 60);
    }

    retire() {
        this.kill();
        this.visible = false;
        this.callAll("retire");
    }
}
