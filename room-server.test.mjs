import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { createRoomService } from './room-server.mjs';

const player = index => ({ playerId: `guest_test_${index}`, username: `Player ${index}`,
  baseColour: { numericValue: '0x2980b9' }, turretColour: { numericValue: '0x63caff' }, treadColour: { numericValue: '0x34495e' } });

test('eight real sockets share authoritative physics, capacity, ownership and cleanup', async t => {
  const wall = performance.now();
  const cpu = process.cpuUsage();
  const service = createRoomService();
  const server = http.createServer();
  const wss = new WebSocketServer({ server });
  wss.on('connection', service.attach);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const clients = [];
  t.after(async () => {
    for (const client of clients) client.socket.terminate();
    service.close();
    await new Promise(resolve => wss.close(resolve));
    await new Promise(resolve => server.close(resolve));
  });
  async function open() {
    const socket = new WebSocket(`ws://127.0.0.1:${server.address().port}/rooms`);
    const packets = [];
    const snapshotTimes = [];
    socket.on('message', raw => {
      const packet = JSON.parse(raw.toString());
      packets.push(packet);
      if (packet.type === 'snapshot') snapshotTimes.push(performance.now());
    });
    await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
    const client = { socket, packets, snapshotTimes, send: packet => socket.send(JSON.stringify(packet)) };
    clients.push(client);
    return client;
  }
  async function wait(client, predicate, timeout = 8000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const found = client.packets.find(predicate);
      if (found) return found;
      await new Promise(resolve => setTimeout(resolve, 15));
    }
    throw Error(`Timed out. Last packets: ${JSON.stringify(client.packets.slice(-2))}`);
  }
  const host = await open();
  host.send({ type: 'create', theme: 0, players: [player(1)] });
  const room = await wait(host, packet => packet.type === 'roster');
  assert.match(room.code, /^[A-F0-9]{6}$/);
  for (let index = 2; index <= 8; index++) {
    const client = await open();
    client.send({ type: 'join', code: room.code, players: [player(index)] });
    await wait(client, packet => packet.type === 'roster' && packet.players.length === index);
  }
  const ninth = await open();
  ninth.send({ type: 'join', code: room.code, players: [player(9)] });
  assert.match((await wait(ninth, packet => packet.type === 'error')).message, /full/);
  clients[1].send({ type: 'profile', player: { ...player(1), username: 'Unauthorized' } });
  assert.match((await wait(clients[1], packet => packet.type === 'error' && /own room/.test(packet.message))).message, /own/);
  host.send({ type: 'profile', player: { ...player(1), username: 'Host ace' } });
  await wait(clients[1], packet => packet.type === 'roster' && packet.players[0].username === 'Host ace');
  clients[1].send({ type: 'start' });
  assert.match((await wait(clients[1], packet => packet.type === 'error' && /creator/.test(packet.message))).message, /creator/);
  host.send({ type: 'start' });
  const first = await wait(host, packet => packet.type === 'snapshot' && packet.phase === 'in round');
  assert.equal(first.state.tankStates.length, 8);
  for (const client of clients.slice(0, 8)) {
    const initial = await wait(client, packet => packet.type === 'snapshot' && packet.maze);
    assert.deepEqual(initial.maze, host.packets.find(packet => packet.type === 'snapshot' && packet.maze).maze);
    assert.equal(initial.game.maxActivePlayerCount, 8);
  }
  const before = first.state.tankStates.find(tank => tank.playerId === player(1).playerId);
  const input = { type: 'input', playerId: player(1).playerId, forward: true, back: false, left: false, right: false, fire: true };
  // A different connection cannot control the host's tank.
  clients[1].send(input);
  await new Promise(resolve => setTimeout(resolve, 150));
  const afterSpoof = host.packets.at(-1).state.tankStates.find(tank => tank.playerId === player(1).playerId);
  assert.equal(afterSpoof.x, before.x);
  assert.equal(afterSpoof.y, before.y);
  const refresh = setInterval(() => host.send(input), 100);
  const moved = await wait(host, packet => packet.type === 'snapshot' && packet.state?.tankStates.some(tank => tank.playerId === before.playerId && (tank.x !== before.x || tank.y !== before.y)));
  clearInterval(refresh);
  assert(moved.state.projectileStates.length > 0 || host.packets.some(packet => packet.state?.projectileStates.length > 0));
  const simulation = service.rooms.get(room.code).game;
  simulation.endRound({ getPlayerIds: () => [player(1).playerId], getExperiencePerWinner: () => 0,
    getGoldAmountPerWinner: () => 0, getRankChanges: () => [] });
  const finished = await wait(host, packet => packet.type === 'snapshot' && packet.award);
  assert.deepEqual(finished.award.playerIds, [player(1).playerId]);
  assert(finished.game.scoreStates.some(score => score.playerId === player(1).playerId && score.value === 1));
  simulation.betweenRoundsDuration = 100;
  const nextRound = await wait(host, packet => packet.type === 'snapshot' && packet.round > first.round && packet.maze);
  assert.equal(nextRound.state.tankStates.length, 8);
  clients[7].socket.close();
  await wait(host, packet => packet.type === 'roster' && packet.started && packet.players.length === 7);
  ninth.packets.length = 0;
  ninth.send({ type: 'join', code: room.code, players: [player(9)] });
  const joined = await wait(ninth, packet => packet.type === 'snapshot' && packet.maze);
  assert.equal(joined.game.playerStates.length, 8);
  host.socket.close();
  const transferred = await wait(clients[1], packet => packet.type === 'roster' && packet.started && packet.players.length === 7 && packet.host !== room.host);
  assert.notEqual(transferred.host, room.host);
  for (const client of clients) client.socket.close();
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(service.rooms.size, 0);
  const usage = process.cpuUsage(cpu);
  const snapshotHz = (host.snapshotTimes.length - 1) * 1000 / (host.snapshotTimes.at(-1) - host.snapshotTimes[0]);
  assert(snapshotHz > 20, `Snapshot cadence regressed: ${snapshotHz.toFixed(1)} Hz`);
  console.log(JSON.stringify({ workflow: '8 WebSocket clients, cold room, shared maze, physics/input, ninth-player rejection, scoring/next round, late join, host transfer, empty-room cleanup', elapsedMs: Math.round(performance.now() - wall), cpuMs: Math.round((usage.user + usage.system) / 1000), peakProcessMemoryKiB: process.resourceUsage().maxRSS, snapshotHz: Number(snapshotHz.toFixed(1)), tokenUsage: 'not measured' }));
});
