import { Constants } from "./constants.js";
import { Zone } from "./zone.js";
import { B2DUtils } from "./b2dutils.js";

export class StormZone extends Zone {
    _expansionTime = 0;
    _expansionSequence = null;
    _tileBounds = null;
    _expansionSide = 0;
    _expansionTilesRight = 0;
    _expansionTilesBottom = 0;
    _expansionTilesLeft = 0;
    _expansionTilesTop = 0;

    constructor(zoneState, roundModel, eventHandler, eventContext) {
        super(roundModel, eventHandler, eventContext);
        this.setZoneState(zoneState);
    }

    update(deltaTime) {
        this._expansionTime -= deltaTime;

        if (this._expansionTime <= Constants.STORM_ZONE_START_GROW_TIME) {
            if (this._expansionSide < 0) {
                this._expansionSide = this._expansionSequence[this._expansionTilesRight + this._expansionTilesBottom + this._expansionTilesLeft + this._expansionTilesTop];

                switch (this._expansionSide) {
                    case 0:
                    {
                        this._expansionTilesRight += 1;
                        break;
                    }
                    case 1:
                    {
                        this._expansionTilesBottom += 1;
                        break;
                    }
                    case 2:
                    {
                        this._expansionTilesLeft += 1;
                        break;
                    }
                    case 3:
                    {
                        this._expansionTilesTop += 1;
                        break;
                    }
                }

                // Rebuild tiles.
                this._rebuildTiles();

                // Make sure that zone is marked as changed.
                this.roundModel.changeZone(this.id);
            }

            // Update body.
            const corners = this.getCorners();
            B2DUtils.updateStormZoneBody(this.b2dBody, this, corners.stormStartRight, corners.stormEndRight, corners.stormStartBottom, corners.stormEndBottom, corners.stormStartLeft, corners.stormEndLeft, corners.stormStartTop, corners.stormEndTop);
        }

        if (this._expansionTime <= 0.0) {
            this._expansionSide = -1;
            this._expansionTime = Constants.STORM_ZONE_EXPANSION_TIME;

            // Rebuild tiles.
            this._rebuildTiles();

            // Make sure that zone is marked as changed.
            this.roundModel.changeZone(this.id);
        }
    }

    getCorners() {
        const ratio = Math.max(0.0, Math.min(1.0, (Constants.STORM_ZONE_START_GROW_TIME - this._expansionTime) / Constants.STORM_ZONE_START_GROW_TIME));

        const stormStartRight = ((this._tileBounds.maxX + 1) - (this._expansionTilesRight - (this._expansionSide === 0 ? 1.0 - ratio : 0.0))) * Constants.MAZE_TILE_SIZE.m;
        const stormEndRight = ((this._tileBounds.maxX + 1) * Constants.MAZE_TILE_SIZE.m) + (Constants.MAZE_WALL_WIDTH.m / 2.0);
        const stormStartBottom = ((this._tileBounds.maxY + 1) - (this._expansionTilesBottom - (this._expansionSide === 1 ? 1.0 - ratio : 0.0))) * Constants.MAZE_TILE_SIZE.m;
        const stormEndBottom = ((this._tileBounds.maxY + 1) * Constants.MAZE_TILE_SIZE.m) + (Constants.MAZE_WALL_WIDTH.m / 2.0);
        const stormStartLeft = (this._tileBounds.minX * Constants.MAZE_TILE_SIZE.m) - (Constants.MAZE_WALL_WIDTH.m / 2.0);
        const stormEndLeft = (this._tileBounds.minX + this._expansionTilesLeft - (this._expansionSide === 2 ? 1.0 - ratio : 0.0)) * Constants.MAZE_TILE_SIZE.m;
        const stormStartTop = (this._tileBounds.minY * Constants.MAZE_TILE_SIZE.m) - (Constants.MAZE_WALL_WIDTH.m / 2.0);
        const stormEndTop = (this._tileBounds.minY + this._expansionTilesTop - (this._expansionSide === 3 ? 1.0 - ratio : 0.0)) * Constants.MAZE_TILE_SIZE.m;

        return {
            stormStartRight,
            stormEndRight,
            stormStartBottom,
            stormEndBottom,
            stormStartLeft,
            stormEndLeft,
            stormStartTop,
            stormEndTop
        };
    }

    done() {
        return false;
    }

    isPhysical() {
        return false;
    }

    _rebuildTiles() {
        let tilesRight = this._expansionTilesRight;
        let tilesBottom = this._expansionTilesBottom;
        let tilesLeft = this._expansionTilesLeft;
        let tilesTop = this._expansionTilesTop;
        // If not currently expanding, include the next expansion side in the current tiles. This avoids respawning tanks being swallowed by the storm.
        if (this._expansionSide < 0) {
            const nextExpansionSide = this._expansionSequence[this._expansionTilesRight + this._expansionTilesBottom + this._expansionTilesLeft + this._expansionTilesTop];
            switch (nextExpansionSide) {
                case 0:
                {
                    tilesRight += 1;
                    break;
                }
                case 1:
                {
                    tilesBottom += 1;
                    break;
                }
                case 2:
                {
                    tilesLeft += 1;
                    break;
                }
                case 3:
                {
                    tilesTop += 1;
                    break;
                }
            }
        }

        const maze = this.roundModel.getMaze();
        this.tiles = [];
        for (let i = this._tileBounds.minX; i <= this._tileBounds.maxX; ++i) {
            for (let j = this._tileBounds.minY; j <= this._tileBounds.maxY; ++j) {
                if (i < this._tileBounds.minX + tilesLeft || i > this._tileBounds.maxX - tilesRight || j < this._tileBounds.minY + tilesTop || j > this._tileBounds.maxY - tilesBottom) {
                    const position = { x: i, y: j };
                    if (maze) {
                        if (maze.isPositionInsideMaze(position)) {
                            this.tiles[this.tiles.length] = position;
                        }
                    }
                }
            }
        }
    }

    static createInitialZoneState(id, expansionSequence, tileBounds) {
        const fields = {
            _expansionTime: 0,
            _expansionSequence: expansionSequence,
            _tileBounds: tileBounds,
            _expansionSide: 0,
            _expansionTilesRight: 0,
            _expansionTilesBottom: 0,
            _expansionTilesLeft: 0,
            _expansionTilesTop: 0
        };

        return Zone.createInitialZoneState(id, Constants.ZONE_TYPES.STORM, [], JSON.stringify(fields));
    }
}
