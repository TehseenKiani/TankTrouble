import { UIConfettiParticle } from "./uiconfettiparticle.js";
import { UIConstants } from "../uiconstants.js";

export class UIConfettiEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 100);

        this.particleClass = UIConfettiParticle;
        this.makeParticles();

        this.minParticleSpeed.setTo(UIConstants.CONFETTI_MIN_X_SPEED, UIConstants.CONFETTI_MIN_Y_SPEED);
        this.maxParticleSpeed.setTo(UIConstants.CONFETTI_MAX_X_SPEED, UIConstants.CONFETTI_MAX_Y_SPEED);
        this.particleDrag.setTo(UIConstants.CONFETTI_DRAG, UIConstants.CONFETTI_DRAG);
        this.setAlpha(0.6, 0.8);
        this.setRotation(-120, 120);
        this.minParticleScale = 0.5;
        this.maxParticleScale = 1.0;
        this.gravity = UIConstants.CONFETTI_GRAVITY;

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

        this.explode(6500, 100);
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
