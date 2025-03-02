import Phaser, { Game } from "phaser";
import { PLAYER_CONFIG, WeaponId, WEAPONS  } from "./Player.constants";
import { MouseFollower } from "../MouseFollower";
import { PlayerConfig, Weapon } from "./Player.types";
import { Organism } from "../Organism";
import { ProjectileManager } from "../ProjectileManager/ProjectileManager";
import { BaseScene } from "../../scenes/BaseScene";
import { ProjectileId } from "../ProjectileManager/ProjectileManager.constants";
import { Textures } from "../../scenes/Pilot/Pilot.constants";
import { BodyFollower } from "../BodyFollower/BodyFollower";
import { CooldownBar } from "../CooldownBar";

const SPEAR_FIXED_TOP_OFFSET = -40;
const DASH_ROTATION_DURATION = 500;

interface Cursors {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  SPACE: Phaser.Input.Keyboard.Key;
  SHIFT: Phaser.Input.Keyboard.Key;
  ONE: Phaser.Input.Keyboard.Key;
  TWO: Phaser.Input.Keyboard.Key;
  THREE: Phaser.Input.Keyboard.Key;
}

export default class Player extends Organism {
  private config: PlayerConfig;
  private mouseFollower!: MouseFollower;
  private multiJumpCounter: number = 0;
  private jumpHoldTimeMs: number = 0;
  private isJumpHolding: boolean = false;
  private isDroppingThrough: boolean = false;
  private cursors?: Cursors;
  private airDashCount: number = 0;
  private projectileManager!: ProjectileManager;
  private lastDashTime: number = 0;
  private cooldownBar: CooldownBar;
  /**
   * Must be set to true from the scene it's rendered from in order for the
   * drop-through mechanic to work.
   */
  public standingOnPassThroughPlatform: boolean = false;
  private equippedWeapon: Weapon | null = null;
  private bodyFollower: BodyFollower;

  constructor(
    scene: BaseScene,
    x: number,
    y: number,
    texture: string,
    projectileManager: ProjectileManager,
    config: PlayerConfig = PLAYER_CONFIG,
  ) {
    super(
      scene,
      x,
      y,
      texture,
      scene.restartScene,
      config.organismOptions
    );
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.config = config;
    this.depth = config.depth;
    this.projectileManager = projectileManager;

    // ################################################################
    // Cooldown bar
    // ################################################################
    this.cooldownBar = new CooldownBar(scene, this, -19);

    // ################################################################
    // Body follower (Togglable spear over head)
    // ################################################################
    const controlledFollowerItems = [
      {
        id: WeaponId.spear,
        texture: Textures.goldSpear,
        x: 0,
        y: -12,
      }
    ];
    this.bodyFollower = new BodyFollower(scene, this, config.depth, SPEAR_FIXED_TOP_OFFSET, controlledFollowerItems)

    // ################################################################
    // Init Mouse Follower
    // ################################################################
    this.mouseFollower = new MouseFollower(
      scene,
      this,
      undefined,
      { depth: config.depth },
    );

    // Input
    if (scene.input.keyboard) {
      this.cursors = {
        W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        SHIFT: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        ONE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
        TWO: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
        THREE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      };
    }

    // Shoot event
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.attack();
      }
    });

    this.equipWeapon(null);
  }

  public update() {
    this.mouseFollower.update();

    /**
     * Rotate the fixed bodyfollower item towards mouse pos (spear above head)
     */
    this.bodyFollower.setControlledItemRotation(
      WeaponId.spear,
      this.mouseFollower.mouseAngle
    );

    if (!this.cursors) {
      return;
    }

    const body = this.getBody();

    // Snap X position when very close to 0 to avoid floting-point drift
    if (Math.abs(body.velocity.x) < 1 && Math.abs(this.x % 1) > 0.01) {
      this.x = Math.round(this.x);
    }

    // ################################################################
    // Reset
    // ################################################################
    if (body.touching.down) {
      this.jumpHoldTimeMs = 0;
      this.multiJumpCounter = 0;
      this.airDashCount = 0;
    } else {
      this.standingOnPassThroughPlatform = false;
    }

    // ################################################################
    // Strafe cancel, strafe snapping
    // !! Needs to be run before setting current call's "lastDirection"
    // ################################################################
    if (
      this.getLastDirection() === "right" &&
      Phaser.Input.Keyboard.JustDown(this.cursors.A) &&
      body.velocity.x > this.config.strafeCancelSnapVelocity
    ) {
      this.setVelocityX(this.config.strafeCancelSnapVelocity);
    } else if (
      this.getLastDirection() === "left" &&
      Phaser.Input.Keyboard.JustDown(this.cursors.D) &&
      body.velocity.x < (-this.config.strafeCancelSnapVelocity)
    ) {
      this.setVelocityX(-this.config.strafeCancelSnapVelocity);
    }

    // ################################################################
    // Move horizontally
    // ################################################################
    if (this.cursors.A.isDown) {
      this.moveHorizontal("left");
    } else if (this.cursors.D.isDown) {
      this.moveHorizontal("right");
    } else {
      this.stopMovingHorizontal();
    }

    // ################################################################
    // Attack
    // ################################################################
    if (Phaser.Input.Keyboard.JustDown(this.cursors.W)) {
      this.attack();
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.cursors.ONE)) {
      this.equipWeapon(null);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.TWO)) {
      this.equipWeapon(WEAPONS.spear);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.THREE)) {
      this.equipWeapon(WEAPONS.bow);
    }

    // ################################################################
    // Drop through platform
    // ################################################################
    if (this.cursors.S.isDown && this.standingOnPassThroughPlatform) {
      this.isDroppingThrough = true;
      body.checkCollision.down = false;
      this.setVelocityY(200);
    } else if (this.isDroppingThrough) {
      this.isDroppingThrough = false;
      setTimeout(() => {
        body.checkCollision.down = true;
      }, 100)
    }

    // ################################################################
    // Dash
    // ################################################################
    if (Phaser.Input.Keyboard.JustDown(this.cursors.SHIFT)) {
      this.performDash();
    }

    // ################################################################
    // Jump
    // ################################################################
    if (this.cursors.SPACE.isUp) {
      this.isJumpHolding = false;
      this.jumpHoldTimeMs = 0;
    } else {
      /**
       * Jump boosting - hold to keep jump velocity for a moment
       */
      if (this.isJumpHolding && this.canJumpBoost()) {
        this.jumpHoldTimeMs = this.jumpHoldTimeMs + this.scene.game.loop.delta;
        this.performJump();
      }
      /**
       * Standing on ground - initate jump
       */
      else if (body.blocked.down) {
        this.isJumpHolding = true;
        this.multiJumpCounter = 0;
        this.performJump();
      }
      /**
       * Is in air, perform multijump if:
       * - it's the first event from current key press
       * - and has not consumed all jump charges
       */
      else if (
        Phaser.Input.Keyboard.JustDown(this.cursors.SPACE)
        && (
          this.config.multiJumpCharges === undefined
          || this.config.multiJumpCharges > this.multiJumpCounter
        )
      ) {
        this.multiJumpCounter++
        this.performJump();
      }
    }
  }

  // ################################################################
  // Weapon mechanics
  // ################################################################
  private canAttack(): boolean {
    return this.cooldownBar.remainingCooldown === 0;
  }

  private attack(): void {
    if (this.canAttack()) {
      this.cooldownBar.startCooldown(this.equippedWeapon?.attackSpeed ?? 0);

      if (this.equippedWeapon?.id === WeaponId.spear) {
        this.throwSpear();
      } else if (this.equippedWeapon?.id === WeaponId.bow) {
        this.fireArrow();
      }
    }
  }
  
  private throwSpear(): void {
    const { velX, velY } = this.getVelocityTowardsMouse(1000);
    this.bodyFollower.hideControlledItemOverDuration(WeaponId.spear, WEAPONS[WeaponId.spear].attackSpeed)
  
    // Calculate correct spawn position
    const spawnX = this.getBody().x;
    const spawnY = this.getBody().y + SPEAR_FIXED_TOP_OFFSET;
    
    // Fire projectile from adjusted position
    this.projectileManager.fireProjectile(
      this,
      velX,
      velY,
      spawnX,
      spawnY,
      ProjectileId.goldSpear,
    );
  }

  private fireArrow(): void {
    const { velX, velY } = this.getVelocityTowardsMouse(1000);
    
    // Bow dimensions
    const bowWidth = this.mouseFollower.width; // Assuming it's set correctly
    const spawnOffset = bowWidth / 2; // Move the arrow outward
  
    // Bow's rotation in radians
    const angle = this.mouseFollower.rotation;
  
    // Calculate correct spawn position
    const spawnX = this.mouseFollower.x + Math.cos(angle) * spawnOffset;
    const spawnY = this.mouseFollower.y + Math.sin(angle) * spawnOffset;
  
    // Fire projectile from adjusted position
    this.projectileManager.fireProjectile(
      this,
      velX,
      velY,
      spawnX,
      spawnY,
      ProjectileId.arrow,
    );
  }

  equipWeapon(weapon: Weapon | null): void {
  this.cooldownBar.startCooldown(weapon?.attackSpeed ?? 0, true);
    
    /**
     * No weapon equipped
     */
    if (!weapon) {
      this.bodyFollower.setControlledItemVisibility(WeaponId.spear, false)
      this.mouseFollower.setMaxRadius(65, 85);
      this.mouseFollower.updateTexture(Textures.pointer);
      this.equippedWeapon = null;
    } else if (weapon.id === WeaponId.bow) {
      this.bodyFollower.setControlledItemVisibility(WeaponId.spear, false)
      this.mouseFollower.setMaxRadius(weapon.mouseFollower.radius.x, weapon.mouseFollower.radius.y);
      this.mouseFollower.updateTexture(Textures.bow);
      this.equippedWeapon = WEAPONS.bow;
    } else if (weapon.id === WeaponId.spear) {
      this.bodyFollower.setControlledItemVisibility(WeaponId.spear, true)
      this.mouseFollower.updateTexture(null);
      this.equippedWeapon = WEAPONS.spear;
    }
  }

  /**
   * Get typed body
   */
  public getBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  /**
   * Get a velocity in the direction of the mouse mouseFollower.mouseAngle
   */
  private getVelocityTowardsMouse(velocity: number): {
    velX: number;
    velY: number;
  } {
    const angle = this.mouseFollower.mouseAngle;
    const velX = Math.cos(angle) * velocity;
    const velY = Math.sin(angle) * velocity;
    return {
      velX,
      velY,
    };
  }

  private performJump(): void {
    this.setVelocityY(-this.config.jumpVelocity);
  }

  private resetRotation(duration: number): void {
    this.scene.tweens.add({
      targets: this,
      rotation: 0,  // Reset back to default upright position
      duration: duration,  // Time in ms for smooth transition
      ease: "Quad.easeOut",  // Smooth easing effect
    });
  }

  private canDash(): boolean {
    return (
      (!this.config.dashDelayMs || this.scene.time.now - (this.lastDashTime || 0) >= this.config.dashDelayMs)
      && (!this.config.dashCharges || this.config.dashCharges > this.airDashCount)
    );
  }
  
  private performDash(): void {
    if (!this.canDash()) {
      return;
    }
    // ################################################################
    // Limiter counters
    // ################################################################
    this.lastDashTime = this.scene.time.now;
    this.airDashCount++;

    // ################################################################
    // Dash velocity handled on Organism
    // ################################################################
    const { velX, velY } = this.getVelocityTowardsMouse(this.config.dashVelocity);
    const dashDuration = this.dash(velX, velY, this.config.dashDecayVelocity) / 2;
    const rotateDelay = dashDuration * 0.3;
    const rotateDuration = dashDuration * 0.7;

    // ################################################################
    // Rotate towards dash
    // ################################################################
    this.scene.tweens.killTweensOf(this);
    this.setRotation(this.mouseFollower.mouseAngle + Math.PI / 2);
    this.scene.time.addEvent({
      delay: rotateDelay, // Wait before starting reset
      callback: () => this.resetRotation(rotateDuration),
      callbackScope: this,
    });
  }

  private canJumpBoost(): boolean {
    return this.jumpHoldTimeMs < this.config.jumpBoostDurationMs
  }
}
