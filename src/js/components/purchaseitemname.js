import { Backend } from "../backend.js";

customElements.define("purchase-item-name", class extends HTMLElement {
    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        const fill = result => {
            if (typeof result === "object") {
                $(this).html(`${result.name}${result.quantity ? ` (${result.quantity})` : ""}`);
            }
        };
        const adminId = this.getAttribute("data-admin-id");
        const itemId = Number(this.getAttribute("data-item-id"));

        switch (this.getAttribute("kind")) {
            case "gold":
            {
                Backend.getGoldShopItemAsAdmin(adminId, this.getAttribute("data-player-id"), itemId).then(fill);
                break;
            }
            case "virtual":
            {
                Backend.getVirtualShopItemDetailsAsAdmin(adminId, itemId).then(fill);
                break;
            }
            default:
            {
                Backend.getShopItemDetailsAsAdmin(adminId, itemId).then(fill);
            }
        }
    }
});
