export class UIWelderSparkParticle extends Phaser.Particle {
    constructor(game, x, y) {
        // Call super.
        super(game, x, y, game.cache.getBitmapData("welderspark"));

        // Kill particle.
        this.kill();
    }

    onEmit() {
        const xx = Math.floor(Math.random() * UIWelderSparkParticle.spawnPoints.length);
        const randomSpawnPoint = UIWelderSparkParticle.spawnPoints[xx];
        this.x = UIWelderSparkParticle.tankIcon.world.x + (randomSpawnPoint.x * UIWelderSparkParticle.tankIcon.width);
        this.y = UIWelderSparkParticle.tankIcon.world.y + (randomSpawnPoint.y * UIWelderSparkParticle.tankIcon.height);
        this.body.bounce.setTo(0.5, 0.7);
    }

    update() {
        this.rotation = this.game.math.angleBetween(this.body.velocity.x, this.body.velocity.y, 1.0, 0.0);
        this.alpha = Math.max(0.0, this.alpha - (0.008 - (Math.random() * 0.001)));
    }

    retire() {
        // Kill particle.
        this.kill();
    }

    static setSpawnPoints(tankIcon, spawnPointsOld, spawnPointsNew) {
        UIWelderSparkParticle.spawnPoints = [];

        UIWelderSparkParticle.tankIcon = tankIcon;

        if (spawnPointsOld) {
            UIWelderSparkParticle.spawnPoints = [...UIWelderSparkParticle.spawnPoints, ...spawnPointsOld];
        }
        if (spawnPointsNew) {
            UIWelderSparkParticle.spawnPoints = [...UIWelderSparkParticle.spawnPoints, ...spawnPointsNew];
        }
    }
}
