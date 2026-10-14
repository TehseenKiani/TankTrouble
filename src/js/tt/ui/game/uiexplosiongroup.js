import { UIExplosionEmitter } from "./uiexplosionemitter.js";

//FIXME Maybe collect sounds in a wrapper object.
export class UIExplosionGroup extends Phaser.Group {
    constructor(game) {
        // Call super.
        super(game, null);

        // Create smoke emitter.
        this.emitter = this.add(new UIExplosionEmitter(game));

        // Disable explosion.
        this.exists = false;
        this.visible = false;
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.update();

        // Disable when all children are dead.
        if (this.countLiving() === 0) {
            this.exists = false;
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

    spawn(x, y, sound, smokeCount) {
        sound.play();

        // Revive and place the sprite.
        this.exists = true;
        this.visible = true;
        this.emitter.spawn(x, y, smokeCount);
    }

    retire() {
        this.exists = false;
        this.visible = false;
        this.emitter.retire();
    }
}
