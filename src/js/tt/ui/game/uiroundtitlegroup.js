import { UIConstants } from "../uiconstants.js";

export class UIRoundTitleGroup extends Phaser.Group {
    constructor(game, gameController) {
        // Call super.
        super(game, null);

        this.gameController = gameController;

        this.title = this.addChild(new Phaser.Text(game, 0, -UIConstants.ROUND_TITLE_SPACING / 2.0, "", { font: `${UIConstants.ROUND_TITLE_FONT_SIZE}px TankTrouble`, fontWeight: "bold", fill: "#ffffff", stroke: "#000000", strokeThickness: UIConstants.ROUND_TITLE_STROKE_WIDTH }));
        this.title.anchor.setTo(0.5, 0.5);

        this.title.kill();

        this.subtitle = this.addChild(new Phaser.Text(game, 0, UIConstants.ROUND_TITLE_SPACING / 2.0, "", { font: `${UIConstants.ROUND_RANKED_FONT_SIZE}px TankTrouble`, fontWeight: "bold", fill: "#e00000", stroke: "#000000", strokeThickness: UIConstants.ROUND_TITLE_STROKE_WIDTH }));
        this.subtitle.anchor.setTo(0.5, 0.5);

        this.subtitle.kill();

        this.exists = false;
        this.visible = false;
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.update();
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    spawn(title, subtitle) {
        // Revive and place the group.
        this.exists = true;
        this.visible = true;

        this.title.revive();
        this.title.text = title;
        this.title.scale.set(0.0, 0.0);

        if (subtitle !== "") {
            this.subtitle.revive();
            this.subtitle.text = subtitle;
            this.subtitle.scale.set(0.0, 0.0);
        } else {
            this.subtitle.kill();
        }

        this.removeEvent = this.game.time.events.add(UIConstants.ROUND_TITLE_DISPLAY_TIME, this.remove, this);

        this.game.add.tween(this.title.scale).to({ x: 1.0, y: 1.0 }, 300, Phaser.Easing.Back.Out, true);
        if (subtitle !== "") {
            this.game.add.tween(this.subtitle.scale).to({ x: 1.0, y: 1.0 }, 300, Phaser.Easing.Back.Out, true);
        }
    }

    remove() {
        this.removeEvent = null;

        // Animate title and ranked away.
        this.game.add.tween(this.title.scale).to({ x: 0.0, y: 0.0 }, 100, Phaser.Easing.Linear.None, true).onComplete.add(
            () => {
                this.title.kill();
                this.title.exists = false;
                this.title.visible = false;
            },
            this.title
        );

        this.game.add.tween(this.subtitle.scale).to({ x: 0.0, y: 0.0 }, 100, Phaser.Easing.Linear.None, true).onComplete.add(
            () => {
                // Kill the sprite.
                this.subtitle.kill();
            },
            this.subtitle
        );
    }

    retire() {
        if (this.removeEvent) {
            this.game.time.events.remove(this.removeEvent);
        }

        this.title.kill();
        this.subtitle.kill();

        // Kill the group.
        this.exists = false;
        this.visible = false;
    }
}
