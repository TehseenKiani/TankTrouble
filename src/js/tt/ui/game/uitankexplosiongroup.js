import { QualityManager } from "../../../qualitymanager.js";
import { UIConstants } from "../uiconstants.js";
import { UIExplosionEmitter } from "./uiexplosionemitter.js";
import { UIExplosionFragmentSprite } from "./uiexplosionfragmentsprite.js";
import { UISmokeEmitter } from "./uismokeemitter.js";

//FIXME Maybe collect sounds in a wrapper object.
export class UITankExplosionGroup extends Phaser.Group {
    constructor(game, tankExplosionSounds) {
        // Call super.
        super(game, null);

        this.tankExplosionSounds = tankExplosionSounds;

        // Create fragment group.
        this.fragmentGroup = this.game.add.group(this);

        // Add pool of fragments and fragment smoke emitters.
        for (let i = 0; i < UIConstants.EXPLOSION_FRAGMENT_COUNT; ++i) {
            const fragmentSprite = new UIExplosionFragmentSprite(game);
            this.fragmentGroup.add(fragmentSprite);
            // Only put smoke emitter on every other fragment.
            if (i % 2) {
                this.fragmentGroup.add(new UISmokeEmitter(game, fragmentSprite));
            }
        }

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
        if (this.countLiving() <= 1 && this.fragmentGroup.countLiving() === 0) {
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

    spawn(x, y, playerId) {
        this.tankExplosionSounds[Math.floor(Math.random() * UIConstants.TANK_EXPLOSION_AUDIO_COUNT)].play();

        // Revive and place the sprite.
        this.exists = true;
        this.visible = true;
        this.emitter.spawn(x, y, QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.TANK_EXPLOSION_SMOKE_COUNT));
        const fragmentCount = QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.TANK_EXPLOSION_FRAGMENT_COUNT);
        for (let i = 0; i < fragmentCount; ++i) {
            this.fragmentGroup.children[i].spawn(x, y, playerId);
        }
    }

    retire() {
        this.exists = false;
        this.visible = false;
        this.emitter.retire();
        this.fragmentGroup.callAll("retire");
    }
}
