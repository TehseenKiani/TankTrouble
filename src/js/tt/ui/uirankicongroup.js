import { UIConstants } from "./uiconstants.js";
import { UIRankIconSparkleImage } from "./playerpanel/uirankiconsparkleimage.js";
import { UIUtils } from "./uiutils.js";

export class UIRankIconGroup extends Phaser.Group {
    constructor(game) {
        // Call super.
        super(game, null);

        this.rankIcon = this.addChild(new Phaser.Image(game, 0, 0, "ranks", "0"));
        this.rankIcon.anchor.set(0.5, 0.5);
        this.rankIcon.kill();

        this.rankChangeIconLeftHalf = this.addChild(new Phaser.Image(game, 0, 0, "ranks", "0"));
        this.rankChangeIconLeftHalf.anchor.set(0.5, 0.5);
        this.rankChangeIconLeftHalf.kill();

        const rankChangeIconLeftHalfMask = this.rankChangeIconLeftHalf.addChild(new Phaser.Graphics(game, 0, 0));
        rankChangeIconLeftHalfMask.beginFill(0xffffff);
        const scaleX = UIConstants.RANK_ICON_WIDTH / 2.0;
        const scaleY = UIConstants.RANK_ICON_HEIGHT / 2.0;
        rankChangeIconLeftHalfMask.drawPolygon(new Phaser.Polygon([scaleX * -1, scaleY * -1, scaleX * 0, scaleY * -1, scaleX * -0.2, scaleY * -0.25, scaleX * 0.2, scaleY * 0.25, scaleX * 0, scaleY * 1, scaleX * -1, scaleY * 1]));
        this.rankChangeIconLeftHalf.mask = rankChangeIconLeftHalfMask;

        this.rankChangeIconRightHalf = this.addChild(new Phaser.Image(game, 0, 0, "ranks", "0"));
        this.rankChangeIconRightHalf.anchor.set(0.5, 0.5);
        this.rankChangeIconRightHalf.kill();

        const rankChangeIconRightHalfMask = this.rankChangeIconRightHalf.addChild(new Phaser.Graphics(game, 0, 0));
        rankChangeIconRightHalfMask.beginFill(0xffffff);
        rankChangeIconRightHalfMask.drawPolygon(new Phaser.Polygon([scaleX * 1, scaleY * -1, scaleX * 1, scaleY * 1, scaleX * 0, scaleY * 1, scaleX * 0.2, scaleY * 0.25, scaleX * -0.2, scaleY * -0.25, scaleX * 0, scaleY * -1]));
        this.rankChangeIconRightHalf.mask = rankChangeIconRightHalfMask;

        this.glow = this.addChild(new Phaser.Image(game, 0, 0, "ranks", "glow"));
        this.glow.anchor.set(0.5, 0.5);
        this.glow.kill();

        this.sparkleGroup = this.game.add.group(this);

        // Add pool of sparkles.
        for (let i = 0; i < UIConstants.RANK_LEVEL_UP_SPARKLE_POOL_SIZE; ++i) {
            this.sparkleGroup.add(new UIRankIconSparkleImage(game));
        }

        this.rankLevel = null;

        this.allRankChangeTweens = [];

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

    spawn() {
        this.exists = true;
        this.visible = true;

        this.rankIcon.revive();
        this.rankIcon.scale.set(1.0, 1.0);
        this.rankChangeIconLeftHalf.kill();
        this.rankChangeIconRightHalf.kill();

        this.rankLevel = null;
    }

    updateRankLevel(newRankLevel) {
        // Animate rank level change.
        if (this.rankLevel !== null) {
            if (newRankLevel > this.rankLevel) {
                this._rankUp(this.rankLevel, newRankLevel);
            } else if (newRankLevel < this.rankLevel) {
                this._rankDown(this.rankLevel, newRankLevel);
            }
        } else {
            this.rankLevel = newRankLevel;
            this.rankIcon.frameName = `${newRankLevel}`;
        }
    }

    _rankUp(oldRankLevel, newRankLevel) {
        this._resetRankChangeIcons(oldRankLevel);
        this.rankIcon.frameName = `${newRankLevel}`;
        this.rankIcon.alpha = 0.0;
        this.rankIcon.scale.set(1.5, 1.5);

        this.glow.alpha = 1.0;
        this.glow.scale.set(0.01, 0.01);
        this.glow.revive();

        // Animate.
        this.allRankChangeTweens.push(this.game.add.tween(this.rankChangeIconLeftHalf.scale).to({ x: 1.5, y: 1.5 }, 1000, Phaser.Easing.Cubic.Out, true), this.game.add.tween(this.rankChangeIconRightHalf.scale).to({ x: 1.5, y: 1.5 }, 1000, Phaser.Easing.Cubic.Out, true), this.game.add.tween(this.glow.scale).to({ x: 1.0, y: 1.0 }, 1000, Phaser.Easing.Cubic.Out, true, 1000));

        let fadeOutTween = this.game.add.tween(this.glow).to({ alpha: 0.0 }, 500, Phaser.Easing.Cubic.Out, true, 1700);
        this.allRankChangeTweens.push(fadeOutTween);
        fadeOutTween.onComplete.add(() => {
            this.glow.kill();
        }, this);

        for (let i = 0; i < this.sparkleGroup.length - 1; ++i) {
            const sparkleImage = this.sparkleGroup.getFirstExists(false);
            if (sparkleImage) {
                sparkleImage.spawn((-UIConstants.RANK_ICON_WIDTH / 2.0) + (Math.random() * UIConstants.RANK_ICON_WIDTH), (-UIConstants.RANK_ICON_HEIGHT / 2.0) + (Math.random() * UIConstants.RANK_ICON_HEIGHT), 700 + (i * 80));
            }
        }

        this.allRankChangeTweens.push(this.game.add.tween(this.rankIcon).to({ alpha: 1.0 }, 200, Phaser.Easing.Cubic.In, true, 1500));

        fadeOutTween = this.game.add.tween(this.rankChangeIconLeftHalf).to({ alpha: 0.0 }, 200, Phaser.Easing.Cubic.Out, true, 1500);
        this.allRankChangeTweens.push(fadeOutTween);
        fadeOutTween.onComplete.add(() => {
            this.rankChangeIconLeftHalf.kill();
        }, this);
        fadeOutTween = this.game.add.tween(this.rankChangeIconRightHalf).to({ alpha: 0.0 }, 200, Phaser.Easing.Cubic.Out, true, 1500);
        this.allRankChangeTweens.push(fadeOutTween);
        fadeOutTween.onComplete.add(() => {
            this.rankChangeIconRightHalf.kill();
        }, this);

        const sparkleImage = this.sparkleGroup.getFirstExists(false);
        if (sparkleImage) {
            sparkleImage.spawn(UIConstants.RANK_ICON_WIDTH / 2.0, 0, 2700);
        }

        this.allRankChangeTweens.push(this.game.add.tween(this.rankIcon.scale).to({ x: 1.0, y: 1.0 }, 1000, Phaser.Easing.Cubic.Out, true, 3700));

        this.rankLevel = newRankLevel;
    }

    _rankDown(oldRankLevel, newRankLevel) {
        this._resetRankChangeIcons(oldRankLevel);
        this.rankIcon.frameName = `${newRankLevel}`;
        this.rankIcon.scale.set(0.0, 0.0);

        // Animate.
        this.allRankChangeTweens.push(this.game.add.tween(this.rankChangeIconLeftHalf.scale).to({ x: 1.5, y: 1.5 }, 1000, Phaser.Easing.Cubic.Out, true), this.game.add.tween(this.rankChangeIconRightHalf.scale).to({ x: 1.5, y: 1.5 }, 1000, Phaser.Easing.Cubic.Out, true), UIUtils.tweenTint(this.rankChangeIconLeftHalf, 0xffffff, 0x555555, 1000, Phaser.Easing.Linear.None, 700), UIUtils.tweenTint(this.rankChangeIconRightHalf, 0xffffff, 0x555555, 1000, Phaser.Easing.Linear.None, 700), this.game.add.tween(this.rankChangeIconLeftHalf).to({ x: UIConstants.RANK_LEVEL_DOWN_SHAKE_OFFSET, rotation: 0.05 }, 1000, UIUtils.easingSin(50, 0), true, 700), this.game.add.tween(this.rankChangeIconRightHalf).to({ x: UIConstants.RANK_LEVEL_DOWN_SHAKE_OFFSET, rotation: 0.05 }, 1000, UIUtils.easingSin(50, 0), true, 700), this.game.add.tween(this.rankChangeIconLeftHalf).to({ y: UIConstants.RANK_LEVEL_DOWN_SHAKE_OFFSET }, 1000, UIUtils.easingSin(70, Math.PI / 2.0), true, 700), this.game.add.tween(this.rankChangeIconRightHalf).to({ y: UIConstants.RANK_LEVEL_DOWN_SHAKE_OFFSET }, 1000, UIUtils.easingSin(70, Math.PI / 2.0), true, 700));

        const xOffsetLeftHalf = -UIConstants.RANK_LEVEL_DOWN_TEAR_MIN_OFFSET - (Math.random() * UIConstants.RANK_LEVEL_DOWN_TEAR_RANDOM_OFFSET);
        const xOffsetRightHalf = UIConstants.RANK_LEVEL_DOWN_TEAR_MIN_OFFSET + (Math.random() * UIConstants.RANK_LEVEL_DOWN_TEAR_RANDOM_OFFSET);
        const rotationLeftHalf = 0.3 + ((Math.random() * 0.6) - 0.3);
        const rotationRightHalf = 0.3 + ((Math.random() * 0.6) - 0.3);

        this.allRankChangeTweens.push(this.game.add.tween(this.rankChangeIconLeftHalf).to({ x: xOffsetLeftHalf, y: UIConstants.RANK_LEVEL_DOWN_TEAR_Y_OFFSET, rotation: rotationLeftHalf }, 1000, Phaser.Easing.Cubic.Out, true, 1700), this.game.add.tween(this.rankChangeIconRightHalf).to({ x: xOffsetRightHalf, y: -UIConstants.RANK_LEVEL_DOWN_TEAR_Y_OFFSET, rotation: rotationRightHalf }, 1000, Phaser.Easing.Cubic.Out, true, 1700), this.game.add.tween(this.rankIcon.scale).to({ x: 1.0, y: 1.0 }, 500, Phaser.Easing.Cubic.Out, true, 1500));

        let fadeOutTween = this.game.add.tween(this.rankChangeIconLeftHalf).to({ alpha: 0.0 }, 500, Phaser.Easing.Cubic.Out, true, 2700);
        this.allRankChangeTweens.push(fadeOutTween);
        fadeOutTween.onComplete.add(() => {
            this.rankChangeIconLeftHalf.kill();
        }, this);
        fadeOutTween = this.game.add.tween(this.rankChangeIconRightHalf).to({ alpha: 0.0 }, 500, Phaser.Easing.Cubic.Out, true, 2700);
        this.allRankChangeTweens.push(fadeOutTween);
        fadeOutTween.onComplete.add(() => {
            this.rankChangeIconRightHalf.kill();
        }, this);

        this.rankLevel = newRankLevel;
    }

    _resetRankChangeIcons(rankLevel) {
        for (let i = 0; i < this.allRankChangeTweens.length; ++i) {
            this.allRankChangeTweens[i].stop();
        }
        this.allRankChangeTweens = [];

        this.rankChangeIconLeftHalf.revive();
        this.rankChangeIconLeftHalf.scale.set(1.0, 1.0);
        this.rankChangeIconLeftHalf.position.set(0.0, 0.0);
        this.rankChangeIconLeftHalf.rotation = 0.0;
        this.rankChangeIconLeftHalf.tint = 0xffffff;
        this.rankChangeIconLeftHalf.alpha = 1.0;
        this.rankChangeIconLeftHalf.frameName = `${rankLevel}`;
        this.rankChangeIconRightHalf.revive();
        this.rankChangeIconRightHalf.scale.set(1.0, 1.0);
        this.rankChangeIconRightHalf.position.set(0.0, 0.0);
        this.rankChangeIconRightHalf.rotation = 0.0;
        this.rankChangeIconRightHalf.tint = 0xffffff;
        this.rankChangeIconRightHalf.alpha = 1.0;
        this.rankChangeIconRightHalf.frameName = `${rankLevel}`;
    }

    remove() {
        // Stop all tweens.
        for (let i = 0; i < this.allRankChangeTweens.length; ++i) {
            this.allRankChangeTweens[i].stop();
        }
        this.allRankChangeTweens = [];
        // Kill the group.
        this.exists = false;
        this.visible = false;
        // Kill the children.
        this.rankIcon.kill();
        this.rankChangeIconLeftHalf.kill();
        this.rankChangeIconRightHalf.kill();
        this.sparkleGroup.callAll("remove");
        this.glow.kill();
    }

    retire() {
        // Stop all tweens.
        for (let i = 0; i < this.allRankChangeTweens.length; ++i) {
            this.allRankChangeTweens[i].stop();
        }
        this.allRankChangeTweens = [];
        // Kill the group.
        this.exists = false;
        this.visible = false;
        // Kill the children.
        this.rankIcon.kill();
        this.rankChangeIconLeftHalf.kill();
        this.rankChangeIconRightHalf.kill();
        this.sparkleGroup.callAll("retire");
        this.glow.kill();
    }
}
