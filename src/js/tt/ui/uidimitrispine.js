import { MathUtils } from "../mathutils.js";
import { RoundModel } from "../roundmodel.js";
import { GameSession } from "../../gamesession.js";
import { Log } from "../log.js";
import { UIConstants } from "./uiconstants.js";

export class UIDimitriSpine extends PhaserSpine.Spine {
    constructor(game, x, y, playerId, flipX) {
        flipX = flipX === undefined ? false : flipX;

        // Call super.
        super(game, x, y, "dimitri", true, flipX);

        this.playerId = playerId === undefined ? null : playerId;

        this.scale.setTo(UIConstants.SPINE_SCALE);

        this.setMixByName("torso breathe", "torso tense", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("torso tense", "torso breathe", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("head normalise", "head lower", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("head lower", "head normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("eyes normalise", "eyes anger", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("eyes normalise", "eyes surprise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("eyes anger", "eyes normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("eyes anger", "eyes surprise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("eyes surprise", "eyes normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("eyes surprise", "eyes anger", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("schnurrbart normalise", "schnurrbart breathe", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("schnurrbart normalise", "schnurrbart wiggle", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("schnurrbart breathe", "schnurrbart normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("schnurrbart breathe", "schnurrbart wiggle", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("schnurrbart wiggle", "schnurrbart normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("schnurrbart wiggle", "schnurrbart breathe", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hands normalise", "hands rub", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hands rub", "hands normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip normalise", "hip bounce", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip normalise", "hip lower", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip normalise", "hip lean backwards", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip normalise", "hip lean forwards", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip bounce", "hip normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip bounce", "hip lower", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip bounce", "hip lean backwards", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip bounce", "hip lean forwards", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lower", "hip normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lower", "hip bounce", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lower", "hip lean backwards", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lower", "hip lean forwards", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lean backwards", "hip normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lean backwards", "hip bounce", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lean backwards", "hip lower", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lean backwards", "hip lean forwards", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lean forwards", "hip normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lean forwards", "hip bounce", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lean forwards", "hip lower", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("hip lean forwards", "hip lean backwards", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("left foot normalise", "left foot scratch", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("left foot normalise", "left foot tap", UIConstants.DIMITRI.FOOT_TAP_MIX_TIME);
        this.setMixByName("left foot scratch", "left foot normalise", UIConstants.DIMITRI.DEFAULT_MIX_TIME);
        this.setMixByName("left foot scratch", "left foot tap", UIConstants.DIMITRI.FOOT_TAP_MIX_TIME);
        this.setMixByName("left foot tap", "left foot normalise", UIConstants.DIMITRI.FOOT_TAP_MIX_TIME);
        this.setMixByName("left foot tap", "left foot scratch", UIConstants.DIMITRI.FOOT_TAP_MIX_TIME);

        // State.
        this.isIdle = false;
        this.idleLegsDelay = MathUtils.randomRange(UIConstants.DIMITRI.MIN_LEGS_DELAY, UIConstants.DIMITRI.MAX_LEGS_DELAY);
        this.idleWiggleDelay = MathUtils.randomRange(UIConstants.DIMITRI.MIN_WIGGLE_DELAY, UIConstants.DIMITRI.MAX_WIGGLE_DELAY);
        this.endAnimationEvent = null;

        // Register for game and round events.
        GameSession.addGameEventListener(this._gameEventHandler, this);
        GameSession.addRoundEventListener(this._roundEventHandler, this);

        // Create log.
        this.log = new Log("UIDimitriSpine");
    }

    _clearEvents() {
        if (this.endAnimationEvent) {
            this.game.time.events.remove(this.endAnimationEvent);
            this.endAnimationEvent = null;
        }
    }

    update() {
        if (!this.exists) {
            return;
        }

        if (this.isIdle) {
            this.idleWiggleDelay -= this.game.time.delta / 1000;
            if (this.idleWiggleDelay < 0) {
                this.idleWiggleDelay = MathUtils.randomRange(UIConstants.DIMITRI.MIN_WIGGLE_DELAY, UIConstants.DIMITRI.MAX_WIGGLE_DELAY);
                this.setAnimationByName(UIConstants.DIMITRI.TRACKS.SCHNURRBART, "schnurrbart wiggle");
                for (let i = 1; i < UIConstants.DIMITRI.SCHNURRBART_WIGGLE_COUNT; ++i) {
                    this.addAnimationByName(UIConstants.DIMITRI.TRACKS.SCHNURRBART, "schnurrbart wiggle");
                }
                this.addAnimationByName(UIConstants.DIMITRI.TRACKS.SCHNURRBART, "schnurrbart breathe", true);
            }

            this.idleLegsDelay -= this.game.time.delta / 1000;
            if (this.idleLegsDelay < 0) {
                this.idleLegsDelay = MathUtils.randomRange(UIConstants.DIMITRI.MIN_LEGS_DELAY, UIConstants.DIMITRI.MAX_LEGS_DELAY);
                const randomValue = Math.random();
                if (randomValue <= UIConstants.DIMITRI.HIP_BOUNCE_PROBABILITY) {
                    this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HIP, "hip bounce");
                    for (let i = 1; i < UIConstants.DIMITRI.HIP_BOUNCE_COUNT; ++i) {
                        this.addAnimationByName(UIConstants.DIMITRI.TRACKS.HIP, "hip bounce");
                    }
                    this.addAnimationByName(UIConstants.DIMITRI.TRACKS.HIP, "hip normalise");
                } else if (randomValue - UIConstants.DIMITRI.HIP_BOUNCE_PROBABILITY <= UIConstants.DIMITRI.FOOT_SCRATCH_PROBABILITY) {
                    this.setAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot scratch");
                    for (let i = 1; i < UIConstants.DIMITRI.FOOT_SCRATCH_COUNT; ++i) {
                        this.addAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot scratch");
                    }
                    this.addAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot normalise");
                } else {
                    this.setAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot tap");
                    for (let i = 1; i < UIConstants.DIMITRI.FOOT_TAP_COUNT; ++i) {
                        this.addAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot tap");
                    }
                    this.addAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot normalise");
                }
            }
        }

        // Call super.
        super.update();
    }

    idle() {
        this.isIdle = true;

        this._clearEvents();

        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.TORSO, "torso breathe", true);
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HEAD, "head normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.EYES, "eyes normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.MOUTH, "mouth normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.SCHNURRBART, "schnurrbart breathe", true);
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HANDS, "hands normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HIP, "hip normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot normalise");
    }

    scowl(time) {
        this.isIdle = false;

        this._clearEvents();

        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.TORSO, "torso tense");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HEAD, "head lower");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.EYES, "eyes anger");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.MOUTH, "mouth normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.SCHNURRBART, "schnurrbart normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HANDS, "hands rub", true);
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HIP, "hip lower");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot normalise");
        this.endAnimationEvent = this.game.time.events.add(time, this.idle, this);
    }

    gasp(time) {
        this.isIdle = false;

        this._clearEvents();

        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.TORSO, "torso tense");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HEAD, "head normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.EYES, "eyes surprise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.MOUTH, "mouth oh");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.SCHNURRBART, "schnurrbart normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HANDS, "hands normalise");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.HIP, "hip lean backwards");
        this.setAnimationByName(UIConstants.DIMITRI.TRACKS.FOOT, "left foot normalise");
        this.endAnimationEvent = this.game.time.events.add(time, this.idle, this);
    }

    _gameEventHandler(self, id, evt, data) {
    }

    _roundEventHandler(self, id, evt, data) {
        switch (evt) {
            case RoundModel._EVENTS.TANK_KILLED:
            {
                console.log(self.playerId);
                if (data.getVictimPlayerId() === self.playerId) {
                    if (Math.random() < UIConstants.AVATAR_DIMITRI_GASP_CHANCE) {
                        self.gasp(UIConstants.AVATAR_DIMITRI_GASP_TIME);
                    }
                } else if (data.getKillerPlayerId() === self.playerId) {
                    if (Math.random() < UIConstants.AVATAR_DIMITRI_GLOAT_CHANCE) {
                        self.scowl(UIConstants.AVATAR_DIMITRI_SCOWL_TIME);
                    }
                }
                break;
            }
        }
    }

    retire() {
        // Remove event listeners.
        GameSession.removeGameEventListener(this._gameEventHandler, this);
        GameSession.removeRoundEventListener(this._roundEventHandler, this);

        this._clearEvents();

        // Kill the spine.
        this.kill();
    }
}
