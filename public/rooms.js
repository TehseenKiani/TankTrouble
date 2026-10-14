import { createRoomInputs } from './room-inputs.js';

// Room transport owns networking; the existing game controller owns rendering and physics state.
export function installRooms({ Constants, GameController, GameState, RoundState, Maze, PlayerDetails, Users, Backend, Caches, GameSession, ClientManager, getSelectedTheme }) {
    let connection = null;
    let controller = null;
    let roster = null;
    let clientId = null;
    let round = -1;
    let previousState = null;
    let countdown = null;
    let ended = false;
    let pendingMaze = null;
    let dialog = null;
    let status = null;
    let rosterList = null;
    let startButton = null;
    let roomInputs = null;
    const client = ClientManager.getClient();
    const send = packet => { if (connection?.readyState === WebSocket.OPEN) connection.send(JSON.stringify(packet)); };

    function message(text) {
        if (status) status.textContent = text;
        roomButton.textContent = roster ? `Room ${roster.code}` : 'Rooms';
        roomButton.title = text;
    }
    function closeDialog() {
        dialog?.remove(); dialog = null; status = null; rosterList = null; startButton = null;
        GameSession.enableGameInput();
    }
    function leave() {
        const socket = connection;
        connection = null;
        client.roomTransport = null;
        roster = null;
        roomInputs = null;
        socket?.close();
        closeDialog();
        const game = GameSession.getGame();
        if (controller && game?.state.getCurrentState()?.gameController === controller) controller.endGame();
        controller = null;
        Constants.setMode(Constants.MODE_CLIENT_LOCAL);
        roomButton.textContent = 'Rooms';
        roomButton.title = 'Create or join an eight-player room';
    }

    function updateRoster(packet) {
        const previousPlayers = roster?.players || [];
        roster = packet;
        for (const player of packet.players) {
            Caches.getPlayerDetailsCache().set(player.playerId, PlayerDetails.withObject(player));
            const previous = previousPlayers.find(item => item.playerId === player.playerId);
            if (previous && JSON.stringify(previous) !== JSON.stringify(player) && !Users.isAnyUser(player.playerId)) {
                Users.updateUser(player.playerId, true, true);
                const sprite = GameSession.getGame()?.state.getCurrentState()?.getTankSprite?.(player.playerId);
                if (sprite) {
                    sprite.tint = player.baseColour.numericValue;
                    sprite.turret.tint = player.turretColour.numericValue;
                    sprite.leftTread.tint = sprite.rightTread.tint = player.treadColour.numericValue;
                }
            }
        }
        roomButton.textContent = `Room ${packet.code}`;
        if (!dialog) return;
        message(`Room ${packet.code} · ${packet.players.length}/8 players${packet.started ? ' · Playing' : ' · Waiting'}`);
        rosterList.replaceChildren();
        for (const player of packet.players) {
            const row = document.createElement('li');
            row.textContent = player.username;
            row.style.borderLeft = `8px solid #${player.baseColour.numericValue.slice(2)}`;
            rosterList.append(row);
        }
        startButton.hidden = packet.started || packet.host !== clientId;
        startButton.disabled = packet.players.length < 2;
    }

    function removeMissing(next) {
        if (!previousState) return;
        const collections = [
            ['tankStates', 'playerId', item => controller.destroyTank(item.playerId)],
            ['projectileStates', 'id', item => controller.destroyProjectile(item.id)],
            ['trapStates', 'id', item => controller.destroyTrap(item.id)],
            ['collectibleStates', 'id', item => controller.destroyCollectible({ getCollectibleId: () => item.id, getPlayerId: () => '' })],
            ['weaponStates', 'id', item => controller.destroyWeapon({ getWeaponId: () => item.id, getPlayerId: () => item.playerId })],
            ['upgradeStates', 'id', item => controller.destroyUpgrade({ getUpgradeId: () => item.id, getPlayerId: () => item.playerId })],
            ['counterStates', 'id', item => controller.destroyCounter(item.id)],
            ['zoneStates', 'id', item => controller.destroyZone(item.id)]
        ];
        for (const [key, id, remove] of collections) {
            const ids = new Set((next[key] || []).map(item => item[id]));
            for (const item of previousState[key] || []) if (!ids.has(item[id])) remove(item);
        }
    }

    function snapshot(packet) {
        if (packet.maze) pendingMaze = packet.maze;
        if (!controller) {
            Constants.setMode(Constants.MODE_CLIENT_ONLINE);
            // Accept server positions for every tank, including locally predicted tanks.
            controller = GameController.withIds(packet.game.id, []);
            controller.roomConnection = true;
            roomInputs = createRoomInputs(controller, send);
            controller.setInputState = state => roomInputs.update(state);
            round = -1; previousState = null; countdown = null; ended = false;
            GameSession.getGame().state.start('Game', true, false, controller);
            closeDialog();
        }
        // Phaser starts states on its next frame. Retain the initial maze until
        // the game's event listeners are attached, rather than losing its events.
        if (GameSession.getGameController() !== controller) return;
        controller.setGameState(GameState.withObject(packet.game));
        if (!packet.round || !packet.state) return;
        if (packet.round !== round) {
            // A joining client receives a full maze/state for the current round.
            if (round >= 0 && !ended) controller.model.setState('between rounds');
            controller.createRound(false);
            round = packet.round; previousState = null; countdown = null; ended = false;
        }
        if (pendingMaze) {
            controller.setMaze(Maze.withObject(pendingMaze));
            pendingMaze = null;
        }
        if (packet.phase === 'counting down' || packet.phase === 'in round') {
            removeMissing(packet.state);
            roomInputs.reconcile(RoundState.withObject(packet.state));
            previousState = packet.state;
            if (packet.phase === 'counting down' && countdown !== packet.countdown) {
                countdown = packet.countdown;
                controller.countDown(Math.min(3, Math.max(1, countdown)));
            }
            if (packet.phase === 'in round' && controller.getState() !== 'in round') {
                if (controller.getState() === 'between rounds') controller.countDown(0);
                controller.startRound();
            }
        } else if (packet.award && !ended) {
            const award = packet.award;
            controller.endRound({ getPlayerIds: () => award.playerIds, getExperiencePerWinner: () => award.experience,
                getGoldAmountPerWinner: () => 0, getRankChanges: () => [] });
            ended = true;
            previousState = null;
        }
    }

    async function connect(action, code) {
        if (connection) { message('Leave your current room first.'); return; }
        if (GameSession.getGameController()) { message('Leave your current match with X before creating or joining a room.'); return; }
        const playerIds = Users.getAllPlayerIds();
        if (!playerIds.length) { message('Choose 1, 2, or 3 players on the opening screen first.'); return; }
        const players = await Promise.all(playerIds.map(id => Backend.getPlayerDetails(id, Caches.getPlayerDetailsCache())));
        if (players.some(player => !player || typeof player !== 'object')) { message('Player details could not be loaded.'); return; }
        const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/rooms`);
        connection = socket;
        client.roomTransport = { leave };
        message('Connecting…');
        socket.onopen = () => send({ type: action, code, theme: getSelectedTheme(Constants.MAZE_THEMES), players: players.map(player => player.data) });
        socket.onmessage = event => {
            if (socket !== connection) return;
            try {
                const packet = JSON.parse(event.data);
                if (packet.type === 'connected') clientId = packet.id;
                if (packet.type === 'roster') updateRoster(packet);
                if (packet.type === 'snapshot') snapshot(packet);
                if (packet.type === 'error') {
                    message(packet.message);
                    if (!roster) { connection = null; client.roomTransport = null; socket.close(); }
                }
            } catch (error) {
                console.error('Room update failed', error);
                leave(); openDialog(); message('The room update failed. Please rejoin.');
            }
        };
        socket.onerror = () => message('Could not reach the room server.');
        socket.onclose = () => {
            if (socket !== connection) return;
            leave(); openDialog(); message('Disconnected from the room. Join again using its code.');
        };
    }

    function openDialog() {
        if (dialog) return;
        dialog = document.createElement('dialog');
        dialog.className = 'roomDialog';
        const heading = document.createElement('h2'); heading.textContent = 'Multiplayer rooms';
        const hint = document.createElement('p');
        hint.textContent = 'Up to 8 players. Everyone must open this same server address, then enter the room code. The creator chooses the map theme.';
        status = document.createElement('p'); status.setAttribute('role', 'status');
        const create = document.createElement('button'); create.textContent = 'Create room';
        create.addEventListener('click', () => connect('create'));
        const form = document.createElement('form');
        const label = document.createElement('label'); label.textContent = 'Room code ';
        const code = document.createElement('input'); code.name = 'code'; code.maxLength = 6;
        code.placeholder = 'ABC123'; code.autocomplete = 'off'; code.required = true;
        label.append(code);
        const join = document.createElement('button'); join.textContent = 'Join room'; join.type = 'submit';
        form.append(label, join);
        form.addEventListener('submit', event => { event.preventDefault(); connect('join', code.value.trim().toUpperCase()); });
        rosterList = document.createElement('ul');
        startButton = document.createElement('button'); startButton.textContent = 'Start match'; startButton.hidden = true;
        startButton.addEventListener('click', () => send({ type: 'start' }));
        const leaveButton = document.createElement('button'); leaveButton.textContent = 'Leave room';
        leaveButton.addEventListener('click', leave);
        const close = document.createElement('button'); close.textContent = 'Close'; close.addEventListener('click', closeDialog);
        dialog.append(heading, hint, create, form, status, rosterList, startButton, leaveButton, close);
        document.body.append(dialog);
        dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
        dialog.showModal();
        roomInputs?.reset();
        GameSession.disableGameInput();
        if (roster) updateRoster(roster);
        else message('Choose local players, then create a room or enter a code to join.');
    }

    const roomButton = document.createElement('button');
    roomButton.id = 'roomButton'; roomButton.textContent = 'Rooms';
    roomButton.title = 'Create or join an eight-player room';
    roomButton.addEventListener('click', openDialog);
    document.querySelector('#header').append(roomButton);
    Users.addEventListener((self, event, change) => {
        if (!roster || event !== Users.EVENTS.PLAYER_UPDATED || !Users.isAnyUser(change.playerId)) return;
        Backend.getPlayerDetails(change.playerId, Caches.getPlayerDetailsCache()).then(player => {
            if (roster && player && typeof player === 'object') send({ type: 'profile', player: player.data });
        });
    }, null);
    // Input managers publish changes; periodic refreshes also clear stale inputs after disconnects.
    setInterval(() => {
        if (!controller || !connection || dialog) return;
        roomInputs?.heartbeat();
    }, 100);
    window.addEventListener('blur', () => {
        roomInputs?.reset();
    });
}
