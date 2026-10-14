import { PlayerPanel } from "./playerpanel.js";
import { AudioManager } from "../../../audiomanager.js";
import { ResizeManager } from "../../../resizemanager.js";

export class UIPlayerPanel {
    static phaserInstance = null;

    static insertPanel(parentElement) {
        ResizeManager.addEventListener(UIPlayerPanel._resizeEventHandler, this);
        AudioManager.addEventListener(UIPlayerPanel._audioEventHandler, this);

        parentElement.empty();

        const config = {
            width: parentElement.width(),
            height: parentElement.height(),
            renderer: Phaser.WEBGL,
            parent: parentElement[0],
            transparent: true,
            enableDebug: false
        };
        UIPlayerPanel.phaserInstance = new Phaser.Game(config);

        UIPlayerPanel.phaserInstance.state.add("Boot", new PlayerPanel.UIBootState());
        UIPlayerPanel.phaserInstance.state.add("Preload", new PlayerPanel.UIPreloadState());
        UIPlayerPanel.phaserInstance.state.add("Main", new PlayerPanel.UIMainState());

        UIPlayerPanel.phaserInstance.state.start("Boot");

        return UIPlayerPanel.phaserInstance;
    }

    static removePanel() {
        ResizeManager.removeEventListener(UIPlayerPanel._resizeEventHandler, this);
        AudioManager.removeEventListener(UIPlayerPanel._audioEventHandler, this);

        if (UIPlayerPanel.phaserInstance) {
            if (UIPlayerPanel.phaserInstance.load) {
                UIPlayerPanel.phaserInstance.load.reset(true, true);
            }
            UIPlayerPanel.phaserInstance.destroy();
            UIPlayerPanel.phaserInstance = null;
        }
    }

    static disableInput() {
        $(UIPlayerPanel.phaserInstance.parent).addClass("inputDisabled");
    }

    static enableInput() {
        $(UIPlayerPanel.phaserInstance.parent).removeClass("inputDisabled");
    }

    static showLoginIcon() {
        // A bit of a nasty hack to hide and show login icon in menu.
        if (UIPlayerPanel.phaserInstance) {
            if (UIPlayerPanel.phaserInstance.state.current === "Main") {
                UIPlayerPanel.phaserInstance.state.getCurrentState().scheduleUpdate(true, true);
            }
        }
    }

    static hideLoginIcon() {
        // A bit of a nasty hack to hide and show login icon in menu.
        if (UIPlayerPanel.phaserInstance) {
            if (UIPlayerPanel.phaserInstance.state.current === "Main") {
                UIPlayerPanel.phaserInstance.state.getCurrentState().scheduleUpdate(false);
            }
        }
    }

    static getTankIconPosition(playerId) {
        const localPosition = this.getLocalTankIconPosition(playerId);
        if (!localPosition) {
            return this.getOnlineTankIconPosition(playerId);
        }

        return localPosition;
    }

    static getLocalTankIconPosition(playerId) {
        if (UIPlayerPanel.phaserInstance) {
            if (UIPlayerPanel.phaserInstance.state.current === "Main") {
                return UIPlayerPanel.phaserInstance.state.getCurrentState().getLocalTankIconPosition(playerId);
            }
        }
    }

    static getOnlineTankIconPosition(playerId) {
        if (UIPlayerPanel.phaserInstance) {
            if (UIPlayerPanel.phaserInstance.state.current === "Main") {
                return UIPlayerPanel.phaserInstance.state.getCurrentState().getOnlineTankIconPosition(playerId);
            }
        }
    }

    static showRankChanges(rankChanges) {
        if (UIPlayerPanel.phaserInstance) {
            if (UIPlayerPanel.phaserInstance.state.current === "Main") {
                UIPlayerPanel.phaserInstance.state.getCurrentState().showRankChanges(rankChanges);
            }
        }
    }

    static _resizeEventHandler(self, evt, data) {
        switch (evt) {
            case ResizeManager.EVENTS.REFRESH:
            {
                if (UIPlayerPanel.phaserInstance && UIPlayerPanel.phaserInstance.scale) {
                    UIPlayerPanel.phaserInstance.scale.refresh();
                }
                break;
            }
        }
    }

    static _audioEventHandler(self, evt, data) {
        switch (evt) {
            case AudioManager.EVENTS.SOUND_ON:
            {
                if (UIPlayerPanel.phaserInstance) {
                    UIPlayerPanel.phaserInstance.sound.mute = false;
                    UIPlayerPanel.phaserInstance.sound.volume = AudioManager.getSoundVolume();
                }

                break;
            }
            case AudioManager.EVENTS.SOUND_OFF:
            {
                if (UIPlayerPanel.phaserInstance) {
                    UIPlayerPanel.phaserInstance.sound.mute = true;
                }

                break;
            }
            case AudioManager.EVENTS.MUSIC_ON:
            case AudioManager.EVENTS.MUSIC_OFF:
            {
                break;
            }
        }
    }
}
