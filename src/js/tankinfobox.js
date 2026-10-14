import { TankTrouble } from "./tanktrouble.js";
import { Users } from "./users.js";
import { Caches } from "./caches.js";
import { GameSession } from "./gamesession.js";
import { createLocalPlayerBox } from "./localplayers.js";

TankTrouble.TankInfoBox = createLocalPlayerBox({ Users, Caches, GameSession });
