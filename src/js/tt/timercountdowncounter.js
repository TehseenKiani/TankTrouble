import { Constants } from "./constants.js";
import { Counter } from "./counter.js";

export class TimerCountdownCounter extends Counter {
    _startTime = 0;
    _currentTime = 0;

    constructor(counterState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setCounterState(counterState);
    }

    update(deltaTime) {
        this._currentTime = Math.max(0, this._currentTime - deltaTime);
    }

    done() {
        return this._currentTime <= 0;
    }

    static createInitialCounterState(id, startTime, currentTime) {
        const fields = {
            _startTime: startTime,
            _currentTime: currentTime
        };

        return Counter.createInitialCounterState(id, Constants.COUNTER_TYPES.TIMER_COUNTDOWN, JSON.stringify(fields));
    }
}
