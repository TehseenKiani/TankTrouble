export class Log {
    static logDebugMessages = false;

    prefix = "";
    isOpera = false;
    isFirefox = false;
    isChrome = false;
    isIE = false;

    constructor(prefix) {
        this.prefix = prefix;

        const browserWindow = typeof window === "undefined" ? {} : window;
        const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
        this.isOpera = !!browserWindow.opera || userAgent.includes(" OPR/");
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
        this.isFirefox = typeof InstallTrigger !== "undefined";   // Firefox 1.0+
        this.isSafari = userAgent.includes("Safari");
        // At least Safari 3+: "[object HTMLElementConstructor]"
        this.isChrome = !!browserWindow.chrome && !this.isOpera;              // Chrome 1+
        this.isIE = typeof document !== "undefined" && !!document.documentMode; // At least IE6
    }

    debug(message, data) {
        if (Log.logDebugMessages) {
            this._log("D", message, data);
        }
    }

    warn(message, data) {
        this._log("W", message, data);
    }

    error(message, data) {
        this._log("E", message, data);
    }

    _log(level, message, data) {
        const callerInfo = this._getCallerInfo(0);

        console.log(`[${level}][${new Date()}][${this.prefix}][${callerInfo.file}:${callerInfo.line}]: ${message}${data ? JSON.stringify(data) : ""}`);
    }

    _getCallerInfo(level = 0) {
        if (this.isSafari) {
            return {
                name: "unknown",
                path: "unknown",
                file: "unknown",
                line: 0,
                char: 0
            };
        }

        level += 4;
        let error = new Error();

        if (this.isIE) {
            try {
                throw error;
            } catch (error_) {
                error = error_;
            }
        }

        const callerInfo = {
            name: "",
            path: "",
            file: "",
            line: 0,
            char: 0
        };

        callerInfo.stack = error.stack;

        // Turn the stack string into an array
        const stackLines = error.stack.split("\n");

        // Get the caller line
        const callerLine = stackLines[level];

        // Get the index
        const index = callerLine.indexOf("at ");

        // Get the error line, without the '  at ' part
        const clean = callerLine.slice(index + 2);

        const result = /^ (.*?) \((.*?):(\d*):(\d*)\)/.exec(clean);

        if (result) {
            callerInfo.name = result[1];
            callerInfo.path = result[2];
            callerInfo.file = callerInfo.path.split("/").pop();
            callerInfo.line = result[3];
            callerInfo.char = result[4];
        }

        return callerInfo;
    }

    static setLogDebugMessages(logDebugMessages) {
        Log.logDebugMessages = logDebugMessages;
    }
}
