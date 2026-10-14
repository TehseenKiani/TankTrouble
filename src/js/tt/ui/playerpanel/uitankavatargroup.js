import { AIs } from "../../ais.js";
import { Log } from "../../log.js";
import { UIConstants } from "../uiconstants.js";
import { UIDimitriSpine } from "../uidimitrispine.js";
import { UILaikaSpine } from "../uilaikaspine.js";

export class UITankAvatarGroup extends Phaser.Group {
    constructor(game) {
        // Call super.
        super(game, null);

        this.avatarSpine = null;
        this.name = null;
        this.playerId = null;

        this.spawnTween = null;
        this.removeTween = null;

        // Disable group.
        this.scale.set(0.0, 0.0);
        this.exists = false;
        this.visible = false;

        // Create log.
        this.log = new Log("UITankAvatarGroup");
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

    spawn(x, y, playerId, animate, targetScale) {
        // Revive and place the group.
        this.exists = true;
        this.visible = true;
        this.x = x;
        this.y = y;

        // Store playerId.
        this.playerId = playerId;
        this.targetScale = targetScale || 1.0;

        // Create avatar.
        if (AIs.isReady() && AIs.isAI(this.playerId)) {
            const ai = AIs.getAI(this.playerId);
            this.name = ai.name;
            switch (this.name) {
                case "Laika":
                {
                    this.avatarSpine = this.addChild(new UILaikaSpine(this.game, UIConstants.AVATAR_LAIKA_X, UIConstants.AVATAR_LAIKA_Y, this.playerId, true));
                    this.targetScale *= UIConstants.AVATAR_LAIKA_SCALE;
                    break;
                }
                case "Dimitri":
                {
                    this.avatarSpine = this.addChild(new UIDimitriSpine(this.game, UIConstants.AVATAR_DIMITRI_X, UIConstants.AVATAR_DIMITRI_Y, this.playerId));
                    this.targetScale *= UIConstants.AVATAR_DIMITRI_SCALE;
                    break;
                }
            }

            this.avatarSpine.anchor.setTo(0.5, 0.5);
            this.avatarSpine.idle();
        }

        const delay = 50 + (Math.random() * 200);

        if (this.removeTween) {
            this.removeTween.stop();
            this.removeTween = null;
        }

        if (animate) {
            this.spawnTween = this.game.add.tween(this.scale).to({ x: -this.targetScale, y: this.targetScale }, UIConstants.ELEMENT_POP_IN_TIME, Phaser.Easing.Back.Out, true, delay);
        } else {
            this.scale.set(-this.targetScale, this.targetScale);
        }

        // Brian TODO: Investigate why this is necessary to make Laika look correct.
        if (this.avatarSpine) {
            this.avatarSpine.skeleton.flipX = false;
        }
    }

    refresh(x, y, targetScale) {
        if (x !== undefined) {
            this.game.add.tween(this).to({ x }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
        if (y !== undefined) {
            this.game.add.tween(this).to({ y }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
        if (targetScale !== undefined) {
            this.targetScale = targetScale;

            switch (this.name) {
                case "Laika":
                {
                    this.targetScale *= UIConstants.AVATAR_LAIKA_SCALE;
                    break;
                }
                case "Dimitri":
                {
                    this.targetScale *= UIConstants.AVATAR_DIMITRI_SCALE;
                    break;
                }
            }

            this.game.add.tween(this.scale).to({ x: -this.targetScale, y: this.targetScale }, UIConstants.ELEMENT_MOVE_TIME, Phaser.Easing.Quadratic.InOut, true);
        }
    }

    remove() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        this.removeTween = this.game.add.tween(this.scale).to({ x: 0.0, y: 0.0 }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
        this.removeTween.onComplete.add(
            () => {
                if (this.avatarSpine) {
                    // Kill the avatar.
                    this.avatarSpine.retire();
                    this.removeChild(this.avatarSpine);
                    this.avatarSpine.destroy();
                    this.avatarSpine = null;
                }

                // Kill the group.
                this.exists = false;
                this.visible = false;
            },
            this
        );
    }

    retire() {
        if (this.avatarSpine) {
            // Kill the avatar.
            this.avatarSpine.retire();
            this.removeChild(this.avatarSpine);
            this.avatarSpine.destroy();
            this.avatarSpine = null;
        }

        // Kill the group.
        this.exists = false;
        this.visible = false;
    }
}
