import { Backend } from "../backend.js";
import { Caches } from "../caches.js";
import { Utils } from "../utils.js";

customElements.define("stroked-player-name", class extends HTMLElement {
    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        this.strokedText = document.createElement("stroked-text");
        this.strokedText.setAttribute("width", 150);
        this.strokedText.setAttribute("height", 25);
        this.strokedText.setAttribute("font-size", 16);
        this.strokedText.setAttribute("stroke-width", 3);
        this.appendChild(this.strokedText);

        Backend.getPlayerDetails(this.getAttribute("data-player-id"), Caches.getPlayerDetailsCache())
            .then(result => {
                let username = "Scrapped";
                if (typeof result === "object") {
                    username = Utils.maskUnapprovedUsername(result);
                }
                this.strokedText.setAttribute("text", username);
            });
    }
});
