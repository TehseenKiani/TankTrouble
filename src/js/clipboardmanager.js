import { Commands } from "./commands.js";

export class ClipboardManager {
    static init() {
        Commands.register("--copy", (button, data) => {
            ClipboardManager.copy(button.attr("data-value"));
        });
    }

    static copy(value) {
        navigator.clipboard.writeText(value);
    }
}
