const palette = [
    { base: "#a5ff03", turret: "#ff55ee", tread: "#80bb00" },
    { base: "#2980b9", turret: "#63caff", tread: "#34495e" },
    { base: "#e67e22", turret: "#ffe060", tread: "#7f8c8d" }
];
const localPlayers = new Map();
const slots = new Map();

function colour(hex) {
    return { type: "numeric", rawValue: `0x${hex.slice(1)}`, numericValue: `0x${hex.slice(1)}`, imageValue: "" };
}

function applyProfile(details, profile) {
    details.data.username = profile.name;
    for (const part of ["base", "turret", "tread"]) details.data[`${part}Colour`] = colour(profile[part]);
}

export function registerLocalPlayer(details, activeIds) {
    const usedSlots = new Set(activeIds.map(id => slots.get(id)));
    let slot = 0;
    while (usedSlots.has(slot)) slot++;
    const fallback = { name: `Player ${slot + 1}`, ...palette[slot % palette.length] };
    let profile = fallback;
    try {
        const saved = JSON.parse(localStorage.getItem(`localPlayer.${slot}`));
        if (saved && typeof saved.name === "string" && saved.name.trim() &&
            ["base", "turret", "tread"].every(part => /^#[0-9a-f]{6}$/i.test(saved[part]))) profile = saved;
    } catch { /* Use defaults when storage is unavailable or invalid. */ }
    applyProfile(details, profile);
    slots.set(details.getPlayerId(), slot);
    localPlayers.set(details.getPlayerId(), details);
    return details;
}

export function getLocalPlayer(playerId) {
    return localPlayers.get(playerId);
}

export function createLocalPlayerBox({ Users, Caches, GameSession }) {
    return {
        EVENTS: { OPENED: "opened", CLOSED: "closed" },
        eventListeners: [],
        showing: false,
        playerId: null,
        addEventListener(callback, context) { this.eventListeners.push({ callback, context }); },
        removeEventListener(callback, context) {
            this.eventListeners = this.eventListeners.filter(item => item.callback !== callback || item.context !== context);
        },
        _notify(event) {
            for (const item of this.eventListeners) item.callback(item.context, event, this.playerId);
        },
        isShowing() { return this.showing; },
        getPlayerId() { return this.playerId; },
        hide() {
            if (!this.showing) return;
            this.dialog.remove();
            GameSession.enableGameInput();
            this.showing = false;
            this._notify(this.EVENTS.CLOSED);
        },
        show(x, y, playerId) {
            this.hide();
            const details = getLocalPlayer(playerId);
            if (!details || !Users.getAllPlayerIds().includes(playerId)) return;
            this.playerId = playerId;
            const dialog = document.createElement("dialog");
            dialog.className = "localPlayerEditor";
            const form = document.createElement("form");
            const heading = document.createElement("h2");
            heading.textContent = "Local player";
            form.append(heading);
            const fields = {};
            for (const [key, title, type] of [["name", "Name", "text"], ["base", "Tank body", "color"], ["turret", "Turret", "color"], ["tread", "Tracks", "color"]]) {
                const label = document.createElement("label");
                label.textContent = title;
                const input = document.createElement("input");
                input.type = type;
                input.name = key;
                input.value = key === "name" ? details.getUsername() : `#${Number(details.data[`${key}Colour`].numericValue).toString(16).padStart(6, "0")}`;
                if (key === "name") { input.required = true; input.maxLength = 24; }
                label.append(input);
                form.append(label);
                fields[key] = input;
            }
            const save = document.createElement("button");
            save.type = "submit";
            save.textContent = "Save";
            const cancel = document.createElement("button");
            cancel.type = "button";
            cancel.textContent = "Cancel";
            cancel.addEventListener("click", () => this.hide());
            form.append(save, cancel);
            form.addEventListener("submit", event => {
                event.preventDefault();
                const profile = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value.trim()]));
                if (!profile.name) { fields.name.setCustomValidity("Enter a name"); fields.name.reportValidity(); return; }
                applyProfile(details, profile);
                Caches.getPlayerDetailsCache().set(playerId, details);
                try { localStorage.setItem(`localPlayer.${slots.get(playerId)}`, JSON.stringify(profile)); } catch { /* Optional persistence. */ }
                Users.updateUser(playerId, true, true);
                const state = GameSession.getGame()?.state.getCurrentState();
                const sprite = state?.getTankSprite?.(playerId);
                if (sprite) {
                    sprite.tint = details.getBaseColour().numericValue;
                    sprite.turret.tint = details.getTurretColour().numericValue;
                    sprite.leftTread.tint = sprite.rightTread.tint = details.getTreadColour().numericValue;
                }
                this.hide();
            });
            fields.name.addEventListener("input", () => fields.name.setCustomValidity(""));
            dialog.addEventListener("cancel", event => { event.preventDefault(); this.hide(); });
            dialog.append(form);
            document.body.append(dialog);
            this.dialog = dialog;
            this.showing = true;
            dialog.showModal();
            GameSession.disableGameInput();
            this._notify(this.EVENTS.OPENED);
        }
    };
}
