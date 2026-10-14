import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UIScoreExplosionFragmentSprite extends Phaser.Sprite {
    constructor(game) {
        const randomFragmentIndex = Math.floor(Math.random() * 9);

        // Call super.
        super(game, 0, 0, "playerpanel", `fragment${randomFragmentIndex}`);

        // Set up UI Physics body.
        this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.onBeginContact.add(this._hitSomething, this);

        this.body.clearShapes();
        this.body.loadPolygon("playerpanel-physics", `fragment${randomFragmentIndex}`);

        this.body.setMaterial(UIUtils.scoreFragmentMaterial);
        this.body.setCollisionGroup(UIUtils.scoreFragmentCollisionGroup);
        this.body.collides([UIUtils.playerPanelFloorCollisionGroup]);
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

    spawn(x, y, width) {
        // Determine a random direction for the fragment.
        const speed = UIConstants.SCORE_FRAGMENT_MIN_SPEED + (Math.random() * (UIConstants.SCORE_FRAGMENT_MAX_SPEED - UIConstants.SCORE_FRAGMENT_MIN_SPEED));
        const direction = UIConstants.SCORE_FRAGMENT_MIN_ANGLE + (Math.random() * (UIConstants.SCORE_FRAGMENT_MAX_ANGLE - UIConstants.SCORE_FRAGMENT_MIN_ANGLE));
        const speedX = Math.cos(direction) * speed;
        const speedY = Math.sin(direction) * speed;

        x += (width * Math.random()) - (width / 2);
        y += speedY * 0.1;

        // Revive and place the sprite.
        this.reset(x, y);
        this.alpha = 1.0;
        this.body.rotation = Math.random() * Math.PI * 2.0;
        this.body.velocity.x = speedX;
        this.body.velocity.y = speedY;
        this.body.angularVelocity = (Math.random() * UIConstants.SCORE_FRAGMENT_MAX_ROTATION_SPEED) - (UIConstants.SCORE_FRAGMENT_MAX_ROTATION_SPEED / 2.0);

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
