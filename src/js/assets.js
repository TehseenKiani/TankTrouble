import manifest from "../build/assets.json" with { type: "json" };

export class Assets {
    static url(path) {
        return `/${manifest[`assets/${path}`]?.url ?? `assets/${path}`}`;
    }

    static size(path) {
        return manifest[`assets/${path}`];
    }
}
