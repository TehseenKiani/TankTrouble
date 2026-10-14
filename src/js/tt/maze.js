import { ArrayUtils } from "./arrayutils.js";
import { MathUtils } from "./mathutils.js";
import { Constants } from "./constants.js";
import { MazeThemeManager } from "./mazethememanager.js";
import { Log } from "./log.js";
import createGraph from "ngraph.graph";
import { aStar } from "ngraph.path";

/*
 * Datastructures:
 *
 * Walls:
 *      0: Right wall,
 *      1: Down wall,
 *      2: Left wall,
 *      3: Up wall
 *
 * Tiles:
 *      0: Floor present,
 *      1: Top wall present,
 *      2: Left wall present
 *
 * Wall configurations:
 *      1: Top wall,
 *      2: Left wall,
 *      4: Bottom wall,
 *      8: Right wall
 *
 * Borders:
 *      x,
 *      y,
 *      number,
 *      orientation, (-1, 0, 1, 2 indicating multiples of Math.PI / 2)
 *      flip
 * Floors:
 *      x,
 *      y,
 *      number,
 *      orientation, (0, 1, 2, 3 indicating multiples of Math.PI / 2)
 * Spaces:
 *      x,
 *      y,
 *      number,
 *      orientation, (0, 1, 2, 3 indicating multiples of Math.PI / 2)
 * Walls:
 *      x,
 *      y,
 *      number,
 *      rotate, (false, true)
 *      flipX,
 *      flipY
 * Wall decorations:
 *      x,
 *      y,
 *      number,
 *      orientation, (0, 1, 2, 3 indicating multiples of Math.PI / 2)
 */
export class Maze {
    static log = new Log("Maze");

    data = {
        theme: 0,
        tiles: [],
        borders: [],
        floors: [],
        spaces: [],
        walls: [],
        wallDecorations: []
    };

    width = 0;
    height = 0;
    graph = null;
    vertices = [];
    tankPositions = [];
    crateSpawnPositions = [];
    tankSpawnPositions = [];
    reachable = [];
    tileToReachableIndex = [];
    tilePresentToTileIndex = [];
    tileBounds = null;
    distances = [];
    deadEndPenalties = [];

    static withObject(object) {
        const instance = new this();
        instance.data = object;
        instance.width = instance.data.tiles.length;
        instance.height = instance.data.tiles[0].length;

        // Find a position to calculate reachable from.
        for (let i = 0; i < instance.width; ++i) {
            for (let j = 0; j < instance.height; ++j) {
                const tilePresent = instance.data.tiles[i][j][0] === 1;
                if (tilePresent) {
                    instance._calculateReachable({ x: i, y: j }, instance.width, instance.height);

                    break;
                }
            }
        }

        instance._calculateTileBounds();
        instance._calculateDistances();
        instance._calculateDeadEndPenalties();

        instance._createGraph();
        return instance;
    }

    static createRandom(width, height, playerIds, theme) {
        const instance = new this();

        instance.width = width;
        instance.height = height;

        const wallProbability = Constants.MAZE.WALL_PROBABILITIES[Math.floor(Math.random() * Constants.MAZE.WALL_PROBABILITIES.length)];
        const tileProbability = Constants.MAZE.TILE_PROBABILITIES[Math.floor(Math.random() * Constants.MAZE.TILE_PROBABILITIES.length)];

        // Keep creating a new maze until successful.
        while (true) {
            instance.tankPositions = [];

            instance.data.tiles = instance._createRandomMaze(instance.width, instance.height, wallProbability, tileProbability);

            // Place first tank.
            // Ensure that tank is placed in a tile that is present.
            instance._calculateTilePresentToTileIndex(instance.width, instance.height);

            // Guard against the case where no tiles are present.
            if (instance.tilePresentToTileIndex.length === 0) {
                continue;
            }

            const presentTile = instance.tilePresentToTileIndex[Math.floor(Math.random() * instance.tilePresentToTileIndex.length)];
            instance.tankPositions.push({ x: presentTile.x, y: presentTile.y, rotation: Math.random() * 2.0 * Math.PI, playerId: playerIds[0] });

            // Compute reachable tiles.
            instance._calculateReachable(instance.tankPositions[0], instance.width, instance.height);

            // Ensure that reachable tiles make up a fitting percentage of available tiles.
            let failedToReachEnoughTiles = false;
            while (instance.reachable.length < Constants.MAZE_MINIMUM_REACHABLE_RATIO * instance.tilePresentToTileIndex.length) {
                //console.log("Reachable too small: " + instance.reachable.length + " / " + Constants.MAZE_MINIMUM_REACHABLE_RATIO * instance.tilePresentToTileIndex.length);

                if (!instance._expandReachable(instance.tankPositions[0], instance.width, instance.height)) {
                    if (!instance._expandUnreachable(instance.tankPositions[0], instance.width, instance.height)) {
                        failedToReachEnoughTiles = true;
                        break;
                    }
                }
            }

            // Failed to expand reachable tiles to fitting percentage.
            if (failedToReachEnoughTiles) {
                Maze.log.error(`Failed to create random maze ${width} X ${height} with probabilities ${wallProbability} and ${tileProbability}`);
                continue;
            }

            // Mark neighbouring tiles as used.
            instance._markTilesAsUsed(instance.tankPositions[0], Constants.MAZE_MINIMUM_TILES_BETWEEN_TANKS);

            // Get available tiles.
            let available = instance._getUnusedTiles();

            // Place remaining tanks.
            let failedToPlaceRemainingTanks = false;
            for (let i = 1; i < playerIds.length; ++i) {
                if (available.length === 0) {
                    failedToPlaceRemainingTanks = true;
                    break;
                }

                const newPosition = Math.floor(Math.random() * available.length);
                instance.tankPositions.push({ x: available[newPosition].x, y: available[newPosition].y, rotation: Math.random() * 2.0 * Math.PI, playerId: playerIds[i] });

                // Mark neighbouring tiles as used.
                instance._markTilesAsUsed(instance.tankPositions[i], Constants.MAZE_MINIMUM_TILES_BETWEEN_TANKS);

                available = instance._getUnusedTiles();
            }

            // Failed to place remaining tanks.
            if (failedToPlaceRemainingTanks) {
                continue;
            }

            // Success!
            break;
        }

        // Centre on tile and convert to physical units.
        for (const position of instance.tankPositions) {
            position.x += 0.5;
            position.y += 0.5;
            position.x *= Constants.MAZE_TILE_SIZE.m;
            position.y *= Constants.MAZE_TILE_SIZE.m;
        }

        // Store theme.
        instance.data.theme = theme;

        // Compute borders, floors, spaces, walls and decorations based on theme.
        instance._calculateBorderFloorsSpacesWallsAndDecorations();

        // Compute bounds where there are tiles present.
        instance._calculateTileBounds();

        // Compute distances from all tiles to all other tiles.
        instance._calculateDistances();

        // Compute dead end penalties.
        instance._calculateDeadEndPenalties();

        // Create graph representation.
        instance._createGraph();

        return instance;
    }

    static createSymmetric(width, height, playerIds, theme) {
        const instance = new this();
        instance.width = width;
        instance.height = height;

        const wallProbability = Math.sqrt(Constants.MAZE.WALL_PROBABILITIES[Math.floor(Math.random() * Constants.MAZE.WALL_PROBABILITIES.length)]);
        const tileProbability = Math.sqrt(Constants.MAZE.TILE_PROBABILITIES[Math.floor(Math.random() * Constants.MAZE.TILE_PROBABILITIES.length)]);

        const blockWidth = Math.floor(instance.width / 2);
        const blockHeight = Math.floor(instance.height / 2);

        // Keep creating a new maze until successful.
        while (true) {
            instance.tankPositions = [];

            // Start by creating a random maze representing the block of one player.
            instance.data.tiles = instance._createRandomMaze(blockWidth, blockHeight, wallProbability, tileProbability);

            // Place first tank.
            // Ensure that tank is placed in a tile that is present.
            instance._calculateTilePresentToTileIndex(blockWidth, blockHeight);

            // Guard against the case where no tiles are present.
            if (instance.tilePresentToTileIndex.length === 0) {
                continue;
            }

            const [presentTile] = instance.tilePresentToTileIndex;
            instance.tankPositions.push({ x: presentTile.x, y: presentTile.y, rotation: Math.random() * 2.0 * Math.PI, playerId: playerIds[0] });

            // Compute reachable tiles.
            instance._calculateReachable(instance.tankPositions[0], blockWidth, blockHeight);

            // Ensure that all tiles are reachable.
            let failedToReachEnoughTiles = false;
            while (instance.reachable.length < Constants.MAZE_MINIMUM_REACHABLE_RATIO * instance.tilePresentToTileIndex.length) {
                //console.log("Reachable too small: " + instance.reachable.length + " / " + instance.tilePresentToTileIndex.length);

                if (!instance._expandReachable(instance.tankPositions[0], blockWidth, blockHeight)) {
                    if (!instance._expandUnreachable(instance.tankPositions[0], blockWidth, blockHeight)) {
                        failedToReachEnoughTiles = true;
                        break;
                    }
                }
            }

            // Failed to expand reachable tiles to all present.
            if (failedToReachEnoughTiles) {
                Maze.log.error(`Failed to create symmetric maze ${width} X ${height} with probabilities ${wallProbability} and ${tileProbability}`);
                continue;
            }

            // Ensure that at least one of the right-most tiles is present - this is enough as all tiles are reachable.
            let openToTheRight = false;
            for (let j = 0; j < blockHeight; ++j) {
                if (instance.data.tiles[blockWidth - 1][j][0] === 1) {
                    openToTheRight = true;
                    break;
                }
            }

            // Ensure that at least one of the bottom-most tiles is present - this is enough as all tiles are reachable.
            let openToTheBottom = false;
            for (let i = 0; i < blockWidth; ++i) {
                if (instance.data.tiles[i][blockHeight - 1][0] === 1) {
                    openToTheBottom = true;
                    break;
                }
            }

            if (!openToTheRight || !openToTheBottom) {
                continue;
            }

            // We now have a block which can be used for a symmetric, connected maze - with space in the middle for weapon spawns.
            instance.data.tiles = instance._createSymmetricMaze(instance.data.tiles, blockWidth, blockHeight, instance.width, instance.height, wallProbability);

            // Place remaining tanks.
            for (let i = 1; i < playerIds.length; ++i) {
                const newPosition = { x: instance.tankPositions[0].x, y: instance.tankPositions[0].y, rotation: instance.tankPositions[0].rotation, playerId: playerIds[i] };
                if (i >= 1 && i <= 2) {
                    newPosition.x = instance.width - 1 - newPosition.x;
                    newPosition.rotation = -newPosition.rotation;
                }
                if (i % 2) {
                    newPosition.y = instance.height - 1 - newPosition.y;
                    newPosition.rotation = Math.PI - newPosition.rotation;
                }
                instance.tankPositions.push(newPosition);
            }

            // Success!
            break;
        }

        // Update reachable to the final symmetric maze.
        instance._calculateReachable(instance.tankPositions[0], instance.width, instance.height);

        // Create crate spawn positions.
        if (instance.tileToReachableIndex[blockWidth][blockHeight] !== undefined) {
            instance.crateSpawnPositions.push({ x: blockWidth, y: blockHeight });
        }
        const widthEven = instance.width % 2 === 0;
        const heightEven = instance.height % 2 === 0;
        // If width or height is even, place more crate spawn positions.
        if (widthEven || heightEven) {
            if (widthEven) {
                if (instance.tileToReachableIndex[width - 1 - blockWidth][blockHeight] !== undefined) {
                    instance.crateSpawnPositions.push({ x: width - 1 - blockWidth, y: blockHeight });
                }
            }
            if (heightEven) {
                if (instance.tileToReachableIndex[blockWidth][height - 1 - blockHeight] !== undefined) {
                    instance.crateSpawnPositions.push({ x: blockWidth, y: height - 1 - blockHeight });
                }
            }
            if (widthEven && heightEven) {
                if (instance.tileToReachableIndex[width - 1 - blockWidth][height - 1 - blockHeight] !== undefined) {
                    instance.crateSpawnPositions.push({ x: width - 1 - blockWidth, y: height - 1 - blockHeight });
                }
            }
        } else {
            // FIXME Place crate spawn positions in star?
        }

        // Create tank spawn positions from first tank position.
        const [tankPosition] = instance.tankPositions;
        instance.tankSpawnPositions.push({ x: tankPosition.x, y: tankPosition.y }, { x: width - 1 - tankPosition.x, y: tankPosition.y }, { x: tankPosition.x, y: height - 1 - tankPosition.y }, { x: width - 1 - tankPosition.x, y: height - 1 - tankPosition.y });

        // Centre on tile and convert to physical units.
        for (const position of instance.tankPositions) {
            position.x += 0.5;
            position.y += 0.5;
            position.x *= Constants.MAZE_TILE_SIZE.m;
            position.y *= Constants.MAZE_TILE_SIZE.m;
        }

        // Shuffle tank position player ids.
        for (let i = 0; i < instance.tankPositions.length - 1; ++i) {
            const swap = instance.tankPositions[i].playerId;
            const otherIndex = Math.floor(MathUtils.randomRange(i, instance.tankPositions.length));
            instance.tankPositions[i].playerId = instance.tankPositions[otherIndex].playerId;
            instance.tankPositions[otherIndex].playerId = swap;
        }

        // Store theme.
        instance.data.theme = theme;

        // Compute borders, floors, spaces, walls and decorations based on theme.
        instance._calculateBorderFloorsSpacesWallsAndDecorations();

        // Compute bounds where there are tiles present.
        instance._calculateTileBounds();

        // Compute distances from all tiles to all other tiles.
        instance._calculateDistances();

        // Compute dead end penalties.
        instance._calculateDeadEndPenalties();

        // Create graph representation.
        instance._createGraph();

        return instance;
    }

    toObject() {
        return this.data;
    }

    _createRandomMaze(width, height, wallProbability, tileProbability) {
        const walls = Array.from({ length: width + 1 }, () => Array.from({ length: height + 1 }, () => Math.random() > wallProbability ? 4 : Math.floor(Math.random() * 4)));
        const tiles = Array.from({ length: width }, () => Array.from({ length: height }, () => [Math.random() > tileProbability ? 0 : 1, 0, 0]));

        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {
                const tilePresent = tiles[i][j][0] === 1;
                let topWall = false;
                let leftWall = false;
                if (tilePresent) {
                    topWall = walls[i][j] === 0 || (i + 1 < walls.length && walls[i + 1][j] === 2) || j === 0 || (j > 0 && tiles[i][j - 1][0] === 0);
                    leftWall = walls[i][j] === 1 || (j + 1 < walls[i].length && walls[i][j + 1] === 3) || i === 0 || (i > 0 && tiles[i - 1][j][0] === 0);
                } else {
                    topWall = j > 0 && tiles[i][j - 1][0] === 1;
                    leftWall = i > 0 && tiles[i - 1][j][0] === 1;
                }
                tiles[i][j][1] = topWall ? 1 : 0;
                tiles[i][j][2] = leftWall ? 1 : 0;
            }
        }

        return tiles;
    }

    _createSymmetricMaze(blockTiles, blockWidth, blockHeight, width, height, wallProbability) {
        const addVerticalConnector = width % 2;
        const addHorizontalConnector = height % 2;

        const tiles = Array.from({ length: width }, () => new Array(height));

        // Copy in upper-left block.
        for (let i = 0; i < blockWidth; ++i) {
            for (let j = 0; j < blockHeight; ++j) {
                tiles[i][j] = blockTiles[i][j];
            }
        }

        // Create lower-left block.
        for (let i = 0; i < blockWidth; ++i) {
            for (let j = 0; j < blockHeight - 1; ++j) {
                tiles[i][height - 1 - j] = [blockTiles[i][j][0], blockTiles[i][j + 1][1], blockTiles[i][j][2]];
            }
        }
        for (let i = 0; i < blockWidth; ++i) {
            tiles[i][height - blockHeight] = [blockTiles[i][blockHeight - 1][0], 0, blockTiles[i][blockHeight - 1][2]];
        }

        // Connect the two blocks: upper-left and lower-left.
        // First find possible connections.
        let potentialConnections = [];
        for (let i = 0; i < blockWidth; ++i) {
            if (tiles[i][blockHeight - 1][0] === 1) {
                potentialConnections.push(i);
            }
        }

        // Always close off first connection if possible.
        // Let the other ones be closed off randomly in next step.
        if (potentialConnections.length >= 2) {
            tiles[potentialConnections[0]][height - blockHeight][1] = 1;
            potentialConnections.shift();
        }

        // Close off a random amount except at least one.
        ArrayUtils.shuffle(potentialConnections);
        let amountToCloseOff = Math.floor(Math.random() * potentialConnections.length);
        for (let i = 0; i < amountToCloseOff; ++i) {
            tiles[potentialConnections[i]][height - blockHeight][1] = 1;
        }

        // Stitch blocks together with connector.
        if (addHorizontalConnector) {
            for (let i = 0; i < blockWidth; ++i) {
                const verticalNeighbourTilesPresent = tiles[i][height - blockHeight][0] === 1;
                const neighbourTopWallPresent = tiles[i][height - blockHeight][1] === 1;
                const placeTile = verticalNeighbourTilesPresent && !neighbourTopWallPresent;
                const firstConnectorTile = i === 0 && placeTile;
                const oppositeOfPreviousConnectorTile = i > 0 && ((tiles[i - 1][blockHeight][0] === 0 && placeTile) || (tiles[i - 1][blockHeight][0] === 1 && !placeTile));
                const placeRandomWall = placeTile && Math.random() <= wallProbability;
                tiles[i][blockHeight] = [placeTile ? 1 : 0, verticalNeighbourTilesPresent && neighbourTopWallPresent ? 1 : 0, firstConnectorTile || oppositeOfPreviousConnectorTile || placeRandomWall ? 1 : 0];
            }
        }

        // Create right block.
        for (let i = 0; i < blockWidth - 1; ++i) {
            for (let j = 0; j < height; ++j) {
                tiles[width - 1 - i][j] = [tiles[i][j][0], tiles[i][j][1], tiles[i + 1][j][2]];
            }
        }
        for (let j = 0; j < height; ++j) {
            tiles[width - blockWidth][j] = [tiles[blockWidth - 1][j][0], tiles[blockWidth - 1][j][1], 0];
        }

        // Connect the two blocks: left and right.
        // First find possible connections.
        potentialConnections = [];
        // If horizontal connector was added, also potentially cut that off.
        for (let j = 0; j < blockHeight + (addHorizontalConnector ? 1 : 0); ++j) {
            if (tiles[blockWidth - 1][j][0] === 1) {
                potentialConnections.push(j);
            }
        }

        // Always close off first connection if possible.
        // Let the other ones be closed off randomly in next step.
        if (potentialConnections.length >= 2) {
            tiles[width - blockWidth][potentialConnections[0]][2] = 1;
            tiles[width - blockWidth][height - 1 - potentialConnections[0]][2] = 1;
            potentialConnections.shift();
        }

        // Close off a random amount except at least one.
        ArrayUtils.shuffle(potentialConnections);
        amountToCloseOff = Math.floor(Math.random() * potentialConnections.length);
        for (let i = 0; i < amountToCloseOff; ++i) {
            tiles[width - blockWidth][potentialConnections[i]][2] = 1;
            tiles[width - blockWidth][height - 1 - potentialConnections[i]][2] = 1;
        }

        // Stitch blocks together with connector.
        if (addVerticalConnector) {
            for (let j = 0; j < height; ++j) {
                const horizontalNeighbourTilesPresent = tiles[width - blockWidth][j][0] === 1;
                const neighbourLeftWallPresent = tiles[width - blockWidth][j][2] === 1;
                const placeTile = horizontalNeighbourTilesPresent && !neighbourLeftWallPresent;
                const firstConnectorTile = j === 0 && placeTile;
                const oppositeOfPreviousConnectorTile = j > 0 && ((tiles[blockWidth][j - 1][0] === 0 && placeTile) || (tiles[blockWidth][j - 1][0] === 1 && !placeTile));
                tiles[blockWidth][j] = [placeTile ? 1 : 0, firstConnectorTile || oppositeOfPreviousConnectorTile ? 1 : 0, horizontalNeighbourTilesPresent && neighbourLeftWallPresent ? 1 : 0];
            }
            // Add random horizontal walls - need to do this as separate loop as symmetrical tiles have not been created yet in first loop.
            for (let j = 1; j <= blockHeight; ++j) {
                const horizontalNeighbourTilesPresent = tiles[width - blockWidth][j][0] === 1;
                const neighbourLeftWallPresent = tiles[width - blockWidth][j][2] === 1;
                const placeTile = horizontalNeighbourTilesPresent && !neighbourLeftWallPresent;
                const placeRandomWall = placeTile && Math.random() <= wallProbability;
                tiles[blockWidth][j][1] = tiles[blockWidth][j][1] === 1 || placeRandomWall ? 1 : 0;
                tiles[blockWidth][height - j][1] = tiles[blockWidth][height - j][1] === 1 || placeRandomWall ? 1 : 0;
            }
        }

        return tiles;
    }

    _createGraph() {
        this.graph = createGraph();

        this.vertices = Array.from({ length: this.width }, () => new Array(this.height));

        // Create vertex for each tile present.
        for (let i = 0; i < this.width; ++i) {
            for (let j = 0; j < this.height; ++j) {
                if (this.data.tiles[i][j][0] === 1) {
                    this.vertices[i][j] = (i * this.height) + j;
                    this.graph.addNode(this.vertices[i][j], { x: i, y: j });
                }
            }
        }

        // Create edge pairs between neighbouring tiles.
        this.graph.forEachNode(v => {
            const current = v.data;

            // Check if we can move left.
            if (current.x > 0 && this.data.tiles[current.x][current.y][2] === 0) {
                this.graph.addLink(v.id, this.vertices[current.x - 1][current.y], { x: current.x - 1, y: current.y, length: 1 });
            }

            // Check if we can move right.
            if (current.x < this.width - 1 && this.data.tiles[current.x + 1][current.y][2] === 0) {
                this.graph.addLink(v.id, this.vertices[current.x + 1][current.y], { x: current.x + 1, y: current.y, length: 1 });
            }

            // Check if we can move down.
            if (current.y < this.height - 1 && this.data.tiles[current.x][current.y + 1][1] === 0) {
                this.graph.addLink(v.id, this.vertices[current.x][current.y + 1], { x: current.x, y: current.y + 1, length: 1 });
            }

            // Check if we can move up.
            if (current.y > 0 && this.data.tiles[current.x][current.y][1] === 0) {
                this.graph.addLink(v.id, this.vertices[current.x][current.y - 1], { x: current.x, y: current.y - 1, length: 1 });
            }

            // Check if we can move left-down.
            if (current.x > 0 && current.y < this.height - 1 && this.data.tiles[current.x][current.y][2] === 0 && this.data.tiles[current.x][current.y + 1][2] === 0 && this.data.tiles[current.x][current.y + 1][1] === 0 && this.data.tiles[current.x - 1][current.y + 1][1] === 0) {
                this.graph.addLink(v.id, this.vertices[current.x - 1][current.y + 1], { x: current.x - 1, y: current.y + 1, length: Math.SQRT2 });
            }

            // Check if we can move right-down.
            if (current.x < this.width - 1 && current.y < this.height - 1 && this.data.tiles[current.x + 1][current.y][2] === 0 && this.data.tiles[current.x + 1][current.y + 1][2] === 0 && this.data.tiles[current.x][current.y + 1][1] === 0 && this.data.tiles[current.x + 1][current.y + 1][1] === 0) {
                this.graph.addLink(v.id, this.vertices[current.x + 1][current.y + 1], { x: current.x + 1, y: current.y + 1, length: Math.SQRT2 });
            }

            // Check if we can move left-up.
            if (current.x > 0 && current.y > 0 && this.data.tiles[current.x][current.y][2] === 0 && this.data.tiles[current.x][current.y - 1][2] === 0 && this.data.tiles[current.x][current.y][1] === 0 && this.data.tiles[current.x - 1][current.y][1] === 0) {
                this.graph.addLink(v.id, this.vertices[current.x - 1][current.y - 1], { x: current.x - 1, y: current.y - 1, length: Math.SQRT2 });
            }

            // Check if we can move right-up.
            if (current.x < this.width - 1 && current.y > 0 && this.data.tiles[current.x + 1][current.y][2] === 0 && this.data.tiles[current.x + 1][current.y - 1][2] === 0 && this.data.tiles[current.x][current.y][1] === 0 && this.data.tiles[current.x + 1][current.y][1] === 0) {
                this.graph.addLink(v.id, this.vertices[current.x + 1][current.y - 1], { x: current.x + 1, y: current.y - 1, length: Math.SQRT2 });
            }
        });
    }

    _calculateTilePresentToTileIndex(width, height) {
        this.tilePresentToTileIndex = [];
        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {
                const tilePresent = this.data.tiles[i][j][0] === 1;
                if (tilePresent) {
                    this.tilePresentToTileIndex.push({ x: i, y: j });
                }
            }
        }
    }

    _calculateReachable(tankPosition, width, height) {
        this.tileToReachableIndex = Array.from({ length: width }, () => new Array(height));

        this.reachable = [];

        this._traverseCloseTiles(tankPosition, Number.MAX_VALUE, width, height, current => {
            this.tileToReachableIndex[current.x][current.y] = this.reachable.length;
            this.reachable.push({ x: current.x, y: current.y, used: false });
        });
    }

    _expandReachable(tankPosition, width, height) {
        let foundExpansion = false;

        //console.log("Try to expand reachable");

        // Shuffle indexes to randomise reachable walkthrough.
        const reachableIndex = [...this.reachable.keys()];
        ArrayUtils.shuffle(reachableIndex);

        // Walk through the reachable tiles and attempt to find a neighbouring unreachable tile, which we can punch a hole to.
        for (let i = 0; i < this.reachable.length; ++i) {
            const current = this.reachable[reachableIndex[i]];

            // Check left.
            if (current.x > 0 && this.data.tiles[current.x - 1][current.y][0] === 1 && this.tileToReachableIndex[current.x - 1][current.y] === undefined) {
                this.data.tiles[current.x][current.y][2] = 0;
                //console.log("Found expansion to the left of: " + current.x + ", " + current.y);
                foundExpansion = true;
                break;
            }

            // Check right.
            if (current.x < width - 1 && this.data.tiles[current.x + 1][current.y][0] === 1 && this.tileToReachableIndex[current.x + 1][current.y] === undefined) {
                this.data.tiles[current.x + 1][current.y][2] = 0;
                //console.log("Found expansion to the right of: " + current.x + ", " + current.y);
                foundExpansion = true;
                break;
            }

            // Check down.
            if (current.y < height - 1 && this.data.tiles[current.x][current.y + 1][0] === 1 && this.tileToReachableIndex[current.x][current.y + 1] === undefined) {
                this.data.tiles[current.x][current.y + 1][1] = 0;
                //console.log("Found expansion under: " + current.x + ", " + current.y);
                foundExpansion = true;
                break;
            }

            // Check up.
            if (current.y > 0 && this.data.tiles[current.x][current.y - 1][0] === 1 && this.tileToReachableIndex[current.x][current.y - 1] === undefined) {
                this.data.tiles[current.x][current.y][1] = 0;
                //console.log("Found expansion over: " + current.x + ", " + current.y);
                foundExpansion = true;
                break;
            }
        }

        if (foundExpansion) {
            this._calculateReachable(tankPosition, width, height);
        }

        return foundExpansion;
    }

    _expandUnreachable(tankPosition, width, height) {
        let foundExpansion = false;

        const unreachable = [];

        // Look for unreachable, present tiles.
        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {
                if (this.data.tiles[i][j][0] === 1 && this.tileToReachableIndex[i][j] === undefined) {
                    unreachable.push({ x: i, y: j });
                }
            }
        }

        // Shuffle the found tiles.
        ArrayUtils.shuffle(unreachable);

        // Try to expand an unreachable, present tile.
        for (const current of unreachable) {
            // Check left.
            if (current.x > 0 && this.data.tiles[current.x - 1][current.y][0] === 0) {
                this._addTile(current.x - 1, current.y, width, height);
                foundExpansion = true;
            }

            // Check right.
            if (current.x < width - 1 && this.data.tiles[current.x + 1][current.y][0] === 0) {
                this._addTile(current.x + 1, current.y, width, height);
                foundExpansion = true;
            }

            // Check down.
            if (current.y < height - 1 && this.data.tiles[current.x][current.y + 1][0] === 0) {
                this._addTile(current.x, current.y + 1, width, height);
                foundExpansion = true;
            }

            // Check up.
            if (current.y > 0 && this.data.tiles[current.x][current.y - 1][0] === 0) {
                this._addTile(current.x, current.y - 1, width, height);
                foundExpansion = true;
            }

            if (foundExpansion) {
                break;
            }
        }

        if (foundExpansion) {
            this._calculateReachable(tankPosition, width, height);
            this._calculateTilePresentToTileIndex(width, height);
        }

        return foundExpansion;
    }

    _addTile(x, y, width, height) {
        // Update tile.
        this.data.tiles[x][y][0] = 1;

        // Update left wall.
        if (x <= 0 || this.data.tiles[x - 1][y][0] === 0) {
            this.data.tiles[x][y][2] = 1;
        }

        // Update right wall.
        if (x < width - 1 && this.data.tiles[x + 1][y][0] === 0) {
            this.data.tiles[x + 1][y][2] = 1;
        }

        // Update top wall.
        if (y <= 0 || this.data.tiles[x][y - 1][0] === 0) {
            this.data.tiles[x][y][1] = 1;
        }

        // Update bottom wall.
        if (y < height - 1 && this.data.tiles[x][y + 1][0] === 0) {
            this.data.tiles[x][y + 1][1] = 1;
        }
    }

    _traverseCloseTiles(position, maximumDistance, width, height, traverseFunction) {
        const alreadyAddedToWorklist = Array.from({ length: width }, () => new Array(height));

        const worklist = [];
        worklist.push({ x: position.x, y: position.y, distance: 0 });

        alreadyAddedToWorklist[position.x][position.y] = true;

        while (worklist.length > 0) {
            const current = worklist.shift();

            // If we have moved too far away, stop traversing this path.
            if (current.distance > maximumDistance) {
                continue;
            }

            traverseFunction(current);

            // Check if we can move left.
            if (current.x > 0 && this.data.tiles[current.x][current.y][2] === 0) {
                if (alreadyAddedToWorklist[current.x - 1][current.y] === undefined) {
                    alreadyAddedToWorklist[current.x - 1][current.y] = true;
                    worklist.push({ x: current.x - 1, y: current.y, distance: current.distance + 1 });
                }
            }

            // Check if we can move right.
            if (current.x < width - 1 && this.data.tiles[current.x + 1][current.y][2] === 0) {
                if (alreadyAddedToWorklist[current.x + 1][current.y] === undefined) {
                    alreadyAddedToWorklist[current.x + 1][current.y] = true;
                    worklist.push({ x: current.x + 1, y: current.y, distance: current.distance + 1 });
                }
            }

            // Check if we can move down.
            if (current.y < height - 1 && this.data.tiles[current.x][current.y + 1][1] === 0) {
                if (alreadyAddedToWorklist[current.x][current.y + 1] === undefined) {
                    alreadyAddedToWorklist[current.x][current.y + 1] = true;
                    worklist.push({ x: current.x, y: current.y + 1, distance: current.distance + 1 });
                }
            }

            // Check if we can move up.
            if (current.y > 0 && this.data.tiles[current.x][current.y][1] === 0) {
                if (alreadyAddedToWorklist[current.x][current.y - 1] === undefined) {
                    alreadyAddedToWorklist[current.x][current.y - 1] = true;
                    worklist.push({ x: current.x, y: current.y - 1, distance: current.distance + 1 });
                }
            }
        }
    }

    _markTilesAsUsed(position, minimumDistance) {
        this._traverseCloseTiles(position, minimumDistance, this.width, this.height, current => {
            // Mark tile as used.
            this.reachable[this.tileToReachableIndex[current.x][current.y]].used = true;
        });
    }

    _clearUsedTiles() {
        for (const reachableTile of this.reachable) {
            reachableTile.used = false;
        }
    }

    _getUnusedTiles() {
        const unused = [];

        for (const current of this.reachable) {
            if (!current.used) {
                unused.push({ x: current.x, y: current.y });
            }
        }

        return unused;
    }

    traverseCloseTiles(position, maximumDistance, traverseFunction) {
        if (!this._isPositionInsideMaze(position)) {
            Maze.log.error("A position was outside the maze.");
            return;
        }

        this._traverseCloseTiles(position, maximumDistance, this.width, this.height, traverseFunction);
    }

    getTheme() {
        return this.data.theme;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getTiles() {
        return this.data.tiles;
    }

    getBorders() {
        return this.data.borders;
    }

    getFloors() {
        return this.data.floors;
    }

    getSpaces() {
        return this.data.spaces;
    }

    getWalls() {
        return this.data.walls;
    }

    getWallDecorations() {
        return this.data.wallDecorations;
    }

    getTileBounds() {
        return this.tileBounds;
    }

    getDistances() {
        return this.distances;
    }

    getDistancesFromPosition(position) {
        if (!this._isPositionInsideMaze(position)) {
            return false;
        }
        return this.distances[position.x][position.y];
    }

    getDistanceBetweenPositions(startPosition, endPosition) {
        if (!this._isPositionInsideMaze(startPosition) || !this._isPositionInsideMaze(endPosition)) {
            return false;
        }
        return this.distances[startPosition.x][startPosition.y][endPosition.x][endPosition.y];
    }

    getDistanceToPosition(distances, position) {
        if (!this._isPositionInsideMaze(position)) {
            return false;
        }
        return distances[position.x][position.y];
    }

    getDeadEndPenalties() {
        return this.deadEndPenalties;
    }

    getDeadEndPenalty(position) {
        if (!this._isPositionInsideMaze(position)) {
            return 0;
        }

        return this.deadEndPenalties[position.x][position.y];
    }

    getReachable() {
        return this.reachable;
    }

    getReachableIndexFromPosition(position) {
        if (!this._isPositionInsideMaze(position)) {
            return false;
        }
        return this.tileToReachableIndex[position.x][position.y];
    }

    getTankPositions() {
        return this.tankPositions;
    }

    getRandomUnusedPosition(roundState, minimumDistance) {
        // Update positions already in use.
        this._updateUsedPositions(roundState, minimumDistance, true);

        const unused = this._getUnusedTiles();

        return this._getRandomPosition(unused);
    }

    getCrateSpawnPosition(roundState) {
        // Update positions already in use.
        this._updateUsedPositions(roundState, 0, true);

        const unused = this._getUnusedTiles();

        // Filter out spawn positions that are already in use.
        const comparePositionFunction = (a, b) => { return a.x === b.x && a.y === b.y; };
        const availablePositions = [];
        for (const crateSpawnPosition of this.crateSpawnPositions) {
            const unusedIndex = ArrayUtils.indexOf(unused, crateSpawnPosition, comparePositionFunction);
            if (unusedIndex !== -1) {
                availablePositions.push(unused[unusedIndex]);
            }
        }

        return this._getRandomPosition(availablePositions);
    }

    getTankSpawnPosition(roundState) {
        // Update positions already in use.
        this._updateUsedPositions(roundState, 0, false);

        const unused = this._getUnusedTiles();

        // Filter out spawn positions that are already in use.
        const comparePositionFunction = (a, b) => { return a.x === b.x && a.y === b.y; };
        const availablePositions = [];
        for (const tankSpawnPosition of this.tankSpawnPositions) {
            const unusedIndex = ArrayUtils.indexOf(unused, tankSpawnPosition, comparePositionFunction);
            if (unusedIndex !== -1) {
                availablePositions.push(unused[unusedIndex]);
            }
        }

        // Find the position with highest distance to other tanks.
        const tankStates = roundState.getTankStates();

        let maxDistance = 0;
        let bestPositions = [];
        for (const availablePosition of availablePositions) {
            const distances = this.getDistancesFromPosition(availablePosition);
            let distance = Number.MAX_VALUE;
            for (const tankState of tankStates) {
                const position = { x: Math.floor(tankState.getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(tankState.getY() / Constants.MAZE_TILE_SIZE.m) };

                // FIXME This should not be strictly necessary as server verifies tank state positions.
                if (!this._isPositionInsideMaze(position)) {
                    Maze.log.error("A tank position was outside the maze. This should have been corrected by the server!");
                    continue;
                }

                distance = Math.min(distance, distances[position.x][position.y]);
            }

            if (distance > maxDistance) {
                maxDistance = distance;
                bestPositions = [availablePosition];
            } else if (distance === maxDistance) {
                bestPositions.push(availablePosition);
            }
        }

        return this._getRandomPosition(bestPositions);
    }

    _getRandomPosition(positions) {
        if (positions.length === 0) {
            return;
        }

        const position = MathUtils.randomArrayEntry(positions);

        return this._makePositionPhysical(position);
    }

    _makePositionPhysical(position) {
        position.x += 0.5;
        position.y += 0.5;
        position.x *= Constants.MAZE_TILE_SIZE.m;
        position.y *= Constants.MAZE_TILE_SIZE.m;

        position.rotation = Math.random() * 2.0 * Math.PI;

        return position;
    }

    isTankStateInsideMaze(tankState) {
        const position = { x: Math.floor(tankState.getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(tankState.getY() / Constants.MAZE_TILE_SIZE.m) };
        return this._isPositionInsideMaze(position);
    }

    isPositionInsideMaze(position) {
        if (position.x < 0 ||
            position.x >= this.width ||
            position.y < 0 ||
            position.y >= this.height) {
            return false;
        }

        const distances = this.distances[position.x][position.y];
        if (distances === null) {
            return false;
        }

        return true;
    }

    _isPositionInsideMaze(position) {
        if (position.x < 0 ||
            position.x >= this.width ||
            position.y < 0 ||
            position.y >= this.height) {
            Maze.log.error(`Position outside tiles: ${position.x}, ${position.y}`);
            return false;
        }

        const distances = this.distances[position.x][position.y];
        if (distances === null) {
            Maze.log.error(`Position pointing to invalid tile: ${position.x}, ${position.y}`);
            return false;
        }

        return true;
    }

    _updateUsedPositions(roundState, minimumDistance, includeTankSpawnPositions) {
        // Clear previous used marking.
        this._clearUsedTiles();

        // Iterate over tanks, collectibles, traps and zones and mark neighbouring tiles as used.
        const tankStates = roundState.getTankStates();
        for (const tankState of tankStates) {
            const position = { x: Math.floor(tankState.getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(tankState.getY() / Constants.MAZE_TILE_SIZE.m) };

            // FIXME This should not be strictly necessary as server verifies tank state positions.
            if (!this._isPositionInsideMaze(position)) {
                Maze.log.error("A tank position was outside the maze. This should have been corrected by the server!");
                continue;
            }

            this._markTilesAsUsed(position, minimumDistance);
        }

        const trapStates = roundState.getTrapStates();
        for (const trapState of trapStates) {
            const position = { x: Math.floor(trapState.getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(trapState.getY() / Constants.MAZE_TILE_SIZE.m) };

            if (!this._isPositionInsideMaze(position)) {
                Maze.log.error("A trap position was outside the maze. This indicates that someone wall-hacked the game!");
                continue;
            }

            this._markTilesAsUsed(position, 0);
        }

        const collectibleStates = roundState.getCollectibleStates();
        for (const collectibleState of collectibleStates) {
            const position = { x: Math.floor(collectibleState.getX() / Constants.MAZE_TILE_SIZE.m), y: Math.floor(collectibleState.getY() / Constants.MAZE_TILE_SIZE.m) };

            this._markTilesAsUsed(position, 0);
        }

        const zoneStates = roundState.getZoneStates();
        for (const zoneState of zoneStates) {
            switch (zoneState.getType()) {
                case Constants.ZONE_TYPES.SPAWN:
                {
                    const tiles = zoneState.getTiles();
                    for (const tile of tiles) {
                        this._markTilesAsUsed(tile, 0);
                    }
                    break;
                }
                case Constants.ZONE_TYPES.STORM:
                {
                    const tiles = zoneState.getTiles();
                    for (const tile of tiles) {
                        this._markTilesAsUsed(tile, 0);
                    }
                    break;
                }
            }
        }

        if (includeTankSpawnPositions) {
            for (const tankSpawnPosition of this.tankSpawnPositions) {
                this._markTilesAsUsed(tankSpawnPosition, 0);
            }
        }
    }

    getStormExpansionSequence() {
        const result = [];
        const tileBounds = this.getTileBounds();
        let remainingWidth = (tileBounds.maxX - tileBounds.minX) + 1;
        let remainingHeight = (tileBounds.maxY - tileBounds.minY) + 1;
        while (remainingWidth > 0 && remainingHeight > 0) {
            const horizontalWeight = remainingWidth / (remainingWidth + remainingHeight);
            if (Math.random() < horizontalWeight) {
                // Expand horizontally.
                result.push(Math.random() < 0.5 ? 0 : 2);
                remainingWidth -= 1;
            } else {
                // Expand vertically.
                result.push(Math.random() < 0.5 ? 1 : 3);
                remainingHeight -= 1;
            }
        }

        return result;
    }

    _calculateBorderFloorsSpacesWallsAndDecorations() {
        this.data.borders = [];
        this.data.floors = [];
        this.data.spaces = [];
        this.data.walls = [];
        this.data.wallDecorations = [];

        const tileToWallConfiguration = Array.from({ length: this.width }, () => new Array(this.height));

        // Calculate wall configurations.
        for (let i = 0; i < this.width; ++i) {
            for (let j = 0; j < this.height; ++j) {
                tileToWallConfiguration[i][j] = (this.data.tiles[i][j][1] << 0) +
                    (this.data.tiles[i][j][2] << 1) +
                    ((j < this.height - 1 ? this.data.tiles[i][j + 1][1] : this.data.tiles[i][j][0]) << 2) +
                    ((i < this.width - 1 ? this.data.tiles[i + 1][j][2] : this.data.tiles[i][j][0]) << 3);
            }
        }

        // Find all spaces and internal borders.
        for (let i = 0; i < this.width; ++i) {
            for (let j = 0; j < this.height; ++j) {
                const tilePresent = this.data.tiles[i][j][0] === 1;
                if (tilePresent) {
                    const floor = MazeThemeManager.getRandomFloor(this.data.theme, tileToWallConfiguration[i][j]);
                    if (floor) {
                        this.data.floors.push({
                            x: i,
                            y: j,
                            number: floor.number,
                            orientation: floor.orientation
                        });
                    }
                    const wallDecoration = MazeThemeManager.getRandomWallDecoration(this.data.theme, tileToWallConfiguration[i][j]);
                    if (wallDecoration) {
                        this.data.wallDecorations.push({
                            x: i,
                            y: j,
                            number: wallDecoration.number,
                            orientation: wallDecoration.orientation
                        });
                    }
                } else if (tileToWallConfiguration[i][j] === 15 || this._isClosedOffSpace({ x: i, y: j })) {
                    const space = MazeThemeManager.getRandomSpace(this.data.theme, tileToWallConfiguration[i][j]);
                    if (space) {
                        this.data.spaces.push({
                            x: i,
                            y: j,
                            number: space.number,
                            orientation: space.orientation
                        });
                    }
                } else {
                    const borders = MazeThemeManager.getRandomBorders(this.data.theme, tileToWallConfiguration[i][j]);
                    for (let k = 0; k < borders.length; ++k) {
                        const border = borders[k];
                        this.data.borders.push({
                            x: i,
                            y: j,
                            number: border.number,
                            orientation: border.orientation,
                            flip: border.flip
                        });
                    }
                }
            }
        }
        // Find all outer borders.
        for (let i = 0; i < this.width; ++i) {
            if (this.data.tiles[i][0][1] === 1) {
                const borders = MazeThemeManager.getRandomBorders(this.data.theme, 1 << 2);
                for (let k = 0; k < borders.length; ++k) {
                    const border = borders[k];
                    this.data.borders.push({
                        x: i,
                        y: -1,
                        number: border.number,
                        orientation: border.orientation,
                        flip: border.flip
                    });
                }
            }
            if (this.data.tiles[i][this.height - 1][0] === 1) {
                const borders = MazeThemeManager.getRandomBorders(this.data.theme, 1 << 0);
                for (let k = 0; k < borders.length; ++k) {
                    const border = borders[k];
                    this.data.borders.push({
                        x: i,
                        y: this.height,
                        number: border.number,
                        orientation: border.orientation,
                        flip: border.flip
                    });
                }
            }
        }
        for (let j = 0; j < this.height; ++j) {
            if (this.data.tiles[0][j][2] === 1) {
                const borders = MazeThemeManager.getRandomBorders(this.data.theme, 1 << 3);
                for (let k = 0; k < borders.length; ++k) {
                    const border = borders[k];
                    this.data.borders.push({
                        x: -1,
                        y: j,
                        number: border.number,
                        orientation: border.orientation,
                        flip: border.flip
                    });
                }
            }
            if (this.data.tiles[this.width - 1][j][0] === 1) {
                const borders = MazeThemeManager.getRandomBorders(this.data.theme, 1 << 1);
                for (let k = 0; k < borders.length; ++k) {
                    const border = borders[k];
                    this.data.borders.push({
                        x: this.width,
                        y: j,
                        number: border.number,
                        orientation: border.orientation,
                        flip: border.flip
                    });
                }
            }
        }
        // Find all internal walls.
        for (let i = 0; i < this.width; ++i) {
            for (let j = 0; j < this.height; ++j) {
                const walls = MazeThemeManager.getRandomWalls(this.data.theme, tileToWallConfiguration[i][j]);
                for (let k = 0; k < walls.length; ++k) {
                    const wall = walls[k];
                    this.data.walls.push({
                        x: i,
                        y: j,
                        number: wall.number,
                        rotate: wall.rotate,
                        flipX: wall.flipX,
                        flipY: wall.flipY
                    });
                }
            }
        }
        // Find all outer walls.
        for (let i = 0; i < this.width; ++i) {
            if (this.data.tiles[i][this.height - 1][0] === 1) {
                const walls = MazeThemeManager.getRandomWalls(this.data.theme, 1 << 0);
                for (let k = 0; k < walls.length; ++k) {
                    const wall = walls[k];
                    this.data.walls.push({
                        x: i,
                        y: this.height,
                        number: wall.number,
                        rotate: wall.rotate,
                        flipX: wall.flipX,
                        flipY: wall.flipY
                    });
                }
            }
        }
        for (let j = 0; j < this.height; ++j) {
            if (this.data.tiles[this.width - 1][j][0] === 1) {
                const walls = MazeThemeManager.getRandomWalls(this.data.theme, 1 << 1);
                for (let k = 0; k < walls.length; ++k) {
                    const wall = walls[k];
                    this.data.walls.push({
                        x: this.width,
                        y: j,
                        number: wall.number,
                        rotate: wall.rotate,
                        flipX: wall.flipX,
                        flipY: wall.flipY
                    });
                }
            }
        }
    }

    _isClosedOffSpace(startPosition) {
        const alreadyAddedToWorklist = Array.from({ length: this.width }, () => new Array(this.height));

        const worklist = [];
        worklist.push({ x: startPosition.x, y: startPosition.y });

        alreadyAddedToWorklist[startPosition.x][startPosition.y] = true;

        while (worklist.length > 0) {
            const current = worklist.pop();

            // If at any point, we reach the edge of the maze. We know the space is not closed off.
            if (current.x === 0 || current.x === this.width - 1 || current.y === 0 || current.y === this.height - 1) {
                return false;
            }

            // Check if we can move left.
            if (this.data.tiles[current.x][current.y][2] === 0) {
                if (alreadyAddedToWorklist[current.x - 1][current.y] === undefined) {
                    alreadyAddedToWorklist[current.x - 1][current.y] = true;
                    worklist.push({ x: current.x - 1, y: current.y });
                }
            }

            // Check if we can move right.
            if (this.data.tiles[current.x + 1][current.y][2] === 0) {
                if (alreadyAddedToWorklist[current.x + 1][current.y] === undefined) {
                    alreadyAddedToWorklist[current.x + 1][current.y] = true;
                    worklist.push({ x: current.x + 1, y: current.y });
                }
            }

            // Check if we can move down.
            if (this.data.tiles[current.x][current.y + 1][1] === 0) {
                if (alreadyAddedToWorklist[current.x][current.y + 1] === undefined) {
                    alreadyAddedToWorklist[current.x][current.y + 1] = true;
                    worklist.push({ x: current.x, y: current.y + 1 });
                }
            }

            // Check if we can move up.
            if (this.data.tiles[current.x][current.y][1] === 0) {
                if (alreadyAddedToWorklist[current.x][current.y - 1] === undefined) {
                    alreadyAddedToWorklist[current.x][current.y - 1] = true;
                    worklist.push({ x: current.x, y: current.y - 1 });
                }
            }
        }

        // We never reached the edge of the maze, so the starting position must be part of a closed off space.
        return true;
    }

    _calculateTileBounds() {
        this.tileBounds = { minX: this.width, minY: this.height, maxX: 0, maxY: 0 };
        for (let i = 0; i < this.width; ++i) {
            for (let j = 0; j < this.height; ++j) {
                if (this.data.tiles[i][j][0] === 1) {
                    this.tileBounds.minX = Math.min(i, this.tileBounds.minX);
                    this.tileBounds.minY = Math.min(j, this.tileBounds.minY);
                    this.tileBounds.maxX = Math.max(i, this.tileBounds.maxX);
                    this.tileBounds.maxY = Math.max(j, this.tileBounds.maxY);
                }
            }
        }
    }

    _calculateDistances() {
        // Allocate distances array.
        this.distances = Array.from({ length: this.width }, () => new Array(this.height).fill(null));

        for (const reachableTile of this.reachable) {
            this.distances[reachableTile.x][reachableTile.y] = this._calculateDistancesFromPosition(reachableTile);
        }
    }

    _calculateDistancesFromPosition(position) {
        const result = Array.from({ length: this.width }, () => new Array(this.height).fill(Number.MAX_VALUE));

        this._traverseCloseTiles(position, Number.MAX_VALUE, this.width, this.height, current => {
            result[current.x][current.y] = current.distance;
        });

        return result;
    }

    getGradientPath(startPosition, maxLength, gradientFunction) {
        const result = [];

        let currentValue = gradientFunction(startPosition);
        let current = startPosition;
        let next = null;
        let foundPath = true;

        while (maxLength > 0 && foundPath) {
            foundPath = false;

            // Check if we can move left.
            if (current.x > 0 && this.data.tiles[current.x][current.y][2] === 0) {
                const value = gradientFunction({ x: current.x - 1, y: current.y });
                if (value > currentValue) {
                    currentValue = value;
                    next = { x: current.x - 1, y: current.y };
                    foundPath = true;
                }
            }

            // Check if we can move right.
            if (current.x < this.width - 1 && this.data.tiles[current.x + 1][current.y][2] === 0) {
                const value = gradientFunction({ x: current.x + 1, y: current.y });
                if (value > currentValue) {
                    currentValue = value;
                    next = { x: current.x + 1, y: current.y };
                    foundPath = true;
                }
            }

            // Check if we can move down.
            if (current.y < this.height - 1 && this.data.tiles[current.x][current.y + 1][1] === 0) {
                const value = gradientFunction({ x: current.x, y: current.y + 1 });
                if (value > currentValue) {
                    currentValue = value;
                    next = { x: current.x, y: current.y + 1 };
                    foundPath = true;
                }
            }

            // Check if we can move up.
            if (current.y > 0 && this.data.tiles[current.x][current.y][1] === 0) {
                const value = gradientFunction({ x: current.x, y: current.y - 1 });
                if (value > currentValue) {
                    currentValue = value;
                    next = { x: current.x, y: current.y - 1 };
                    foundPath = true;
                }
            }

            // Check if we can move left-down.
            if (current.x > 0 && current.y < this.height - 1 && this.data.tiles[current.x][current.y][2] === 0 && this.data.tiles[current.x][current.y + 1][2] === 0 && this.data.tiles[current.x][current.y + 1][1] === 0 && this.data.tiles[current.x - 1][current.y + 1][1] === 0) {
                const value = gradientFunction({ x: current.x - 1, y: current.y + 1 });
                if (value > currentValue) {
                    currentValue = value;
                    next = { x: current.x - 1, y: current.y + 1 };
                    foundPath = true;
                }
            }

            // Check if we can move right-down.
            if (current.x < this.width - 1 && current.y < this.height - 1 && this.data.tiles[current.x + 1][current.y][2] === 0 && this.data.tiles[current.x + 1][current.y + 1][2] === 0 && this.data.tiles[current.x][current.y + 1][1] === 0 && this.data.tiles[current.x + 1][current.y + 1][1] === 0) {
                const value = gradientFunction({ x: current.x + 1, y: current.y + 1 });
                if (value > currentValue) {
                    currentValue = value;
                    next = { x: current.x + 1, y: current.y + 1 };
                    foundPath = true;
                }
            }

            // Check if we can move left-up.
            if (current.x > 0 && current.y > 0 && this.data.tiles[current.x][current.y][2] === 0 && this.data.tiles[current.x][current.y - 1][2] === 0 && this.data.tiles[current.x][current.y][1] === 0 && this.data.tiles[current.x - 1][current.y][1] === 0) {
                const value = gradientFunction({ x: current.x - 1, y: current.y - 1 });
                if (value > currentValue) {
                    currentValue = value;
                    next = { x: current.x - 1, y: current.y - 1 };
                    foundPath = true;
                }
            }

            // Check if we can move right-up.
            if (current.x < this.width - 1 && current.y > 0 && this.data.tiles[current.x + 1][current.y][2] === 0 && this.data.tiles[current.x + 1][current.y - 1][2] === 0 && this.data.tiles[current.x][current.y][1] === 0 && this.data.tiles[current.x + 1][current.y][1] === 0) {
                const value = gradientFunction({ x: current.x + 1, y: current.y - 1 });
                if (value > currentValue) {
                    currentValue = value;
                    next = { x: current.x + 1, y: current.y - 1 };
                    foundPath = true;
                }
            }

            if (foundPath) {
                result.push(next);
            }

            --maxLength;
            current = next;
        }

        return result;
    }

    getPathAwayFrom(startPosition, fromPosition, maxLength, deadEndWeight) {
        const distances = this.distances[fromPosition.x][fromPosition.y];

        const path = this.getGradientPath(startPosition, maxLength, current => {
            return distances[current.x][current.y] - (this.deadEndPenalties[current.x][current.y] * deadEndWeight);
        });

        return path;
    }

    getPathAwayFromWithThreats(startPosition, fromPosition, maxLength, deadEndWeight, threatMap, threatWeight) {
        const distances = this.distances[fromPosition.x][fromPosition.y];

        const path = this.getGradientPath(startPosition, maxLength, current => {
            return distances[current.x][current.y] - (this.deadEndPenalties[current.x][current.y] * deadEndWeight) - (threatMap.get(current) * threatWeight);
        });

        return path;
    }

    getPathAwayWithMultipleDistancesAndThreats(startPosition, maxLength, deadEndWeight, distancesArray, threatMap, threatWeight) {
        const path = this.getGradientPath(startPosition, maxLength, current => {
            let distance = 0;
            for (const distances of distancesArray) {
                distance += distances[current.x][current.y];
            }
            distance /= distancesArray.length;
            return distance - (this.deadEndPenalties[current.x][current.y] * deadEndWeight) - (threatMap.get(current) * threatWeight);
        });

        return path;
    }

    getShortestPathWithGraph(startPosition, endPosition, weights, lengthWeight) {
        const pathFinder = aStar(this.graph, {
            oriented: true,
            distance(fromNode, toNode, link) {
                if (weights !== undefined) {
                    return weights[link.data.x][link.data.y] + (link.data.length * lengthWeight);
                } else {
                    return link.data.length;
                }
            }
        });

        const result = pathFinder.find(this.vertices[startPosition.x][startPosition.y], this.vertices[endPosition.x][endPosition.y]);
        const path = [];
        for (let i = result.length - 2; i >= 0; --i) {
            const step = result[i].data;
            const previous = result[i + 1].data;
            const diagonal = step.x !== previous.x && step.y !== previous.y;
            path.push({ x: step.x, y: step.y, length: diagonal ? Math.SQRT2 : 1 });
        }
        return path;
    }

    _calculateDeadEndPenalties() {
        const result = Array.from({ length: this.width }, () => new Array(this.height).fill(0));

        const worklist = [];
        for (const current of this.reachable) {
            let exitCount = 0;

            // Check if we can move left.
            if (current.x > 0 && this.data.tiles[current.x][current.y][2] === 0) {
                ++exitCount;
            }
            // Check if we can move right.
            if (current.x < this.width - 1 && this.data.tiles[current.x + 1][current.y][2] === 0) {
                ++exitCount;
            }
            // Check if we can move down.
            if (current.y < this.height - 1 && this.data.tiles[current.x][current.y + 1][1] === 0) {
                ++exitCount;
            }
            // Check if we can move up.
            if (current.y > 0 && this.data.tiles[current.x][current.y][1] === 0) {
                ++exitCount;
            }

            if (exitCount === 1) {
                worklist.push({ x: current.x, y: current.y });
            }
        }

        while (worklist.length > 0) {
            const current = worklist.shift();

            let exitCount = 0;
            let next = null;
            let penalty = Constants.MAZE_MAX_DEAD_END_PENALTY;

            // Check if we can move left.
            if (current.x > 0 && this.data.tiles[current.x][current.y][2] === 0) {
                // Check if left is not a dead end already.
                // If it is not, count it as an exit and add it for potential future processing.
                if (result[current.x - 1][current.y] === 0) {
                    ++exitCount;
                    next = { x: current.x - 1, y: current.y };
                } else {
                    penalty = Math.max(1, Math.min(penalty, result[current.x - 1][current.y] - 1));
                }
            }

            // Check if we can move right.
            if (current.x < this.width - 1 && this.data.tiles[current.x + 1][current.y][2] === 0) {
                if (result[current.x + 1][current.y] === 0) {
                    ++exitCount;
                    next = { x: current.x + 1, y: current.y };
                } else {
                    penalty = Math.max(1, Math.min(penalty, result[current.x + 1][current.y] - 1));
                }
            }

            // Check if we can move down.
            if (current.y < this.height - 1 && this.data.tiles[current.x][current.y + 1][1] === 0) {
                if (result[current.x][current.y + 1] === 0) {
                    ++exitCount;
                    next = { x: current.x, y: current.y + 1 };
                } else {
                    penalty = Math.max(1, Math.min(penalty, result[current.x][current.y + 1] - 1));
                }
            }

            // Check if we can move up.
            if (current.y > 0 && this.data.tiles[current.x][current.y][1] === 0) {
                if (result[current.x][current.y - 1] === 0) {
                    ++exitCount;
                    next = { x: current.x, y: current.y - 1 };
                } else {
                    penalty = Math.max(1, Math.min(penalty, result[current.x][current.y - 1] - 1));
                }
            }

            // There were at most one exit, so we can now mark this tile as a dead end.
            if (exitCount <= 1) {
                result[current.x][current.y] = penalty;
            }

            // There was exactly one exit, so we should add the free neighbour for processing.
            if (exitCount === 1) {
                worklist.push(next);
            }
        }

        this.deadEndPenalties = result;
    }
}
