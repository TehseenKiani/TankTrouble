import { UIUtils } from "../uiutils.js";

export class UITankFeatherSprite extends Phaser.Sprite {
    constructor(game) {
        // Call super.
        super(game, 0, 0, "game", `feather${Math.floor(Math.random() * 4)}`);

        // Disable feather.
        this.kill();
    }

    spawn(x, y) {
        // Revive and place the sprite.
        this.reset(x, y);

        // Set up UI Physics body.
        this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.dynamic = true;
        this.body.fixedRotation = false;
        this.body.damping = 0.94;
        this.body.angularDamping = 0.8;

        this.alpha = 1.0;
        this.scale.set(1.0 + (Math.random() * 0.2));
        this.body.setRectangle(this.width * 0.4, this.height);
        //this.body.setCircle(this.width * 0.5);
        //this.body.clearShapes();
        //this.body.addPolygon({}, points);

        this.body.setMaterial(UIUtils.puffMaterial);
        this.body.setCollisionGroup(UIUtils.puffCollisionGroup);
        this.body.collides(UIUtils.wallCollisionGroup);
        const speed = (Math.random() * 400.0) - 200.0;
        const direction = Math.random() * 2.0 * Math.PI;
        this.body.velocity.x = Math.cos(direction) * speed;
        this.body.velocity.y = Math.sin(direction) * speed;
        this.body.rotation = Math.random() * 2.0 * Math.PI;
        this.body.angularVelocity = (Math.random() * 10.0) - 5.0;
    }

    update() {
        // Check if game is frozen.
        if (this.game.physics.arcade.isPaused) {
            return;
        }

        if (!this.exists) {
            return;
        }

        // Call super.
        super.update();

        if (Math.abs(this.body.velocity.x) < 0.1 && Math.abs(this.body.velocity.y) < 0.1) {
            this.alpha = Math.max(0.0, this.alpha - (0.03 - (Math.random() * 0.0083)));
        }

        if (this.alpha === 0.0) {
            this.kill();
        }
    }

    retire() {
        // Kill sprite.
        this.kill();
    }
}
