import { UIConstants } from "../uiconstants.js";
import { UISprayCanParticle } from "./uispraycanparticle.js";

export class UISprayCanEmitter extends Phaser.Particles.Arcade.Emitter {
    constructor(game) {
        // Call super.
        super(game, 0, 0, 400);

        this.particleClass = UISprayCanParticle;
        this.makeParticles();

        this.minParticleSpeed.setTo(UIConstants.SPRAY_MIN_X_SPEED, UIConstants.SPRAY_MIN_Y_SPEED);
        this.maxParticleSpeed.setTo(UIConstants.SPRAY_MAX_X_SPEED, UIConstants.SPRAY_MAX_Y_SPEED);
        this.particleDrag.setTo(UIConstants.SPRAY_DRAG, UIConstants.SPRAY_DRAG);
        this.setAlpha(0.5, 0.7);
        this.setRotation(0, 0);
        this.minParticleScale = 0.8;
        this.maxParticleScale = 1.0;
        this.gravity = 0;

        // State.
        this.sprayCan = null;

        // Disable emitter.
        this.kill();
        this.visible = false;
    }

    update() {
        // Check if exists.
        if (!this.exists) {
            return;
        }

        // Keep the emitter's position synched with the spray can's position.
        this.x = this.sprayCan.world.x + (this.sprayCan.width * UIConstants.GARAGE_SPRAY_OFFSET_X);
        this.y = this.sprayCan.world.y + (this.sprayCan.height * UIConstants.GARAGE_SPRAY_OFFSET_Y);

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

    spawn(sprayCan, currentEmitter) {
        // Revive and place the sprite.
        this.revive();
        this.visible = true;

        this.sprayCan = sprayCan;
        this.x = this.sprayCan.world.x + (this.sprayCan.width * UIConstants.GARAGE_SPRAY_OFFSET_X);
        this.y = this.sprayCan.world.y + (this.sprayCan.height * UIConstants.GARAGE_SPRAY_OFFSET_Y);

        // Update the colour of the spray.
        UISprayCanParticle.setCurrentEmitter(currentEmitter);
        UISprayCanParticle.setColour(this.game, sprayCan.getColour());

        this.flow(UIConstants.GARAGE_SPRAY_PARTICLE_TIME, 16, 10, (UIConstants.GARAGE_SPRAY_TIME / 16) * 10);
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
