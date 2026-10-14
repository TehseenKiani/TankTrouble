import { TankTrouble } from "./tanktrouble.js";
import { AudioManager } from "./audiomanager.js";
import { Utils } from "./utils.js";

TankTrouble.SoundButton = {
    // jQuery objects.
    sound: null,

    init() {
        this.sound = $("<div class='sound'></div>");
        Utils.addImageWithClasses(this.sound, "low standard", "header/volumeLow.png", "Sound");
        Utils.addImageWithClasses(this.sound, "low active", "header/volumeLowActive.png", "Sound");
        Utils.addImageWithClasses(this.sound, "medium standard", "header/volumeMedium.png", "Sound");
        Utils.addImageWithClasses(this.sound, "medium active", "header/volumeMediumActive.png", "Sound");
        Utils.addImageWithClasses(this.sound, "high standard", "header/volumeHigh.png", "Sound");
        Utils.addImageWithClasses(this.sound, "high active", "header/volumeHighActive.png", "Sound");
        Utils.addImageWithClasses(this.sound, "off standard", "header/volumeOff.png", "Sound");
        Utils.addImageWithClasses(this.sound, "off active", "header/volumeOffActive.png", "Sound");

        $("#header").append(this.sound);

        this.sound.on("mouseup", event => {
            this._toggle();
        });

        AudioManager.addEventListener(this._audioEventHandler, this);

        // Set correct state on button.
        if (AudioManager.isSoundOn()) {
            this._on(AudioManager.getSoundVolumeSetting());
        } else {
            this._off();
        }
    },

    _toggle() {
        AudioManager.toggleSound();
    },

    _off() {
        this.sound.removeClass("low medium high");
        this.sound.addClass("off");
    },

    _on(volumeSetting) {
        switch (volumeSetting) {
            case AudioManager.VOLUME_SETTINGS.LOW:
            {
                this.sound.removeClass("off medium high");
                this.sound.addClass("low");
                break;
            }
            case AudioManager.VOLUME_SETTINGS.MEDIUM:
            {
                this.sound.removeClass("off low high");
                this.sound.addClass("medium");
                break;
            }
            case AudioManager.VOLUME_SETTINGS.HIGH:
            {
                this.sound.removeClass("off low medium");
                this.sound.addClass("high");
                break;
            }
        }
    },

    _audioEventHandler(self, evt, data) {
        switch (evt) {
            case AudioManager.EVENTS.SOUND_ON:
            {
                self._on(data);

                break;
            }
            case AudioManager.EVENTS.SOUND_OFF:
            {
                self._off();

                break;
            }
            case AudioManager.EVENTS.MUSIC_ON:
            case AudioManager.EVENTS.MUSIC_OFF:
            {
                break;
            }
        }
    }
};
