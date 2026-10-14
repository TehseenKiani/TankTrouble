# Multiplayer rooms

Start the local server with `node server.mjs` (tested with Node.js 24.12.0).

1. Choose one, two, or three local players and assign their controls.
2. Click **Rooms**, then **Create room**. The creator's selected map theme is used.
3. Other players open the same server address, choose their local players, click
   **Rooms**, and enter the six-character code under **Join room**.
4. The creator clicks **Start match** once at least two players have joined.

There can be eight players total, including multiple players sharing a keyboard.
Players joining an ongoing match enter the queue for the next round. The server
runs the original game's physics, weapons, scoring, and rounds. The browser renders
authoritative snapshots, predicts local controls immediately, and sends controls
only for its own players. Each authoritative snapshot corrects positions before
the current held controls are reapplied. Name and
color edits made through the local player editor are shared with the room.

On other computers on the same network, use `http://<server-computer-LAN-IP>:8085/game`,
not `localhost`. The server must remain running and reachable. This change does
not publish the server to the internet or change firewall/router settings.

Rooms are held in memory. A disconnected player is removed; creator controls pass
to another connection if the creator leaves. Empty rooms are deleted, and restarting
the server clears all rooms. Room codes are for joining a casual local game and
are not account authentication.

The server allows up to 32 rooms and 128 room connections, enforces eight players
per room, validates player/control payloads, rejects oversized messages, rate-limits
incoming messages, clears stale controls, and closes slow or unresponsive clients.

## Verification

Run `node --test room-inputs.test.mjs room-server.test.mjs`. Input tests cover
immediate prediction/transmission, controls surviving authoritative corrections,
and releasing keys on focus loss. The room test uses eight actual WebSocket clients and
the production engine to check shared mazes, movement/firing, ownership of inputs,
full-room rejection, profile edits and their ownership, explicit round-end scoring and the next round, joining an
ongoing game, creator transfer, and empty-room cleanup.

Before the responsiveness fix, controls waited for a 100 ms periodic sender and
were not predicted locally. The 30 Hz simulation's elapsed snapshot timer also
quantized its 50 ms target to roughly 15 Hz (derived from the timer settings).
Controls now predict and send synchronously; the measured input function took
0.256 ms, excluding frame rendering and network travel. The server runs physics
at 60 Hz and advances snapshot deadlines to deliver 30 Hz; the eight-client test
measured 30.1 Hz.

Equivalent cold completed eight-client workflows on this development machine:

| Version | Elapsed | Test-process CPU | Peak test-process memory |
| --- | --- | --- | --- |
| Before responsiveness fix | 3.30 s | 421 ms | 77,212 KiB |
| After responsiveness fix | 3.08 s | 390 ms | 93,396 KiB |

These are individual runs with random mazes, not a statistically controlled CPU
comparison. The test retains received packets, and the new version sends about
twice as many snapshots. The engine and socket clients share one test process;
test-runner overhead and whole-process-family peak memory were not measured.
Warm-run costs, browser CPU/memory, end-to-end key-to-display latency, and agent
token costs were not measured.

Browser verification used two independent game tabs to create/join one room and
observe the same maze, tanks, movement, and firing. Eight rendered browser clients,
separate physical devices, internet latency, and firewall traversal are unverified.
