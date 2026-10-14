export class Cache {
    defaultDuration = 3600;
    values = {};

    constructor(defaultDuration) {
        if (defaultDuration !== undefined) {
            this.defaultDuration = defaultDuration;
        }
    }

    get(key) {
        if (typeof key !== "string") {
            throw new Error("Key must be a string");
        }

        this._expire(key);

        if (Object.hasOwn(this.values, key)) {
            return this.values[key].value;
        }

        //console.log("Cache miss: " + key);
        return false;
    }

    set(key, value, duration) {
        if (typeof key !== "string") {
            throw new Error("Key must be a string");
        }

        this.values[key] = {
            value,
            inserted: Math.floor(Date.now() / 1000),
            duration: duration ? duration : this.defaultDuration
        };
    }

    invalidate(key) {
        if (typeof key !== "string") {
            throw new Error("Key must be a string");
        }

        if (Object.hasOwn(this.values, key)) {
            delete this.values[key];
        }
    }

    invalidateAll() {
        this.values = {};
    }

    _expire(key) {
        if (Object.hasOwn(this.values, key)) {
            if ((this.values[key].inserted + this.values[key].duration) < Math.floor(Date.now() / 1000)) {
                delete this.values[key];
            }
        }
    }

    has(key) {
        this._expire(key);

        return Object.hasOwn(this.values, key);
    }
}
