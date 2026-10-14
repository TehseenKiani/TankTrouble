import { Utils } from "../utils.js";

customElements.define("player-name", class extends HTMLElement {
    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        Utils.createPlayerNames([this.getAttribute("data-player-id")], names => {
            $(this).empty().append(names);
        });
    }
});
