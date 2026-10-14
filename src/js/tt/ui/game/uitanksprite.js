import { Constants } from "../../constants.js";
import { Backend } from "../../../backend.js";
import { Caches } from "../../../caches.js";
import { UIConstants } from "../uiconstants.js";
import { UIUtils } from "../uiutils.js";

//FIXME Maybe collect sounds in a wrapper object.
export class UITankSprite extends Phaser.Sprite {
    constructor(game, gameController, emptyBarrelSounds, fireBulletSounds, fireLaserSound, fireShotgunSound, fireMissileSound, fireMineSound, chargeGatlingGunSound, holdGatlingGunSound, dischargeGatlingGunSound, pickupLaserSound, pickupDoubleBarrelSound, pickupShotgunSound, pickupMissileSound, pickupMineSound, pickupGatlingGunSound, pickupShieldSound, loadWeaponSound, dustEmitter, launchEmitter) {
        // Call super.
        super(game, 0, 0, "game", "base");

        this.gameController = gameController;
        this.emptyBarrelSounds = emptyBarrelSounds;
        this.fireBulletSounds = fireBulletSounds;
        this.fireLaserSound = fireLaserSound;
        this.fireShotgunSound = fireShotgunSound;
        this.fireMissileSound = fireMissileSound;
        this.fireMineSound = fireMineSound;
        this.chargeGatlingGunSound = chargeGatlingGunSound;
        this.holdGatlingGunSound = holdGatlingGunSound;
        this.dischargeGatlingGunSound = dischargeGatlingGunSound;
        this.pickupLaserSound = pickupLaserSound;
        this.pickupDoubleBarrelSound = pickupDoubleBarrelSound;
        this.pickupShotgunSound = pickupShotgunSound;
        this.pickupMissileSound = pickupMissileSound;
        this.pickupMineSound = pickupMineSound;
        this.pickupGatlingGunSound = pickupGatlingGunSound;
        this.pickupShieldSound = pickupShieldSound;
        this.loadWeaponSound = loadWeaponSound;
        this.dustEmitter = dustEmitter;
        this.launchEmitter = launchEmitter;

        // Set up UI Physics body.
        this.game.physics.p2.enable(this);
        this.body.allowSleep = false;
        this.body.kinematic = true;
        this.body.setRectangle(Constants.TANK.WIDTH.px, Constants.TANK.HEIGHT.px);
        this.body.addRectangle(Constants.BULLET_TURRET.WIDTH.px, Constants.BULLET_TURRET.HEIGHT.px, Constants.BULLET_TURRET.OFFSET_X.px, Constants.BULLET_TURRET.OFFSET_Y.px);
        this.body.setCollisionGroup(UIUtils.tankCollisionGroup);
        this.body.collides([UIUtils.fragmentCollisionGroup, UIUtils.rayCollisionGroup]);

        //create tank treads, base and turret sprites.
        this.leftTread = this.addChild(new Phaser.Image(game, UIConstants.TANK_LEFT_TREAD_X, 0, "game", "tread"));
        this.leftTread.anchor.setTo(0.5, 0.5);
        this.leftTreadShade = this.addChild(new Phaser.Image(game, UIConstants.TANK_LEFT_TREAD_X, 0, "game", "treadShade0"));
        this.leftTreadShade.anchor.setTo(0.5, 0.5);

        this.rightTread = this.addChild(new Phaser.Image(game, UIConstants.TANK_RIGHT_TREAD_X, 0, "game", "tread"));
        this.rightTread.anchor.setTo(0.5, 0.5);
        this.rightTreadShade = this.addChild(new Phaser.Image(game, UIConstants.TANK_RIGHT_TREAD_X, 0, "game", "treadShade0"));
        this.rightTreadShade.anchor.setTo(0.5, 0.5);

        this.turret = this.addChild(new Phaser.Image(game, 0, UIConstants.TANK_TURRET_Y, "game", "turret0"));
        this.turret.animations.add("idleBullet", ["turret0"], 24, false);
        this.turret.animations.add("fireBullet", ["turret1", "turret2"], 24, false).onComplete.add(() => {
            this.turret.animations.play("idleBullet");
        },
        this);
        this.turret.animations.add("idleLaser", ["turret3"], 24, false);
        this.turret.animations.add("idleDoubleBarrel", ["turret4"], 24, false);
        this.turret.animations.add("fireDoubleBarrelLeft", ["turret5", "turret6"], 24, false).onComplete.add(() => {
            this.turret.animations.play("idleDoubleBarrel");
        },
        this);
        this.turret.animations.add("fireDoubleBarrelRight", ["turret7", "turret8"], 24, false).onComplete.add(() => {
            this.turret.animations.play("idleDoubleBarrel");
        },
        this);
        this.turret.animations.add("idleShotgun", ["turret9"], 24, false);
        this.turret.animations.add("fireShotgun", ["turret9", "turret9", "turret9", "turret9", "turret9", "turret9", "turret9", "turret9", "turret9", "turret9", "turret9", "turret10", "turret11", "turret11", "turret11", "turret11", "turret11", "turret11", "turret10", "turret9", "turret9", "turret9", "turret9"], 24, false).onComplete.add(() => {
            this.turret.animations.play("idleShotgun");
        },
        this);
        this.turret.animations.add("idleHomingMissile", ["turret12"], 24, false);
        this.turret.animations.add("fireHomingMissile", ["turret13"], 24, false);
        this.turret.animations.add("idleMine", ["turret14"], 24, false);
        this.turret.animations.add("idleGatlingGun", ["turret15"], 24, false);
        this.turret.animations.add("fireGatlingGun", ["turret15", "turret16"], 24, false).onComplete.add(() => {
            const activeWeapon = this.gameController.getActiveWeapon(this.playerId);
            if (activeWeapon) {
                const frameRate = UIConstants.GATLING_GUN_MIN_ANIMATION_SPEED + Math.floor(UIConstants.GATLING_GUN_ANIMATION_SPEED_RANGE * activeWeapon.getField("weaponCharge"));
                this.turret.animations.play("fireGatlingGun", frameRate);
            }
        },
        this);

        this.turret.anchor.setTo(0.5, 0.5);

        this.leftTreadPosition = 0.0;
        this.rightTreadPosition = 0.0;

        // Disable tank.
        this.kill();
    }

    update() {
        if (!this.exists) {
            return;
        }

        // Update position from game model.
        const tank = this.gameController.getTank(this.playerId);
        if (tank) {
            this.smoothedX = ((this.body.x * this.smoothing) + UIUtils.mpx(tank.getX())) / (this.smoothing + 1);
            this.smoothedY = ((this.body.y * this.smoothing) + UIUtils.mpx(tank.getY())) / (this.smoothing + 1);
            this.smoothedRotation = ((this.body.rotation * this.smoothing) + tank.getRotation()) / (this.smoothing + 1);

            // Move the treads according to UIConstants that define forward/back animation speeds.
            const deltaTime = this.game.time.delta;

            if (tank.getSpeed() > 0.0) {
                const ratio = tank.getSpeed() / Constants.TANK.FORWARD_SPEED.m;
                if (tank.getRotationSpeed() < 0.0) {
                    this.leftTreadPosition += deltaTime * ratio * UIConstants.TANK_TREAD_INNER_FORWARD_SPEED;
                    this.rightTreadPosition += deltaTime * ratio * UIConstants.TANK_TREAD_FORWARD_SPEED;
                } else if (tank.getRotationSpeed() > 0.0) {
                    this.leftTreadPosition += deltaTime * ratio * UIConstants.TANK_TREAD_FORWARD_SPEED;
                    this.rightTreadPosition += deltaTime * ratio * UIConstants.TANK_TREAD_INNER_FORWARD_SPEED;
                } else {
                    this.leftTreadPosition += deltaTime * ratio * UIConstants.TANK_TREAD_FORWARD_SPEED;
                    this.rightTreadPosition += deltaTime * ratio * UIConstants.TANK_TREAD_FORWARD_SPEED;
                }
            } else if (tank.getSpeed() < 0.0) {
                const ratio = -tank.getSpeed() / Constants.TANK.BACK_SPEED.m;
                if (tank.getRotationSpeed() < 0.0) {
                    this.leftTreadPosition -= deltaTime * ratio * UIConstants.TANK_TREAD_INNER_BACK_SPEED;
                    this.rightTreadPosition -= deltaTime * ratio * UIConstants.TANK_TREAD_BACK_SPEED;
                } else if (tank.getRotationSpeed() > 0.0) {
                    this.leftTreadPosition -= deltaTime * ratio * UIConstants.TANK_TREAD_BACK_SPEED;
                    this.rightTreadPosition -= deltaTime * ratio * UIConstants.TANK_TREAD_INNER_BACK_SPEED;
                } else {
                    this.leftTreadPosition -= deltaTime * ratio * UIConstants.TANK_TREAD_BACK_SPEED;
                    this.rightTreadPosition -= deltaTime * ratio * UIConstants.TANK_TREAD_BACK_SPEED;
                }
            } else if (tank.getRotationSpeed() < 0.0) {
                this.leftTreadPosition -= deltaTime * UIConstants.TANK_TREAD_TURN_SPEED;
                this.rightTreadPosition += deltaTime * UIConstants.TANK_TREAD_TURN_SPEED;
            } else if (tank.getRotationSpeed() > 0.0) {
                this.leftTreadPosition += deltaTime * UIConstants.TANK_TREAD_TURN_SPEED;
                this.rightTreadPosition -= deltaTime * UIConstants.TANK_TREAD_TURN_SPEED;
            }

            this.leftTreadPosition = ((this.leftTreadPosition % 12) + 12) % 12;
            this.rightTreadPosition = ((this.rightTreadPosition % 12) + 12) % 12;

            // Update the frames of the tread sprites.
            this.leftTreadShade.frameName = `treadShade${Math.floor(this.leftTreadPosition)}`;
            this.rightTreadShade.frameName = `treadShade${Math.floor(this.rightTreadPosition)}`;

            // Update the weapon if needed.
            const activeWeapon = this.gameController.getActiveWeapon(this.playerId);
            if (activeWeapon) {
                switch (activeWeapon.getType()) {
                    case Constants.WEAPON_TYPES.GATLING_GUN:
                    {
                        this._updateTurret(activeWeapon);
                        this._updateWeaponSound(activeWeapon);
                        break;
                    }
                }
            }
        }
        this.body.x = this.smoothedX;
        this.body.y = this.smoothedY;
        this.body.rotation = this.smoothedRotation;
    }

    spawn(x, y, rotation, playerId, animate, smoothing) {
        // Revive and place the sprite.
        this.reset(x, y);
        this.body.rotation = rotation;
        this.scale.setTo(1.0, 1.0);

        this.smoothedX = x;
        this.smoothedY = y;
        this.smoothedRotation = rotation;
        this.smoothing = smoothing;

        // Reset animations.
        this.turret.animations.play("idleBullet");

        if (animate) {
            this.scale.setTo(0.01, 0.01);
            this.spawnTween = this.game.add.tween(this.scale).to({ x: 1.0, y: 1.0 }, UIConstants.CRATE_SPAWN_TIME, UIUtils.easingCubicBezier(0.01, 1.5, 1.5, 1), true);
            this.spawnTween.onComplete.add(
                () => {
                    this.game.sound.play("tankLand", 0.6);
                    this.dustEmitter.spawn(this.x, this.y);
                },
                this
            );
        }

        // Store playerId.
        this.playerId = playerId;

        // Send request for player details.
        Backend.getPlayerDetails(this.playerId, Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "object") {
                    this.tint = result.getBaseColour().numericValue;
                    this.turret.tint = result.getTurretColour().numericValue;
                    this.leftTread.tint = result.getTreadColour().numericValue;
                    this.rightTread.tint = result.getTreadColour().numericValue;
                } else {
                    this.tint = UIConstants.TANK_UNAVAILABLE_COLOUR.numericValue;
                    this.turret.tint = UIConstants.TANK_UNAVAILABLE_COLOUR.numericValue;
                    this.leftTread.tint = UIConstants.TANK_UNAVAILABLE_COLOUR.numericValue;
                    this.rightTread.tint = UIConstants.TANK_UNAVAILABLE_COLOUR.numericValue;
                }
            });
    }

    addWeapon(weapon, animate) {
        const activeWeapon = this.gameController.getActiveWeapon(this.playerId);

        const defaultWeapon = this.gameController.getDefaultWeapon(this.playerId);
        const queuedWeapons = this.gameController.getQueuedWeapons(this.playerId);

        if (activeWeapon) {
            if (animate) {
                // Only play sound if is not the first weapon added.
                if ((defaultWeapon && weapon.getId() !== defaultWeapon.getId()) || queuedWeapons.length > 0) {
                    // Play sound depending on weapon.
                    switch (weapon.getType()) {
                        case Constants.WEAPON_TYPES.LASER:
                        {
                            this.pickupLaserSound.play();
                            break;
                        }
                        case Constants.WEAPON_TYPES.DOUBLE_BARREL:
                        {
                            this.pickupDoubleBarrelSound.play();
                            break;
                        }
                        case Constants.WEAPON_TYPES.SHOTGUN:
                        {
                            this.pickupShotgunSound.play();
                            break;
                        }
                        case Constants.WEAPON_TYPES.HOMING_MISSILE:
                        {
                            this.pickupMissileSound.play();
                            break;
                        }
                        case Constants.WEAPON_TYPES.MINE:
                        {
                            this.pickupMineSound.play();
                            break;
                        }
                        case Constants.WEAPON_TYPES.GATLING_GUN:
                        {
                            this.pickupGatlingGunSound.play();
                            break;
                        }
                    }
                }
            }

            if (weapon.getId() === activeWeapon.getId()) {
                this._updateTurret(activeWeapon);
            }
        }
    }

    removeWeapon() {
        const activeWeapon = this.gameController.getActiveWeapon(this.playerId);

        if (activeWeapon) {
            // Play load sound if new activate weapon is not default weapon.
            const defaultWeapon = this.gameController.getDefaultWeapon(this.playerId);
            if (activeWeapon !== defaultWeapon) {
                this.loadWeaponSound.play();
            }
            this._updateTurret(activeWeapon);
        }
    }

    addUpgrade(upgrade, animate) {
        if (animate) {
            // Play sound depending on upgrade.
            switch (upgrade.getType()) {
                case Constants.UPGRADE_TYPES.SHIELD:
                {
                    this.pickupShieldSound.play();
                    break;
                }
            }
        }
    }

    fire() {
        const activeWeapon = this.gameController.getActiveWeapon(this.playerId);
        if (activeWeapon) {
            switch (activeWeapon.getType()) {
                case Constants.WEAPON_TYPES.BULLET:
                {
                    this.fireBulletSounds[Math.floor(Math.random() * UIConstants.FIRE_BULLET_AUDIO_COUNT)].play();
                    this.turret.animations.play("fireBullet");
                    break;
                }
                case Constants.WEAPON_TYPES.LASER:
                {
                    this.fireLaserSound.play();
                    break;
                }
                case Constants.WEAPON_TYPES.DOUBLE_BARREL:
                {
                    this.fireBulletSounds[Math.floor(Math.random() * UIConstants.FIRE_BULLET_AUDIO_COUNT)].play();
                    if (activeWeapon.getField("leftBarrel")) {
                        this.turret.animations.play("fireDoubleBarrelLeft");
                    } else {
                        this.turret.animations.play("fireDoubleBarrelRight");
                    }
                    break;
                }
                case Constants.WEAPON_TYPES.SHOTGUN:
                {
                    this.fireShotgunSound.play();
                    this.turret.animations.play("fireShotgun");
                    break;
                }
                case Constants.WEAPON_TYPES.HOMING_MISSILE:
                {
                    this.fireMissileSound.play();
                    this.launchEmitter.spawn(this.x, this.y, this.rotation);
                    this.turret.animations.play("fireHomingMissile");

                    break;
                }
                case Constants.WEAPON_TYPES.MINE:
                {
                    this.fireMineSound.play();
                    break;
                }
                case Constants.WEAPON_TYPES.GATLING_GUN:
                {
                    this.fireBulletSounds[Math.floor(Math.random() * UIConstants.FIRE_BULLET_AUDIO_COUNT)].play();
                    break;
                }
            }
        }
    }

    emptyBarrel() {
        this.emptyBarrelSounds[Math.floor(Math.random() * UIConstants.EMPTY_BARREL_AUDIO_COUNT)].play();
    }

    remove() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        this.holdGatlingGunSound.stop();
        this.dischargeGatlingGunSound.stop();

        // Kill the sprite.
        this.kill();
    }

    retire() {
        if (this.spawnTween) {
            this.spawnTween.stop();
        }

        this.holdGatlingGunSound.stop();
        this.dischargeGatlingGunSound.stop();

        // Kill the sprite.
        this.kill();
    }

    _updateTurret(weapon) {
        // Set correct turret frame.
        switch (weapon.getType()) {
            case Constants.WEAPON_TYPES.BULLET:
            {
                this.turret.animations.play("idleBullet");
                break;
            }
            case Constants.WEAPON_TYPES.LASER:
            {
                this.turret.animations.play("idleLaser");
                break;
            }
            case Constants.WEAPON_TYPES.DOUBLE_BARREL:
            {
                this.turret.animations.play("idleDoubleBarrel");
                break;
            }
            case Constants.WEAPON_TYPES.SHOTGUN:
            {
                this.turret.animations.play("idleShotgun");
                break;
            }
            case Constants.WEAPON_TYPES.HOMING_MISSILE:
            {
                if (!weapon.getField("launched")) {
                    this.turret.animations.play("idleHomingMissile");
                } else {
                    this.turret.animations.play("fireHomingMissile");
                }
                break;
            }
            case Constants.WEAPON_TYPES.MINE:
            {
                this.turret.animations.play("idleMine");
                break;
            }
            case Constants.WEAPON_TYPES.GATLING_GUN:
            {
                const weaponCharge = weapon.getField("weaponCharge");
                if (weaponCharge > 0.0) {
                    const frameRate = UIConstants.GATLING_GUN_MIN_ANIMATION_SPEED + Math.floor(UIConstants.GATLING_GUN_ANIMATION_SPEED_RANGE * weaponCharge);
                    this.turret.animations.play("fireGatlingGun", frameRate);
                } else {
                    this.turret.animations.play("idleGatlingGun");
                }
                break;
            }
        }
    }

    _updateWeaponSound(weapon) {
        switch (weapon.getType()) {
            case Constants.WEAPON_TYPES.GATLING_GUN:
            {
                const weaponCharge = weapon.getField("weaponCharge");
                if (weapon.getField("triggerPulled")) {
                    if (weaponCharge < 1.0) {
                        const startPosition = weaponCharge * 0.6;
                        this.chargeGatlingGunSound.play("", startPosition, 0.6, false, false);
                        this.holdGatlingGunSound.stop();
                        this.dischargeGatlingGunSound.stop();
                    } else {
                        this.chargeGatlingGunSound.stop();
                        this.holdGatlingGunSound.play("", 0, 0.6, true, false);
                        this.dischargeGatlingGunSound.stop();
                    }
                } else if (weaponCharge > 0.0) {
                    const startPosition = ((1.0 - weaponCharge) * 2.0) + 0.1;
                    this.chargeGatlingGunSound.stop();
                    this.holdGatlingGunSound.stop();
                    this.dischargeGatlingGunSound.play("", startPosition, 0.6, false, false);
                }
                break;
            }
        }
    }
}
