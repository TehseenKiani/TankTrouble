import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { createRoomService } from './room-server.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 8085;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webm': 'audio/webm',
  '.m4a': 'audio/mp4'
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  let pathname = urlObj.pathname;

  // Handle SPA game routes
  if (pathname === '/' || pathname === '/game' || pathname === '/shop' || pathname === '/news' || pathname === '/forum') {
    pathname = '/index.html';
  }

  // Handle Ajax API requests
  if (pathname === '/ajax/' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const method = payload.method;
        const reqId = payload.id || 1;

        // Offline / Local Handlers for core game functionality
        if (method === 'tanktrouble.account.createGuests') {
          const count = payload.params?.[0] || 1;
          const playerIds = [];
          const multiplayerTokens = [];
          const playerDetails = [];

          const colours = [
            { turret: '0xff55ee', base: '0xa5ff03', tread: '0xa5ff03' },
            { turret: '0x3498db', base: '0x2980b9', tread: '0x34495e' },
            { turret: '0xe67e22', base: '0xd35400', tread: '0x7f8c8d' }
          ];

          for (let i = 0; i < count; i++) {
            const pid = `guest_${Date.now()}_${i + 1}`;
            const token = `token_${Date.now()}_${i + 1}`;
            playerIds.push(pid);
            multiplayerTokens.push(token);
            const c = colours[i % colours.length];
            playerDetails.push({
              playerId: pid,
              username: `Player ${i + 1}`,
              victories: 0,
              kills: 0,
              deaths: 0,
              suicides: 0,
              experience: 0,
              surrenders: 0,
              turretColour: { type: 'numeric', rawValue: c.turret, numericValue: c.turret, imageValue: '' },
              treadColour: { type: 'numeric', rawValue: c.tread, numericValue: c.tread, imageValue: '' },
              baseColour: { type: 'numeric', rawValue: c.base, numericValue: c.base, imageValue: '' },
              turretAccessory: '0',
              barrelAccessory: '0',
              frontAccessory: '0',
              backAccessory: '0',
              treadAccessory: '0',
              backgroundAccessory: '0',
              badge: '0',
              premium: true,
              rank: 0,
              xp: 0,
              beta: false,
              verified: false,
              newsSubscriber: false,
              lastForumPost: null,
              guest: true,
              gmLevel: null,
              created: Math.floor(Date.now() / 1000),
              lastLogin: null,
              banned: false,
              usernameApproved: true,
              country: null
            });
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: reqId,
            result: {
              result: true,
              message: 'OK',
              data: {
                achievementUnlocks: [],
                data: {
                  playerIds,
                  multiplayerTokens,
                  playerDetails
                }
              }
            }
          }));
          return;
        }

        if (method === 'tanktrouble.getAdmissionToken') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: reqId,
            result: {
              result: true,
              message: 'OK',
              data: {
                token: 'local_admission_token',
                expiresAt: 2147483647
              }
            }
          }));
          return;
        }

        // Try proxying to official server
        const proxyRes = await fetch('https://tanktrouble.com/ajax/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body
        });
        const data = await proxyRes.text();
        res.writeHead(proxyRes.status, { 'Content-Type': 'application/json' });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', error: { message: err.message }, id: 1 }));
      }
    });
    return;
  }

  // Static file serving
  const localFilePath = path.join(PUBLIC_DIR, pathname);

  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    const ext = path.extname(localFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    fs.createReadStream(localFilePath).pipe(res);
    return;
  }

  // Auto-caching fallback: Fetch missing assets from tanktrouble.com and cache locally
  if (pathname.startsWith('/build/') || pathname.startsWith('/assets/') || pathname.endsWith('.ico') || pathname.endsWith('.php')) {
    try {
      console.log(`[Cache Miss] Fetching from remote: ${pathname}`);
      const remoteUrl = `https://tanktrouble.com${pathname}${urlObj.search}`;
      const remoteRes = await fetch(remoteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (remoteRes.ok) {
        const buffer = Buffer.from(await remoteRes.arrayBuffer());
        // Save locally for future requests
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
        fs.writeFileSync(localFilePath, buffer);

        const ext = path.extname(localFilePath).toLowerCase();
        const contentType = remoteRes.headers.get('content-type') || MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(buffer);
        return;
      }
    } catch (err) {
      console.error(`Failed to cache ${pathname}:`, err.message);
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

// Setup WebSocket Server for Local/LAN Multiplayer
const roomService = createRoomService();
const wss = new WebSocketServer({ server, maxPayload: 16384 });

wss.on('connection', (ws, req) => {
  if (new URL(req.url, 'http://localhost').pathname === '/rooms') {
    roomService.attach(ws);
    return;
  }
  console.log('[WS] Client connected from browser');

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      // In-game binary / schemapack packet
      return;
    }

    const typeId = msg._typeId;
    console.log(`[WS] Received message type: ${typeId}`);

    // PingMessage (15) -> PongMessage (28)
    if (typeId === 15) {
      ws.send(JSON.stringify({
        _typeId: 28,
        result: true,
        clientTimestamp: msg.clientTimestamp || Date.now(),
        serverTimestamp: Date.now()
      }));
      return;
    }

    // HandshakeMessage (45) -> HandshakeResultMessage (58)
    if (typeId === 45) {
      console.log('[WS] Handshake accepted');
      ws.send(JSON.stringify({
        _typeId: 58,
        result: true,
        message: 'OK',
        resultData: null
      }));
      return;
    }

    // AuthenticateMessage (23) -> AuthenticateResultMessage (51)
    if (typeId === 23) {
      console.log('[WS] Authenticating players:', msg.playerIds);
      const pids = (msg.playerIds && msg.playerIds.length > 0) ? msg.playerIds : ['local_guest'];
      const playerDetails = pids.map((pid, idx) => ({
        playerId: pid,
        username: `Player ${idx + 1}`,
        victories: 0,
        kills: 0,
        deaths: 0,
        suicides: 0,
        experience: 0,
        surrenders: 0,
        turretColour: { type: 'numeric', rawValue: '0xff55ee', numericValue: '0xff55ee', imageValue: '' },
        treadColour: { type: 'numeric', rawValue: '0xa5ff03', numericValue: '0xa5ff03', imageValue: '' },
        baseColour: { type: 'numeric', rawValue: '0xa5ff03', numericValue: '0xa5ff03', imageValue: '' },
        turretAccessory: '0',
        barrelAccessory: '0',
        frontAccessory: '0',
        backAccessory: '0',
        treadAccessory: '0',
        backgroundAccessory: '0',
        badge: '0',
        premium: true,
        rank: 0,
        xp: 0,
        beta: false,
        verified: false,
        newsSubscriber: false,
        guest: true,
        gmLevel: null,
        created: Math.floor(Date.now() / 1000),
        lastLogin: null,
        banned: false,
        usernameApproved: true,
        country: null
      }));

      ws.send(JSON.stringify({
        _typeId: 51,
        result: true,
        message: 'OK',
        resultData: playerDetails
      }));
      return;
    }

    // ListGamesMessage (27) -> ListGamesResultMessage (57)
    if (typeId === 27) {
      ws.send(JSON.stringify({
        _typeId: 57,
        result: true,
        message: 'OK',
        resultData: []
      }));
      return;
    }

    // CreateGameMessage (32) -> CreateGameResultMessage (53)
    if (typeId === 32) {
      console.log('[WS] CreateGame received:', msg);
      const gameId = 'local_game_' + Date.now();
      ws.send(JSON.stringify({
        _typeId: 53,
        result: true,
        message: 'OK',
        resultData: gameId
      }));
      return;
    }

    // JoinGameMessage (33) -> JoinGameResultMessage (54)
    if (typeId === 33) {
      console.log('[WS] JoinGame received:', msg);
      const gameId = (msg.gameId && msg.gameId !== '*') ? msg.gameId : ('local_game_' + Date.now());
      ws.send(JSON.stringify({
        _typeId: 54,
        result: true,
        message: 'OK',
        resultData: gameId
      }));
      return;
    }

    // LeaveGameMessage (34) -> LeaveGameResultMessage (55)
    if (typeId === 34) {
      console.log('[WS] LeaveGame received');
      ws.send(JSON.stringify({
        _typeId: 55,
        result: true,
        message: 'OK',
        resultData: null
      }));
      return;
    }

    // Default fallback: acknowledge with success
    console.log(`[WS] Handled unspecialized message type: ${typeId}`);
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TankTrouble local server running at http://localhost:${PORT}`);
  console.log(`LAN access available at http://<your-local-ip>:${PORT}`);
});
