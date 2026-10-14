import { GameMode } from "./gamemode.js";
import { Constants } from "./constants.js";
import { RoundModel } from "./roundmodel.js";
import { Maze } from "./maze.js";
import { ScoreState } from "./scorestate.js";
import { BulletWeapon } from "./bulletweapon.js";
import { IdGenerator } from "./idgenerator.js";

export class BootCampGameMode extends GameMode {
    tanks = null;

    tankCount = 0;

    roundFinishingDuration = 0;

    crateSpawnDuration = 0;

    constructor() {
        super();
        this.mode = Constants.GAME_MODES.BOOT_CAMP;
    }

    canRemovePlayer(playerId) {
        return this.roundController.getTank(playerId) === undefined;
    }

    getScoreStates(playerId) {
        return [
            ScoreState.withState(
                IdGenerator.generate("s"),
                playerId,
                Constants.SCORE_TYPES.KILL,
                0
            ),
            ScoreState.withState(
                IdGenerator.generate("s"),
                playerId,
                Constants.SCORE_TYPES.VICTORY,
                0
            )
        ];
    }

    initialiseRound() {
        this.tanks = this.roundController.getTanks();
        this.tankCount = Object.keys(this.tanks).length;
        this.roundFinishingDuration = Constants.ROUND_FINISHING_DURATION;
        this.crateSpawnDuration = Constants.CRATE_SPAWN_DURATION_MIN + (Math.random() * Constants.CRATE_SPAWN_DURATION_VARIANCE);
    }

    getTeam(playerId) {
        return Constants.TEAMS.NO_TEAM;
    }

    getMaze(playerIds, theme) {
        if (this.symmetric) {
            return Maze.createSymmetric(
                Math.min(Constants.MAZE.MAX_WIDTH, Math.floor((Constants.MAZE.BASE_WIDTH + Constants.MAZE.WIDTH_FOR_PLAYERS[playerIds.length]) * ((Math.random() * (Constants.MAZE.MAX_RANDOM_WIDTH_MULTIPLIER - 1.0)) + 1.0))),
                Math.min(Constants.MAZE.MAX_HEIGHT, Math.floor((Constants.MAZE.BASE_HEIGHT + Constants.MAZE.HEIGHT_FOR_PLAYERS[playerIds.length]) * ((Math.random() * (Constants.MAZE.MAX_RANDOM_HEIGHT_MULTIPLIER - 1.0)) + 1.0))),
                playerIds,
                this.ranked ? Constants.MAZE_THEMES.STANDARD : theme
            );
        } else {
            return Maze.createRandom(
                Math.min(Constants.MAZE.MAX_WIDTH, Math.floor((Constants.MAZE.BASE_WIDTH + Constants.MAZE.WIDTH_FOR_PLAYERS[playerIds.length]) * ((Math.random() * (Constants.MAZE.MAX_RANDOM_WIDTH_MULTIPLIER - 1.0)) + 1.0))),
                Math.min(Constants.MAZE.MAX_HEIGHT, Math.floor((Constants.MAZE.BASE_HEIGHT + Constants.MAZE.HEIGHT_FOR_PLAYERS[playerIds.length]) * ((Math.random() * (Constants.MAZE.MAX_RANDOM_HEIGHT_MULTIPLIER - 1.0)) + 1.0))),
                playerIds,
                this.ranked ? Constants.MAZE_THEMES.STANDARD : theme
            );
        }
    }

    getInitialWeaponState(playerId) {
        return BulletWeapon.createInitialWeaponState(
            IdGenerator.generate("bw"),
            playerId,
            Constants.BULLET_AMMO_COUNT);
    }

    getInitialUpgradeState(playerId) {
        return null;
    }

    getRespawnWeaponState(playerId) {
        return this.getInitialWeaponState(playerId);
    }

    getRespawnUpgradeState(playerId) {
        return this.getInitialUpgradeState(playerId);
    }

    roundEventHandler(self, id, evt, data) {
        switch (evt) {
            case RoundModel._EVENTS.ROUND_ENDED:
            {
                // Register game victory.
                const score = self.gameController.getScoreByPlayerIdAndType(data.getPlayerIds()[0], Constants.SCORE_TYPES.VICTORY);
                if (score) {
                    self.gameController.adjustScore(score.getId(), 1);
                }

                break;
            }
            case RoundModel._EVENTS.TANK_KILLED:
            {
                // Reset round finishing duration every time a tank is killed.
                self.roundFinishingDuration = Constants.ROUND_FINISHING_DURATION;

                // Register kill.
                if (data.getKillerPlayerId() !== data.getVictimPlayerId()) {
                    const score = self.gameController.getScoreByPlayerIdAndType(data.getKillerPlayerId(), Constants.SCORE_TYPES.KILL);
                    if (score) {
                        self.gameController.adjustScore(score.getId(), 1);
                    }
                }

                break;
            }
            case RoundModel._EVENTS.TANK_DESTROYED:
            {
                // Reset round finishing duration every time a tank is destroyed.
                self.roundFinishingDuration = Constants.ROUND_FINISHING_DURATION;
                break;
            }
        }
    }

    update(deltaTime) {
        // Spawn crates
        if (this.crateTypes.length > 0) {
            if (this.roundController.getCrateCount() < Constants.MAX_CRATES) {
                this.crateSpawnDuration -= deltaTime;
                if (this.crateSpawnDuration < 0.0) {
                    let cratePosition;
                    if (this.symmetric) {
                        cratePosition = this.roundController.getMaze().getCrateSpawnPosition(this.roundController.getRoundState(true));
                    } else {
                        cratePosition = this.roundController.getMaze().getRandomUnusedPosition(this.roundController.getRoundState(true), Constants.CRATE_MINIMUM_TILES_TO_TANKS);
                    }
                    if (cratePosition) {
                        const randomCrateType = this.crateTypes[Math.floor(Math.random() * this.crateTypes.length)];
                        this.roundController.spawnCrate(randomCrateType, cratePosition);
                    }

                    this.crateSpawnDuration = Constants.CRATE_SPAWN_DURATION_MIN + (Math.random() * Constants.CRATE_SPAWN_DURATION_VARIANCE);
                }
            }
        }

        // Check if round should be over soon.
        this.tanks = this.roundController.getTanks();
        this.tankCount = Object.keys(this.tanks).length;
        if (this.tankCount <= 1) {
            this.roundFinishingDuration -= deltaTime;
        }
    }

    isRoundOver() {
        return this.roundFinishingDuration <= 0;
    }

    getWinnerPlayerIds() {
        if (this.tankCount === 1) {
            return [this.tanks[Object.keys(this.tanks)[0]].getPlayerId()];
        } else {
            return [];
        }
    }

    getVictoryExperience() {
        return 0;
    }

    getKillExperience() {
        return 0;
    }

    getVictoryGoldAmount() {
        return 0;
    }
}
