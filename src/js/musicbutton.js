import { TankTrouble } from "./tanktrouble.js";
import { AudioManager } from "./audiomanager.js";
import { Utils } from "./utils.js";

TankTrouble.MusicButton = {
    // jQuery objects.
    music: null,

    init() {
        this.music = $("<div class='music'></div>");
        Utils.addImageWithClasses(this.music, "on standard", "header/musicOn.png", "Music");
        Utils.addImageWithClasses(this.music, "on active", "header/musicOnActive.png", "Music");
        Utils.addImageWithClasses(this.music, "off standard", "header/musicOff.png", "Music");
        Utils.addImageWithClasses(this.music, "off active", "header/musicOffActive.png", "Music");

        $("#header").append(this.music);

        this.music.on("mouseup", event => {
            this._toggle();
        });

        AudioManager.addEventListener(this._audioEventHandler, this);

        // Set correct state on button.
        if (AudioManager.isMusicOn()) {
            this._on();
        } else {
            this._off();
        }
    },

    _toggle() {
        AudioManager.toggleMusic();
    },

    _off() {
        this.music.removeClass("on");
        this.music.addClass("off");
    },

    _on() {
        this.music.removeClass("off");
        this.music.addClass("on");
    },

    _audioEventHandler(self, evt, data) {
        switch (evt) {
            case AudioManager.EVENTS.SOUND_ON:
            case AudioManager.EVENTS.SOUND_OFF:
            {
                break;
            }
            case AudioManager.EVENTS.MUSIC_ON:
            {
                self._on();

                break;
            }
            case AudioManager.EVENTS.MUSIC_OFF:
            {
                self._off();

                break;
            }
        }
    }
};
