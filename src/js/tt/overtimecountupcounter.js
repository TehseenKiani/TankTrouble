import { Constants } from "./constants.js";
import { Counter } from "./counter.js";

export class OvertimeCountUpCounter extends Counter {
    _currentTime = 0;

    constructor(counterState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setCounterState(counterState);
    }

    update(deltaTime) {
        this._currentTime += deltaTime;
    }

    done() {
        return false;
    }

    static createInitialCounterState(id, currentTime) {
        const fields = {
            _currentTime: currentTime
        };

        return Counter.createInitialCounterState(id, Constants.COUNTER_TYPES.OVERTIME_COUNT_UP, JSON.stringify(fields));
    }
}
