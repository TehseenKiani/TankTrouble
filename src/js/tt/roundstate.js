import { TankState } from "./tankstate.js";
import { ProjectileState } from "./projectilestate.js";
import { TrapState } from "./trapstate.js";
import { CollectibleState } from "./collectiblestate.js";
import { WeaponState } from "./weaponstate.js";
import { UpgradeState } from "./upgradestate.js";
import { CounterState } from "./counterstate.js";
import { ZoneState } from "./zonestate.js";

export class RoundState {
    data = {
        tankStates: [],
        projectileStates: [],
        trapStates: [],
        collectibleStates: [],
        weaponStates: [],
        upgradeStates: [],
        counterStates: [],
        zoneStates: []
    };

    cachedTankStates = null;
    cachedProjectileStates = null;
    cachedTrapStates = null;
    cachedCollectibleStates = null;
    cachedWeaponStates = null;
    cachedUpgradeStates = null;
    cachedCounterStates = null;
    cachedZoneStates = null;

    static withState(tankStates, projectileStates, trapStates, collectibleStates, weaponStates, upgradeStates, counterStates, zoneStates) {
        const instance = new this();
        instance.data.tankStates = tankStates;
        instance.data.projectileStates = projectileStates;
        instance.data.trapStates = trapStates;
        instance.data.collectibleStates = collectibleStates;
        instance.data.weaponStates = weaponStates;
        instance.data.upgradeStates = upgradeStates;
        instance.data.counterStates = counterStates;
        instance.data.zoneStates = zoneStates;
        return instance;
    }

    static withObject(object) {
        const instance = new this();
        instance.data = object;
        return instance;
    }

    getTankStates() {
        if (this.cachedTankStates) {
            return this.cachedTankStates;
        }

        const tankStates = this.data.tankStates.map(tankStateObject => TankState.withObject(tankStateObject));

        this.cachedTankStates = tankStates;

        return tankStates;
    }

    setTankStates(tankStates) {
        this.cachedTankStates = tankStates;

        this.data.tankStates = tankStates.map(tankState => tankState.toObject());
    }

    getProjectileStates() {
        if (this.cachedProjectileStates) {
            return this.cachedProjectileStates;
        }

        const projectileStates = this.data.projectileStates.map(projectileStateObject => ProjectileState.withObject(projectileStateObject));

        this.projectileStates = projectileStates;

        return projectileStates;
    }

    setProjectileStates(projectileStates) {
        this.cachedProjectileStates = projectileStates;

        this.data.projectileStates = projectileStates.map(projectileState => projectileState.toObject());
    }

    getTrapStates() {
        if (this.cachedTrapStates) {
            return this.cachedTrapStates;
        }

        const trapStates = this.data.trapStates.map(trapStateObject => TrapState.withObject(trapStateObject));

        this.trapStates = trapStates;

        return trapStates;
    }

    setTrapStates(trapStates) {
        this.cachedTrapStates = trapStates;

        this.data.trapStates = trapStates.map(trapState => trapState.toObject());
    }

    getCollectibleStates() {
        if (this.cachedCollectibleStates) {
            return this.cachedCollectibleStates;
        }

        const collectibleStates = this.data.collectibleStates.map(collectibleStateObject => CollectibleState.withObject(collectibleStateObject));

        this.cachedCollectibleStates = collectibleStates;

        return collectibleStates;
    }

    setCollectibleStates(collectibleStates) {
        this.cachedCollectibleStates = collectibleStates;

        this.data.collectibleStates = collectibleStates.map(collectibleState => collectibleState.toObject());
    }

    getWeaponStates() {
        if (this.cachedWeaponStates) {
            return this.cachedWeaponStates;
        }

        const weaponStates = this.data.weaponStates.map(weaponStateObject => WeaponState.withObject(weaponStateObject));

        this.cachedWeaponStates = weaponStates;

        return weaponStates;
    }

    setWeaponStates(weaponStates) {
        this.cachedWeaponStates = weaponStates;

        this.data.weaponStates = weaponStates.map(weaponState => weaponState.toObject());
    }

    getUpgradeStates() {
        if (this.cachedUpgradeStates) {
            return this.cachedUpgradeStates;
        }

        const upgradeStates = this.data.upgradeStates.map(upgradeStateObject => UpgradeState.withObject(upgradeStateObject));

        this.cachedUpgradeStates = upgradeStates;

        return upgradeStates;
    }

    setUpgradeStates(upgradeStates) {
        this.cachedUpgradeStates = upgradeStates;

        this.data.upgradeStates = upgradeStates.map(upgradeState => upgradeState.toObject());
    }

    getCounterStates() {
        if (this.cachedCounterStates) {
            return this.cachedCounterStates;
        }

        const counterStates = this.data.counterStates.map(counterStateObject => CounterState.withObject(counterStateObject));

        this.cachedCounterStates = counterStates;

        return counterStates;
    }

    setCounterStates(counterStates) {
        this.cachedCounterStates = counterStates;

        this.data.counterStates = counterStates.map(counterState => counterState.toObject());
    }

    getZoneStates() {
        if (this.cachedZoneStates) {
            return this.cachedZoneStates;
        }

        const zoneStates = this.data.zoneStates.map(zoneStateObject => ZoneState.withObject(zoneStateObject));

        this.cachedZoneStates = zoneStates;

        return zoneStates;
    }

    setZoneStates(zoneStates) {
        this.cachedZoneStates = zoneStates;

        this.data.zoneStates = zoneStates.map(zoneState => zoneState.toObject());
    }

    isExpanded() {
        return this.data.trapStates.length > 0 || this.data.weaponStates.length > 0 || this.data.upgradeStates.length > 0 || this.data.counterStates.length > 0 || this.data.zoneStates.length > 0;
    }

    deltaFrom(previousRoundState) {
        const delta = {};
        for (const statesName in this.data) {
            delta[statesName] = this.data[statesName].map((stateObject, index) => {
                const previousStateObject = previousRoundState.data[statesName][index] || {};
                const changedStateObject = {};
                for (const key in stateObject) {
                    if (Array.isArray(stateObject[key]) || stateObject[key] !== previousStateObject[key]) {
                        changedStateObject[key] = stateObject[key];
                    }
                }
                return changedStateObject;
            });
        }

        return RoundState.withObject(delta);
    }

    applyDelta(deltaRoundState) {
        const merged = {};
        for (const statesName in deltaRoundState.data) {
            merged[statesName] = deltaRoundState.data[statesName].map((changedStateObject, index) => ({ ...this.data[statesName][index], ...changedStateObject }));
        }

        return RoundState.withObject(merged);
    }

    toObject() {
        return this.data;
    }
}
