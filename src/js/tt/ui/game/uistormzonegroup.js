import { MathUtils } from "../../mathutils.js";
import { QualityManager } from "../../../qualitymanager.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

export class UIStormZoneGroup extends Phaser.Group {
    constructor(game, gameController) {
        // Call super.
        super(game, null);

        this.gameController = gameController;

        // Allocate a fixed size for the tile sprites and scale them to each maze when spawning.
        this.firstStormTileSprite = this.addChild(new Phaser.TileSprite(game, 0.0, 0.0, UIConstants.STORM_ZONE_TILE_SPRITE_RESOLUTION, UIConstants.STORM_ZONE_TILE_SPRITE_RESOLUTION, "game", "storm0"));
        this.secondStormTileSprite = this.addChild(new Phaser.TileSprite(game, 0.0, 0.0, UIConstants.STORM_ZONE_TILE_SPRITE_RESOLUTION, UIConstants.STORM_ZONE_TILE_SPRITE_RESOLUTION, "game", "storm1"));

        this.firstStormTileSprite.blendMode = PIXI.blendModes.MULTIPLY;
        this.secondStormTileSprite.blendMode = PIXI.blendModes.MULTIPLY;

        this.stormMask = this.addChild(new Phaser.Graphics(game, 0.0, 0.0));

        this.firstStormTileSprite.mask = this.stormMask;
        this.secondStormTileSprite.mask = this.stormMask;

        this.firstStormTileSprite.kill();
        this.secondStormTileSprite.kill();

        this.exists = false;
        this.visible = false;
    }

    update() {
        // Check if exists.
        if (!this.exists || this.game.physics.arcade.isPaused) {
            return;
        }

        // Call super.
        super.update();

        const stormZone = this.gameController.getZone(this.zoneId);
        const corners = stormZone.getCorners();
        const expansionSide = stormZone.getField("expansionSide");

        this._updateStormParticles(this.rightStormParticles, 0.0, 0.0, UIUtils.mpx(corners.stormEndTop), UIUtils.mpx(corners.stormStartBottom), expansionSide === 0, this.game.time.delta / 1000);
        this._updateStormParticles(this.bottomStormParticles, UIUtils.mpx(corners.stormEndLeft), UIUtils.mpx(corners.stormStartRight), 0.0, 0.0, expansionSide === 1, this.game.time.delta / 1000);
        this._updateStormParticles(this.leftStormParticles, 0.0, 0.0, UIUtils.mpx(corners.stormEndTop), UIUtils.mpx(corners.stormStartBottom), expansionSide === 2, this.game.time.delta / 1000);
        this._updateStormParticles(this.topStormParticles, UIUtils.mpx(corners.stormEndLeft), UIUtils.mpx(corners.stormStartRight), 0.0, 0.0, expansionSide === 3, this.game.time.delta / 1000);

        this._updateStormMask(corners);

        this.time += this.game.time.delta / 1000;

        const firstStormTileSpriteOldScaleX = this.firstStormTileSprite.tileScale.x;
        const firstStormTileSpriteNewScaleX = 1.0 + (0.1 * Math.cos(this.time * 1.0));
        const firstStormTileSpriteOldScaleY = this.firstStormTileSprite.tileScale.y;
        const firstStormTileSpriteNewScaleY = 1.0 + (0.05 * Math.sin(this.time * 1.3));
        const firstStormTileSpriteDX = (this.mazeLocalBounds.width / this.firstStormTileSprite.scale.x) * (firstStormTileSpriteNewScaleX - firstStormTileSpriteOldScaleX) * 0.5;
        const firstStormTileSpriteDY = (this.mazeLocalBounds.height / this.firstStormTileSprite.scale.y) * (firstStormTileSpriteNewScaleY - firstStormTileSpriteOldScaleY) * 0.5;

        const secondStormTileSpriteOldScaleX = this.secondStormTileSprite.tileScale.x;
        const secondStormTileSpriteNewScaleX = 1.0 + (0.05 * -Math.sin(this.time * 0.7));
        const secondStormTileSpriteOldScaleY = this.secondStormTileSprite.tileScale.y;
        const secondStormTileSpriteNewScaleY = 1.0 + (0.1 * Math.cos(this.time * 0.5));
        const secondStormTileSpriteDX = (this.mazeLocalBounds.width / this.secondStormTileSprite.scale.x) * (secondStormTileSpriteNewScaleX - secondStormTileSpriteOldScaleX) * 0.5;
        const secondStormTileSpriteDY = (this.mazeLocalBounds.height / this.secondStormTileSprite.scale.y) * (secondStormTileSpriteNewScaleY - secondStormTileSpriteOldScaleY) * 0.5;

        this.firstStormTileSprite.tilePosition.x += ((0.125 * Math.cos(this.time * 0.07)) * UIConstants.STORM_ZONE_TILE_SPRITE_SCROLL_SPEED) - firstStormTileSpriteDX;
        this.firstStormTileSprite.tilePosition.y += ((0.25 * Math.sin(this.time * 0.19)) * UIConstants.STORM_ZONE_TILE_SPRITE_SCROLL_SPEED) - firstStormTileSpriteDY;
        this.secondStormTileSprite.tilePosition.x += ((0.0625 * -Math.sin(this.time * 0.03)) * UIConstants.STORM_ZONE_TILE_SPRITE_SCROLL_SPEED) - secondStormTileSpriteDX;
        this.secondStormTileSprite.tilePosition.y += ((0.0675 * Math.cos(this.time * 0.21)) * UIConstants.STORM_ZONE_TILE_SPRITE_SCROLL_SPEED) - secondStormTileSpriteDY;

        this.firstStormTileSprite.tileScale.x = firstStormTileSpriteNewScaleX;
        this.firstStormTileSprite.tileScale.y = firstStormTileSpriteNewScaleY;
        this.secondStormTileSprite.tileScale.x = secondStormTileSpriteNewScaleX;
        this.secondStormTileSprite.tileScale.y = secondStormTileSpriteNewScaleY;

        this.firstStormTileSprite.alpha = Math.min(1.0, this.firstStormTileSprite.alpha + 0.015);
        this.secondStormTileSprite.alpha = Math.min(1.0, this.secondStormTileSprite.alpha + 0.015);
    }

    postUpdate() {
        if (!this.exists) {
            return;
        }

        // Call super.
        super.postUpdate();
    }

    spawn(zoneId, mazeLocalBounds, animate) {
        // Revive and place the group.
        this.exists = true;
        this.visible = true;

        this.firstStormTileSprite.alpha = 1.0;
        this.secondStormTileSprite.alpha = 1.0;
        this.firstStormTileSprite.revive();
        this.secondStormTileSprite.revive();

        // Store zoneId.
        this.zoneId = zoneId;

        // Reset state.
        this.time = 0;

        // Update maze local bounds.
        this.setMazeLocalBounds(mazeLocalBounds);

        this.firstStormTileSprite.tilePosition.x = Math.random() * UIConstants.STORM_ZONE_TILE_SPRITE_RANDOM_OFFSET;
        this.firstStormTileSprite.tilePosition.y = Math.random() * UIConstants.STORM_ZONE_TILE_SPRITE_RANDOM_OFFSET;
        this.secondStormTileSprite.tilePosition.x = Math.random() * UIConstants.STORM_ZONE_TILE_SPRITE_RANDOM_OFFSET;
        this.secondStormTileSprite.tilePosition.y = Math.random() * UIConstants.STORM_ZONE_TILE_SPRITE_RANDOM_OFFSET;

        this.rightStormParticles = [];
        this.bottomStormParticles = [];
        this.leftStormParticles = [];
        this.topStormParticles = [];
        const stormZone = this.gameController.getZone(this.zoneId);
        const corners = stormZone.getCorners();
        const particleCount = QualityManager.getQualityValue(QualityManager.QUALITY_PARAMETERS.STORM_ZONE_STORM_PARTICLE_COUNT);
        let particleRadiusMultiplier = UIConstants.STORM_ZONE_STORM_PARTICLE_RADIUS_MULTIPLIER;
        if (animate) {
            // TODO Play spawn audio.

            // Spawn particles with the special initial radius.
            particleRadiusMultiplier = UIConstants.STORM_ZONE_FIRST_STORM_PARTICLE_RADIUS_MULTIPLIER;

            // Fade in the storm.
            this.firstStormTileSprite.alpha = 0.0;
            this.secondStormTileSprite.alpha = 0.0;
        }
        this._spawnStormParticles(this.rightStormParticles, particleCount, 0.0, 0.0, UIUtils.mpx(corners.stormEndTop), UIUtils.mpx(corners.stormStartBottom), particleRadiusMultiplier);
        this._spawnStormParticles(this.bottomStormParticles, particleCount, UIUtils.mpx(corners.stormEndLeft), UIUtils.mpx(corners.stormStartRight), 0.0, 0.0, particleRadiusMultiplier);
        this._spawnStormParticles(this.leftStormParticles, particleCount, 0.0, 0.0, UIUtils.mpx(corners.stormEndTop), UIUtils.mpx(corners.stormStartBottom), particleRadiusMultiplier);
        this._spawnStormParticles(this.topStormParticles, particleCount, UIUtils.mpx(corners.stormEndLeft), UIUtils.mpx(corners.stormStartRight), 0.0, 0.0, particleRadiusMultiplier);

        this._updateStormMask(corners);
    }

    destabilise() {
        // Intentionally do nothing. Should never get called.
    }

    retire() {
        // Kill the group.
        this.exists = false;
        this.visible = false;

        this.firstStormTileSprite.kill();
        this.secondStormTileSprite.kill();
    }

    setMazeLocalBounds(mazeLocalBounds) {
        this.mazeLocalBounds = mazeLocalBounds;

        this.firstStormTileSprite.x = this.mazeLocalBounds.x;
        this.firstStormTileSprite.y = this.mazeLocalBounds.y;
        this.secondStormTileSprite.x = this.mazeLocalBounds.x;
        this.secondStormTileSprite.y = this.mazeLocalBounds.y;
        this.firstStormTileSprite.scale.setTo(this.mazeLocalBounds.width / UIConstants.STORM_ZONE_TILE_SPRITE_RESOLUTION, this.mazeLocalBounds.height / UIConstants.STORM_ZONE_TILE_SPRITE_RESOLUTION);
        this.secondStormTileSprite.scale.setTo(this.mazeLocalBounds.width / UIConstants.STORM_ZONE_TILE_SPRITE_RESOLUTION, this.mazeLocalBounds.height / UIConstants.STORM_ZONE_TILE_SPRITE_RESOLUTION);
    }

    _updateStormMask(corners) {
        this.stormMask.clear();
        this.stormMask.beginFill(0xffffff);
        // TODO Optimise scale from m to px.
        this.stormMask.drawRect(UIUtils.mpx(corners.stormStartRight), this.mazeLocalBounds.top, this.mazeLocalBounds.right - UIUtils.mpx(corners.stormStartRight), this.mazeLocalBounds.height);
        this.stormMask.drawRect(this.mazeLocalBounds.left, UIUtils.mpx(corners.stormStartBottom), this.mazeLocalBounds.width, this.mazeLocalBounds.bottom - UIUtils.mpx(corners.stormStartBottom));
        this.stormMask.drawRect(this.mazeLocalBounds.left, this.mazeLocalBounds.top, UIUtils.mpx(corners.stormEndLeft) - this.mazeLocalBounds.left, this.mazeLocalBounds.height);
        this.stormMask.drawRect(this.mazeLocalBounds.left, this.mazeLocalBounds.top, this.mazeLocalBounds.width, UIUtils.mpx(corners.stormEndTop) - this.mazeLocalBounds.top);

        this._drawStormParticles(this.rightStormParticles, UIUtils.mpx(corners.stormStartRight), 0.0);
        this._drawStormParticles(this.bottomStormParticles, 0.0, UIUtils.mpx(corners.stormStartBottom));
        this._drawStormParticles(this.leftStormParticles, UIUtils.mpx(corners.stormEndLeft), 0.0);
        this._drawStormParticles(this.topStormParticles, 0.0, UIUtils.mpx(corners.stormEndTop));
    }

    _drawStormParticles(array, x, y) {
        for (let i = 0; i < array.length; ++i) {
            const particle = array[i];
            const diameter = Math.sin((particle.time / particle.lifetime) * Math.PI) * 2 * particle.radius;
            this.stormMask.drawCircle(x + particle.x, y + particle.y, diameter);
        }
    }

    _spawnStormParticles(array, count, minX, maxX, minY, maxY, radiusMultiplier) {
        while (array.length < count) {
            array.push(this._spawnStormParticle(minX, maxX, minY, maxY, Math.random() * UIConstants.STORM_ZONE_MIN_STORM_PARTICLE_LIFETIME, radiusMultiplier, false));
        }
    }

    _spawnStormParticle(minX, maxX, minY, maxY, timeOffset, radiusMultiplier, currentExpansion) {
        const x = minX + (Math.random() * (maxX - minX));
        const y = minY + (Math.random() * (maxY - minY));
        // Mostly align speed with storm front.
        const speedX = MathUtils.randomAroundZero(UIConstants.STORM_ZONE_STORM_PARTICLE_RANDOM_SPEED) *
            Math.max(UIConstants.STORM_ZONE_STORM_PARTICLE_MIN_SPEED_CLAMP_MULTIPLIER, Math.min(1.0, Math.abs(maxX - minX)));
        const speedY = MathUtils.randomAroundZero(UIConstants.STORM_ZONE_STORM_PARTICLE_RANDOM_SPEED) *
            Math.max(UIConstants.STORM_ZONE_STORM_PARTICLE_MIN_SPEED_CLAMP_MULTIPLIER, Math.min(1.0, Math.abs(maxY - minY)));
        let radius = MathUtils.randomRange(UIConstants.STORM_ZONE_MIN_STORM_PARTICLE_RADIUS, UIConstants.STORM_ZONE_MAX_STORM_PARTICLE_RADIUS);
        if (currentExpansion) {
            radius *= UIConstants.STORM_ZONE_EXPANSION_STORM_PARTICLE_RADIUS_MULTIPLIER;
        }
        let lifetime = MathUtils.randomRange(UIConstants.STORM_ZONE_MIN_STORM_PARTICLE_LIFETIME, UIConstants.STORM_ZONE_MAX_STORM_PARTICLE_LIFETIME);
        if (currentExpansion) {
            lifetime *= UIConstants.STORM_ZONE_EXPANSION_STORM_PARTICLE_LIFETIME_MULTIPLIER;
        }

        return { x, y, speedX, speedY, radius: radius * radiusMultiplier, lifetime, time: timeOffset };
    }

    _updateStormParticles(array, minX, maxX, minY, maxY, currentExpansion, deltaTime) {
        for (let i = 0; i < array.length; ++i) {
            const particle = array[i];
            particle.time += deltaTime;
            particle.x += particle.speedX * deltaTime;
            particle.y += particle.speedY * deltaTime;

            if (particle.time >= particle.lifetime) {
                array[i] = this._spawnStormParticle(minX, maxX, minY, maxY, 0.0, UIConstants.STORM_ZONE_STORM_PARTICLE_RADIUS_MULTIPLIER, currentExpansion);
            }
        }
    }
}
