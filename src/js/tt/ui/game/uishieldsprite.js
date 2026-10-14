import { ArrayUtils } from "../../arrayutils.js";
import { Constants } from "../../constants.js";
import { QualityManager } from "../../../qualitymanager.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UIShieldSprite extends Phaser.Sprite {
    constructor(game, gameController, activateSound, weakenedSound, endSound) {
        // Call super.
        super(game, 0, 0);

        this.gameController = gameController;
        this.activateSound = activateSound;
        this.weakenedSound = weakenedSound;
        this.endSound = endSound;

        this.layer1Shield = this.addChild(new Phaser.Image(game, 0, 0, "game", "shield"));
        this.layer1Shield.anchor.setTo(0.5, 0.5);

        this.layer2Shield = this.addChild(new Phaser.Image(game, 0, 0, "game", "shield"));
        this.layer2Shield.anchor.setTo(0.5, 0.5);

        this.bolts = [];
        this.boltRotationSpeeds = [];
        const boltFrames = ["shieldBolt0", "shieldBolt1", "shieldBolt2"];
        for (let i = 0; i < UIConstants.SHIELD_BOLT_COUNT; ++i) {
            const bolt = this.addChild(new Phaser.Image(game, 0, 0, "game", "shieldBolt0"));
            bolt.anchor.setTo(0.5, 1.0);
            ArrayUtils.shuffle(boltFrames);
            bolt.animations.add("buzz", boltFrames, 6, false).onComplete.add(
                () => {
                    bolt.kill();
                },
                bolt
            );
            bolt.kill();
            this.boltRotationSpeeds.push((Math.random() > 0.5 ? 1 : -1) * ((Math.random() * (UIConstants.SHIELD_BOLT_MAX_ROTATION_SPEED - UIConstants.SHIELD_BOLT_MIN_ROTATION_SPEED)) + UIConstants.SHIELD_BOLT_MIN_ROTATION_SPEED));
            this.bolts.push(bolt);
        }

        // Set up UI Physics body.
        this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.static = true;
        this.body.setCircle(Constants.SHIELD.RADIUS.px); // FIXME Get radius from upgrade.

        // Disable shield.
        this.kill();
    }

    spawn(playerId, weakened, animate) {
        // Revive sprite.
        this.revive();

        // Store playerId and weakened.
        this.playerId = playerId;
        this.weakened = weakened;

        // Reset collision information.
        this.body.setCollisionGroup(UIUtils.shieldCollisionGroup);
        this.body.collides([UIUtils.fragmentCollisionGroup, UIUtils.rayCollisionGroup]);

        this.alpha = 1.0;

        if (animate) {
            this.scale.setTo(0.0, 0.0);
            this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.SHIELD_SPAWN_TIME, Phaser.Easing.Back.Out, true);
            this.activateSound.play();
        } else {
            this.scale.setTo(1.0, 1.0);
        }

        if (this.weakened) {
            this.weakenedSound.play("", 0, 0.5, true);
        }

        const tank = this.gameController.getTank(this.playerId);
        if (tank) {
            this.body.x = UIUtils.mpx(tank.getX());
            this.body.y = UIUtils.mpx(tank.getY());
        }
    }

    update() {
        // Check if exists or game is frozen.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        this.layer1Shield.rotation += (UIConstants.SHIELD_LAYER_1_ROTATION_SPEED * this.game.time.delta) / 1000;
        this.layer2Shield.rotation += (UIConstants.SHIELD_LAYER_2_ROTATION_SPEED * this.game.time.delta) / 1000;

        const inverseBoltProbability = QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.SHIELD_INVERSE_BOLT_PROBABILITY);
        for (let i = 0; i < this.bolts.length; ++i) {
            const bolt = this.bolts[i];
            bolt.rotation += (this.boltRotationSpeeds[i] * this.game.time.delta) / 1000;
            if (!bolt.exists) {
                if (Math.random() > inverseBoltProbability) {
                    bolt.revive();
                    bolt.rotation = Math.random() * 2 * Math.PI;
                    bolt.animations.play("buzz");
                }
            }
        }

        if (this.weakened && Math.random() > UIConstants.INVERSE_SHIELD_WEAKENED_FLICKER_PROBABILITY) {
            this.alpha = UIConstants.SHIELD_WEAKENED_FLICKER_ALPHA_MIN + (Math.random() * (UIConstants.SHIELD_WEAKENED_FLICKER_ALPHA_MAX - UIConstants.SHIELD_WEAKENED_FLICKER_ALPHA_MIN));
        }

        // Update position from game model.
        const tank = this.gameController.getTank(this.playerId);
        if (tank) {
            this.body.x = UIUtils.mpx(tank.getX());
            this.body.y = UIUtils.mpx(tank.getY());
        }
    }

    getPlayerId() {
        return this.playerId;
    }

    activate() {
    }

    weaken() {
        this.weakened = true;
        this.weakenedSound.play("", 0, 1, true);
    }

    strengthen() {
        this.weakened = false;
        this.weakenedSound.stop();
        this.alpha = 1.0;
    }

    remove() {
        if (this.spawnTween) {
            this.spawnTween.stop();
            this.spawnTween = null;
        }

        this.body.clearCollision();

        this.weakenedSound.stop();
        this.endSound.play();

        this.game.add.tween(this).to({ alpha: 0.0 }, UIConstants.SHIELD_BREAK_TIME, Phaser.Easing.Linear.None, true).onComplete.add(
            () => {
                this.weakenedSound.stop();
                // Kill the sprite.
                this.kill();
            },
            this
        );
    }

    retire() {
        this.weakenedSound.stop();
        // Kill the sprite.
        this.kill();
    }
}
