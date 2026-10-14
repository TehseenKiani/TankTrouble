import { Projectile } from "./projectile.js";

export class Shrapnel extends Projectile {
    update(deltaTime) {
        if (!this.isDeadlyToOwner()) {
            this.makeDeadlyToOwner();
        }

        // Update position and velocity from physics.
        this.x = this.b2dBody.GetPosition().x;
        this.y = this.b2dBody.GetPosition().y;
        this.speedX = this.b2dBody.GetLinearVelocity().x;
        this.speedY = this.b2dBody.GetLinearVelocity().y;
    }

    hitShield() {
        const velocity = this.b2dBody.GetLinearVelocity();
        velocity.Multiply(0.0);
    }

    hitMaze() {
        const velocity = this.b2dBody.GetLinearVelocity();
        velocity.Multiply(0.0);
    }

    done() {
        const velocity = this.b2dBody.GetLinearVelocity();
        return velocity.LengthSquared() <= 0.01;
    }
}
