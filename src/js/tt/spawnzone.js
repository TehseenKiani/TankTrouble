import { Constants } from "./constants.js";
import { Zone } from "./zone.js";
import { B2DUtils } from "./b2dutils.js";

export class SpawnZone extends Zone {
    _lifetime = 0;
    _radius = 0;
    _unstable = false;

    constructor(zoneState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setZoneState(zoneState);
    }

    update(deltaTime) {
        this._lifetime -= deltaTime;

        if (this._lifetime <= Constants.SPAWN_ZONE_START_GROW_TIME) {
            const ratio = Math.min(1.0, (Constants.SPAWN_ZONE_START_GROW_TIME - this._lifetime) / (Constants.SPAWN_ZONE_START_GROW_TIME - Constants.SPAWN_ZONE_END_GROW_TIME));
            this._radius = Constants.SPAWN_ZONE_START_RADIUS + (ratio * (Constants.SPAWN_ZONE_END_RADIUS - Constants.SPAWN_ZONE_START_RADIUS));

            B2DUtils.updateSpawnZoneBody(this.b2dBody, this, this._radius);
        }
        if (this._lifetime <= Constants.SPAWN_ZONE_END_GROW_TIME) {
            if (!this._unstable) {
                this._unstable = true;

                this._emitEvent(Zone._EVENTS.ZONE_DESTABILISED, this.id);
            }
        }
    }

    done() {
        return this._lifetime <= 0;
    }

    isPhysical() {
        return false;
    }

    static createInitialZoneState(id, tiles, lifetime, radius) {
        const fields = {
            _lifetime: lifetime,
            _radius: radius,
            _unstable: false
        };

        return Zone.createInitialZoneState(id, Constants.ZONE_TYPES.SPAWN, tiles, JSON.stringify(fields));
    }
}
