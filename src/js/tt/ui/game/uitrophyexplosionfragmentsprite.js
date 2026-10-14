import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UITrophyExplosionFragmentSprite extends Phaser.Sprite {
    constructor(game, prefix, addNumericSuffix, fragmentCount) {
        let randomFragmentIndex = "";
        if (addNumericSuffix) {
            randomFragmentIndex = Math.floor(Math.random() * fragmentCount);
        }

        // Call super.
        super(game, 0, 0, "celebration", prefix + randomFragmentIndex);

        // Set up UI Physics body.
        this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.onBeginContact.add(this._hitSomething, this);

        this.body.clearShapes();
        this.body.loadPolygon("celebration-physics", prefix + randomFragmentIndex);

        this.body.setMaterial(UIUtils.trophyFragmentMaterial);
        this.body.setCollisionGroup(UIUtils.trophyFragmentCollisionGroup);
        this.body.collides([UIUtils.gameFloorCollisionGroup]);
        this.body.collideWorldBounds = false;

        // Disable fragment.
        this.kill();
    }

    update() {
        // Check if exists.
        if (!this.exists) {
            return;
        }

        if (this.fading) {
            this.alpha = Math.max(0.0, this.alpha - 0.025);
        }

        // Disable when all faded out.
        if (this.alpha === 0.0) {
            this.kill();
        }
    }

    spawn(x, y, width, height, randomiseRotation) {
        // Determine a random direction for the fragment.
        const speed = UIConstants.TROPHY_FRAGMENT_MIN_SPEED + (Math.random() * (UIConstants.TROPHY_FRAGMENT_MAX_SPEED - UIConstants.TROPHY_FRAGMENT_MIN_SPEED));
        const direction = UIConstants.TROPHY_FRAGMENT_MIN_ANGLE + (Math.random() * (UIConstants.TROPHY_FRAGMENT_MAX_ANGLE - UIConstants.TROPHY_FRAGMENT_MIN_ANGLE));
        const dirX = Math.cos(direction);
        const dirY = Math.sin(direction);
        const speedX = dirX * speed;
        const speedY = dirY * speed;

        x += Math.random() * dirX * width;
        y += Math.random() * dirY * height;

        // Revive and place the sprite.
        this.reset(x, y);
        this.alpha = 1.0;
        if (randomiseRotation) {
            this.body.rotation = Math.random() * Math.PI * 2.0;
        }
        this.body.velocity.x = speedX;
        this.body.velocity.y = speedY;
        this.body.angularVelocity = (Math.random() * UIConstants.TROPHY_FRAGMENT_MAX_ROTATION_SPEED) - (UIConstants.TROPHY_FRAGMENT_MAX_ROTATION_SPEED / 2.0);

        // Set state.
        this.fading = false;
    }

    retire() {
        // Kill the sprite.
        this.kill();
    }

    _hitSomething(body, shapeA, shapeB, equation) {
        // Start fading out.
        this.fading = true;
    }
}
