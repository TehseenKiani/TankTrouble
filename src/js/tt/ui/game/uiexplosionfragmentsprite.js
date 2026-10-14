import { Constants } from "../../constants.js";
import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UIExplosionFragmentSprite extends Phaser.Sprite {
    constructor(game) {
        const randomFragmentIndex = Math.floor(Math.random() * 10);

        // Call super.
        super(game, 0, 0, "game", `fragment${randomFragmentIndex}`);

        // Set up UI Physics body.
        this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.damping = 0.25;
        this.body.angularDamping = 0.25;
        this.body.onBeginContact.add(this._hitSomething, this);

        this.body.clearShapes();
        this.body.loadPolygon("game-physics", `fragment${randomFragmentIndex}`);

        this.body.setMaterial(UIUtils.fragmentMaterial);
        this.body.clearCollision();
        this.body.setCollisionGroup(UIUtils.fragmentCollisionGroup);

        // Disable fragment.
        this.kill();
    }

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        this.timeAlive += this.game.time.delta / 1000;

        if (!this.colliding && this.timeAlive > UIConstants.EXPLOSION_FRAGMENT_COLLISION_TIME) {
            // Set collision.
            this.colliding = true;
            this.body.collides([UIUtils.wallCollisionGroup, UIUtils.tankCollisionGroup, UIUtils.crateCollisionGroup, UIUtils.shieldCollisionGroup, UIUtils.spawnCollisionGroup]);
        }

        if (!this.fading && this.timeAlive > this.lifetime) {
            // Start fading out.
            this.fading = true;
        }

        if (this.fading) {
            this.alpha = Math.max(0.0, this.alpha - 0.025);
        }

        // Disable when all faded out.
        if (this.alpha === 0.0) {
            this.kill();
        }
    }

    spawn(x, y, playerId) {
        // Store playerId.
        this.playerId = playerId;

        // Send request for player details.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    if (Math.random() > 0.4) {
                        this.tint = result.getBaseColour().numericValue;
                    } else {
                        this.tint = result.getTurretColour().numericValue;
                    }
                } else {
                    this.tint = UIConstants.TANK_UNAVAILABLE_COLOUR.numericValue;
                }
            });

        // Determine a random direction for the fragment.
        const speed = UIConstants.EXPLOSION_FRAGMENT_MIN_SPEED + (Math.random() * (UIConstants.EXPLOSION_FRAGMENT_MAX_SPEED - UIConstants.EXPLOSION_FRAGMENT_MIN_SPEED));
        const direction = Math.random() * Math.PI * 2.0;
        const speedX = Math.cos(direction) * speed;
        const speedY = Math.sin(direction) * speed;

        x += Math.cos(direction) * (((Math.random() * Constants.TANK.WIDTH.px) / 4.0) + (Constants.TANK.WIDTH.px / 4.0));
        y += Math.sin(direction) * (((Math.random() * Constants.TANK.WIDTH.px) / 4.0) + (Constants.TANK.WIDTH.px / 4.0));

        // Revive and place the sprite.
        this.reset(x, y);
        this.alpha = 1.0;
        this.body.rotation = Math.random() * Math.PI * 2.0;
        this.body.velocity.x = speedX;
        this.body.velocity.y = speedY;
        this.body.angularVelocity = (Math.random() * UIConstants.EXPLOSION_FRAGMENT_MAX_ROTATION_SPEED) - (UIConstants.EXPLOSION_FRAGMENT_MAX_ROTATION_SPEED / 2.0);
        this.body.clearCollision(false);

        // Set state.
        this.timeAlive = 0.0;
        this.lifetime = UIConstants.EXPLOSION_FRAGMENT_MIN_LIFETIME + (Math.random() * (UIConstants.EXPLOSION_FRAGMENT_MAX_LIFETIME - UIConstants.EXPLOSION_FRAGMENT_MIN_LIFETIME));
        this.colliding = false;
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
