// Predict controls immediately, then reconcile against authoritative room state.
// Keep the latest input objects so a delayed snapshot cannot release a held key.
export function createRoomInputs(controller, send) {
    const states = new Map();
    const predict = controller.setInputState.bind(controller);
    const transmit = state => send({ ...state.toObject(), type: 'input' });
    return {
        update(state) {
            states.set(state.getPlayerId(), state);
            predict(state);
            transmit(state);
        },
        reconcile(roundState) {
            controller.setRoundState(roundState);
            for (const state of states.values()) predict(state);
        },
        heartbeat() {
            for (const state of states.values()) transmit(state);
        },
        reset() {
            for (const state of states.values()) {
                const released = state.constructor.withState(state.getPlayerId(), false, false, false, false, false);
                states.set(state.getPlayerId(), released);
                predict(released);
                transmit(released);
            }
        }
    };
}
