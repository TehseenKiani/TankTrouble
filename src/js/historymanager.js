export class HistoryManager {
    static updateTab(tab, path, data, replace) {
        const state = { tab, data };
        if (replace) {
            HistoryManager._replaceHistory(state, path);
        } else {
            HistoryManager._pushHistory(state, path);
        }
    }

    static _pushHistory(state, path) {
        history.pushState(
            state,
            "",
            path
        );
    }

    static _replaceHistory(state, path) {
        history.replaceState(
            state,
            "",
            path
        );
    }
}
