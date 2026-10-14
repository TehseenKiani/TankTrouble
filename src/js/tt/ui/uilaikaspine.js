import { Constants } from "../constants.js";
import { MathUtils } from "../mathutils.js";
import { RoundModel } from "../roundmodel.js";
import { Upgrade } from "../upgrade.js";
import { GameSession } from "../../gamesession.js";
import { Log } from "../log.js";
import { UIConstants } from "./uiconstants.js";

export class UILaikaSpine extends PhaserSpine.Spine {
    constructor(game, x, y, playerId, flipX) {
        flipX = flipX === undefined ? false : flipX;

        // Call super.
        super(game, x, y, "laika", true, flipX);

        this.playerId = playerId === undefined ? null : playerId;

        this.scale.setTo(UIConstants.SPINE_SCALE);

        this.setMixByName("torso breathe", "torso tense", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso breathe", "torso relax", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso breathe", "torso excite", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso tense", "torso breathe", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso tense", "torso relax", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso tense", "torso excite", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso relax", "torso breathe", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso relax", "torso tense", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso relax", "torso excite", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso excite", "torso breathe", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso excite", "torso tense", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("torso excite", "torso relax", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("head normalise", "head lower", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("head normalise", "head raise", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("head lower", "head normalise", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("head lower", "head raise", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("head raise", "head normalise", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("head raise", "head lower", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("mouth howl", "mouth howl", UIConstants.LAIKA.HOWL_MIX_TIME);
        this.setMixByName("ears normalise", "ears tense", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("ears normalise", "ears relax", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("ears tense", "ears normalise", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("ears tense", "ears relax", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("ears relax", "ears normalise", UIConstants.LAIKA.DEFAULT_MIX_TIME);
        this.setMixByName("ears relax", "ears tense", UIConstants.LAIKA.DEFAULT_MIX_TIME);

        // State.
        this.isIdle = false;
        this.isAiming = false;
        this.aimers = {};
        this.idleToeRollDelay = MathUtils.randomRange(UIConstants.LAIKA.MIN_TOE_ROLL_DELAY, UIConstants.LAIKA.MAX_TOE_ROLL_DELAY);
        this.idleBlinkDelay = MathUtils.randomRange(UIConstants.LAIKA.MIN_BLINK_DELAY, UIConstants.LAIKA.MAX_BLINK_DELAY);
        this.chainRattleEvent = null;
        this.endAnimationEvent = null;

        // Register for game and round events.
        GameSession.addGameEventListener(this._gameEventHandler, this);
        GameSession.addRoundEventListener(this._roundEventHandler, this);

        // Create log.
        this.log = new Log("UILaikaSpine");
    }

    _clearEvents() {
        if (this.chainRattleEvent) {
            this.game.time.events.remove(this.chainRattleEvent);
            this.chainRattleEvent = null;
        }
        if (this.endAnimationEvent) {
            this.game.time.events.remove(this.endAnimationEvent);
            this.endAnimationEvent = null;
        }
    }

    _clearCustomTracks() {
        this.clearTrack(UIConstants.LAIKA.TRACKS.HOWL);
    }

    _rattleChain() {
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.CHAIN, "chain rattle");
    }

    update() {
        if (!this.exists) {
            return;
        }

        if (this.isIdle) {
            this.idleToeRollDelay -= this.game.time.delta / 1000;
            if (this.idleToeRollDelay < 0) {
                this.idleToeRollDelay = MathUtils.randomRange(UIConstants.LAIKA.MIN_TOE_ROLL_DELAY, UIConstants.LAIKA.MAX_TOE_ROLL_DELAY);
                this.setAnimationByName(UIConstants.LAIKA.TRACKS.TOES, "toes roll");
            }

            // Only blink eye if not aiming.
            if (!this.isAiming) {
                this.idleBlinkDelay -= this.game.time.delta / 1000;
                if (this.idleBlinkDelay < 0) {
                    this.idleBlinkDelay = MathUtils.randomRange(UIConstants.LAIKA.MIN_BLINK_DELAY, UIConstants.LAIKA.MAX_BLINK_DELAY);
                    if (Math.random() <= UIConstants.LAIKA.LASER_BLINK_PROBABILITY) {
                        this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
                        for (let i = 1; i < UIConstants.LAIKA.LASER_BLINK_COUNT; ++i) {
                            this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes normalise", false, UIConstants.LAIKA.LASER_BLINK_TIME);
                            this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close", false, UIConstants.LAIKA.LASER_BLINK_TIME);
                        }
                        this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes laser", false, UIConstants.LAIKA.LASER_BLINK_TIME);
                        this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close", false, UIConstants.LAIKA.LASER_TIME);
                        this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes normalise", false, UIConstants.LAIKA.LASER_BLINK_TIME);
                    } else {
                        this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
                        this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes normalise", false, UIConstants.LAIKA.BLINK_TIME);
                    }
                }
            }
        }

        // Call super.
        super.update();
    }

    _updateAiming() {
        if (!this.isAiming) {
            // Check if we need to start aiming.
            let foundActiveAimer = false;
            for (const aimerId in this.aimers) {
                if (this.aimers[aimerId]) {
                    foundActiveAimer = true;
                    break;
                }
            }
            if (foundActiveAimer) {
                this.isAiming = true;
                if (this.getCurrentAnimationForTrack(UIConstants.LAIKA.TRACKS.EYES) !== "eyes laser") {
                    this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
                    this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes laser", false, UIConstants.LAIKA.LASER_BLINK_TIME);
                }
            }
        } else {
            // Check if we need to stop aiming.
            let foundActiveAimer = false;
            for (const aimerId in this.aimers) {
                if (this.aimers[aimerId]) {
                    foundActiveAimer = true;
                    break;
                }
            }
            if (!foundActiveAimer) {
                this.isAiming = false;

                // Reset idle blink delay to give time to finish aiming animation.
                this.idleBlinkDelay = MathUtils.randomRange(UIConstants.LAIKA.MIN_BLINK_DELAY, UIConstants.LAIKA.MAX_BLINK_DELAY);

                if (this.getCurrentAnimationForTrack(UIConstants.LAIKA.TRACKS.EYES) === "eyes laser") {
                    this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
                    this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes normalise", false, UIConstants.LAIKA.LASER_BLINK_TIME);
                }
            }
        }
    }

    idle() {
        this.isIdle = true;

        this._clearEvents();
        this._clearCustomTracks();

        this.setAnimationByName(UIConstants.LAIKA.TRACKS.TORSO, "torso breathe", true);
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.HEAD, "head normalise");
        if (this.getCurrentAnimationForTrack(UIConstants.LAIKA.TRACKS.EYES) === "eyes laser") {
            this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
            this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes normalise", false, UIConstants.LAIKA.LASER_BLINK_TIME);
        } else {
            this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes normalise");
        }
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.MOUTH, "mouth normalise");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.EARS, "ears normalise");

        this._updateAiming();
    }

    growl(time) {
        this.isIdle = false;

        this.game.sound.play("laikaGrowl");

        this._clearEvents();
        this._clearCustomTracks();

        this.setAnimationByName(UIConstants.LAIKA.TRACKS.TORSO, "torso tense");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.HEAD, "head lower");
        if (this.getCurrentAnimationForTrack(UIConstants.LAIKA.TRACKS.EYES) === "eyes laser") {
            this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
            this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes normalise", false, UIConstants.LAIKA.LASER_BLINK_TIME);
        } else {
            this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes normalise");
        }
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.MOUTH, "mouth anger", true);
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.EARS, "ears tense");
        this.endAnimationEvent = this.game.time.events.add(time, this.idle, this);
    }

    howl(time) {
        this.isIdle = false;

        this.game.sound.play(`laikaHowl${Math.floor(Math.random() * UIConstants.LAIKA_HOWL_AUDIO_COUNT)}`);

        this._clearEvents();
        this._clearCustomTracks();

        this.setAnimationByName(UIConstants.LAIKA.TRACKS.TORSO, "torso tense");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.HEAD, "head raise");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.MOUTH, "mouth oh");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.HOWL, "mouth oh");
        for (let i = 0; i < UIConstants.LAIKA.HOWL_COUNT; ++i) {
            const howlTime = MathUtils.randomRange(UIConstants.LAIKA.MIN_HOWL_TIME, UIConstants.LAIKA.MAX_HOWL_TIME);
            this.addAnimationByName(UIConstants.LAIKA.TRACKS.HOWL, "mouth howl", false, howlTime);
        }
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.EARS, "ears relax");
        this.chainRattleEvent = this.game.time.events.add(UIConstants.LAIKA.CHAIN_RATTLE_DELAY, this._rattleChain, this);
        this.endAnimationEvent = this.game.time.events.add(time, this.idle, this);
    }

    whimper(time) {
        this.isIdle = false;

        this.game.sound.play("laikaWhine");

        this._clearEvents();
        this._clearCustomTracks();

        this.setAnimationByName(UIConstants.LAIKA.TRACKS.TORSO, "torso relax");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.HEAD, "head lower");
        if (this.getCurrentAnimationForTrack(UIConstants.LAIKA.TRACKS.EYES) === "eyes laser") {
            this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
            this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes sad", true, UIConstants.LAIKA.LASER_BLINK_TIME);
        } else {
            this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes sad", true);
        }
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.MOUTH, "mouth sad", true);
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.EARS, "ears sad");
        this.endAnimationEvent = this.game.time.events.add(time, this.idle, this);
    }

    gasp(time) {
        this.isIdle = false;

        this._clearEvents();

        this.setAnimationByName(UIConstants.LAIKA.TRACKS.TORSO, "torso excite");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.HEAD, "head normalise");
        if (this.getCurrentAnimationForTrack(UIConstants.LAIKA.TRACKS.EYES) === "eyes laser") {
            this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes close");
            this.addAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes open", false, UIConstants.LAIKA.LASER_BLINK_TIME);
        } else {
            this.setAnimationByName(UIConstants.LAIKA.TRACKS.EYES, "eyes open");
        }
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.MOUTH, "mouth oh");
        this.setAnimationByName(UIConstants.LAIKA.TRACKS.EARS, "ears tense");
        this.endAnimationEvent = this.game.time.events.add(time, this.idle, this);
    }

    _gameEventHandler(self, id, evt, data) {
    }

    _roundEventHandler(self, id, evt, data) {
        switch (evt) {
            case RoundModel._EVENTS.TANK_KILLED:
            {
                if (data.getVictimPlayerId() === self.playerId) {
                    const randomValue = Math.random();
                    if (randomValue > 0.66) {
                        self.growl(UIConstants.AVATAR_LAIKA_GROWL_TIME);
                    } else if (randomValue > 0.33) {
                        self.whimper(UIConstants.AVATAR_LAIKA_WHIMPER_TIME);
                    } else {
                        self.gasp(UIConstants.AVATAR_LAIKA_GASP_TIME);
                    }
                } else if (data.getKillerPlayerId() === self.playerId) {
                    if (Math.random() < UIConstants.AVATAR_LAIKA_GLOAT_CHANCE) {
                        self.howl(UIConstants.AVATAR_LAIKA_HOWL_TIME);
                    }
                }
                break;
            }
            case RoundModel._EVENTS.UPGRADE_CREATED:
            {
                if (data.getPlayerId() === self.playerId) {
                    if (data.getType() === Constants.UPGRADE_TYPES.AIMER || data.getType() === Constants.UPGRADE_TYPES.LASER_AIMER) {
                        if (data.getType() === Constants.UPGRADE_TYPES.LASER_AIMER) {
                            self.aimers[data.getId()] = data.getField("activated");
                        } else {
                            self.aimers[data.getId()] = true;
                        }
                        self._updateAiming();
                    }
                }
                break;
            }
            case RoundModel._EVENTS.UPGRADE_DESTROYED:
            {
                if (data.getPlayerId() === self.playerId) {
                    delete self.aimers[data.getUpgradeId()];
                    self._updateAiming();
                }
                break;
            }
            case RoundModel._EVENTS.ROUND_ENDED:
            {
                self.aimers = {};
                self._updateAiming();
                break;
            }
            case Upgrade._EVENTS.UPGRADE_ACTIVATED:
            {
                if (self.aimers[data] !== undefined) {
                    self.aimers[data] = true;
                    self._updateAiming();
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
