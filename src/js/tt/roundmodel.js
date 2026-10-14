import { Log } from "./log.js";
import { B2DUtils } from "./b2dutils.js";
import { Constants } from "./constants.js";
import { Tank } from "./tank.js";
import { BulletWeapon } from "./bulletweapon.js";
import { LaserWeapon } from "./laserweapon.js";
import { DoubleBarrelWeapon } from "./doublebarrelweapon.js";
import { ShotgunWeapon } from "./shotgunweapon.js";
import { HomingMissileWeapon } from "./homingmissileweapon.js";
import { MineWeapon } from "./mineweapon.js";
import { GatlingGunWeapon } from "./gatlinggunweapon.js";
import { Projectile } from "./projectile.js";
import { Shotgun } from "./shotgun.js";
import { HomingMissile } from "./homingmissile.js";
import { Mine } from "./mine.js";
import { Shrapnel } from "./shrapnel.js";
import { Collectible } from "./collectible.js";
import { LaserAimerUpgrade } from "./laseraimerupgrade.js";
import { SpawnShieldUpgrade } from "./spawnshieldupgrade.js";
import { AimerUpgrade } from "./aimerupgrade.js";
import { ShieldUpgrade } from "./shieldupgrade.js";
import { SpeedBoostUpgrade } from "./speedboostupgrade.js";
import { TimerCountdownCounter } from "./timercountdowncounter.js";
import { OvertimeCountUpCounter } from "./overtimecountupcounter.js";
import { SpawnZone } from "./spawnzone.js";
import { StormZone } from "./stormzone.js";
import { RoundState } from "./roundstate.js";
import { ChickenOut } from "./chickenout.js";

/*
 * Events:
 * - updated()
 *
 * Datastructures:
 *
 * ProjectileState:
 *
 * {
 *      id: <string>
 *      playerId: <string>,
 *      type: <int>,
 *      x: <float>,
 *      y: <float>,
 *      speedX: <float>,
 *      speedY: <float>,
 * }
 *
 * TrapState:
 *
 * {
 *      id: <string>
 *      playerId: <string>,
 *      type: <int>,
 *      x: <float>,
 *      y: <float>,
 *      speedX: <float>,
 *      speedY: <float>,
 * }
 *
 * CollectibleState:
 *
 * {
 *      id: <string>,
 *      type: <int>,
 *      x: <float>,
 *      y: <float>,
 *      rotation: <float>
 * }
 *
 * WeaponState:
 *
 * {
 *      id: <string>,
 *      playerId: <string>,
 *      type: <int>,
 *      fieldsJSON: <string>
 * }
 *
 * UpgradeState:
 *
 * {
 *      id: <string>,
 *      playerId: <string>,
 *      type: <int>,
 *      fieldsJSON: <string>
 * }
 *
 *  CounterState:
 *
 * {
 *      id: <string>,
 *      type: <int>,
 *      fieldsJSON: <string>
 * }
 *
 *  ZoneState:
 *
 * {
 *      id: <string>,
 *      type: <int>,
 *      tiles: [<int>, <int>],
 *      fieldsJSON: <string>
 * }
 *
 * TankState:
 * {
 *      playerId: <string>,
 *      x: <float>,
 *      y: <float>,
 *      forward: <bool>,
 *      back: <bool>,
 *      rotation: <float>,
 *      left: <bool>,
 *      right: <bool>
 * }
 *
 */
export class RoundModel {
    static _EVENTS = {
        MAZE_SET: "maze set",
        TANK_CREATED: "tank created",
        TANK_DESTROYED: "tank destroyed",
        TANK_KILLED: "tank killed",
        PROJECTILE_CREATED: "projectile created",
        PROJECTILE_DESTROYED: "projectile destroyed",
        PROJECTILE_TIMEOUT: "projectile timeout",
        TRAP_CREATED: "trap created",
        TRAP_TRIPPED: "trap tripped",
        TRAP_DESTROYED: "trap destroyed",
        COLLECTIBLE_CREATED: "collectible created",
        COLLECTIBLE_DESTROYED: "collectible destroyed",
        WEAPON_CREATED: "weapon created",
        WEAPON_DESTROYED: "weapon destroyed",
        UPGRADE_CREATED: "upgrade created",
        UPGRADE_DESTROYED: "upgrade destroyed",
        COUNTER_CREATED: "counter created",
        COUNTER_DESTROYED: "counter destroyed",
        ZONE_CREATED: "zone created",
        ZONE_DESTROYED: "zone destroyed",
        TANK_TANK_COLLISION: "tank tank collision",
        TANK_MAZE_COLLISION: "tank maze collision",
        TANK_COLLECTIBLE_COLLISION: "tank collectible collision",
        TANK_DEADLY_COLLISION: "tank deadly collision",
        TANK_TRAP_COLLISION: "tank trap collision",
        TANK_TRAP_END_COLLISION: "tank trap end collision",
        TANK_SHIELD_COLLISION: "tank shield collision",
        TANK_ZONE_COLLISION: "tank zone collision",
        PROJECTILE_MAZE_COLLISION: "projectile maze collision",
        PROJECTILE_SHIELD_COLLISION: "projectile shield collision",
        PROJECTILE_ZONE_COLLISION: "projectile zone collision",
        SHIELD_SHIELD_COLLISION: "shield shield collision",
        SHIELD_ZONE_COLLISION: "shield zone collision",
        TRAP_ZONE_COLLISION: "trap zone collision",
        ROUND_CREATED: "round created",
        ROUND_STARTED: "round started",
        ROUND_ENDED: "round ended",
        CELEBRATION_STARTED: "celebration started",
        CELEBRATION_ENDED: "celebration ended",
        TANK_CHICKENED_OUT: "tank chickened out",       // Emitted when a tank illegally leaves the round.
        TANK_CHANGED: "tank changed"                  // Emitted every client frame and contains the client's tank state.
    };

    b2dWorld = null;
    tanks = {};
    projectiles = {};
    traps = {};
    collectibles = {};
    collectibleCounts = {};
    weapons = {};
    upgrades = {};
    counters = {};
    zones = {};
    trapCreated = false;
    weaponCreated = false;
    upgradeCreated = false;
    counterCreated = false;
    zoneCreated = false;
    zoneChanged = false;
    eventListeners = [];
    collisionEvents = [];
    destroyedPlayerIds = [];
    destroyedProjectileIds = [];
    destroyedTrapIds = [];
    destroyedCollectibleIds = [];
    destroyedZoneIds = [];
    playerIdOtherWeaponIds = {};
    playerIdDefaultWeaponId = {};
    playerIdUpgradeIds = {};
    playerIdModifiers = {};
    started = false;
    running = true;
    goldSpawnCount = 0;
    diamondSpawnCount = 0;
    ranked = false;
    victoryGoldAmount = 0;
    stakes = [];
    punishablePlayerIds = [];
    cachedRoundState = null;
    log = null;
    maze = null;

    constructor(controllerId, b2dWorld) {
        this.log = new Log(`RoundModel${controllerId}`);
        this.b2dWorld = b2dWorld;
        this.b2dWorld.SetContactListener(this);
        for (const collectibleType in Constants.COLLECTIBLE_TYPES) {
            this.collectibleCounts[Constants.COLLECTIBLE_TYPES[collectibleType]] = 0;
        }
    }

    /**
     * Implemented to be a b2d contact listener
     */
    BeginContact(b2dContact) {
        const data = B2DUtils.getContactData(b2dContact);

        // Collect collision event for later dispatch, AFTER the entire physics step has been completed.
        const collisionEvent = {};

        switch (data.contactBits) {
            case Constants.COLLISION_CATEGORIES.TANK | Constants.COLLISION_CATEGORIES.TRAP:
            {
                collisionEvent.collisionType = RoundModel._EVENTS.TANK_TRAP_COLLISION;
                collisionEvent.data = data;
                break;
            }
            case Constants.COLLISION_CATEGORIES.TRAP | Constants.COLLISION_CATEGORIES.ZONE:
            {
                collisionEvent.collisionType = RoundModel._EVENTS.TRAP_ZONE_COLLISION;
                collisionEvent.data = data;
                break;
            }
        }

        // Check that the collision was handled.
        if (collisionEvent.data !== undefined) {
            this.collisionEvents.push(collisionEvent);
        }
    }

    /**
     * Implemented to be a b2d contact listener
     */
    EndContact(b2dContact) {
        const data = B2DUtils.getContactData(b2dContact);

        // Collect collision event for later dispatch, AFTER the entire physics step has been completed.
        const collisionEvent = {};

        switch (data.contactBits) {
            case Constants.COLLISION_CATEGORIES.TANK | Constants.COLLISION_CATEGORIES.TRAP:
            {
                collisionEvent.collisionType = RoundModel._EVENTS.TANK_TRAP_END_COLLISION;
                collisionEvent.data = data;
                break;
            }
        }

        // Check that the collision was handled.
        if (collisionEvent.data !== undefined) {
            this.collisionEvents.push(collisionEvent);
        }
    }

    /**
     * Implemented to be a b2d contact listener
     */
    PostSolve(b2dContact, b2dContactImpulse) {
        // Intentionally left blank
    }

    /**
     * Implemented to be a b2d contact listener
     */
    PreSolve(b2dContact, b2dManifold) {
        // Ignore contacts that are not touching.
        if (!b2dContact.IsTouching()) {
            return;
        }

        const data = B2DUtils.getContactData(b2dContact);

        // Collect collision event for later dispatch, AFTER the entire physics step has been completed.
        const collisionEvent = {};

        switch (data.contactBits) {
            case Constants.COLLISION_CATEGORIES.MAZE | Constants.COLLISION_CATEGORIES.PROJECTILE:
            {
                if (!data.projectile.isDeadlyToOwner()) {
                    data.projectile.makeDeadlyToOwner();
                }
                collisionEvent.collisionType = RoundModel._EVENTS.PROJECTILE_MAZE_COLLISION;
                collisionEvent.data = data;
                break;
            }
            case Constants.COLLISION_CATEGORIES.TANK | Constants.COLLISION_CATEGORIES.PROJECTILE:
            {
                if (data.projectile.isDeadlyToOwner() || data.tankA.getPlayerId() !== data.projectile.getPlayerId()) {
                    collisionEvent.collisionType = RoundModel._EVENTS.TANK_DEADLY_COLLISION;
                    collisionEvent.data = data;
                }
                b2dContact.SetEnabled(false);
                break;
            }
            case Constants.COLLISION_CATEGORIES.SHIELD | Constants.COLLISION_CATEGORIES.PROJECTILE:
            {
                if (!data.projectile.isDeadlyToOwner() && data.projectile.getPlayerId() === data.shieldA.getPlayerId()) {
                    b2dContact.SetEnabled(false);
                } else {
                    if (!data.projectile.isDeadlyToOwner()) {
                        data.projectile.makeDeadlyToOwner();
                    }
                    if (data.projectile.getType() === Constants.WEAPON_TYPES.MINE) {
                        b2dContact.SetEnabled(false);
                    }
                    collisionEvent.collisionType = RoundModel._EVENTS.PROJECTILE_SHIELD_COLLISION;
                    collisionEvent.data = data;
                }

                break;
            }
            case Constants.COLLISION_CATEGORIES.ZONE | Constants.COLLISION_CATEGORIES.PROJECTILE:
            {
                if (!data.zone.isPhysical()) {
                    b2dContact.SetEnabled(false);
                }
                collisionEvent.collisionType = RoundModel._EVENTS.PROJECTILE_ZONE_COLLISION;
                collisionEvent.data = data;
                break;
            }
            case Constants.COLLISION_CATEGORIES.TANK | Constants.COLLISION_CATEGORIES.TRAP:
            {
                b2dContact.SetEnabled(false);
                break;
            }
            case Constants.COLLISION_CATEGORIES.TANK:
            {
                collisionEvent.collisionType = RoundModel._EVENTS.TANK_TANK_COLLISION;
                collisionEvent.data = data;
                break;
            }
            case Constants.COLLISION_CATEGORIES.MAZE | Constants.COLLISION_CATEGORIES.TANK:
            {
                collisionEvent.collisionType = RoundModel._EVENTS.TANK_MAZE_COLLISION;
                collisionEvent.data = data;
                break;
            }
            case Constants.COLLISION_CATEGORIES.COLLECTIBLE | Constants.COLLISION_CATEGORIES.TANK:
            {
                collisionEvent.collisionType = RoundModel._EVENTS.TANK_COLLECTIBLE_COLLISION;
                collisionEvent.data = data;
                b2dContact.SetEnabled(false);
                break;
            }
            case Constants.COLLISION_CATEGORIES.SHIELD | Constants.COLLISION_CATEGORIES.TANK:
            {
                if (data.tankA.getPlayerId() === data.shieldA.getPlayerId()) {
                    b2dContact.SetEnabled(false);
                } else {
                    collisionEvent.collisionType = RoundModel._EVENTS.TANK_SHIELD_COLLISION;
                    collisionEvent.data = data;
                }
                break;
            }
            case Constants.COLLISION_CATEGORIES.ZONE | Constants.COLLISION_CATEGORIES.TANK:
            {
                if (!data.zone.isPhysical()) {
                    b2dContact.SetEnabled(false);
                }
                collisionEvent.collisionType = RoundModel._EVENTS.TANK_ZONE_COLLISION;
                collisionEvent.data = data;
                break;
            }
            case Constants.COLLISION_CATEGORIES.SHIELD:
            {
                collisionEvent.collisionType = RoundModel._EVENTS.SHIELD_SHIELD_COLLISION;
                collisionEvent.data = data;
                break;
            }
            case Constants.COLLISION_CATEGORIES.SHIELD | Constants.COLLISION_CATEGORIES.ZONE:
            {
                if (!data.zone.isPhysical()) {
                    b2dContact.SetEnabled(false);
                }
                collisionEvent.collisionType = RoundModel._EVENTS.SHIELD_ZONE_COLLISION;
                collisionEvent.data = data;
                break;
            }
            case Constants.COLLISION_CATEGORIES.TRAP | Constants.COLLISION_CATEGORIES.ZONE:
            {
                b2dContact.SetEnabled(false);
                break;
            }
        }

        // Check that the collision was handled.
        if (collisionEvent.data !== undefined) {
            this.collisionEvents.push(collisionEvent);
        }
    }

    setMaze(maze) {
        this.maze = maze;
        B2DUtils.createMaze(this.b2dWorld, maze);
        this._notifyEventListeners(RoundModel._EVENTS.MAZE_SET, maze);
    }

    getMaze() {
        return this.maze;
    }

    removeTank(playerId) {
        if (playerId in this.tanks) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            this.destroyedPlayerIds.push(playerId);

            this.punishablePlayerIds.push(playerId);

            const projectileIds = [];
            const trapIds = [];

            // Find all the projectiles of this tank and remove them, too.
            for (const projectile in this.projectiles) {
                if (this.projectiles[projectile].getPlayerId() === playerId) {
                    const projectileId = this.projectiles[projectile].getId();
                    this.destroyedProjectileIds.push(projectileId);
                    projectileIds.push(projectileId);
                }
            }

            // Find all the traps of this tank and remove them, too.
            for (const trap in this.traps) {
                if (this.traps[trap].getPlayerId() === playerId) {
                    const trapId = this.traps[trap].getId();
                    this.destroyedTrapIds.push(trapId);
                    trapIds.push(trapId);
                }
            }

            const chickenOut = new ChickenOut(playerId, projectileIds, trapIds);
            this._notifyEventListeners(RoundModel._EVENTS.TANK_CHICKENED_OUT, chickenOut);
        } else {
            this.log.error(`Attempt to remove tank with id ${playerId} from round, but tank is not currently in this round`);
        }
    }

    setProjectileState(projectileState) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        if (!(projectileState.getId() in this.projectiles)) {
            let projectile;
            let b2dBody;
            switch (projectileState.getType()) {
                case Constants.WEAPON_TYPES.BULLET:
                {
                    projectile = new Projectile(projectileState, Constants.BULLET_MAX_LIFETIME, Constants.PROJECTILE_BOUNCE_TIMEOUT_WINDOW, Constants.PROJECTILE_BOUNCE_TIMEOUT_COUNT, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createProjectileBody(this.b2dWorld, projectile, Constants.BULLET.RADIUS.m);

                    break;
                }
                case Constants.WEAPON_TYPES.LASER:
                {
                    projectile = new Projectile(projectileState, Constants.LASER_MAX_LIFETIME, Constants.PROJECTILE_BOUNCE_TIMEOUT_WINDOW, Constants.PROJECTILE_BOUNCE_TIMEOUT_COUNT, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createProjectileBody(this.b2dWorld, projectile, Constants.LASER.RADIUS.m);

                    break;
                }
                case Constants.WEAPON_TYPES.DOUBLE_BARREL:
                {
                    projectile = new Projectile(projectileState, Constants.DOUBLE_BARREL_MAX_LIFETIME, Constants.PROJECTILE_BOUNCE_TIMEOUT_WINDOW, Constants.PROJECTILE_BOUNCE_TIMEOUT_COUNT, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createProjectileBody(this.b2dWorld, projectile, Constants.DOUBLE_BARREL.RADIUS.m);

                    break;
                }
                case Constants.WEAPON_TYPES.SHOTGUN:
                {
                    projectile = new Shotgun(projectileState, Constants.SHOTGUN_MAX_LIFETIME, Constants.PROJECTILE_BOUNCE_TIMEOUT_WINDOW, Constants.PROJECTILE_BOUNCE_TIMEOUT_COUNT, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createProjectileBody(this.b2dWorld, projectile, Constants.SHOTGUN.RADIUS.m);

                    break;
                }
                case Constants.WEAPON_TYPES.HOMING_MISSILE:
                {
                    projectile = new HomingMissile(projectileState, Constants.HOMING_MISSILE_MAX_LIFETIME, Constants.PROJECTILE_BOUNCE_TIMEOUT_WINDOW, Constants.PROJECTILE_BOUNCE_TIMEOUT_COUNT, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createProjectileBody(this.b2dWorld, projectile, Constants.HOMING_MISSILE.RADIUS.m);

                    break;
                }
                case Constants.WEAPON_TYPES.MINE:
                {
                    projectile = new Shrapnel(projectileState, 0, Constants.PROJECTILE_BOUNCE_TIMEOUT_WINDOW, Constants.PROJECTILE_BOUNCE_TIMEOUT_COUNT, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createProjectileBody(this.b2dWorld, projectile, Constants.MINE_SHRAPNEL_RADIUS);

                    break;
                }
                case Constants.WEAPON_TYPES.GATLING_GUN:
                {
                    projectile = new Projectile(projectileState, Constants.GATLING_GUN_MAX_LIFETIME, Constants.PROJECTILE_BOUNCE_TIMEOUT_WINDOW, Constants.PROJECTILE_BOUNCE_TIMEOUT_COUNT, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createProjectileBody(this.b2dWorld, projectile, Constants.GATLING_GUN.RADIUS.m);

                    break;
                }
            }

            projectile.setB2DBody(b2dBody);

            this.projectiles[projectileState.getId()] = projectile;
            this._notifyEventListeners(RoundModel._EVENTS.PROJECTILE_CREATED, projectile);
        } else {
            this.projectiles[projectileState.getId()].setProjectileState(projectileState);
        }
    }

    setTrapState(trapState) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        if (!(trapState.getId() in this.traps)) {
            let trap;
            let b2dBody;
            switch (trapState.getType()) {
                case Constants.WEAPON_TYPES.MINE:
                {
                    trap = new Mine(trapState, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createTrapBody(this.b2dWorld, trap, Constants.MINE.RADIUS.m);

                    break;
                }
            }

            trap.setB2DBody(b2dBody);

            this.traps[trapState.getId()] = trap;

            this.trapCreated = true;
            this._notifyEventListeners(RoundModel._EVENTS.TRAP_CREATED, trap);
        } else {
            // Intentionally do not synch existing traps.
            //this.traps[trapState.getId()].setTrapState(trapState);
        }
    }

    setCollectibleState(collectibleState) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        if (!(collectibleState.getId() in this.collectibles)) {
            const collectible = new Collectible(collectibleState);
            let b2dBody;
            switch (collectibleState.getType()) {
                case Constants.COLLECTIBLE_TYPES.CRATE_LASER:
                case Constants.COLLECTIBLE_TYPES.CRATE_DOUBLE_BARREL:
                case Constants.COLLECTIBLE_TYPES.CRATE_SHOTGUN:
                case Constants.COLLECTIBLE_TYPES.CRATE_HOMING_MISSILE:
                case Constants.COLLECTIBLE_TYPES.CRATE_MINE:
                case Constants.COLLECTIBLE_TYPES.CRATE_GATLING_GUN:
                case Constants.COLLECTIBLE_TYPES.CRATE_AIMER:
                case Constants.COLLECTIBLE_TYPES.CRATE_SHIELD:
                case Constants.COLLECTIBLE_TYPES.CRATE_SPEED_BOOST:
                {
                    b2dBody = B2DUtils.createCrateBody(this.b2dWorld, collectible);

                    break;
                }
                case Constants.COLLECTIBLE_TYPES.GOLD:
                {
                    b2dBody = B2DUtils.createGoldBody(this.b2dWorld, collectible);
                    ++this.goldSpawnCount;

                    break;
                }
                case Constants.COLLECTIBLE_TYPES.DIAMOND:
                {
                    b2dBody = B2DUtils.createDiamondBody(this.b2dWorld, collectible);
                    ++this.diamondSpawnCount;

                    break;
                }
            }

            collectible.setB2DBody(b2dBody);

            this.collectibles[collectibleState.getId()] = collectible;
            this.collectibleCounts[collectible.getType()]++;
            this._notifyEventListeners(RoundModel._EVENTS.COLLECTIBLE_CREATED, collectible);
        } else {
            this.collectibles[collectibleState.getId()].setCollectibleState(collectibleState);
        }
    }

    setTankState(tankState) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        if (!(tankState.getPlayerId() in this.tanks)) {
            const tank = new Tank(tankState, this);
            this.tanks[tankState.getPlayerId()] = tank;
            this.playerIdDefaultWeaponId[tankState.getPlayerId()] = null;
            this.playerIdOtherWeaponIds[tankState.getPlayerId()] = [];
            this.playerIdUpgradeIds[tankState.getPlayerId()] = [];
            this._updateModifiers(tankState.getPlayerId()); // Update map from tank to modifiers.
            const b2dBody = B2DUtils.createTankBody(this.b2dWorld, tank);
            tank.setB2DBody(b2dBody);
            this._notifyEventListeners(RoundModel._EVENTS.TANK_CREATED, tank);
        } else {
            this.tanks[tankState.getPlayerId()].setTankState(tankState);
        }
    }

    setWeaponState(weaponState) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        if (!(weaponState.getId() in this.weapons)) {
            let weapon;
            switch (weaponState.getType()) {
                case Constants.WEAPON_TYPES.BULLET:
                {
                    weapon = new BulletWeapon(weaponState, this, this.relayEvent, this);
                    break;
                }
                case Constants.WEAPON_TYPES.LASER:
                {
                    weapon = new LaserWeapon(weaponState, this, this.relayEvent, this);
                    break;
                }
                case Constants.WEAPON_TYPES.DOUBLE_BARREL:
                {
                    weapon = new DoubleBarrelWeapon(weaponState, this, this.relayEvent, this);
                    break;
                }
                case Constants.WEAPON_TYPES.SHOTGUN:
                {
                    weapon = new ShotgunWeapon(weaponState, this, this.relayEvent, this);
                    break;
                }
                case Constants.WEAPON_TYPES.HOMING_MISSILE:
                {
                    weapon = new HomingMissileWeapon(weaponState, this, this.relayEvent, this);
                    break;
                }
                case Constants.WEAPON_TYPES.MINE:
                {
                    weapon = new MineWeapon(weaponState, this, this.relayEvent, this);
                    break;
                }
                case Constants.WEAPON_TYPES.GATLING_GUN:
                {
                    weapon = new GatlingGunWeapon(weaponState, this, this.relayEvent, this);
                    break;
                }
            }

            this.weapons[weaponState.getId()] = weapon;

            // Update map from tank to weapons.
            if (weapon.isDefault()) {
                this.playerIdDefaultWeaponId[weaponState.getPlayerId()] = weapon.getId();
            } else {
                this.playerIdOtherWeaponIds[weaponState.getPlayerId()].unshift(weapon.getId());
            }

            // Update tank's body.
            const newWeapon = this.getActiveWeapon(weaponState.getPlayerId());
            const tank = this.tanks[weaponState.getPlayerId()];
            if (newWeapon && tank) {
                B2DUtils.updateTankBodyTurret(tank.getB2DBody(), tank, newWeapon);
            }

            this.weaponCreated = true;
            this._notifyEventListeners(RoundModel._EVENTS.WEAPON_CREATED, weapon);
        } else {
            // Intentionally do not synch existing weapons.
            //this.weapons[weaponState.getId()].setWeaponState(weaponState);
        }
    }

    setUpgradeState(upgradeState) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        if (!(upgradeState.getId() in this.upgrades)) {
            let upgrade;
            switch (upgradeState.getType()) {
                case Constants.UPGRADE_TYPES.LASER_AIMER:
                {
                    upgrade = new LaserAimerUpgrade(upgradeState, this, this.relayEvent, this);
                    break;
                }
                case Constants.UPGRADE_TYPES.SPAWN_SHIELD:
                {
                    upgrade = new SpawnShieldUpgrade(upgradeState, this, this.relayEvent, this);
                    break;
                }
                case Constants.UPGRADE_TYPES.AIMER:
                {
                    upgrade = new AimerUpgrade(upgradeState, this, this.relayEvent, this);
                    break;
                }
                case Constants.UPGRADE_TYPES.SHIELD:
                {
                    upgrade = new ShieldUpgrade(upgradeState, this, this.relayEvent, this);
                    break;
                }
                case Constants.UPGRADE_TYPES.SPEED_BOOST:
                {
                    upgrade = new SpeedBoostUpgrade(upgradeState, this, this.relayEvent, this);
                    break;
                }
            }

            this.upgrades[upgradeState.getId()] = upgrade;

            // Update map from tank to upgrades.
            this.playerIdUpgradeIds[upgradeState.getPlayerId()].push(upgrade.getId());

            // Update map from tank to modifiers.
            this._updateModifiers(upgradeState.getPlayerId());

            // Update tank's body.
            const tank = this.tanks[upgradeState.getPlayerId()];
            if (tank) {
                B2DUtils.addTankBodyUpgrade(tank.getB2DBody(), upgrade);
            }

            this.upgradeCreated = true;
            this._notifyEventListeners(RoundModel._EVENTS.UPGRADE_CREATED, upgrade);
        } else {
            // Intentionally do not synch existing upgrades.
            //this.upgrades[upgradeState.getId()].setUpgradeState(upgradeState);
        }
    }

    setCounterState(counterState) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        if (!(counterState.getId() in this.counters)) {
            let counter;
            switch (counterState.getType()) {
                case Constants.COUNTER_TYPES.TIMER_COUNTDOWN:
                {
                    counter = new TimerCountdownCounter(counterState, this, this.relayEvent, this);
                    break;
                }
                case Constants.COUNTER_TYPES.OVERTIME_COUNT_UP:
                {
                    counter = new OvertimeCountUpCounter(counterState, this, this.relayEvent, this);
                    break;
                }
            }

            this.counters[counterState.getId()] = counter;

            this.counterCreated = true;
            this._notifyEventListeners(RoundModel._EVENTS.COUNTER_CREATED, counter);
        } else {
            // Intentionally do not synch existing counters.
            //this.counters[counterState.getId()].setCounterState(counterState);
        }
    }

    setZoneState(zoneState) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        if (!(zoneState.getId() in this.zones)) {
            let zone;
            let b2dBody = null;
            switch (zoneState.getType()) {
                case Constants.ZONE_TYPES.SPAWN:
                {
                    zone = new SpawnZone(zoneState, this, this.relayEvent, this);
                    b2dBody = B2DUtils.createSpawnZoneBody(this.b2dWorld, zone, zone.getField("radius"));
                    break;
                }
                case Constants.ZONE_TYPES.STORM:
                {
                    zone = new StormZone(zoneState, this, this.relayEvent, this);
                    const corners = zone.getCorners();
                    b2dBody = B2DUtils.createStormZoneBody(this.b2dWorld, zone, corners.stormStartRight, corners.stormEndRight, corners.stormStartBottom, corners.stormEndBottom, corners.stormStartLeft, corners.stormEndLeft, corners.stormStartTop, corners.stormEndTop);
                    break;
                }
            }

            zone.setB2DBody(b2dBody);

            this.zones[zoneState.getId()] = zone;

            this.zoneCreated = true;
            this._notifyEventListeners(RoundModel._EVENTS.ZONE_CREATED, zone);
        } else if (zoneState.getType() === Constants.ZONE_TYPES.STORM) {
            // Intentionally only synch existing storm zones.
            this.zones[zoneState.getId()].setZoneState(zoneState);
        }
    }

    emitTankState(tankState) {
        this._notifyEventListeners(RoundModel._EVENTS.TANK_CHANGED, tankState);
    }

    getRoundState(expandedState) {
        expandedState |= this.trapCreated || this.weaponCreated || this.upgradeCreated || this.counterCreated || this.zoneCreated || this.zoneChanged;

        if (this.cachedRoundState) {
            if ((expandedState && this.cachedRoundState.isExpanded()) || (!expandedState && !this.cachedRoundState.isExpanded())) {
                return this.cachedRoundState;
            }
        }

        const roundState = new RoundState();
        const tankStates = [];
        const projectileStates = [];
        const collectibleStates = [];
        for (const playerId in this.tanks) {
            if (this.destroyedPlayerIds.includes(playerId)) {
                continue;
            }
            const tank = this.tanks[playerId];
            tankStates.push(tank.getTankState());
        }
        roundState.setTankStates(tankStates);

        for (const projectileId in this.projectiles) {
            if (this.destroyedProjectileIds.includes(projectileId)) {
                continue;
            }
            const projectile = this.projectiles[projectileId];
            projectileStates.push(projectile.getProjectileState());
        }
        roundState.setProjectileStates(projectileStates);

        for (const collectibleId in this.collectibles) {
            if (this.destroyedCollectibleIds.includes(collectibleId)) {
                continue;
            }
            const collectible = this.collectibles[collectibleId];
            collectibleStates.push(collectible.getCollectibleState());
        }
        roundState.setCollectibleStates(collectibleStates);

        if (expandedState) {
            this._getExpandedRoundState(roundState);
        }

        this.cachedRoundState = roundState;

        return roundState;
    }

    _getExpandedRoundState(roundState) {
        const trapStates = [];
        for (const trapId in this.traps) {
            if (this.destroyedTrapIds.includes(trapId)) {
                continue;
            }
            const trap = this.traps[trapId];
            trapStates.push(trap.getTrapState());
        }
        roundState.setTrapStates(trapStates);

        const weaponStates = [];
        for (const weaponId in this.weapons) {
            const weapon = this.weapons[weaponId];
            weaponStates.push(weapon.getWeaponState());
        }
        roundState.setWeaponStates(weaponStates);

        const upgradeStates = [];
        for (const upgradeId in this.upgrades) {
            const upgrade = this.upgrades[upgradeId];
            upgradeStates.push(upgrade.getUpgradeState());
        }
        roundState.setUpgradeStates(upgradeStates);

        const counterStates = [];
        for (const counterId in this.counters) {
            const counter = this.counters[counterId];
            counterStates.push(counter.getCounterState());
        }
        roundState.setCounterStates(counterStates);

        const zoneStates = [];
        for (const zoneId in this.zones) {
            if (this.destroyedZoneIds.includes(zoneId)) {
                continue;
            }
            const zone = this.zones[zoneId];
            zoneStates.push(zone.getZoneState());
        }
        roundState.setZoneStates(zoneStates);
    }

    clearExpandedRoundStateBits() {
        this.trapCreated = false;
        this.weaponCreated = false;
        this.upgradeCreated = false;
        this.counterCreated = false;
        this.zoneCreated = false;
        this.zoneChanged = false;
    }

    getTank(playerId) {
        return this.tanks[playerId];
    }

    isTankDestroyed(playerId) {
        return this.destroyedPlayerIds.includes(playerId);
    }

    getTankCount() {
        return Object.keys(this.tanks).length;
    }

    getCrateCount() {
        let sum = 0;
        for (let i = 0; i < Constants.COLLECTIBLE_TYPES.CRATE_COUNT; ++i) {
            sum += this.collectibleCounts[i];
        }

        return sum;
    }

    getCollectibleCount(collectibleType) {
        return this.collectibleCounts[collectibleType];
    }

    getGoldSpawnCount() {
        return this.goldSpawnCount;
    }

    getDiamondSpawnCount() {
        return this.diamondSpawnCount;
    }

    getTanks() {
        return this.tanks;
    }

    destroyTank(playerId) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        this.destroyedPlayerIds.push(playerId);
        this._notifyEventListeners(RoundModel._EVENTS.TANK_DESTROYED, playerId);
    }

    killTank(kill) {
        // Invalidate cached round state.
        this.cachedRoundState = null;

        this.log.debug(`Marking tank ${kill.getVictimPlayerId()} as killed`);
        this.destroyedPlayerIds.push(kill.getVictimPlayerId());
        this._notifyEventListeners(RoundModel._EVENTS.TANK_KILLED, kill);
    }

    getProjectile(projectileId) {
        return this.projectiles[projectileId];
    }

    getProjectiles() {
        return this.projectiles;
    }

    getTrap(trapId) {
        return this.traps[trapId];
    }

    getTraps() {
        return this.traps;
    }

    getCollectible(collectibleId) {
        return this.collectibles[collectibleId];
    }

    getCollectibles() {
        return this.collectibles;
    }

    getWeapons() {
        return this.weapons;
    }

    getActiveWeapon(playerId) {
        const otherWeaponIds = this.playerIdOtherWeaponIds[playerId];
        if (!otherWeaponIds || otherWeaponIds.length === 0) {
            return this.getDefaultWeapon(playerId);
        } else {
            return this.weapons[otherWeaponIds.at(-1)];
        }
    }

    getQueuedWeapons(playerId) {
        const otherWeaponIds = this.playerIdOtherWeaponIds[playerId];
        const result = [];
        if (otherWeaponIds) {
            for (let i = 0; i < otherWeaponIds.length - 1; ++i) {
                result.push(this.weapons[otherWeaponIds[i]]);
            }
        }

        return result;
    }

    getDefaultWeapon(playerId) {
        const weaponId = this.playerIdDefaultWeaponId[playerId];
        if (weaponId) {
            return this.weapons[weaponId];
        } else {
            return null;
        }
    }

    getUpgrades() {
        return this.upgrades;
    }

    getUpgrade(upgradeId) {
        return this.upgrades[upgradeId];
    }

    getUpgradeByPlayerIdAndType(playerId, type) {
        for (const upgradeId in this.upgrades) {
            const upgrade = this.upgrades[upgradeId];
            if (upgrade.getPlayerId() === playerId && upgrade.getType() === type) {
                return upgrade;
            }
        }

        return null;
    }

    getCounters() {
        return this.counters;
    }

    getCounter(counterId) {
        return this.counters[counterId];
    }

    getZones() {
        return this.zones;
    }

    getZone(zoneId) {
        return this.zones[zoneId];
    }

    delayedFire(playerId) {
        const tank = this.getTank(playerId);
        if (tank) {
            const weapon = this.getActiveWeapon(playerId);
            if (weapon) {
                const projectileStates = weapon.getProjectileStates(tank);
                for (const projectileState of projectileStates) {
                    this.setProjectileState(projectileState);
                }
            }
        }
    }

    destroyProjectile(projectileId) {
        const projectile = this.projectiles[projectileId];
        if (projectile) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            const defaultWeapon = this.getDefaultWeapon(projectile.getPlayerId());
            if (defaultWeapon && defaultWeapon.getType() === projectile.getType()) {
                defaultWeapon.reload(projectile);
            }
            this.destroyedProjectileIds.push(projectileId);
            this._notifyEventListeners(RoundModel._EVENTS.PROJECTILE_DESTROYED, projectileId);
        }
    }

    timeoutProjectile(projectileId) {
        const projectile = this.projectiles[projectileId];
        if (projectile) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            const defaultWeapon = this.getDefaultWeapon(projectile.getPlayerId());
            if (defaultWeapon && defaultWeapon.getType() === projectile.getType()) {
                defaultWeapon.reload(projectile);
            }
            this.destroyedProjectileIds.push(projectileId);
            this._notifyEventListeners(RoundModel._EVENTS.PROJECTILE_TIMEOUT, projectileId);
        }
    }

    destroyTrap(trapId) {
        const trap = this.traps[trapId];
        if (trap) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            this.destroyedTrapIds.push(trapId);
            this._notifyEventListeners(RoundModel._EVENTS.TRAP_DESTROYED, trapId);
        }
    }

    tripTrap(trip) {
        const trap = this.traps[trip.getTrapId()];
        if (trap) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            trap.trip(trip.getPlayerId(), trip.getEntered());
            this._notifyEventListeners(RoundModel._EVENTS.TRAP_TRIPPED, trip);
        }
    }

    destroyCollectible(pickup) {
        const collectible = this.collectibles[pickup.getCollectibleId()];
        if (collectible) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            this.destroyedCollectibleIds.push(pickup.getCollectibleId());
            this.collectibleCounts[collectible.getType()]--;
            this._notifyEventListeners(RoundModel._EVENTS.COLLECTIBLE_DESTROYED, pickup);
        }
    }

    updateWeapon(playerId, weaponId) {
        const weapon = this.weapons[weaponId];
        if (weapon) {
            // Update tank's body.
            const tank = this.tanks[playerId];
            if (tank) {
                B2DUtils.updateTankBodyTurret(tank.getB2DBody(), tank, weapon);
            }
        }
    }

    destroyWeapon(weaponDeactivation) {
        const weaponId = weaponDeactivation.getWeaponId();
        const playerId = weaponDeactivation.getPlayerId();
        const weapon = this.weapons[weaponId];
        if (weapon) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            delete this.weapons[weaponId];

            const defaultWeaponId = this.playerIdDefaultWeaponId[playerId];
            if (defaultWeaponId === weaponId) {
                this.playerIdDefaultWeaponId[playerId] = null;
            } else {
                const otherWeaponIds = this.playerIdOtherWeaponIds[playerId];
                const index = otherWeaponIds.indexOf(weaponId);
                if (index !== -1) {
                    otherWeaponIds.splice(index, 1);
                }
            }

            // Update tank's body.
            const newWeapon = this.getActiveWeapon(playerId);
            const tank = this.tanks[playerId];
            if (newWeapon && tank) {
                B2DUtils.updateTankBodyTurret(tank.getB2DBody(), tank, newWeapon);
            }

            this._notifyEventListeners(RoundModel._EVENTS.WEAPON_DESTROYED, weaponDeactivation);
        }
    }

    destroyUpgrade(upgradeUpdate) {
        const upgradeId = upgradeUpdate.getUpgradeId();
        const playerId = upgradeUpdate.getPlayerId();
        const upgrade = this.upgrades[upgradeId];
        if (upgrade) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            delete this.upgrades[upgradeId];

            const upgradeIds = this.playerIdUpgradeIds[playerId];
            const index = upgradeIds.indexOf(upgradeId);
            if (index !== -1) {
                upgradeIds.splice(index, 1);
            }

            // Update map from tank to modifiers.
            this._updateModifiers(playerId);

            // Update tank's body.
            const tank = this.tanks[playerId];
            if (tank) {
                B2DUtils.removeTankBodyUpgrade(tank.getB2DBody(), upgrade.getType());
            }

            this._notifyEventListeners(RoundModel._EVENTS.UPGRADE_DESTROYED, upgradeUpdate);
        }
    }

    destroyCounter(counterId) {
        const counter = this.counters[counterId];
        if (counter) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            delete this.counters[counterId];

            this._notifyEventListeners(RoundModel._EVENTS.COUNTER_DESTROYED, counterId);
        }
    }

    destroyZone(zoneId) {
        const zone = this.zones[zoneId];
        if (zone) {
            // Invalidate cached round state.
            this.cachedRoundState = null;

            this.destroyedZoneIds.push(zoneId);
            this._notifyEventListeners(RoundModel._EVENTS.ZONE_DESTROYED, zoneId);
        }
    }

    changeZone(zoneId) {
        const zone = this.zones[zoneId];
        if (zone) {
            this.zoneChanged = true;
        }
    }

    update(deltaTime) {
        if (!this.running) {
            return;
        }

        // Invalidate cached round state.
        this.cachedRoundState = null;

        this._removeDestroyed();
        this.b2dWorld.Step(deltaTime, 10, 10);
        this._filterAndDispatchCollisionEvents();
        this._removeDestroyed();

        // Iterate over all elements and call update
        for (const tank in this.tanks) {
            this.tanks[tank].update(deltaTime);
        }
        for (const projectile in this.projectiles) {
            this.projectiles[projectile].update(deltaTime);
        }
        for (const trap in this.traps) {
            this.traps[trap].update(deltaTime);
        }
        for (const collectible in this.collectibles) {
            this.collectibles[collectible].update(deltaTime);
        }
        for (const weapon in this.weapons) {
            this.weapons[weapon].update(deltaTime);
        }
        for (const upgrade in this.upgrades) {
            this.upgrades[upgrade].update(deltaTime);
        }
        for (const counter in this.counters) {
            this.counters[counter].update(deltaTime);
        }
        for (const zone in this.zones) {
            this.zones[zone].update(deltaTime);
        }
    }

    _filterAndDispatchCollisionEvents() {
        const dispatchedCollisionEvents = [];

        for (const event of this.collisionEvents) {
            // Make sure to filter duplicate collision events:
            // - filter so that a tank can only be involved in one event of each type per step (except tank-trap and tank-trap-end collisions).
            //      - do this by only checking type and tankA properties of event data, and ignoring maze and projectile properties.
            // - filter so that a collectible can only be involved in one event of each type per step.
            //      - do this by only checking type and collectible properties of event data, and ignoring tankA, tankB and maze properties.
            // - filter so that a trap can only be involved in one event of each type per step.
            //      - do this by only checking type and trap properties of event data, and ignoring tankA, tankB and maze properties.
            // - filter so that a shield can only be involved in one event of each type per step (except projectile-shield collisions).
            //      - do this by only checking type and shieldA properties of event data, and ignoring tankA, tankB and maze properties.
            // - filter so that a zone can only be involved in one event of each type per step (except projectile-zone collisions).
            //      - do this by only checking type and zone properties of event data, and ignoring tankA, tankB and maze properties.
            // - filter so that a projectile can only be involved in one event of each type per step (except projectile-maze and projectile-shield collisions).
            //      - do this by only checking type and projectile properties of event data, and ignoring tankA, tankB and maze properties.
            let eventAlreadyDispatched = false;
            for (const dispatchedEvent of dispatchedCollisionEvents) {
                if (event.collisionType === dispatchedEvent.collisionType &&
                    ((event.data.tankA !== undefined && event.data.tankA === dispatchedEvent.data.tankA && event.collisionType !== RoundModel._EVENTS.TANK_TRAP_COLLISION && event.collisionType !== RoundModel._EVENTS.TANK_TRAP_END_COLLISION) ||
                     (event.data.collectible !== undefined && event.data.collectible === dispatchedEvent.data.collectible) ||
                     (event.data.trap !== undefined && event.data.trap === dispatchedEvent.data.trap) ||
                     (event.data.shieldA !== undefined && event.data.shieldA === dispatchedEvent.data.shieldA && event.collisionType !== RoundModel._EVENTS.PROJECTILE_SHIELD_COLLISION) ||
                     (event.data.zone !== undefined && event.data.zone === dispatchedEvent.data.zone && event.collisionType !== RoundModel._EVENTS.PROJECTILE_ZONE_COLLISION) ||
                     (event.data.projectile !== undefined && event.data.projectile === dispatchedEvent.data.projectile && event.collisionType !== RoundModel._EVENTS.PROJECTILE_MAZE_COLLISION && event.collisionType !== RoundModel._EVENTS.PROJECTILE_SHIELD_COLLISION)
                    )
                ) {
                    eventAlreadyDispatched = true;
                    break;
                }
            }
            if (!eventAlreadyDispatched) {
                dispatchedCollisionEvents.push(event);
                this._notifyEventListeners(event.collisionType, event.data);
            }
        }
        this.collisionEvents = [];
    }

    _removeDestroyed() {
        // Clean this.tanks, this.projectiles, this.collectibles and remove b2d bodies
        for (const destroyedPlayerId of this.destroyedPlayerIds) {
            const tank = this.tanks[destroyedPlayerId];
            if (tank) {
                this.b2dWorld.DestroyBody(tank.getB2DBody());
                delete this.tanks[destroyedPlayerId];

                delete this.weapons[this.playerIdDefaultWeaponId[destroyedPlayerId]];
                for (const otherWeaponId of this.playerIdOtherWeaponIds[destroyedPlayerId]) {
                    delete this.weapons[otherWeaponId];
                }

                delete this.playerIdDefaultWeaponId[destroyedPlayerId];
                delete this.playerIdOtherWeaponIds[destroyedPlayerId];

                for (const upgradeId of this.playerIdUpgradeIds[destroyedPlayerId]) {
                    delete this.upgrades[upgradeId];
                }

                delete this.playerIdUpgradeIds[destroyedPlayerId];

                delete this.playerIdModifiers[destroyedPlayerId];
            } else if (Constants.getMode() === Constants.MODE_SERVER) {
                // Only report this as an error on the server, since out-of-focus browser tabs can cause the model to be out of synch when an update (and therefore _removeDestroyed) is finally called.
                this.log.error(`Tried to destroy tank which was already gone: ${destroyedPlayerId}`);
            }
        }
        this.destroyedPlayerIds = [];

        for (const destroyedProjectileId of this.destroyedProjectileIds) {
            const projectile = this.projectiles[destroyedProjectileId];
            if (projectile) {
                this.b2dWorld.DestroyBody(projectile.getB2DBody());
                delete this.projectiles[destroyedProjectileId];
            } else if (Constants.getMode() === Constants.MODE_SERVER) {
                // Only report this as an error on the server, since out-of-focus browser tabs can cause the model to be out of synch when an update (and therefore _removeDestroyed) is finally called.
                this.log.error(`Tried to destroy projectile which was already gone: ${destroyedProjectileId}`);
            }
        }
        this.destroyedProjectileIds = [];

        for (const destroyedTrapId of this.destroyedTrapIds) {
            const trap = this.traps[destroyedTrapId];
            if (trap) {
                this.b2dWorld.DestroyBody(trap.getB2DBody());
                delete this.traps[destroyedTrapId];
            } else if (Constants.getMode() === Constants.MODE_SERVER) {
                // Only report this as an error on the server, since out-of-focus browser tabs can cause the model to be out of synch when an update (and therefore _removeDestroyed) is finally called.
                this.log.error(`Tried to destroy trap which was already gone: ${destroyedTrapId}`);
            }
        }
        this.destroyedTrapIds = [];

        for (const destroyedCollectibleId of this.destroyedCollectibleIds) {
            const collectible = this.collectibles[destroyedCollectibleId];
            if (collectible) {
                this.b2dWorld.DestroyBody(collectible.getB2DBody());
                delete this.collectibles[destroyedCollectibleId];
            } else if (Constants.getMode() === Constants.MODE_SERVER) {
                // Only report this as an error on the server, since out-of-focus browser tabs can cause the model to be out of synch when an update (and therefore _removeDestroyed) is finally called.
                this.log.error(`Tried to destroy collectible which was already gone: ${destroyedCollectibleId}`);
            }
        }
        this.destroyedCollectibleIds = [];

        for (const destroyedZoneId of this.destroyedZoneIds) {
            const zone = this.zones[destroyedZoneId];
            if (zone) {
                this.b2dWorld.DestroyBody(zone.getB2DBody());
                delete this.zones[destroyedZoneId];
            } else if (Constants.getMode() === Constants.MODE_SERVER) {
                // Only report this as an error on the server, since out-of-focus browser tabs can cause the model to be out of synch when an update (and therefore _removeDestroyed) is finally called.
                this.log.error(`Tried to destroy zone which was already gone: ${destroyedZoneId}`);
            }
        }
        this.destroyedZoneIds = [];
    }

    addEventListener(callback, context, gameId) {
        this.eventListeners.push({ callback, context, gameId });
    }

    removeEventListener(callback, context) {
        const index = this.eventListeners.findIndex(listener => listener.callback === callback && listener.context === context);
        if (index !== -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    _notifyEventListeners(evt, data) {
        for (const eventListener of this.eventListeners) {
            try {
                eventListener.callback(eventListener.context, eventListener.gameId, evt, data);
            } catch (error) {
                this.log.error("Event listener failed", error);
            }
        }
    }

    createRound(ranked) {
        this.ranked = ranked;
        this._notifyEventListeners(RoundModel._EVENTS.ROUND_CREATED, ranked);
    }

    startRound() {
        this.started = true;
        this._notifyEventListeners(RoundModel._EVENTS.ROUND_STARTED);
    }

    endRound(victoryAward) {
        this.started = false;
        this.running = false;

        this._notifyEventListeners(RoundModel._EVENTS.ROUND_ENDED, victoryAward);

        // Explicitly delete our references to stored objects
        // to hopefully induce an expedient GC
        // Do NOT cleanup the event listeners here, as CELEBRATION_STARTED and CELEBRATION_ENDED events happen AFTER!
        this.b2dWorld = null;
        this.tanks = {};
        this.projectiles = {};
        this.traps = {};
        this.collectibles = {};
        this.weapons = {};
        this.upgrades = {};
        this.counters = {};
        this.zones = {};
        this.collisionEvents = [];
        this.destroyedPlayerIds = [];
        this.destroyedProjectileIds = [];
        this.destroyedCollectibleIds = [];
        this.destroyedZoneIds = [];
        this.playerIdOtherWeaponIds = {};
        this.playerIdDefaultWeaponId = {};
        this.playerIdUpgradeIds = {};
        this.playerIdModifiers = {};
    }

    startCelebration() {
        this.maze = null;
        this._notifyEventListeners(RoundModel._EVENTS.CELEBRATION_STARTED);
    }

    endCelebration() {
        this._notifyEventListeners(RoundModel._EVENTS.CELEBRATION_ENDED);
    }

    getStarted() {
        return this.started;
    }

    setVictoryGoldAmount(victoryGoldAmount) {
        this.victoryGoldAmount = victoryGoldAmount;
    }

    getVictoryGoldAmount() {
        return this.victoryGoldAmount;
    }

    setStakes(stakes) {
        this.stakes = stakes;
    }

    getStake(playerId) {
        for (const stake of this.stakes) {
            if (stake.playerId === playerId) {
                return stake;
            }
        }

        return null;
    }

    getRankChanges(winnerPlayerIds) {
        if (!this.ranked) {
            return [];
        }

        const changes = {};
        const rankBeforeChanges = {};

        // Get the rank changes. If there are any winners, share the total stakes among them.
        // If there are no winners, only take the stakes of the punishable players.
        if (winnerPlayerIds.length > 0) {
            let totalStakes = 0;
            for (const stake of this.stakes) {
                changes[stake.playerId] = -stake.value;
                rankBeforeChanges[stake.playerId] = stake.rank;
                totalStakes += stake.value;
            }

            const stakesPerWinner = Math.ceil(totalStakes / winnerPlayerIds.length);

            for (const winnerPlayerId of winnerPlayerIds) {
                changes[winnerPlayerId] += stakesPerWinner;
            }
        } else {
            for (const stake of this.stakes) {
                for (const punishablePlayerId of this.punishablePlayerIds) {
                    if (stake.playerId === punishablePlayerId) {
                        changes[stake.playerId] = -stake.value;
                        rankBeforeChanges[stake.playerId] = stake.rank;

                        break;
                    }
                }
            }
        }
        // Convert from object to array.
        const changesArray = [];
        for (const playerId in changes) {
            changesArray.push({ playerId, rank: rankBeforeChanges[playerId], change: changes[playerId] });
        }

        return changesArray;
    }

    getModifier(playerId, modifierType) {
        const modifiers = this.playerIdModifiers[playerId];
        if (modifiers) {
            return modifiers[modifierType];
        } else {
            return Constants.MODIFIER_INFO[modifierType].DEFAULT;
        }
    }

    relayEvent(self, evt, data) {
        self._notifyEventListeners(evt, data);
    }

    _updateModifiers(playerId) {
        const newModifiers = {};

        for (const modifierType in Constants.MODIFIER_TYPES) {
            const modifier = Constants.MODIFIER_TYPES[modifierType];
            newModifiers[modifier] = Constants.MODIFIER_INFO[modifier].DEFAULT;
        }

        const upgradeIds = this.playerIdUpgradeIds[playerId];
        for (const upgradeId of upgradeIds) {
            const upgrade = this.upgrades[upgradeId];
            switch (upgrade.getType()) {
                case Constants.UPGRADE_TYPES.SPEED_BOOST:
                {
                    newModifiers[Constants.MODIFIER_TYPES.SPEED] += upgrade.getField("speedBoost");
                    break;
                }
            }
        }

        this.playerIdModifiers[playerId] = newModifiers;
    }

    getB2DWorld() {
        return this.b2dWorld;
    }
}
