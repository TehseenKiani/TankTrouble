import { UIConstants } from "../uiconstants.js";

export class UICounterTimerGroup extends Phaser.Group {
    constructor(game, gameController) {
        // Call super.
        super(game, null);

        this.gameController = gameController;

        this.time = this.addChild(new Phaser.Text(game, 0, 0, "0", { font: `${UIConstants.TIMER_FONT_SIZE}px TankTrouble`, fontWeight: "bold", fill: "#ffffff", stroke: "#000000", strokeThickness: UIConstants.TIMER_STROKE_WIDTH }));
        this.time.anchor.setTo(0.5, 0.5);
        this.time.kill();

        this.exists = false;
        this.visible = false;
    }

    update() {
        // Check if exists.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        const counter = this.gameController.getCounter(this.counterId);
        if (counter) {
            const currentSeconds = Math.floor(counter.getField("currentTime"));
            if (currentSeconds <= 10 && this.oldSeconds !== currentSeconds) {
                this.time.tint = 0xff0000 + (currentSeconds * 0x001919);
                this.time.scale.setTo(UIConstants.TIMER_EMPHASISE_SCALE, UIConstants.TIMER_EMPHASISE_SCALE);
                this.game.add.tween(this.time.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
            } else if (this.oldSeconds !== currentSeconds) {
                this.time.scale.setTo(UIConstants.TIMER_COUNT_SCALE, UIConstants.TIMER_COUNT_SCALE);
                this.game.add.tween(this.time.scale).to({ x: 1.0, y: 1.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
            }

            this.time.setText(currentSeconds);

            this.oldSeconds = currentSeconds;
        }
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    spawn(x, y, counterId, animate) {
        // Revive and place the group.
        this.exists = true;
        this.visible = true;
        this.x = x;
        this.y = y;

        this.time.revive();
        this.time.tint = 0xffffff;

        // Reset state.
        this.counterId = counterId;

        const counter = this.gameController.getCounter(this.counterId);
        if (counter) {
            const currentSeconds = Math.floor(counter.getField("currentTime"));
            if (currentSeconds <= 10) {
                this.time.tint = 0xff0000 + (currentSeconds * 0x001919);
            }
            this.time.setText(currentSeconds);
        }

        if (this.removeTween) {
            this.removeTween.stop();
            this.removeTween = null;
        }

        if (animate) {
            this.scale.setTo(0.0, 0.0);
            this.spawnTween = this.game.add.tween(this.scale).to({ x: UIConstants.ASSET_SCALE, y: UIConstants.ASSET_SCALE }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true);
        } else {
            this.scale.setTo(UIConstants.ASSET_SCALE, UIConstants.ASSET_SCALE);
        }
    }

    getPlayerId() {
        return null;
    }

    remove() {
        if (this.spawnTween) {
            this.spawnTween.stop();
            this.spawnTween = null;
        }

        this.removeTween = this.game.add.tween(this.scale).to({ x: 0, y: 0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        this.removeTween.onComplete.add(
            () => {
                this.time.kill();

                // Kill the group.
                this.exists = false;
                this.visible = false;
            },
            this
        );
    }

    retire() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        this.time.kill();

        // Kill the group.
        this.exists = false;
        this.visible = false;
    }
}
