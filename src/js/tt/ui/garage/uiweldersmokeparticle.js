import { UIConstants } from "../uiconstants.js";

export class UIWelderSmokeParticle extends Phaser.Particle {
    constructor(game, x, y) {
        // Call super.
        super(game, x, y, game.cache.getBitmapData(`weldersmoke${Math.floor(Math.random() * 2)}`));

        // Kill particle.
        this.kill();
    }

    onEmit() {
        const xx = Math.floor(Math.random() * UIWelderSmokeParticle.spawnPoints.length);
        const randomSpawnPoint = UIWelderSmokeParticle.spawnPoints[xx];
        this.x = UIWelderSmokeParticle.tankIcon.world.x + (randomSpawnPoint.x * UIWelderSmokeParticle.tankIcon.width);
        this.y = UIWelderSmokeParticle.tankIcon.world.y + (randomSpawnPoint.y * UIWelderSmokeParticle.tankIcon.height);
    }

    update() {
        this.alpha = Math.max(0.0, this.alpha - (0.01 - (Math.random() * 0.004)));
        this.scale.set(this.scale.x + 0.0125, this.scale.y + 0.0125);
    }

    retire() {
        // Kill particle.
        this.kill();
    }

    static updateSpark(game) {
        const randomIntensity = Math.floor(Math.random() * 64);
        UIWelderSmokeParticle._drawSparkSmoke(game.cache.getBitmapData("weldersmoke0"), 172 + randomIntensity);
        UIWelderSmokeParticle._drawSparkSmoke(game.cache.getBitmapData("weldersmoke1"), 128 + randomIntensity);
    }

    static _drawSparkSmoke(welderSmoke, intensity) {
        welderSmoke.clear();
        const radGrad = welderSmoke.context.createRadialGradient(UIConstants.WELDER_SMOKE_RADIUS, UIConstants.WELDER_SMOKE_RADIUS, UIConstants.WELDER_SMOKE_INNER_RADIUS, UIConstants.WELDER_SMOKE_RADIUS, UIConstants.WELDER_SMOKE_RADIUS, UIConstants.WELDER_SMOKE_RADIUS);
        radGrad.addColorStop(0, `rgba(${intensity}, ${intensity}, ${intensity}, 1)`);
        radGrad.addColorStop(1, `rgba(${intensity}, ${intensity}, ${intensity}, 0)`);
        welderSmoke.context.fillStyle = radGrad;
        welderSmoke.context.fillRect(0, 0, UIConstants.WELDER_SMOKE_RADIUS * 2, UIConstants.WELDER_SMOKE_RADIUS * 2);
        welderSmoke.dirty = true;
    }

    static setSpawnPoints(tankIcon, spawnPointsOld, spawnPointsNew) {
        UIWelderSmokeParticle.spawnPoints = [];

        UIWelderSmokeParticle.tankIcon = tankIcon;

        if (spawnPointsOld) {
            UIWelderSmokeParticle.spawnPoints = [...UIWelderSmokeParticle.spawnPoints, ...spawnPointsOld];
        }
        if (spawnPointsNew) {
            UIWelderSmokeParticle.spawnPoints = [...UIWelderSmokeParticle.spawnPoints, ...spawnPointsNew];
        }
    }
}
