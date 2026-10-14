import { AdminUtils } from "../adminutils.js";

customElements.define("admin-player-name", class extends HTMLElement {
    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        const previousName = this.getAttribute("data-previous-name");

        AdminUtils.createPlayerNamesWithLookupByPlayerIds([this.getAttribute("data-player-id")], this.getAttribute("data-admin-id")).then(names => {
            $(this).empty();
            if (previousName === null || previousName === names.text()) {
                $(this).append(names);
            } else {
                $(this).append($("<span class='data'></span>").text(previousName), " (now ", names, ")");
            }
        });
    }
});
