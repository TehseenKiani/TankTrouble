import { MazeMap } from "./mazemap.js";
import { Constants } from "./constants.js";
import { B2DUtils } from "./b2dutils.js";
import { MathUtils } from "./mathutils.js";
import { InputState } from "./inputstate.js";
import { RoundModel } from "./roundmodel.js";
import { AIUtils } from "./aiutils.js";

export class AI {
    static _TRAITS = {
        AGGRESSIVENESS: "aggressiveness",
        VENGEFULNESS: "vengefulness",
        CLEVERNESS: "cleverness",
        GREEDINESS: "greediness",
        BOLDNESS: "boldness",
        DETERMINATION: "determination",
        INSANITY: "insanity", // Unused. Shuffles goal priority?
        CHATTINESS: "chattiness", // Unused.
        DEXTERITY: "dexterity"
    };

    static _GOALS = {
        SHOOT_AFTER: "shoot after",
        LAY_TRAP: "lay trap",
        PICK_UP_COLLECTIBLE: "pick up collectible",
        DODGE_PROJECTILE: "dodge projectile",
        GET_UNSTUCK: "get unstuck",
        RUN_AWAY: "run away",
        HUNT: "hunt",
        IDLE: "idle"
    };

    static _ACTIONS = {
        DRIVE_TO_TILE: "drive to tile",
        DRIVE_TO_POSITION: "drive to position",
        TURN_TO: "turn to",
        FIRE: "fire",
        IDLE: "idle"
    };

    static _EVENTS = {
        GOAL_UPDATED: "goal updated" // Unused for now.
    };

    aiId = null;
    config = null;
    gameController = null;
    myPosition = null;
    tankPositions = {};
    projectilePositions = {};
    projectilePaths = {};
    trapPositions = {};
    weaponCratePositions = [];
    shieldCratePositions = [];
    goldPositions = [];
    diamondPositions = [];
    laserAimerPaths = {};
    threatMap = null;
    kills = [];
    stuckNormal = null;
    stuckNow = false;
    stuckTime = 0;
    currentAggressiveness = null;
    currentGreediness = null;
    goal = null;
    nextGoalId = 1;
    actions = [];
    inputState = null;

    constructor(aiId, config, gameController) {
        this.aiId = aiId;
        this.config = config;
        this.gameController = gameController;

        this._reset();

        this.inputState = InputState.withState(this.aiId, false, false, false, false, false);
        this.gameController.addRoundEventListener(this._roundEventHandler, this);
    }

    update(deltaTime) {
        this._updateState(deltaTime);

        if (this._makeDecisionsAndUpdateGoal(deltaTime)) {
            this._updateActionsToAchieveGoal();
        }

        this._updateInputToDoAction();

        this._updateAndRemovePerformedActions(deltaTime);
    }

    shutdown() {
        this.gameController.removeRoundEventListener(this._roundEventHandler, this);
    }

    getInputState() {
        return this.inputState;
    }

    _roundEventHandler(self, id, evt, data) {
        switch (evt) {
            case RoundModel._EVENTS.TANK_KILLED:
            {
                if ((data.getKillerPlayerId() === self.aiId && data.getVictimPlayerId() !== self.aiId) ||
                    (data.getKillerPlayerId() !== self.aiId && data.getVictimPlayerId() === self.aiId)) {
                    self.kills.push(data);

                    if (self.kills.length > Constants.AI.KILLS_TO_REMEMBER) {
                        self.kills.shift();
                    }
                }
                break;
            }
            case RoundModel._EVENTS.ROUND_CREATED:
            {
                // Reset goal and relevant state.
                self._reset();
                break;
            }
            case RoundModel._EVENTS.TANK_MAZE_COLLISION:
            {
                if (data.tankA.getPlayerId() === self.aiId) {
                    self.stuckNormal = data.collisionNormal;
                    self.stuckNow = true;
                }
                break;
            }
        }
    }

    _updateState(deltaTime) {
        const tank = this.gameController.getTank(this.aiId);
        if (tank === undefined) {
            return;
        }

        this.myPosition = { x: Math.floor(tank.getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(tank.getY() / Constants.MAZE_TILE_SIZE.m) };

        // FIXME Share tankPositions, collectible positions and projectilePositions between AIs.
        const tanks = this.gameController.getTanks();
        this.tankPositions = {};
        for (const tankId in tanks) {
            this.tankPositions[tankId] = { x: Math.floor(tanks[tankId].getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(tanks[tankId].getY() / Constants.MAZE_TILE_SIZE.m) };
        }

        const collectibles = this.gameController.getCollectibles();
        this.weaponCratePositions = [];
        this.shieldCratePositions = [];
        this.goldPositions = [];
        this.diamondPositions = [];
        for (const collectible in collectibles) {
            const position = { x: Math.floor(collectibles[collectible].getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(collectibles[collectible].getY() / Constants.MAZE_TILE_SIZE.m) };
            switch (collectibles[collectible].getType()) {
                case Constants.COLLECTIBLE_TYPES.CRATE_LASER:
                case Constants.COLLECTIBLE_TYPES.CRATE_DOUBLE_BARREL:
                case Constants.COLLECTIBLE_TYPES.CRATE_SHOTGUN:
                case Constants.COLLECTIBLE_TYPES.CRATE_HOMING_MISSILE:
                case Constants.COLLECTIBLE_TYPES.CRATE_MINE:
                case Constants.COLLECTIBLE_TYPES.CRATE_GATLING_GUN:
                {
                    this.weaponCratePositions.push(position);
                    break;
                }
                case Constants.COLLECTIBLE_TYPES.CRATE_SHIELD:
                {
                    this.shieldCratePositions.push(position);
                    break;
                }
                case Constants.COLLECTIBLE_TYPES.GOLD:
                {
                    this.goldPositions.push(position);
                    break;
                }
                case Constants.COLLECTIBLE_TYPES.DIAMOND:
                {
                    this.diamondPositions.push(position);
                    break;
                }
            }
        }

        const projectiles = this.gameController.getProjectiles();
        this.projectilePositions = {};
        this.projectilePaths = {};
        this.trapPositions = {};
        this.laserAimerPaths = {};
        for (const projectileId in projectiles) {
            this.projectilePositions[projectileId] = { x: Math.floor(projectiles[projectileId].getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(projectiles[projectileId].getY() / Constants.MAZE_TILE_SIZE.m) };
        }

        const traps = this.gameController.getTraps();
        for (const trapId in traps) {
            this.trapPositions[trapId] = { x: Math.floor(traps[trapId].getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(traps[trapId].getY() / Constants.MAZE_TILE_SIZE.m) };
        }

        const maze = this.gameController.getMaze();
        if (maze) {
            if (this.threatMap) {
                this.threatMap.clear(0);
            } else {
                // Allocate new threat map.
                this.threatMap = new MazeMap(maze.getWidth(), maze.getHeight(), 0);
            }

            // Add projectiles to threat map.
            const maxProjectileDistanceToConsider = MathUtils.linearInterpolation(Constants.AI.MIN_PROJECTILE_DISTANCE_TO_CONSIDER, Constants.AI.MAX_PROJECTILE_DISTANCE_TO_CONSIDER, this.config[AI._TRAITS.CLEVERNESS]);
            const projectileBounces = Math.ceil(MathUtils.linearInterpolation(Constants.AI.MIN_PROJECTILE_BOUNCES, Constants.AI.MAX_PROJECTILE_BOUNCES, this.config[AI._TRAITS.CLEVERNESS]));
            const projectilePathLength = MathUtils.linearInterpolation(Constants.AI.MIN_PROJECTILE_PATH_LENGTH, Constants.AI.MAX_PROJECTILE_PATH_LENGTH, this.config[AI._TRAITS.CLEVERNESS]);
            const currentProjectiles = this.gameController.getProjectiles();
            for (const projectileId in currentProjectiles) {
                const projectileDistance = maze.getDistanceBetweenPositions(this.myPosition, this.projectilePositions[projectileId]);
                if (projectileDistance !== false && projectileDistance <= maxProjectileDistanceToConsider) {
                    const pathInfo = B2DUtils.calculateProjectilePath(this.gameController.getB2DWorld(), currentProjectiles[projectileId], projectileBounces, Constants.MAZE_TILE_SIZE.m * projectilePathLength, false);
                    this.projectilePaths[projectileId] = pathInfo.path;
                    const projectileSpeed = Math.sqrt((currentProjectiles[projectileId].getSpeedX() * currentProjectiles[projectileId].getSpeedX()) + (currentProjectiles[projectileId].getSpeedY() * currentProjectiles[projectileId].getSpeedY()));
                    B2DUtils.splatPathUntoMazeMap(this.threatMap, pathInfo.path, Constants.MAZE_TILE_SIZE.m * Constants.AI.PATH_STEP_SIZE, (tile, length, stepSize) => {
                        const distance = maze.getDistanceBetweenPositions(tile, this.myPosition);
                        if (distance === false) {
                            return 0;
                        }
                        const projectileTimeToHere = length / projectileSpeed;
                        const tankTimeToHere = (distance * Constants.MAZE_TILE_SIZE.m) / Constants.TANK.FORWARD_SPEED.m;

                        return Math.min(1, Math.max(0, 1 - (Math.abs(projectileTimeToHere - tankTimeToHere) * Constants.AI.PROJECTILE_THREAT_TIME_FALLOFF))) * Constants.AI.PROJECTILE_THREAT_WEIGHT * stepSize;
                    });
                }
            }

            // Add traps to threat map.
            const currentTraps = this.gameController.getTraps();
            for (const trapId in currentTraps) {
                let weight = Constants.AI.TRAP_THREAT_WEIGHT;
                switch (currentTraps[trapId].getType()) {
                    case Constants.WEAPON_TYPES.MINE:
                    {
                        let timeAlive = currentTraps[trapId].getTimeAlive();
                        // Remember own mines better.
                        if (currentTraps[trapId].getPlayerId() === this.aiId) {
                            timeAlive *= MathUtils.linearInterpolation(Constants.AI.OWN_MINE_THREAT_MAX_TIME_MODIFIER, Constants.AI.OWN_MINE_THREAT_MIN_TIME_MODIFIER, this.config[AI._TRAITS.CLEVERNESS]);
                        }

                        weight = Math.max(0.0, Constants.AI.MINE_INITIAL_THREAT_WEIGHT - (timeAlive * MathUtils.linearInterpolation(Constants.AI.MINE_THREAT_MAX_TIME_FALLOFF, Constants.AI.MINE_THREAT_MIN_TIME_FALLOFF, this.config[AI._TRAITS.CLEVERNESS])));
                        break;
                    }
                }
                // Add threat near trap position.
                maze.traverseCloseTiles(this.trapPositions[trapId], 1, current => {
                    this.threatMap.add(current, weight / (current.distance + 1));
                });
            }

            // Add tanks to threat map.
            const maxTankDistanceToConsider = MathUtils.linearInterpolation(Constants.AI.MIN_TANK_THREAT_DISTANCE_TO_CONSIDER, Constants.AI.MAX_TANK_THREAT_DISTANCE_TO_CONSIDER, this.config[AI._TRAITS.CLEVERNESS]);
            const firingPathBounces = Math.ceil(MathUtils.linearInterpolation(Constants.AI.MIN_FIRING_THREAT_PATH_BOUNCES, Constants.AI.MAX_FIRING_THREAT_PATH_BOUNCES, this.config[AI._TRAITS.CLEVERNESS]));
            const firingPathLength = MathUtils.linearInterpolation(Constants.AI.MIN_FIRING_THREAT_PATH_LENGTH, Constants.AI.MAX_FIRING_THREAT_PATH_LENGTH, this.config[AI._TRAITS.CLEVERNESS]);
            for (const tankId in tanks) {
                if (tankId !== this.aiId) {
                    // FIXME Do not consider team mates!
                    const tankDistance = maze.getDistanceBetweenPositions(this.myPosition, this.tankPositions[tankId]);
                    if (tankDistance !== false && tankDistance <= maxTankDistanceToConsider) {
                        const pathInfo = B2DUtils.calculateFiringPath(this.gameController.getB2DWorld(), tanks[tankId], 0, firingPathBounces, Constants.MAZE_TILE_SIZE.m * firingPathLength, false);
                        B2DUtils.splatPathUntoMazeMap(this.threatMap, pathInfo.path, Constants.MAZE_TILE_SIZE.m * Constants.AI.PATH_STEP_SIZE, (tile, length, stepSize) => {
                            return (1.0 - (length / (Constants.MAZE_TILE_SIZE.m * firingPathLength))) * Constants.AI.FIRING_PATH_THREAT_WEIGHT * stepSize;
                        });
                        // Add threat near tank position.
                        maze.traverseCloseTiles(this.tankPositions[tankId], 1, current => {
                            this.threatMap.add(current, Constants.AI.TANK_THREAT_WEIGHT / (current.distance + 1));
                        });
                    }
                }
            }

            // Add upgrades to threat map.
            // FIXME Check when adding upgrade.
            const upgrades = this.gameController.getUpgrades();
            for (const upgradeId in upgrades) {
                const upgrade = upgrades[upgradeId];
                if (upgrade.getPlayerId() !== this.aiId) {
                    // FIXME Do not consider team mates!
                    switch (upgrade.getType()) {
                        case Constants.UPGRADE_TYPES.LASER_AIMER:
                        {
                            const pathInfo = B2DUtils.calculateFiringPath(this.gameController.getB2DWorld(), tanks[upgrade.getPlayerId()], 0, Number.MAX_VALUE, upgrade.getField("length"), true);
                            this.laserAimerPaths[upgradeId] = pathInfo.path;
                            B2DUtils.splatPathUntoMazeMap(this.threatMap, pathInfo.path, Constants.MAZE_TILE_SIZE.m * Constants.AI.PATH_STEP_SIZE, (tile, length, stepSize) => {
                                return Constants.AI.LASER_AIMER_THREAT_WEIGHT * stepSize;
                            });
                        }
                    }
                }
            }

            // Add zones to threat map.
            // FIXME Check when adding zone.
            const zones = this.gameController.getZones();
            for (const zoneId in zones) {
                const zone = zones[zoneId];
                switch (zone.getType()) {
                    case Constants.ZONE_TYPES.SPAWN:
                    {
                        const tiles = zone.getTiles();
                        for (const tile of tiles) {
                            this.threatMap.add(tile, Constants.AI.SPAWN_ZONE_THREAT_WEIGHT);
                        }
                        break;
                    }
                    case Constants.ZONE_TYPES.STORM:
                    {
                        const tiles = zone.getTiles();
                        for (const tile of tiles) {
                            this.threatMap.add(tile, Constants.AI.STORM_ZONE_THREAT_WEIGHT);
                        }
                        break;
                    }
                }
            }
        }

        if (this.stuckNow) {
            this.stuckTime += deltaTime;
        } else {
            this.stuckTime = 0;
        }
        this.stuckNow = false;

        const aggressivenessGrowth = MathUtils.linearInterpolation(Constants.AI.MIN_AGGRESSIVENESS_GROWTH, Constants.AI.MAX_AGGRESSIVENESS_GROWTH, this.config[AI._TRAITS.AGGRESSIVENESS]);
        this.currentAggressiveness = Math.min(this.config[AI._TRAITS.AGGRESSIVENESS], this.currentAggressiveness + (aggressivenessGrowth * deltaTime));
        const greedinessGrowth = MathUtils.linearInterpolation(Constants.AI.MIN_GREEDINESS_GROWTH, Constants.AI.MAX_GREEDINESS_GROWTH, this.config[AI._TRAITS.GREEDINESS]);
        this.currentGreediness = Math.min(this.config[AI._TRAITS.GREEDINESS], this.currentGreediness + (greedinessGrowth * deltaTime));
    }

    _reset() {
        this.goal = { type: AI._GOALS.IDLE, priority: Constants.AI.IDLE_PRIORITY, id: 0, period: 0 };
        this.nextGoalId = 1;

        this.stuckNow = false;
        this.stuckTime = 0;
        this.stuckNormal = null;

        this.threatMap = null;
    }

    _getPreferredTarget(gameMode, tanks) {
        let target = null;
        let priority = 0;

        const killsToBeBlindedByRevenge = MathUtils.linearInterpolation(Constants.AI.MAX_KILLS_TO_BE_BLINDED_BY_REVENGE, Constants.AI.MIN_KILLS_TO_BE_BLINDED_BY_REVENGE, this.config[AI._TRAITS.VENGEFULNESS]);

        // Revenge target: The tank with most kills against us.
        let revengeTarget = null;
        let revengePriority = 0;
        let highestKillCount = 0;
        for (const tankId in tanks) {
            let killCount = 0;
            for (const kill of this.kills) {
                if (kill.getKillerPlayerId() === tankId && kill.getVictimPlayerId() === this.aiId) {
                    ++killCount;
                }
            }
            if (killCount > highestKillCount) {
                revengeTarget = tankId;
                highestKillCount = killCount;
            }
        }
        if (revengeTarget) {
            const revengeWeight = Math.min(1.0, highestKillCount / killsToBeBlindedByRevenge);
            revengePriority = MathUtils.linearInterpolation(Constants.AI.MIN_REVENGE_PRIORITY, Constants.AI.MAX_REVENGE_PRIORITY, revengeWeight);

            if (revengePriority > priority) {
                target = revengeTarget;
                priority = revengePriority;
            }
        }

        // Win target: The tank that is currently winning.
        let winTarget = null;
        let winPriority = 0;
        // FIXME Check when adding new game mode.
        switch (gameMode) {
            case Constants.GAME_MODES.DEATHMATCH:
            {
                // Go for the tank with most points.
                // FIXME Use mode.getWinnerPlayerIds()?
                let highestScore = 0;
                for (const tankId in tanks) {
                    const score = this.gameController.getScoreByPlayerIdAndType(tankId, Constants.SCORE_TYPES.KILL);
                    if (score) {
                        if (score.getValue() > highestScore) {
                            winTarget = tankId;
                            highestScore = score.getValue();
                        }
                    }
                }
                break;
            }
        }
        if (winTarget) {
            winPriority = MathUtils.linearInterpolation(Constants.AI.MIN_WIN_PRIORITY, Constants.AI.MAX_WIN_PRIORITY, this.config[AI._TRAITS.CLEVERNESS]);

            if (winPriority > priority) {
                target = winTarget;
                priority = winPriority;
            }
        }

        return { target, priority };
    }

    _makeDecisionsAndUpdateGoal(deltaTime) {
        // A goal cannot be changed during its period.
        if (this.goal.period > 0) {
            this.goal.period -= deltaTime;
            return false;
        }

        // After its period, the goal's priority is decreased.
        this.goal.priority -= MathUtils.linearInterpolation(Constants.AI.MAX_PRIORITY_DECREASE, Constants.AI.MIN_PRIORITY_DECREASE, this.config[AI._TRAITS.DETERMINATION]) * deltaTime;

        const tank = this.gameController.getTank(this.aiId);
        if (tank === undefined) {
            return false;
        }

        const maze = this.gameController.getMaze();
        if (maze === undefined) {
            return false;
        }

        const tanks = this.gameController.getTanks();

        const projectiles = this.gameController.getProjectiles();

        const traps = this.gameController.getTraps();

        const upgrades = this.gameController.getUpgrades();

        // Determine new goal.
        const currentGoal = this.goal;

        const defaultGoalPeriod = MathUtils.linearInterpolation(Constants.AI.MAX_GOAL_PERIOD, Constants.AI.MIN_GOAL_PERIOD, this.config[AI._TRAITS.CLEVERNESS]);

        const preferredTargetInfo = this._getPreferredTarget(this.gameController.getMode(), tanks);

        //---------------------------------------
        // Compute go for collectible priorities.
        //---------------------------------------
        const maxCrateDistanceToConsider = MathUtils.linearInterpolation(Constants.AI.MIN_CRATE_DISTANCE_TO_CONSIDER, Constants.AI.MAX_CRATE_DISTANCE_TO_CONSIDER, this.config[AI._TRAITS.CLEVERNESS]);
        const crateDistanceFalloff = MathUtils.linearInterpolation(Constants.AI.MAX_CRATE_DISTANCE_FALLOFF, Constants.AI.MIN_CRATE_DISTANCE_FALLOFF, this.currentGreediness);
        const cratePriorityOffset = MathUtils.linearInterpolation(Constants.AI.MIN_CRATE_PRIORITY_OFFSET, Constants.AI.MAX_CRATE_PRIORITY_OFFSET, this.config[AI._TRAITS.CLEVERNESS]);
        const queuedWeaponCount = this.gameController.getQueuedWeapons(this.aiId).length;
        if (queuedWeaponCount < Constants.MAX_WEAPON_QUEUE) {
            for (const weaponCratePosition of this.weaponCratePositions) {
                const crateDistance = maze.getDistanceBetweenPositions(this.myPosition, weaponCratePosition);
                if (crateDistance !== false && crateDistance <= maxCrateDistanceToConsider) {
                    // FIXME Use getShortestPathWithGraph and take the length. Also, make sure to include limit on danger using boldness.
                    const cratePriority = (Math.max(0.0, 1.0 - (crateDistance * crateDistanceFalloff)) + cratePriorityOffset) / (1.0 + cratePriorityOffset);
                    const crateGoal = { type: AI._GOALS.PICK_UP_COLLECTIBLE, priority: cratePriority, id: this.nextGoalId++, period: defaultGoalPeriod, position: weaponCratePosition };
                    this._updateGoal(crateGoal);
                }
            }
        }
        for (const shieldCratePosition of this.shieldCratePositions) {
            const crateDistance = maze.getDistanceBetweenPositions(this.myPosition, shieldCratePosition);
            if (crateDistance !== false && crateDistance <= maxCrateDistanceToConsider) {
                // FIXME Use getShortestPathWithGraph and take the length. Also, make sure to include limit on danger using boldness.
                const cratePriority = (Math.max(0.0, 1.0 - (crateDistance * crateDistanceFalloff)) + cratePriorityOffset) / (1.0 + cratePriorityOffset);
                const crateGoal = { type: AI._GOALS.PICK_UP_COLLECTIBLE, priority: cratePriority, id: this.nextGoalId++, period: defaultGoalPeriod, position: shieldCratePosition };
                this._updateGoal(crateGoal);
            }
        }
        const maxCurrencyDistanceToConsider = MathUtils.linearInterpolation(Constants.AI.MIN_CURRENCY_DISTANCE_TO_CONSIDER, Constants.AI.MAX_CURRENCY_DISTANCE_TO_CONSIDER, this.currentGreediness);
        const currencyDistanceFalloff = MathUtils.linearInterpolation(Constants.AI.MAX_CURRENCY_DISTANCE_FALLOFF, Constants.AI.MIN_CURRENCY_DISTANCE_FALLOFF, this.currentGreediness);
        for (const goldPosition of this.goldPositions) {
            const goldDistance = maze.getDistanceBetweenPositions(this.myPosition, goldPosition);
            if (goldDistance !== false && goldDistance <= maxCurrencyDistanceToConsider) {
                // FIXME Use getShortestPathWithGraph and take the length. Also, make sure to include limit on danger using boldness.
                const goldPriorityOffset = MathUtils.linearInterpolation(Constants.AI.MIN_GOLD_PRIORITY_OFFSET, Constants.AI.MAX_GOLD_PRIORITY_OFFSET, this.currentGreediness);
                const goldPriority = (Math.max(0.0, 1.0 - (goldDistance * currencyDistanceFalloff)) + goldPriorityOffset) / (1.0 + goldPriorityOffset);
                const crateGoal = { type: AI._GOALS.PICK_UP_COLLECTIBLE, priority: goldPriority, id: this.nextGoalId++, period: defaultGoalPeriod, position: goldPosition };
                this._updateGoal(crateGoal);
            }
        }
        for (const diamondPosition of this.diamondPositions) {
            const diamondDistance = maze.getDistanceBetweenPositions(this.myPosition, diamondPosition);
            if (diamondDistance !== false && diamondDistance <= maxCurrencyDistanceToConsider) {
                // FIXME Use getShortestPathWithGraph and take the length. Also, make sure to include limit on danger using boldness.
                const diamondPriorityOffset = MathUtils.linearInterpolation(Constants.AI.MIN_DIAMOND_PRIORITY_OFFSET, Constants.AI.MAX_DIAMOND_PRIORITY_OFFSET, this.currentGreediness);
                const diamondPriority = (Math.max(0.0, 1.0 - (diamondDistance * currencyDistanceFalloff)) + diamondPriorityOffset) / (1.0 + diamondPriorityOffset);
                const crateGoal = { type: AI._GOALS.PICK_UP_COLLECTIBLE, priority: diamondPriority, id: this.nextGoalId++, period: defaultGoalPeriod, position: diamondPosition };
                this._updateGoal(crateGoal);
            }
        }

        //---------------------------------------
        // Compute dodge projectile priorities.
        //---------------------------------------
        const scaryProjectileDistance = MathUtils.linearInterpolation(Constants.AI.MAX_SCARY_PROJECTILE_DISTANCE, Constants.AI.MIN_SCARY_PROJECTILE_DISTANCE, this.config[AI._TRAITS.BOLDNESS]);
        const maxDodgeProjectileDistance = MathUtils.linearInterpolation(Constants.AI.MAX_DODGE_PROJECTILE_DISTANCE, Constants.AI.MIN_DODGE_PROJECTILE_DISTANCE, this.config[AI._TRAITS.BOLDNESS]);
        for (const projectilePath in this.projectilePaths) {
            if (AIUtils.checkProtected(this.aiId, this.gameController)) {
                continue;
            }
            const dodgeInfo = AIUtils.checkProjectilePathForDodging(tank, this.projectilePaths[projectilePath], projectiles[projectilePath], this.gameController.getB2DWorld(), scaryProjectileDistance * scaryProjectileDistance);
            const dodgeProjectilePriority = (((maxDodgeProjectileDistance - dodgeInfo.closestDistance) / maxDodgeProjectileDistance) + Constants.AI.DODGE_PRIORITY_OFFSET) / (1.0 + Constants.AI.DODGE_PRIORITY_OFFSET);
            const dodgeGoal = { type: AI._GOALS.DODGE_PROJECTILE, priority: dodgeProjectilePriority, id: this.nextGoalId++, period: defaultGoalPeriod, dodgeInfo };
            this._updateGoal(dodgeGoal);
        }

        //---------------------------------------
        // Compute shoot after priority.
        //---------------------------------------
        const activeWeapon = this.gameController.getActiveWeapon(this.aiId);
        if (activeWeapon) {
            // FIXME Check when adding weapon.
            switch (activeWeapon.getType()) {
                case Constants.WEAPON_TYPES.BULLET:
                {
                    if (activeWeapon.getField("bulletsFired") < activeWeapon.getField("bulletCount")) {
                        this._updateStandardShootAfterGoal(tanks, maze, defaultGoalPeriod, activeWeapon.getType(), preferredTargetInfo);
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.LASER:
                case Constants.WEAPON_TYPES.DOUBLE_BARREL:
                {
                    this._updateStandardShootAfterGoal(tanks, maze, defaultGoalPeriod, activeWeapon.getType(), preferredTargetInfo);
                    break;
                }
                case Constants.WEAPON_TYPES.SHOTGUN:
                {
                    if (activeWeapon.getField("reloadTime") <= 0) {
                        this._updateStandardShootAfterGoal(tanks, maze, defaultGoalPeriod, activeWeapon.getType(), preferredTargetInfo);
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.HOMING_MISSILE:
                {
                    if (!activeWeapon.getField("launched")) {
                        this._updateStandardShootAfterGoal(tanks, maze, defaultGoalPeriod, activeWeapon.getType(), preferredTargetInfo);
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.GATLING_GUN:
                {
                    if (activeWeapon.getField("bulletCount") > 0) {
                        this._updateStandardShootAfterGoal(tanks, maze, defaultGoalPeriod, activeWeapon.getType(), preferredTargetInfo);
                    }
                    break;
                }
            }
        }

        //---------------------------------------
        // Compute lay trap priority.
        //---------------------------------------
        if (activeWeapon) {
            // FIXME Check when adding weapon.
            switch (activeWeapon.getType()) {
                case Constants.WEAPON_TYPES.MINE:
                {
                    if (activeWeapon.getField("mineCount") > 0) {
                        this._updateStandardLayTrapGoal(tanks, traps, maze, defaultGoalPeriod, activeWeapon.getType());
                    }
                    break;
                }
            }
        }

        //---------------------------------------
        // Compute run away priority.
        //---------------------------------------
        if (!AIUtils.checkProtected(this.aiId, this.gameController)) {
            // Check if out of ammo.
            const defaultWeapon = this.gameController.getDefaultWeapon(this.aiId);
            if (activeWeapon && defaultWeapon) {
                if (activeWeapon === defaultWeapon) {
                    // FIXME Check when adding weapon.
                    switch (activeWeapon.getType()) {
                        case Constants.WEAPON_TYPES.BULLET:
                        {
                            if (activeWeapon.getField("bulletsFired") === activeWeapon.getField("bulletCount")) {
                                this._updateStandardRunAwayGoal(tanks, maze, defaultGoalPeriod);
                            }
                            break;
                        }
                        case Constants.WEAPON_TYPES.LASER:
                        {
                            if (activeWeapon.getField("fired")) {
                                this._updateStandardRunAwayGoal(tanks, maze, defaultGoalPeriod);
                            }
                            break;
                        }
                        case Constants.WEAPON_TYPES.DOUBLE_BARREL:
                        case Constants.WEAPON_TYPES.SHOTGUN:
                        case Constants.WEAPON_TYPES.GATLING_GUN:
                        {
                            if (activeWeapon.getField("bulletCount") === 0) {
                                this._updateStandardRunAwayGoal(tanks, maze, defaultGoalPeriod);
                            }
                            break;
                        }
                        case Constants.WEAPON_TYPES.HOMING_MISSILE:
                        {
                            if (!activeWeapon.getField("launched")) {
                                this._updateStandardRunAwayGoal(tanks, maze, defaultGoalPeriod);
                            }
                            break;
                        }
                        case Constants.WEAPON_TYPES.MINE:
                        {
                            if (activeWeapon.getField("mineCount") === 0) {
                                this._updateStandardRunAwayGoal(tanks, maze, defaultGoalPeriod);
                            }
                            break;
                        }
                    }
                }
            }

            // Check if in enemy laser aimer path.
            const laserAimerDistance = MathUtils.linearInterpolation(Constants.AI.MAX_LASER_AIMER_DISTANCE, Constants.AI.MIN_LASER_AIMER_DISTANCE, this.config[AI._TRAITS.BOLDNESS]);
            for (const laserAimerPath in this.laserAimerPaths) {
                const dodgeInfo = AIUtils.checkAimerPathForDodging(tank, this.laserAimerPaths[laserAimerPath], upgrades[laserAimerPath], this.gameController.getB2DWorld());
                if (dodgeInfo.closestDistance < laserAimerDistance) {
                    this._updateStandardRunAwayGoal(tanks, maze, defaultGoalPeriod);
                }
            }

            // Check if all enemies are protected.
            let allProtected = true;
            for (const tankId in tanks) {
                if (tankId !== this.aiId) {
                    // FIXME Do not consider team mates!
                    if (!AIUtils.checkProtected(tankId, this.gameController)) {
                        allProtected = false;
                        break;
                    }
                }
            }
            if (allProtected) {
                this._updateStandardRunAwayGoal(tanks, maze, defaultGoalPeriod);
            }
        }

        //---------------------------------------
        // Compute get unstuck priority.
        //---------------------------------------
        const getUnstuckPriority = Math.min(this.stuckTime / Constants.AI.MAX_STUCK_TIME, 1.0);
        this._updateGoal({ type: AI._GOALS.GET_UNSTUCK, priority: getUnstuckPriority, id: this.nextGoalId++, period: Constants.AI.GET_UNSTUCK_GOAL_PERIOD, normal: this.stuckNormal });

        //---------------------------------------
        // Compute hunt priority.
        //---------------------------------------
        const maxTankDistanceToConsider = MathUtils.linearInterpolation(Constants.AI.MIN_TANK_HUNT_DISTANCE_TO_CONSIDER, Constants.AI.MAX_TANK_HUNT_DISTANCE_TO_CONSIDER, this.config[AI._TRAITS.CLEVERNESS]);
        for (const tankId in tanks) {
            if (tankId !== this.aiId) {
                // Ignore tanks with a shield.
                if (AIUtils.checkProtected(tankId, this.gameController)) {
                    continue;
                }
                const tankDistance = maze.getDistanceBetweenPositions(this.myPosition, this.tankPositions[tankId]);
                if (tankDistance !== false) {
                    // FIXME Use getShortestPathWithGraph and take the length. Also, make sure to include limit on danger using boldness.
                    const targetPriorityOffset = tankId === preferredTargetInfo.target ? preferredTargetInfo.priority : 0;
                    const huntPriority = ((((maxTankDistanceToConsider - tankDistance) / maxTankDistanceToConsider) + targetPriorityOffset) / (1.0 + targetPriorityOffset)) * Constants.AI.MAX_HUNT_PRIORITY;
                    const huntGoal = { type: AI._GOALS.HUNT, priority: huntPriority, id: this.nextGoalId++, period: defaultGoalPeriod, position: this.tankPositions[tankId] };
                    this._updateGoal(huntGoal);
                }
            }
        }

        //---------------------------------------
        // Compute idle priority.
        //---------------------------------------
        this._updateGoal({ type: AI._GOALS.IDLE, priority: Constants.AI.IDLE_PRIORITY, id: this.nextGoalId++, period: defaultGoalPeriod });

        if (currentGoal.id !== this.goal.id) {
            //console.log(this.goal.type + " " + this.goal.priority);
            return true;
        }

        return false;
    }

    _updateGoal(potentialNewGoal) {
        //console.log("Consider: " + potentialNewGoal.type + " " + potentialNewGoal.priority);
        if (potentialNewGoal.priority > this.goal.priority) {
            this.goal = potentialNewGoal;
        }
    }

    _updateStandardShootAfterGoal(tanks, maze, period, weaponType, preferredTargetInfo) {
        const maxTankDistanceToConsider = MathUtils.linearInterpolation(Constants.AI.MIN_TANK_TARGET_DISTANCE_TO_CONSIDER, Constants.AI.MAX_TANK_TARGET_DISTANCE_TO_CONSIDER, this.config[AI._TRAITS.CLEVERNESS]);
        const shootAfterPriorityOffset = MathUtils.linearInterpolation(Constants.AI.MIN_SHOOT_AFTER_PRIORITY_OFFSET, Constants.AI.MAX_SHOOT_AFTER_PRIORITY_OFFSET, this.currentAggressiveness);
        for (const tankId in tanks) {
            if (tankId !== this.aiId) {
                // FIXME Do not consider team mates!
                // Ignore tanks with a shield.
                if (AIUtils.checkProtected(tankId, this.gameController)) {
                    continue;
                }
                const tankDistance = maze.getDistanceBetweenPositions(this.myPosition, this.tankPositions[tankId]);
                if (tankDistance !== false && tankDistance < maxTankDistanceToConsider) {
                    const targetPriorityOffset = tankId === preferredTargetInfo.target ? preferredTargetInfo.priority : 0;
                    const shootAfterPriority = (((maxTankDistanceToConsider - tankDistance) / maxTankDistanceToConsider) + shootAfterPriorityOffset + targetPriorityOffset) / (1.0 + shootAfterPriorityOffset + targetPriorityOffset);
                    const shootAfterGoal = { type: AI._GOALS.SHOOT_AFTER, priority: shootAfterPriority, id: this.nextGoalId++, period, target: tankId, weaponType, preferredTargetInfo };
                    this._updateGoal(shootAfterGoal);
                }
            }
        }
    }

    _updateStandardLayTrapGoal(tanks, traps, maze, period, weaponType) {
        // Check that there are at least one other tank.
        for (const tankId in tanks) {
            if (tankId !== this.aiId) {
                const layTrapPriorityOffset = MathUtils.linearInterpolation(Constants.AI.MIN_LAY_TRAP_PRIORITY_OFFSET, Constants.AI.MAX_LAY_TRAP_PRIORITY_OFFSET, this.currentAggressiveness);

                // Check that we are not close to our own laid trap.
                let minTrapDistance = Number.MAX_VALUE;
                for (const trapId in traps) {
                    if (this.aiId === traps[trapId].getPlayerId()) {
                        minTrapDistance = Math.min(minTrapDistance, maze.getDistanceBetweenPositions(this.trapPositions[trapId], this.myPosition));
                    }
                }

                if (minTrapDistance >= Constants.AI.OWN_TRAP_MIN_DISTANCE) {
                    const deadEndPenalty = maze.getDeadEndPenalty(this.myPosition);

                    // Check that we are not locking ourselves in a too small area / too close to a dead end. Take the rotation of the tank into account (assuming that traps are always dropped behind).
                    const myTank = tanks[this.aiId];
                    const directionX = Math.sin(myTank.getRotation()); // Normally it would be Math.cos(rotation), but the tank graphics is rotated 90 degrees CCW
                    const directionY = -Math.cos(myTank.getRotation()); // Normally it would be Math.sin(rotation), but the tank graphics is rotated 90 degrees CCW
                    const closestAxis = MathUtils.getClosestAxis({ x: directionX, y: directionY });
                    const facingPosition = { x: this.myPosition.x + closestAxis.x, y: this.myPosition.y + closestAxis.y };
                    if (maze.isPositionInsideMaze(facingPosition)) {
                        const distance = maze.getDistanceBetweenPositions(this.myPosition, facingPosition);
                        if (distance <= 1) {
                            const facingDeadEndPenalty = maze.getDeadEndPenalty(facingPosition);
                            if (facingDeadEndPenalty <= deadEndPenalty) {
                                const layTrapPriority = (((Constants.MAZE_MAX_DEAD_END_PENALTY - deadEndPenalty) / Constants.MAZE_MAX_DEAD_END_PENALTY) + layTrapPriorityOffset) / (1.0 + layTrapPriorityOffset);
                                const layTrapGoal = { type: AI._GOALS.LAY_TRAP, priority: layTrapPriority, id: this.nextGoalId++, period, weaponType };
                                this._updateGoal(layTrapGoal);

                                return;
                            }
                        }
                    }
                }
            }
        }
    }

    _updateStandardRunAwayGoal(tanks, maze, period) {
        // Combine distances from all tanks.
        const distances = [];
        let averageDistance = 0;
        for (const tankId in tanks) {
            if (tankId !== this.aiId) {
                // FIXME Do not consider team mates!
                const tankDistance = maze.getDistanceBetweenPositions(this.myPosition, this.tankPositions[tankId]);
                if (tankDistance !== false) {
                    distances.push(maze.getDistancesFromPosition(this.tankPositions[tankId]));
                    averageDistance += tankDistance;
                }
            }
        }
        if (distances.length > 0) {
            averageDistance /= distances.length;
            const maxDistanceToConsider = MathUtils.linearInterpolation(Constants.AI.MIN_RUN_AWAY_DISTANCE_TO_CONSIDER, Constants.AI.MAX_RUN_AWAY_DISTANCE_TO_CONSIDER, this.config[AI._TRAITS.CLEVERNESS]);
            const runAwayPriorityOffset = MathUtils.linearInterpolation(Constants.AI.MAX_RUN_AWAY_PRIORITY_OFFSET, Constants.AI.MIN_RUN_AWAY_PRIORITY_OFFSET, this.config[AI._TRAITS.BOLDNESS]);
            const runAwayPriority = (((maxDistanceToConsider - averageDistance) / maxDistanceToConsider) + runAwayPriorityOffset) / (1.0 + runAwayPriorityOffset);
            const runAwayGoal = { type: AI._GOALS.RUN_AWAY, priority: runAwayPriority, id: this.nextGoalId++, period, distances };
            this._updateGoal(runAwayGoal);
        }
    }

    _tryToRetaliate(tank) {
        const activeWeapon = this.gameController.getActiveWeapon(this.aiId);
        const tanks = this.gameController.getTanks();
        if (activeWeapon) {
            const firingPathBounces = Math.ceil(MathUtils.linearInterpolation(Constants.AI.MIN_FIRING_PATH_BOUNCES, Constants.AI.MAX_FIRING_PATH_BOUNCES, this.config[AI._TRAITS.CLEVERNESS]));
            const firingPathLength = MathUtils.linearInterpolation(Constants.AI.MIN_FIRING_PATH_LENGTH, Constants.AI.MAX_FIRING_PATH_LENGTH, this.config[AI._TRAITS.CLEVERNESS]);
            const closestDistanceToRetaliate = MathUtils.linearInterpolation(Constants.AI.MIN_DISTANCE_TO_RETALIATE, Constants.AI.MAX_DISTANCE_TO_RETALIATE, this.config[AI._TRAITS.AGGRESSIVENESS]);
            const reactionDelay = MathUtils.linearInterpolation(Constants.AI.MAX_RETALIATE_DELAY, 0, this.config[AI._TRAITS.DEXTERITY]);
            const duration = this._getFireActionDuration(activeWeapon);
            let firingInfo = null;
            // FIXME Check when adding weapon.
            switch (activeWeapon.getType()) {
                case Constants.WEAPON_TYPES.BULLET:
                {
                    if (activeWeapon.getField("bulletsFired") < activeWeapon.getField("bulletCount")) {
                        firingInfo = AIUtils.checkFiringPath(tank, tanks, this.gameController, 0, firingPathBounces, Constants.MAZE_TILE_SIZE.m * firingPathLength, activeWeapon.getType());
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.LASER:
                case Constants.WEAPON_TYPES.DOUBLE_BARREL:
                {
                    firingInfo = AIUtils.checkFiringPath(tank, tanks, this.gameController, 0, firingPathBounces, Constants.MAZE_TILE_SIZE.m * firingPathLength, activeWeapon.getType());
                    break;
                }
                case Constants.WEAPON_TYPES.SHOTGUN:
                {
                    if (activeWeapon.getField("reloadTime") <= 0) {
                        firingInfo = AIUtils.checkFiringPath(tank, tanks, this.gameController, 0, firingPathBounces, Constants.MAZE_TILE_SIZE.m * firingPathLength, activeWeapon.getType());
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.HOMING_MISSILE:
                {
                    if (!activeWeapon.getField("launched")) {
                        firingInfo = AIUtils.checkFiringPath(tank, tanks, this.gameController, 0, firingPathBounces, Constants.MAZE_TILE_SIZE.m * firingPathLength, activeWeapon.getType());
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.MINE:
                {
                    if (activeWeapon.getField("mineCount") > 0) {
                        firingInfo = AIUtils.checkTrapLaying(tank, tanks, this.gameController, Constants.MAZE_TILE_SIZE.m * firingPathLength, activeWeapon.getType());
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.GATLING_GUN: {
                    if (activeWeapon.getField("bulletCount") > 0) {
                        firingInfo = AIUtils.checkFiringPath(tank, tanks, this.gameController, 0, firingPathBounces, Constants.MAZE_TILE_SIZE.m * firingPathLength, activeWeapon.getType());
                    }
                    break;
                }
            }
            if (firingInfo) {
                if (firingInfo.result === AIUtils._FIRING_RESULTS.HIT) {
                    this.actions.unshift({ type: AI._ACTIONS.FIRE, duration, delay: reactionDelay });

                    this.currentAggressiveness = Math.max(0, this.currentAggressiveness - Constants.AI.AGGRESSIVENESS_RETALIATE_SHRINKAGE);
                } else if (firingInfo.result === AIUtils._FIRING_RESULTS.NEAR) {
                    if (firingInfo.closestDistance < closestDistanceToRetaliate) {
                        this.actions.unshift({ type: AI._ACTIONS.FIRE, duration, delay: reactionDelay });

                        this.currentAggressiveness = Math.max(0, this.currentAggressiveness - Constants.AI.AGGRESSIVENESS_RETALIATE_SHRINKAGE);
                    }
                }
            }
        }
    }

    _updateActionsToAchieveGoal() {
        this.actions = [];

        const tank = this.gameController.getTank(this.aiId);
        if (!tank) {
            return;
        }

        switch (this.goal.type) {
            case AI._GOALS.SHOOT_AFTER:
            {
                this.currentAggressiveness = Math.max(0, this.currentAggressiveness - Constants.AI.AGGRESSIVENESS_SHOOT_AFTER_SHRINKAGE);

                const target = this.gameController.getTank(this.goal.target);
                if (target) {
                    const tankPosition = { x: tank.getX(), y: tank.getY() };
                    const targetPosition = { x: target.getX(), y: target.getY() };
                    const imprecision = MathUtils.randomAroundZero(MathUtils.linearInterpolation(Constants.AI.MAX_ROTATION_IMPRECISION, 0, this.config[AI._TRAITS.DEXTERITY]));
                    const reactionDelay = MathUtils.linearInterpolation(Constants.AI.MAX_FIRE_DELAY, 0, this.config[AI._TRAITS.DEXTERITY]);
                    const activeWeapon = this.gameController.getActiveWeapon(this.aiId);
                    const duration = this._getFireActionDuration(activeWeapon);
                    // First check if we can make a direct hit.
                    if (!B2DUtils.checkLineForMazeCollision(this.gameController.getB2DWorld(), tankPosition, targetPosition)) {
                        const direction = { x: targetPosition.x - tankPosition.x, y: targetPosition.y - tankPosition.y };
                        this.actions.push({ type: AI._ACTIONS.TURN_TO, direction, imprecision }, { type: AI._ACTIONS.FIRE, duration, delay: reactionDelay });
                    } else {
                        // Then check a few angles for bounce shots - include all tanks in this search.
                        const tanks = this.gameController.getTanks();
                        const firingPathBounces = Math.ceil(MathUtils.linearInterpolation(Constants.AI.MIN_FIRING_PATH_BOUNCES, Constants.AI.MAX_FIRING_PATH_BOUNCES, this.config[AI._TRAITS.CLEVERNESS]));
                        // FIXME Possibly modify firingPathLength based on weapon type.
                        const firingPathLength = MathUtils.linearInterpolation(Constants.AI.MIN_FIRING_PATH_LENGTH, Constants.AI.MAX_FIRING_PATH_LENGTH, this.config[AI._TRAITS.CLEVERNESS]);
                        let firingPathsToCheckCount = Math.ceil(MathUtils.linearInterpolation(Constants.AI.MIN_FIRING_PATH_COUNT, Constants.AI.MAX_FIRING_PATH_COUNT, this.config[AI._TRAITS.CLEVERNESS]));
                        // Always make sure that the firing path count is odd. This ensures that we check the direction we're facing.
                        firingPathsToCheckCount += (firingPathsToCheckCount + 1) % 2;
                        const firingPathSpread = MathUtils.linearInterpolation(Constants.AI.MIN_FIRING_PATH_SPREAD, Constants.AI.MAX_FIRING_PATH_SPREAD, this.config[AI._TRAITS.AGGRESSIVENESS]);
                        const minAngle = -firingPathSpread * 0.5;
                        const angleStep = firingPathSpread / (firingPathsToCheckCount - 1);
                        let closestDistance = Number.MAX_VALUE;
                        let shortestLength = Number.MAX_VALUE;
                        let targetDirection = null;
                        let preferredClosestDistance = Number.MAX_VALUE;
                        let preferredShortestLength = Number.MAX_VALUE;
                        let preferredTargetDirection = null;
                        for (let i = 0; i < firingPathsToCheckCount; ++i) {
                            // Add some random offset to direction.
                            const angle = minAngle + (i * angleStep) + MathUtils.randomAroundZero(Constants.AI.FIRING_PATH_RANDOM_OFFSET);
                            const firingInfo = AIUtils.checkFiringPath(tank, tanks, this.gameController, angle, firingPathBounces, Constants.MAZE_TILE_SIZE.m * firingPathLength, this.goal.weaponType);
                            if (firingInfo.result === AIUtils._FIRING_RESULTS.HIT) {
                                if (firingInfo.pathLength < shortestLength) {
                                    shortestLength = firingInfo.pathLength;
                                    closestDistance = 0;
                                    targetDirection = firingInfo.direction;
                                }
                                // Keep separate tabs on the preferred target.
                                if (this.goal.preferredTargetInfo.target) {
                                    if (this.goal.preferredTargetInfo.target === firingInfo.target) {
                                        if (firingInfo.pathLength < preferredShortestLength) {
                                            preferredShortestLength = firingInfo.pathLength;
                                            preferredClosestDistance = 0;
                                            preferredTargetDirection = firingInfo.direction;
                                        }
                                    }
                                }
                            } else if (firingInfo.result === AIUtils._FIRING_RESULTS.NEAR) {
                                if (firingInfo.closestDistance < closestDistance) {
                                    closestDistance = firingInfo.closestDistance;
                                    targetDirection = firingInfo.direction;
                                }
                                // Keep separate tabs on the preferred target.
                                if (this.goal.preferredTargetInfo.target) {
                                    if (this.goal.preferredTargetInfo.target === firingInfo.target) {
                                        if (firingInfo.closestDistance < preferredClosestDistance) {
                                            preferredClosestDistance = firingInfo.closestDistance;
                                            preferredTargetDirection = firingInfo.direction;
                                        }
                                    }
                                }
                            }
                        }

                        // Figure out if going for preferred target or not.
                        const closestPreferredDistanceOffset = MathUtils.linearInterpolation(Constants.AI.MIN_PREFERRED_CLOSEST_DISTANCE_OFFSET, Constants.AI.MAX_PREFERRED_CLOSEST_DISTANCE_OFFSET, this.config[AI._TRAITS.CLEVERNESS]);
                        if (preferredClosestDistance - closestPreferredDistanceOffset <= closestDistance) {
                            closestDistance = preferredClosestDistance;
                            targetDirection = preferredTargetDirection;
                        }

                        // FIXME Possibly modify closestDistanceToFire based on weapon type.
                        const closestDistanceToFire = MathUtils.linearInterpolation(Constants.AI.MIN_DISTANCE_TO_FIRE, Constants.AI.MAX_DISTANCE_TO_FIRE, this.config[AI._TRAITS.AGGRESSIVENESS]);
                        if (closestDistance < closestDistanceToFire) {
                            // We found a direct hit or something close enough.
                            this.actions.push({ type: AI._ACTIONS.TURN_TO, direction: targetDirection, imprecision }, { type: AI._ACTIONS.FIRE, duration, delay: reactionDelay });
                        } else if (targetDirection) {
                            // We found some direction where there was a near shot. Try turning to that direction.
                            this.actions.push({ type: AI._ACTIONS.TURN_TO, direction: targetDirection, imprecision });
                        } else {
                            // We found nothing but suicide or miss shots so try turning around.
                            const angle = MathUtils.randomSign(MathUtils.randomRange(Constants.AI.MIN_TURN_AROUND_ANGLE, Constants.AI.MAX_TURN_AROUND_ANGLE));
                            const directionX = Math.sin(tank.getRotation() + angle); // Normally it would be Math.cos(rotation), but the tank graphics is rotated 90 degrees CCW
                            const directionY = -Math.cos(tank.getRotation() + angle); // Normally it would be Math.sin(rotation), but the tank graphics is rotated 90 degrees CCW
                            this.actions.push({ type: AI._ACTIONS.TURN_TO, direction: { x: directionX, y: directionY }, imprecision });
                        }
                    }
                }

                break;
            }
            case AI._GOALS.LAY_TRAP:
            {
                this.currentAggressiveness = Math.max(0, this.currentAggressiveness - Constants.AI.AGGRESSIVENESS_LAY_TRAP_SHRINKAGE);

                const imprecision = MathUtils.randomAroundZero(MathUtils.linearInterpolation(Constants.AI.MAX_ROTATION_IMPRECISION, 0, this.config[AI._TRAITS.DEXTERITY]));
                const reactionDelay = MathUtils.linearInterpolation(Constants.AI.MAX_FIRE_DELAY, 0, this.config[AI._TRAITS.DEXTERITY]);

                this.actions.push({ type: AI._ACTIONS.FIRE, duration: 1, delay: reactionDelay });
                // Drive a little forwards after laying the trap to avoid it.
                const directionX = Math.sin(tank.getRotation()); // Normally it would be Math.cos(rotation), but the tank graphics is rotated 90 degrees CCW
                const directionY = -Math.cos(tank.getRotation()); // Normally it would be Math.sin(rotation), but the tank graphics is rotated 90 degrees CCW
                const position = { x: tank.getX() + (directionX * Constants.AI.LAY_TRAP_DRIVE_FORWARD_DISTANCE * Constants.MAZE_TILE_SIZE.m), y: tank.getY() + (directionY * Constants.AI.LAY_TRAP_DRIVE_FORWARD_DISTANCE * Constants.MAZE_TILE_SIZE.m) };
                this.actions.push({ type: AI._ACTIONS.DRIVE_TO_POSITION, position, canReverse: false, imprecision });

                break;
            }
            case AI._GOALS.DODGE_PROJECTILE:
            {
                const escapePathLength = Math.ceil(MathUtils.linearInterpolation(Constants.AI.MIN_ESCAPE_PATH_LENGTH, Constants.AI.MAX_ESCAPE_PATH_LENGTH, this.config[AI._TRAITS.CLEVERNESS]));
                const deadEndWeight = MathUtils.linearInterpolation(Constants.AI.MIN_PATH_DEAD_END_WEIGHT, Constants.AI.MAX_PATH_DEAD_END_WEIGHT, this.config[AI._TRAITS.CLEVERNESS]);
                const threatWeight = MathUtils.linearInterpolation(Constants.AI.MAX_PATH_THREAT_WEIGHT, Constants.AI.MIN_PATH_THREAT_WEIGHT, this.config[AI._TRAITS.BOLDNESS]);

                if (this.myPosition && this.projectilePositions[this.goal.dodgeInfo.closestId]) {
                    const maze = this.gameController.getMaze();
                    const escapePath = maze.getPathAwayFromWithThreats(this.myPosition, this.projectilePositions[this.goal.dodgeInfo.closestId], escapePathLength, deadEndWeight, this.threatMap, threatWeight);
                    // If the projectile is really close in time and space, drive to a position next to it and align with the direction.
                    // If there is no escape path, do the same.
                    if ((this.goal.dodgeInfo.closestTime < Constants.AI.TIME_TO_DODGE && this.goal.dodgeInfo.closestDistance < Constants.AI.DISTANCE_TO_DODGE) || escapePath.length === 0) {
                        // Determine position and direction.
                        const { closestDirection } = this.goal.dodgeInfo;
                        const { closestPosition } = this.goal.dodgeInfo;
                        const imprecision = MathUtils.randomAroundZero(MathUtils.linearInterpolation(Constants.AI.MAX_ROTATION_IMPRECISION, 0, this.config[AI._TRAITS.DEXTERITY]));
                        if (this.goal.dodgeInfo.closestDistance < Constants.AI.AMOUNT_TO_DODGE) {
                            const directionLength = Math.sqrt((closestDirection.x * closestDirection.x) + (closestDirection.y * closestDirection.y));
                            const tangent = { x: (-closestDirection.y / directionLength) * Constants.AI.AMOUNT_TO_DODGE, y: (closestDirection.x / directionLength) * Constants.AI.AMOUNT_TO_DODGE };
                            const closestPlusTangent = { x: closestPosition.x + tangent.x, y: closestPosition.y + tangent.y };
                            const closestMinusTangent = { x: closestPosition.x - tangent.x, y: closestPosition.y - tangent.y };
                            let distancePlusSquared = ((tank.getX() - closestPlusTangent.x) * (tank.getX() - closestPlusTangent.x)) + ((tank.getY() - closestPlusTangent.y) * (tank.getY() - closestPlusTangent.y));
                            let distanceMinusSquared = ((tank.getX() - closestMinusTangent.x) * (tank.getX() - closestMinusTangent.x)) + ((tank.getY() - closestMinusTangent.y) * (tank.getY() - closestMinusTangent.y));
                            // If tangent-offset position is inside maze wall, do not prioritise it.
                            const tankPosition = { x: tank.getX(), y: tank.getY() };
                            if (B2DUtils.checkLineForMazeCollision(this.gameController.getB2DWorld(), tankPosition, closestPlusTangent)) {
                                distancePlusSquared += Constants.AI.AMOUNT_TO_DODGE * Constants.AI.AMOUNT_TO_DODGE;
                            }
                            if (B2DUtils.checkLineForMazeCollision(this.gameController.getB2DWorld(), tankPosition, closestMinusTangent)) {
                                distanceMinusSquared += Constants.AI.AMOUNT_TO_DODGE * Constants.AI.AMOUNT_TO_DODGE;
                            }
                            if (distancePlusSquared < distanceMinusSquared) {
                                this.actions.push({ type: AI._ACTIONS.DRIVE_TO_POSITION, position: closestPlusTangent, canReverse: true, imprecision });
                            } else {
                                this.actions.push({ type: AI._ACTIONS.DRIVE_TO_POSITION, position: closestMinusTangent, canReverse: true, imprecision });
                            }
                        }

                        const relativeToTank = B2DUtils.directionToLocalSpace(tank.getB2DBody(), closestDirection);
                        // If projectile is moving in my forward direction, turn towards the same direction as it will be shorter.
                        // Otherwise, turn to its opposite direction, as that will be shorter.
                        if (relativeToTank.y < 0) {
                            this.actions.push({ type: AI._ACTIONS.TURN_TO, direction: closestDirection, imprecision });
                        } else {
                            this.actions.push({ type: AI._ACTIONS.TURN_TO, direction: { x: -closestDirection.x, y: -closestDirection.y }, imprecision });
                        }
                    } else {
                        this.actions = AIUtils.getActionsToFollowPath(escapePath, null, AI._ACTIONS.DRIVE_TO_TILE, AI._ACTIONS.DRIVE_TO_POSITION, this.config[AI._TRAITS.DEXTERITY]);
                    }
                    //Check if it makes sense to fire a shot in the direction we're facing.
                    this._tryToRetaliate(tank);
                }
                break;
            }
            case AI._GOALS.PICK_UP_COLLECTIBLE:
            {
                this.currentGreediness = Math.max(0, this.currentGreediness - Constants.AI.GREEDINESS_PICK_UP_COLLECTIBLE_SHRINKAGE);

                const targetPosition = this.goal.position;

                if (this.myPosition && targetPosition) {
                    const maze = this.gameController.getMaze();
                    const path = maze.getShortestPathWithGraph(this.myPosition, targetPosition, this.threatMap.data(), 0.1);
                    this.actions = AIUtils.getActionsToFollowPath(path, targetPosition, AI._ACTIONS.DRIVE_TO_TILE, AI._ACTIONS.DRIVE_TO_POSITION, this.config[AI._TRAITS.DEXTERITY]);
                }
                break;
            }
            case AI._GOALS.GET_UNSTUCK:
            {
                const stuckNormal = this.goal.normal;
                const targetPosition = {
                    x: tank.getX() - (stuckNormal.x * Constants.AI.GET_UNSTUCK_DISTANCE),
                    y: tank.getY() - (stuckNormal.y * Constants.AI.GET_UNSTUCK_DISTANCE)
                };
                const imprecision = MathUtils.randomAroundZero(MathUtils.linearInterpolation(Constants.AI.MAX_ROTATION_IMPRECISION, 0, this.config[AI._TRAITS.DEXTERITY]));
                this.actions.push({ type: AI._ACTIONS.DRIVE_TO_POSITION, position: targetPosition, canReverse: true, imprecision });
                break;
            }
            case AI._GOALS.RUN_AWAY:
            {
                const { distances } = this.goal;

                const escapePathLength = Math.ceil(MathUtils.linearInterpolation(Constants.AI.MIN_ESCAPE_PATH_LENGTH, Constants.AI.MAX_ESCAPE_PATH_LENGTH, this.config[AI._TRAITS.CLEVERNESS]));
                const deadEndWeight = MathUtils.linearInterpolation(Constants.AI.MIN_PATH_DEAD_END_WEIGHT, Constants.AI.MAX_PATH_DEAD_END_WEIGHT, this.config[AI._TRAITS.CLEVERNESS]);
                const threatWeight = MathUtils.linearInterpolation(Constants.AI.MAX_PATH_THREAT_WEIGHT, Constants.AI.MIN_PATH_THREAT_WEIGHT, this.config[AI._TRAITS.BOLDNESS]);

                const maze = this.gameController.getMaze();
                if (this.myPosition) {
                    const path = maze.getPathAwayWithMultipleDistancesAndThreats(this.myPosition, escapePathLength, deadEndWeight, distances, this.threatMap, threatWeight);
                    this.actions = AIUtils.getActionsToFollowPath(path, null, AI._ACTIONS.DRIVE_TO_TILE, AI._ACTIONS.DRIVE_TO_POSITION, this.config[AI._TRAITS.DEXTERITY]);
                }
                //Check if it makes sense to fire a shot in the direction we're facing.
                this._tryToRetaliate(tank);

                break;
            }
            case AI._GOALS.HUNT:
            {
                const targetPosition = this.goal.position;

                if (this.myPosition && targetPosition) {
                    const maze = this.gameController.getMaze();
                    const path = maze.getShortestPathWithGraph(this.myPosition, targetPosition, this.threatMap.data(), 0.1);
                    this.actions = AIUtils.getActionsToFollowPath(path, targetPosition, AI._ACTIONS.DRIVE_TO_TILE, AI._ACTIONS.DRIVE_TO_POSITION, this.config[AI._TRAITS.DEXTERITY]);
                }

                break;
            }
            case AI._GOALS.IDLE:
            {
                // Do something random - including idling.
                const randomAction = Math.floor(Math.random() * 3);
                switch (randomAction) {
                    case 0:
                    {
                        this.actions.push({ type: AI._ACTIONS.IDLE, duration: MathUtils.randomRange(Constants.AI.MIN_IDLE_DURATION, Constants.AI.MAX_IDLE_DURATION) });
                        break;
                    }
                    case 1:
                    {
                        const angle = MathUtils.randomRange(0, 2 * Math.PI);
                        const directionX = Math.sin(angle); // Normally it would be Math.cos(rotation), but the tank graphics is rotated 90 degrees CCW
                        const directionY = -Math.cos(angle); // Normally it would be Math.sin(rotation), but the tank graphics is rotated 90 degrees CCW
                        const imprecision = MathUtils.randomAroundZero(MathUtils.linearInterpolation(Constants.AI.MAX_ROTATION_IMPRECISION, 0, this.config[AI._TRAITS.DEXTERITY]));
                        this.actions.push({ type: AI._ACTIONS.TURN_TO, direction: { x: directionX, y: directionY }, imprecision });
                        break;
                    }
                    case 2:
                    {
                        const maze = this.gameController.getMaze();
                        const targetPosition = maze.getRandomUnusedPosition(this.gameController.getRoundState(), Constants.AI.MIN_IDLE_DISTANCE);
                        if (this.myPosition && targetPosition) {
                            targetPosition.x = Math.floor(targetPosition.x / Constants.MAZE_TILE_SIZE.m);
                            targetPosition.y = Math.floor(targetPosition.y / Constants.MAZE_TILE_SIZE.m);
                            const path = maze.getShortestPathWithGraph(this.myPosition, targetPosition, this.threatMap.data(), 0.1);
                            this.actions = AIUtils.getActionsToFollowPath(path, targetPosition, AI._ACTIONS.DRIVE_TO_TILE, AI._ACTIONS.DRIVE_TO_POSITION, this.config[AI._TRAITS.DEXTERITY]);
                        }
                        break;
                    }
                }
            }
        }
    }

    _updateInputToDoAction() {
        this.inputState = InputState.withState(this.aiId, false, false, false, false, false);

        if (this.actions.length === 0) {
            return;
        }

        const tank = this.gameController.getTank(this.aiId);
        if (!tank) {
            return;
        }

        const [action] = this.actions;

        switch (action.type) {
            case AI._ACTIONS.DRIVE_TO_TILE:
            {
                const targetPosition = {
                    x: (action.position.x + 0.5) * Constants.MAZE_TILE_SIZE.m,
                    y: (action.position.y + 0.5) * Constants.MAZE_TILE_SIZE.m
                };

                this.inputState = AIUtils.getInputToDriveToPosition(tank, targetPosition, action.canReverse, action.imprecision);

                break;
            }
            case AI._ACTIONS.DRIVE_TO_POSITION:
            {
                this.inputState = AIUtils.getInputToDriveToPosition(tank, action.position, action.canReverse, action.imprecision);

                break;
            }
            case AI._ACTIONS.TURN_TO:
            {
                this.inputState = AIUtils.getInputToTurnToDirection(tank, action.direction, action.imprecision);
                break;
            }
            case AI._ACTIONS.FIRE:
            {
                this.inputState = AIUtils.getInputToFire(tank, action.delay);
                break;
            }
            default:
            {
                break;
            }
        }
    }

    _updateAndRemovePerformedActions(deltaTime) {
        if (this.actions.length === 0) {
            return;
        }

        const tank = this.gameController.getTank(this.aiId);
        if (!tank) {
            return;
        }

        const [action] = this.actions;

        switch (action.type) {
            case AI._ACTIONS.DRIVE_TO_TILE:
            {
                const targetPosition = {
                    x: (action.position.x + 0.5) * Constants.MAZE_TILE_SIZE.m,
                    y: (action.position.y + 0.5) * Constants.MAZE_TILE_SIZE.m
                };

                const diffSqr = ((tank.getX() - targetPosition.x) * (tank.getX() - targetPosition.x)) + ((tank.getY() - targetPosition.y) * (tank.getY() - targetPosition.y));
                if (diffSqr < Constants.AI.DRIVE_TO_TILE_DISTANCE_SQUARED) {
                    this.actions.shift();
                }

                break;
            }
            case AI._ACTIONS.DRIVE_TO_POSITION:
            {
                const diffSqr = ((tank.getX() - action.position.x) * (tank.getX() - action.position.x)) + ((tank.getY() - action.position.y) * (tank.getY() - action.position.y));
                if (diffSqr < Constants.AI.DRIVE_TO_POSITION_DISTANCE_SQUARED) {
                    this.actions.shift();
                }

                break;
            }
            case AI._ACTIONS.TURN_TO:
            {
                const relativeToTank = B2DUtils.directionToLocalSpace(tank.getB2DBody(), action.direction);
                if (Math.abs(Math.atan2(relativeToTank.y, relativeToTank.x) + (Math.PI * 0.5) + action.imprecision) < Constants.AI.TURN_TO_DIFFERENCE) {
                    this.actions.shift();
                }

                break;
            }
            case AI._ACTIONS.FIRE:
            {
                if (action.delay <= 0) {
                    if (action.duration <= 0) {
                        this.actions.shift();
                    }
                    action.duration -= deltaTime;
                }
                action.delay -= deltaTime;
                break;
            }
            case AI._ACTIONS.IDLE:
            {
                if (action.duration <= 0) {
                    this.actions.shift();
                }
                action.duration -= deltaTime;
                break;
            }
            default:
            {
                break;
            }
        }
    }

    _getFireActionDuration(weapon) {
        switch (weapon.getType()) {
            case Constants.WEAPON_TYPES.GATLING_GUN:
            {
                return (Constants.GATLING_GUN_CHARGE_TIME + (Constants.GATLING_GUN_FIRE_RATE * weapon.getField("bulletCount"))) * 1000;
            }
            default:
            {
                return 1;
            }
        }
    }
}
