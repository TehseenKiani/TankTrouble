# TankTrouble

Local and LAN multiplayer Tank Trouble server with the browser client in `public/`.

## Run locally

```bash
npm ci
npm start
```

Open [http://localhost:8085/game](http://localhost:8085/game). Default port is **8085**; override with `PORT`.

## VPS

```bash
git clone https://github.com/TehseenKiani/TankTrouble.git
cd TankTrouble
npm ci
PORT=8085 npm start
```

Use a process manager (systemd, pm2) and reverse proxy (nginx, Caddy) for HTTPS. See [ROOMS.md](ROOMS.md) for multiplayer rooms.

## Tests

```bash
npm test
```
