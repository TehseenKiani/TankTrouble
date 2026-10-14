import { TankTrouble } from "./tanktrouble.js";
import { Utils } from "./utils.js";

TankTrouble.SettingsButton = {
    // jQuery objects.
    settings: null,

    init() {
        this.settings = $("<div class='settings'></div>");
        Utils.addImageWithClasses(this.settings, "standard", "header/settings.png", "Settings");
        Utils.addImageWithClasses(this.settings, "active", "header/settingsActive.png", "Settings");

        $("#header").append(this.settings);

        this.settings.on("mouseup", event => {
            this.open();
        });
    },

    open() {
        const position = this.settings.offset();
        TankTrouble.SettingsBox.show(position.left + (this.settings.width() * 0.5), position.top + (this.settings.height() * 0.5), 20);
    },

    close() {}
};
