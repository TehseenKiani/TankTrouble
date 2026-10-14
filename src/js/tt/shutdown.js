export class Shutdown {
    reason = null;
    reload = false; // Boolean with information on whether to reload page

    constructor(reason, reload) {
        this.reason = reason;
        this.reload = reload;
    }

    getReason() {
        return this.reason;
    }

    getReload() {
        return this.reload;
    }
}
