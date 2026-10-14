import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomInputs } from './src/js/room-inputs.js';
import { InputState } from './src/js/tt/inputstate.js';

function fixture() {
  const predicted = new Map();
  const packets = [];
  const controller = {
    setInputState(state) { predicted.set(state.getPlayerId(), state.toObject()); },
    setRoundState(state) { for (const tank of state.tanks) predicted.set(tank.playerId, tank); }
  };
  return { predicted, packets, inputs: createRoomInputs(controller, packet => packets.push(packet)) };
}

test('a key change predicts and transmits synchronously, without waiting for a heartbeat', () => {
  const { inputs, predicted, packets } = fixture();
  const start = performance.now();
  inputs.update(InputState.withState('one', true, false, false, false, true));
  assert.equal(predicted.get('one').forward, true);
  assert.equal(packets.length, 1);
  assert.equal(packets[0].fire, true);
  console.log(`Synchronous control path: ${(performance.now() - start).toFixed(3)} ms (no scheduled send delay)`);
});

test('an authoritative correction keeps each local player’s current held controls', () => {
  const { inputs, predicted, packets } = fixture();
  inputs.update(InputState.withState('one', true, false, false, false, false));
  inputs.update(InputState.withState('two', false, false, true, false, false));
  inputs.reconcile({ tanks: [{ playerId: 'one', forward: false }, { playerId: 'two', left: false }] });
  assert.equal(predicted.get('one').forward, true);
  assert.equal(predicted.get('two').left, true);
  assert.equal(packets.length, 2, 'reconciliation does not resend old transitions');
  inputs.heartbeat();
  assert.equal(packets.length, 4);
});

test('focus loss releases movement and fire locally and remotely and keeps them released', () => {
  const { inputs, predicted, packets } = fixture();
  inputs.update(InputState.withState('one', true, false, true, false, true));
  inputs.reset();
  for (const key of ['forward', 'back', 'left', 'right', 'fire']) {
    assert.equal(predicted.get('one')[key], false);
    assert.equal(packets.at(-1)[key], false);
  }
  inputs.heartbeat();
  assert.equal(packets.at(-1).forward, false);
});
