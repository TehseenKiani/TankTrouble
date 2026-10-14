import { Constants } from "./constants.js";
import { Projectile } from "./projectile.js";

export class Shotgun extends Projectile {
    hitShield() {
        super.hitShield();
        this.timeAlive = Math.max(this.timeAlive, Constants.SHOTGUN_MAX_LIFETIME - Constants.SHOTGUN_LIFETIME_AFTER_MAZE_HIT);
    }

    hitMaze() {
        super.hitMaze();
        this.timeAlive = Math.max(this.timeAlive, Constants.SHOTGUN_MAX_LIFETIME - Constants.SHOTGUN_LIFETIME_AFTER_MAZE_HIT);
    }
}
