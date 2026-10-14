import { Assets } from "./assets.js";

export class Images {
    static url(path) {
        return Assets.url(`images/${path}`);
    }

    static attributes(path, alt) {
        const { width, height } = Assets.size(`images/${path}`);
        return `src='${Images.url(path)}' width='${width}' height='${height}' alt='${alt ?? ""}'`;
    }
}
