import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UIMineSprite extends Phaser.Sprite {
    constructor(game, gameController, activateSound, tripSound, detonateSound) {
        // Call super.
        super(game, 0, 0, "game", "mine");

        this.activateSound = activateSound;
        this.tripSound = tripSound;
        this.detonateSound = detonateSound;

        this.anchor.setTo(0.5, 0.5);

        this.gameController = gameController;

        this.glow = this.addChild(new Phaser.Image(game, 0, 0, "game", "mineGlow"));
        this.glow.anchor.setTo(0.5, 0.5);
        this.glow.alpha = 0.0;

        // Disable mine.
        this.kill();
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Update position from game model.
        const trap = this.gameController.getTrap(this.trapId);
        if (trap) {
            this.x = UIUtils.mpx(trap.getX());
            this.y = UIUtils.mpx(trap.getY());

            const speedX = trap.getSpeedX();
            const speedY = trap.getSpeedY();

            if ((speedX * speedX) + (speedY * speedY) > 0) {
                this.rotation = Math.atan2(speedY, speedX) - (Math.PI * 0.5);
            }
        }
    }

    spawn(x, y, trapId, playerId, activated, tripped) {
        // Revive and place the sprite.
        this.reset(x, y);
        this.alpha = 1.0;

        // Turn off glow.
        this.glow.alpha = 0.0;

        // Store trapId and playerId.
        this.trapId = trapId;
        this.playerId = playerId;

        // Send request for player details.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.tint = result.getTurretColour().numericValue;
                } else {
                    this.tint = UIConstants.TANK_UNAVAILABLE_COLOUR.numericValue;
                }
            });

        // Set initial state.
        if (tripped) {
            this.glowTween = this.game.add.tween(this.glow).to({ alpha: 1.0 }, 100, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
        } else if (activated) {
            this.alpha = 0.0;
        }
    }

    activate() {
        this.activateSound.play();
        this.fadeTween = this.game.add.tween(this).to({ alpha: 0.0 }, 500, Phaser.Easing.Linear.None, true, 1000);
        this.glowTween = this.game.add.tween(this.glow).to({ alpha: 1.0 }, 200, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
    }

    trip() {
        if (this.glowTween) {
            this.glowTween.stop();
        }

        if (this.fadeTween) {
            this.fadeTween.stop();
        }

        this.activateSound.stop();

        this.tripSound.play();
        this.fadeTween = this.game.add.tween(this).to({ alpha: 1.0 }, 100, Phaser.Easing.Linear.None, true);
        this.glow.alpha = 0.0;
        this.glowTween = this.game.add.tween(this.glow).to({ alpha: 1.0 }, 100, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
    }

    detonate() {
        this.detonateSound.play();
    }

    remove() {
        if (this.glowTween) {
            this.glowTween.stop();
        }
        if (this.fadeTween) {
            this.fadeTween.stop();
        }

        this.detonateSound.stop();

        // Kill the sprite.
        this.kill();
    }

    retire() {
        if (this.glowTween) {
            this.glowTween.stop();
        }
        if (this.fadeTween) {
            this.fadeTween.stop();
        }

        // Kill the sprite.
        this.kill();
    }
}
