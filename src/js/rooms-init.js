import { installRooms } from './rooms.js';
import { Constants } from './tt/constants.js';
import { GameController } from './tt/gamecontroller.js';
import { GameState } from './tt/gamestate.js';
import { RoundState } from './tt/roundstate.js';
import { Maze } from './tt/maze.js';
import { PlayerDetails } from './tt/playerdetails.js';
import { Users } from './users.js';
import { Backend } from './backend.js';
import { Caches } from './caches.js';
import { GameSession } from './gamesession.js';
import { ClientManager } from './clientmanager.js';
import { getSelectedTheme } from './localtheme.js';

export function initialiseRooms() {
    installRooms({ Constants, GameController, GameState, RoundState, Maze, PlayerDetails,
        Users, Backend, Caches, GameSession, ClientManager, getSelectedTheme });
}
