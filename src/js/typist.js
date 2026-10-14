export class Typist {
    static TYPE_DELAY = 100;
    static TYPE_VARIATION = 50;
    static REMOVE_DELAY = 1000 / 30;

    constructor(input) {
        this.input = input;
        this.queue = [];
        this.timer = null;
    }

    add(text) {
        if (text.length === 0) {
            return;
        }

        this.queue.push({ text });
        this._next();
    }

    remove(length) {
        if (length === 0) {
            return;
        }

        this.queue.push({ remove: length });
        this._next();
    }

    pause(delay) {
        this.queue.push({ delay });
        this._next();
    }

    stop() {
        this.queue.length = 0;
        this._fire("stop_type");
        clearTimeout(this.timer);
        this.timer = null;
    }

    _fire(event) {
        this.input[0].dispatchEvent(new Event(event));
    }

    _next() {
        if (this.timer) {
            return;
        }

        const item = this.queue.shift() ?? {};

        if (item.delay) {
            this._fire("start_pause");
            this.timer = setTimeout(() => {
                this.timer = null;
                this._fire("end_pause");
                this._next();
            }, item.delay);
        } else if (item.remove) {
            this._fire("start_remove");
            this._remove(item.remove);
        } else if (item.text) {
            this._fire("start_type");
            this._step([...item.text]);
        } else {
            this._fire("done_type");
        }
    }

    _remove(length) {
        if (length <= 0) {
            this.timer = null;
            this._fire("end_remove");
            this._next();
            return;
        }

        const text = this.input.val().slice(0, -1);

        this.timer = setTimeout(() => {
            this.input.val(text);
            this._remove(length - 1);
        }, Typist.REMOVE_DELAY);

        this._fire("remove_tick");
    }

    _step(characters) {
        if (characters.length === 0) {
            this.timer = null;
            this._fire("end_type");
            this._next();
            return;
        }

        const character = characters.shift();

        this.timer = setTimeout(() => {
            this.input.val(this.input.val() + character);
            this._step(characters);
        }, Typist.TYPE_DELAY + (Math.random() * Typist.TYPE_VARIATION));

        this._fire("tick");
    }
}
