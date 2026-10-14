import { Constants } from "../../constants.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UICrateSprite extends Phaser.Sprite {
    constructor(game, gameController, dustEmitter) {
        // Call super.
        super(game, 0, 0, "game", "crate0-0");

        this.gameController = gameController;
        this.dustEmitter = dustEmitter;

        // Set up UI Physics body.
        this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.kinematic = true;
        this.body.setRectangle(Constants.CRATE.WIDTH.px, Constants.CRATE.HEIGHT.px);
        this.body.setCollisionGroup(UIUtils.crateCollisionGroup);
        this.body.collides([UIUtils.fragmentCollisionGroup, UIUtils.crateCollisionGroup]);

        // State.
        this.theme = 0;
        this.contentFrame = 0;

        // Disable crate.
        this.kill();
    }

    setTheme(theme) {
        this.theme = theme;
        this.frameName = `crate${this.theme}-${this.contentFrame}`;
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Update position from game model.
        const crate = this.gameController.getCollectible(this.crateId);
        if (crate) {
            this.smoothedX = (this.body.x + UIUtils.mpx(crate.getX())) / 2.0;
            this.smoothedY = (this.body.y + UIUtils.mpx(crate.getY())) / 2.0;
            this.smoothedRotation = (this.body.rotation + crate.getRotation()) / 2.0;
        }

        this.body.x = this.smoothedX;
        this.body.y = this.smoothedY;
        this.body.rotation = this.smoothedRotation;
    }

    spawn(x, y, rotation, contentFrame, crateId, animate) {
        // Store contentFrame.
        this.contentFrame = contentFrame;

        // Revive and place the sprite.
        this.reset(x, y);
        this.frameName = `crate${this.theme}-${this.contentFrame}`;
        this.body.rotation = rotation;
        this.scale.setTo(1.0, 1.0);

        this.smoothedX = x;
        this.smoothedY = y;
        this.smoothedRotation = rotation;

        if (animate) {
            this.game.sound.play("crateSpawn");

            this.scale.setTo(0.01, 0.01);
            this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.CRATE_SPAWN_TIME, UIUtils.easingCubicBezier(0.01, 1.5, 1.5, 1), true);
            this.spawnTween.onComplete.add(
                () => {
                    this.game.sound.play("crateLand");
                    this.dustEmitter.spawn(this.x, this.y);
                },
                this
            );
        }

        // Store crateId.
        this.crateId = crateId;
    }

    getExtraPositionInfo() {
        return null;
    }

    remove() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        // Kill the sprite.
        this.kill();
    }

    retire() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        // Kill the sprite.
        this.kill();
    }
}
