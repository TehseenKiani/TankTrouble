import { TankTrouble } from "../tanktrouble.js";
import { UIConstants } from "../tt/ui/uiconstants.js";
import { UITankIcon } from "../tt/ui/uitankicon.js";

customElements.define("tank-icon", class extends HTMLElement {
    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        const playerId = this.getAttribute("data-player-id");
        const size = this.getAttribute("size") || UIConstants.TANK_ICON_SIZES.SMALL;

        this.canvas = document.createElement("canvas");
        this.canvas.width = UIConstants.TANK_ICON_WIDTHS[size];
        this.canvas.height = UIConstants.TANK_ICON_HEIGHTS[size];
        this.appendChild(this.canvas);

        if (this.hasAttribute("interactive")) {
            $(this.canvas).on("mouseup", () => {
                const canvas = $(this.canvas);
                const position = canvas.offset();
                TankTrouble.TankInfoBox.show(position.left + (canvas.width() / 2), position.top + (canvas.height() / 2), playerId, canvas.width() / 2, canvas.height() / 4);
            });
        }

        UITankIcon.loadPlayerTankIcon(this.canvas, size, playerId).then(() => {
            this.dispatchEvent(new Event("load"));
        });
    }
});
