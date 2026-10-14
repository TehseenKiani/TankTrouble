import { Constants } from "./tt/constants.js";
import { GameModel } from "./tt/gamemodel.js";
import { RoundModel } from "./tt/roundmodel.js";
import { Assets } from "./assets.js";
import { GameSession } from "./gamesession.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { Users } from "./users.js";

export class AudioManager {
    static musicContext = null;
    static music = null;
    static musicRequested = false;
    static musicUnfilteredGain = null;
    static musicFilteredGain = null;
    static musicVolumeGain = null;
    static localPlayersAlive = 0;
    static soundOn = true;
    static soundVolumeSetting = null;
    static musicOn = true;
    static eventListeners = [];
    static VOLUME_SETTINGS = {
        LOW: "low",
        MEDIUM: "medium",
        HIGH: "high"
    };

    static LOW_VOLUME = 0.1;
    static MEDIUM_VOLUME = 0.4;
    static HIGH_VOLUME = 1.0;
    static MUSIC_FILTERED_VOLUME = 0.8;
    static MUSIC_HIGH_PASS_FREQUENCY = 300; // Hz
    static MUSIC_LOW_PASS_FREQUENCY = 3000; // Hz
    static MUSIC_FILTER_Q = -3; // dB
    static MUSIC_FADE_TIME_CONSTANT = 0.1; // s
    static EVENTS = {
        SOUND_ON: "sound on",
        SOUND_OFF: "sound off",
        MUSIC_ON: "music on",
        MUSIC_OFF: "music off"
    };

    static addEventListener(callback, context) {
        AudioManager.eventListeners.push({ callback, context });
    }

    static removeEventListener(callback, context) {
        for (let i = 0; i < AudioManager.eventListeners.length; i++) {
            if (AudioManager.eventListeners[i].callback === callback && AudioManager.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                AudioManager.eventListeners.splice(i, 1);
                return;
            }
        }
    }

    static loadAudioSettings() {
        if (Cookies.get("sound")) {
            if (Cookies.get("sound") === "off") {
                AudioManager.turnSoundOff();
            } else if (Cookies.get("sound") === "on") { // Backwards compatibility
                AudioManager.turnSoundOn(AudioManager.VOLUME_SETTINGS.HIGH);
            } else {
                AudioManager.turnSoundOn(Cookies.get("sound"));
            }
        } else {
            AudioManager.turnSoundOn(AudioManager.VOLUME_SETTINGS.HIGH);
        }

        if (Cookies.get("music") && Cookies.get("music") === "on") {
            AudioManager.turnMusicOn();
        } else {
            AudioManager.turnMusicOff();
        }
    }

    static init() {
        const context = new AudioContext();
        AudioManager.musicContext = context;
        AudioManager.music = new AudioBufferSourceNode(context, { loop: true });
        AudioManager.musicUnfilteredGain = new GainNode(context, { gain: 0 });
        AudioManager.musicFilteredGain = new GainNode(context, { gain: 0 });
        AudioManager.musicVolumeGain = new GainNode(context);

        const highPass = { type: "highpass", frequency: AudioManager.MUSIC_HIGH_PASS_FREQUENCY, Q: AudioManager.MUSIC_FILTER_Q };
        const lowPass = { type: "lowpass", frequency: AudioManager.MUSIC_LOW_PASS_FREQUENCY, Q: AudioManager.MUSIC_FILTER_Q };

        AudioManager.music.connect(AudioManager.musicUnfilteredGain).connect(AudioManager.musicVolumeGain).connect(context.destination);
        AudioManager.music
            .connect(new BiquadFilterNode(context, highPass))
            .connect(new BiquadFilterNode(context, highPass))
            .connect(new BiquadFilterNode(context, lowPass))
            .connect(new BiquadFilterNode(context, lowPass))
            .connect(AudioManager.musicFilteredGain)
            .connect(AudioManager.musicVolumeGain);

        AudioManager._updateMusicVolume();
        AudioManager._updateMusicFiltering();

        for (const eventType of ["pointerdown", "keydown", "touchend"]) {
            document.addEventListener(eventType, () => context.resume(), { once: true });
        }

        if (AudioManager.isMusicOn()) {
            if (window.requestIdleCallback) {
                requestIdleCallback(AudioManager._loadMusic, { timeout: 5000 });
            } else {
                setTimeout(AudioManager._loadMusic, 5000);
            }
        }

        GameSession.addRoundEventListener(this._roundEventHandler, this);
        GameSession.addGameEventListener(this._gameEventHandler, this);
    }

    static _loadMusic() {
        if (AudioManager.music === null || AudioManager.musicRequested) {
            return;
        }
        AudioManager.musicRequested = true;

        fetch(Assets.url(AudioManager._getActiveMusic()))
            .then(response => response.arrayBuffer())
            .then(data => AudioManager.musicContext.decodeAudioData(data))
            .then(buffer => {
                AudioManager.music.buffer = buffer;
                AudioManager.music.start();
            })
            .catch(() => {
                AudioManager.musicRequested = false;
            });
    }

    static _updateMusicVolume() {
        if (AudioManager.musicVolumeGain !== null) {
            AudioManager.musicVolumeGain.gain.value = AudioManager.musicOn && AudioManager.soundOn ? AudioManager.getSoundVolume() : 0;
        }
    }

    static _roundEventHandler(self, id, evt, data) {
        switch (evt) {
            case RoundModel._EVENTS.TANK_CREATED: {
                AudioManager._updateLocalPlayersAlive(data.getPlayerId(), true);
                break;
            }
            case RoundModel._EVENTS.TANK_DESTROYED: {
                AudioManager._updateLocalPlayersAlive(data, false);
                break;
            }
            case RoundModel._EVENTS.TANK_KILLED: {
                AudioManager._updateLocalPlayersAlive(data.getVictimPlayerId(), false);
                break;
            }
            case RoundModel._EVENTS.ROUND_CREATED: {
                AudioManager.localPlayersAlive = 0;
                break;
            }
        }
    }

    static _gameEventHandler(self, id, evt, data) {
        switch (evt) {
            case GameModel._EVENTS.GAME_ENDED: {
                AudioManager.leaveGame();
                break;
            }
        }
    }

    static _updateLocalPlayersAlive(playerId, increment) {
        const localPlayer = Users.getAllPlayerIds().includes(playerId);
        if (localPlayer) {
            AudioManager.localPlayersAlive += increment ? 1 : -1;
            AudioManager._updateMusicFiltering();
        }
    }

    static _updateMusicFiltering() {
        if (AudioManager.localPlayersAlive > 1) {
            return;
        }

        const filtered = AudioManager.localPlayersAlive <= 0;
        const now = AudioManager.musicContext.currentTime;
        AudioManager.musicUnfilteredGain.gain.setTargetAtTime(filtered ? 0 : 1, now, AudioManager.MUSIC_FADE_TIME_CONSTANT);
        AudioManager.musicFilteredGain.gain.setTargetAtTime(filtered ? AudioManager.MUSIC_FILTERED_VOLUME : 0, now, AudioManager.MUSIC_FADE_TIME_CONSTANT);
    }

    static leaveGame() {
        AudioManager.localPlayersAlive = 0;
        AudioManager._updateMusicFiltering();
    }

    static toggleSound() {
        if (AudioManager.soundOn) {
            switch (AudioManager.soundVolumeSetting) {
                case AudioManager.VOLUME_SETTINGS.LOW:
                {
                    AudioManager.turnSoundOn(AudioManager.VOLUME_SETTINGS.MEDIUM);
                    break;
                }
                case AudioManager.VOLUME_SETTINGS.MEDIUM:
                {
                    AudioManager.turnSoundOn(AudioManager.VOLUME_SETTINGS.HIGH);
                    break;
                }
                case AudioManager.VOLUME_SETTINGS.HIGH:
                {
                    AudioManager.turnSoundOff();
                    break;
                }
            }
        } else {
            AudioManager.turnSoundOn(AudioManager.VOLUME_SETTINGS.LOW);
        }
    }

    static turnSoundOn(volumeSetting) {
        Cookies.set("sound", volumeSetting, { expires: 365 });
        AudioManager.soundOn = true;
        AudioManager.soundVolumeSetting = volumeSetting;

        AudioManager._updateMusicVolume();

        AudioManager._notifyEventListeners(AudioManager.EVENTS.SOUND_ON, volumeSetting);
    }

    static turnSoundOff() {
        Cookies.set("sound", "off", { expires: 365 });
        AudioManager.soundOn = false;

        AudioManager._updateMusicVolume();

        AudioManager._notifyEventListeners(AudioManager.EVENTS.SOUND_OFF);
    }

    static isSoundOn() {
        return AudioManager.soundOn;
    }

    static getSoundVolumeSetting() {
        return AudioManager.soundVolumeSetting;
    }

    static getSoundVolume() {
        switch (AudioManager.soundVolumeSetting) {
            case AudioManager.VOLUME_SETTINGS.LOW:
            {
                return AudioManager.LOW_VOLUME;
            }
            case AudioManager.VOLUME_SETTINGS.MEDIUM:
            {
                return AudioManager.MEDIUM_VOLUME;
            }
            case AudioManager.VOLUME_SETTINGS.HIGH:
            {
                return AudioManager.HIGH_VOLUME;
            }
        }
    }

    static playSound(audioObject) {
        if (AudioManager.soundOn) {
            audioObject.volume = AudioManager.getSoundVolume();
            audioObject.play();
        }
    }

    static stopSound(audioObject) {
        audioObject.pause();
        audioObject.currentTime = 0;
    }

    static toggleMusic() {
        if (AudioManager.musicOn) {
            AudioManager.turnMusicOff();
        } else {
            AudioManager.turnMusicOn();
        }
    }

    static turnMusicOn() {
        Cookies.set("music", "on", { expires: 365 });
        AudioManager.musicOn = true;
        AudioManager._updateMusicVolume();
        AudioManager._loadMusic();

        AudioManager._notifyEventListeners(AudioManager.EVENTS.MUSIC_ON);
    }

    static turnMusicOff() {
        Cookies.set("music", "off", { expires: 365 });
        AudioManager.musicOn = false;
        AudioManager._updateMusicVolume();

        AudioManager._notifyEventListeners(AudioManager.EVENTS.MUSIC_OFF);
    }

    static isMusicOn() {
        return AudioManager.musicOn;
    }

    static _getActiveMusic() {
        const now = new Date();
        now.setUTCFullYear(1970);

        // Find first active, time-limited theme.
        for (let i = 0; i < Constants.MAZE_THEMES.COUNT; ++i) {
            if (Constants.MAZE_THEME_INFO[i].ACTIVE_DURATION_START !== undefined && Constants.MAZE_THEME_INFO[i].ACTIVE_DURATION_END !== undefined) {
                const start = Constants.MAZE_THEME_INFO[i].ACTIVE_DURATION_START;
                const end = Constants.MAZE_THEME_INFO[i].ACTIVE_DURATION_END;

                start.setUTCFullYear(1970);
                end.setUTCFullYear(1970);

                if (now >= start && now <= end) {
                    return UIConstants.THEME_MUSIC[i];
                }
            }
        }

        return UIConstants.THEME_MUSIC[0]; // Standard theme music.
    }

    static _notifyEventListeners(evt, data) {
        for (let i = 0; i < AudioManager.eventListeners.length; i++) {
            AudioManager.eventListeners[i].callback(AudioManager.eventListeners[i].context, evt, data);
        }
    }
}
