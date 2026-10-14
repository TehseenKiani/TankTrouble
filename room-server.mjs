import { randomBytes } from 'node:crypto';
import { Constants, GameController, BootCampGameMode, InputState } from './engine-runtime.mjs';

const INPUT_KEYS = ['forward', 'back', 'left', 'right', 'fire'];
const MAX_PLAYERS = 8;
const MAX_ROOMS = 32;
const MAX_BUFFERED = 512 * 1024;
const SNAPSHOT_INTERVAL = 1000 / 30;
// Three local input managers at 60 FPS, 10 Hz keepalives, and room actions.
const MAX_MESSAGES_PER_SECOND = 240;

export function createRoomService({ autoTick = true } = {}) {
  const rooms = new Map();
  const connections = new Set();
  const send = (ws, packet) => {
    if (ws.readyState !== 1) return;
    if (ws.bufferedAmount > MAX_BUFFERED) { ws.close(1013, 'Connection too slow'); return; }
    ws.send(JSON.stringify(packet));
  };
  const roster = room => ({ type: 'roster', code: room.code, host: room.host.id,
    started: !!room.game, players: [...room.members].flatMap(member => member.players) });
  const broadcast = (room, packet) => { for (const member of room.members) send(member.ws, packet); };
  const publishRoster = room => broadcast(room, roster(room));

  function leave(member) {
    const room = member.room;
    if (!room) return;
    member.room = null;
    room.members.delete(member);
    for (const player of member.players) room.game?.removePlayer(player.playerId);
    member.players = [];
    if (!room.members.size) { rooms.delete(room.code); return; }
    if (room.host === member) room.host = room.members.values().next().value;
    publishRoster(room);
  }

  function parsePlayers(value) {
    if (!Array.isArray(value) || value.length < 1 || value.length > 3) throw Error('Choose one to three local players first.');
    const ids = new Set();
    return value.map(player => {
      if (!player || typeof player.playerId !== 'string' || !/^guest_[a-zA-Z0-9_-]{1,100}$/.test(player.playerId) || ids.has(player.playerId)) throw Error('Invalid local player. Refresh and try again.');
      ids.add(player.playerId);
      if (typeof player.username !== 'string' || !player.username.trim() || player.username.length > 24) throw Error('Player names must be 1–24 characters.');
      const result = { playerId: player.playerId, username: player.username.trim(), guest: true, premium: true,
        rank: 0, xp: 0, experience: 0, kills: 0, victories: 0, deaths: 0, suicides: 0, surrenders: 0,
        usernameApproved: true, verified: false, beta: false, created: Math.floor(Date.now() / 1000), country: null,
        turretAccessory: '0', barrelAccessory: '0', frontAccessory: '0', backAccessory: '0', treadAccessory: '0', backgroundAccessory: '0', badge: '0', gmLevel: null };
      for (const part of ['base', 'turret', 'tread']) {
        const raw = player[`${part}Colour`]?.numericValue;
        if (typeof raw !== 'string' || !/^0x[0-9a-f]{6}$/i.test(raw)) throw Error('Invalid tank color.');
        result[`${part}Colour`] = { type: 'numeric', rawValue: raw, numericValue: raw, imageValue: '' };
      }
      return result;
    });
  }

  function start(room) {
    if (room.game) throw Error('This match has already started.');
    if ([...room.members].reduce((count, member) => count + member.players.length, 0) < 2) throw Error('At least two players are needed to start.');
    const game = new GameController(new BootCampGameMode(), false, false, false, MAX_PLAYERS,
      Constants.GAME_MODE_INFO[Constants.GAME_MODES.BOOT_CAMP].DEFAULT_AVAILABLE_CRATES, true, room.theme);
    for (const member of room.members) for (const player of member.players) game.addPlayer(player.playerId);
    room.round = 0;
    room.award = null;
    game.addRoundEventListener((self, id, event, data) => {
      if (event === 'round created') { room.round++; room.award = null; }
      if (event === 'round ended') room.award = { playerIds: data.getPlayerIds(), experience: data.getExperiencePerWinner(), gold: 0, rankChanges: [] };
    }, room);
    game.betweenRoundsDuration = 100;
    room.game = game;
    publishRoster(room);
  }

  function tick() {
    const now = Date.now();
    for (const room of rooms.values()) {
      if (!room.game) continue;
      try {
        for (const member of room.members) for (const player of member.players) {
          const input = now - member.lastInputAt < 500 ? member.inputs.get(player.playerId) : null;
          room.game.setInputState(InputState.withState(player.playerId, ...INPUT_KEYS.map(key => !!input?.[key])));
        }
        room.game.update();
        const deadline = room.nextSnapshotAt || now;
        if (now < deadline) continue;
        // Advance a deadline instead of resetting an elapsed timer each tick.
        // Resetting a 50 ms timer on a 33 ms tick silently reduced snapshots to 15 Hz.
        room.nextSnapshotAt = deadline + SNAPSHOT_INTERVAL;
        if (room.nextSnapshotAt < now) room.nextSnapshotAt = now + SNAPSHOT_INTERVAL;
        const maze = room.game.getMaze();
        // Full states use the engine's expanded representation, including weapons/upgrades.
        const roundState = room.game.roundController?.getRoundState(true)?.toObject();
        const packet = { type: 'snapshot', code: room.code, round: room.round,
          phase: room.game.getState(), countdown: room.game.countDownValue + 1,
          game: room.game.getGameState().toObject(), state: roundState,
          award: room.award };
        const mazeObject = maze?.toObject();
        for (const member of room.members) {
          // Send the maze once per connection per round, rather than on every tick.
          const needsMaze = mazeObject && member.mazeRound !== room.round;
          send(member.ws, needsMaze ? { ...packet, maze: mazeObject } : packet);
          if (needsMaze) member.mazeRound = room.round;
        }
      } catch (error) {
        console.error(`Room ${room.code} failed:`, error);
        broadcast(room, { type: 'error', message: 'The room match stopped. Leave and create a new room.' });
        room.game = null;
        publishRoster(room);
      }
    }
  }

  function attach(ws) {
    if (connections.size >= 128) { ws.close(1013, 'Server is full'); return; }
    const member = { ws, id: randomBytes(12).toString('hex'), room: null, players: [], inputs: new Map(), lastInputAt: 0, mazeRound: -1, windowAt: Date.now(), messages: 0, alive: true };
    connections.add(member);
    send(ws, { type: 'connected', id: member.id });
    ws.on('pong', () => { member.alive = true; });
    ws.on('message', raw => {
      try {
        const now = Date.now();
        if (now - member.windowAt >= 1000) { member.windowAt = now; member.messages = 0; }
        if (++member.messages > MAX_MESSAGES_PER_SECOND) throw Error('Too many room messages.');
        if (raw.length > 16384) { ws.close(1009, 'Message too large'); return; }
        const message = JSON.parse(raw.toString());
        if (!message || typeof message.type !== 'string') throw Error('Invalid room message.');
        if (message.type === 'leave') { leave(member); send(ws, { type: 'left' }); return; }
        if (message.type === 'input') {
          if (!member.room?.game || !member.players.some(player => player.playerId === message.playerId)) return;
          if (INPUT_KEYS.some(key => typeof message[key] !== 'boolean')) throw Error('Invalid controls.');
          member.inputs.set(message.playerId, Object.fromEntries(INPUT_KEYS.map(key => [key, message[key]])));
          member.lastInputAt = now;
          return;
        }
        if (message.type === 'start') {
          if (!member.room || member.room.host !== member) throw Error('Only the room creator can start the match.');
          start(member.room);
          return;
        }
        if (message.type === 'profile') {
          if (!member.room) throw Error('Join a room before editing a room player.');
          const [profile] = parsePlayers([message.player]);
          const index = member.players.findIndex(player => player.playerId === profile.playerId);
          if (index < 0) throw Error('You can only edit your own room players.');
          member.players[index] = profile;
          publishRoster(member.room);
          return;
        }
        if (!['create', 'join'].includes(message.type)) throw Error('Unknown room action.');
        if (member.room) throw Error('Leave your current room first.');
        const players = parsePlayers(message.players);
        let room;
        if (message.type === 'create') {
          if (rooms.size >= MAX_ROOMS) throw Error('All room slots are in use. Try again later.');
          if (![0, 1, 2, 4].includes(message.theme)) throw Error('Invalid room theme.');
          let code;
          do { code = randomBytes(4).toString('hex').slice(0, 6).toUpperCase(); } while (rooms.has(code));
          room = { code, host: member, members: new Set(), theme: message.theme, game: null, nextSnapshotAt: 0 };
          rooms.set(code, room);
        } else {
          if (typeof message.code !== 'string' || !/^[0-9A-F]{6}$/.test(message.code)) throw Error('Enter a valid six-character room code.');
          room = rooms.get(message.code);
          if (!room) throw Error('Room not found. Check the code and server address.');
          const existing = [...room.members].flatMap(item => item.players);
          if (existing.length + players.length > MAX_PLAYERS) throw Error('This room is full (8 players maximum).');
          if (players.some(player => existing.some(other => other.playerId === player.playerId))) throw Error('That player is already in this room.');
        }
        member.players = players;
        member.room = room;
        member.mazeRound = -1;
        room.members.add(member);
        for (const player of players) room.game?.addPlayer(player.playerId);
        publishRoster(room);
      } catch (error) { send(ws, { type: 'error', message: error.message }); }
    });
    ws.on('error', () => {});
    ws.on('close', () => { leave(member); connections.delete(member); });
  }
  const timer = autoTick ? setInterval(tick, 1000 / 60) : null;
  const heartbeat = autoTick ? setInterval(() => {
    for (const member of connections) {
      if (!member.alive) { member.ws.terminate(); continue; }
      member.alive = false;
      member.ws.ping();
    }
  }, 15000) : null;
  timer?.unref(); heartbeat?.unref();
  return { attach, tick, rooms, close() {
    clearInterval(timer); clearInterval(heartbeat);
    for (const member of connections) member.ws.close(1001, 'Server stopped');
    rooms.clear();
  } };
}
