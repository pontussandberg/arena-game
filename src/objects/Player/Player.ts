import Phaser, { Game } from "phaser";
import { PLAYER_CONFIG, WeaponId, WEAPONS  } from "./Player.constants";
import { MouseFollower } from "../MouseFollower";
import { PlayerConfig, Weapon } from "./Player.types";
import { Organism } from "../Organism";
import { ProjectileManager } from "../ProjectileManager/ProjectileManager";
import { BaseScene } from "../../scenes/BaseScene";
import { ProjectileId } from "../ProjectileManager/ProjectileManager.constants";
import { Textures } from "../../scenes/Pilot/Pilot.constants";
import { CooldownBar } from "../CooldownBar";
import { ASSET_SCALE } from "../../constants";

const CHARACTER_WIDTH = 35 * ASSET_SCALE;
const CHARACTER_HEIGHT = 88 * ASSET_SCALE;

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

  // Used to set default sprite sheet frame during spear cooldown
  private resetFrameTimeout?: NodeJS.Timeout;
  

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
      config.depth,
      scene.restartScene,
      config.organismOptions
    );
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.config = config;
    this.projectileManager = projectileManager;
    this.setOrigin(0.5, 1)
    this.setSize(CHARACTER_WIDTH, CHARACTER_HEIGHT);
    this.setFrame(1)

    // ################################################################
    // Cooldown bar
    // ################################################################
    this.cooldownBar = new CooldownBar(scene, this);

    // ################################################################
    // Body follower (Togglable spear over head)
    // ################################################################
    const controlledFollowerItems = [
      {
        id: WeaponId.spear,
        texture: Textures.spear,
        x: 0,
        y: -12,
      }
    ];

    // ################################################################
    // Init Mouse Follower
    // ################################################################
    this.mouseFollower = new MouseFollower(
      scene,
      this,
      undefined,
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

    this.equipWeapon(WEAPONS.none);
    this.createAnimations();
  }
  // ################################################################
  // !!! Constructor end
  // ################################################################

  private createAnimations() {
    this.scene.anims.create({
      key: WEAPONS.spear.id, // The name of the animation
      frames: this.scene.anims.generateFrameNames(Textures.player, {
        start: 1, // The first frame of the animation
        end: 2,   // The last frame of the animation
      }),
      
      duration: WEAPONS.spear.attackSpeed, // Duration for the whole animation cycle
      repeat: 0,    // Repeat indefinitely
    });
  }

  public update() {
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
      this.equipWeapon(WEAPONS.none);
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
    this.mouseFollower.update();
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
    if (this.resetFrameTimeout) {
      clearTimeout(this.resetFrameTimeout);
    }

    const { velX, velY } = this.mouseFollower.calcVelocityTowardsMouse(1000, undefined, this.getBody().y);
    
    // Spawn on mouse follower
    const spawnX = this.getBody().x;
    const spawnY = this.getBody().y
    
    // Fire projectile from adjusted position
    this.projectileManager.fireProjectile(
      this,
      velX,
      velY,
      spawnX,
      spawnY,
      ProjectileId.spear,
    );

    // Flip char if throwing towards other dir
    this.forceFlipXOverDuration(velX < 0, WEAPONS.spear.attackSpeed);

    // Set frame to default during cooldown
    this.setFrame(0);
    this.resetFrameTimeout = setTimeout(() => {
      this.setFrame(WEAPONS.spear.spritesheetFrame);
    }, WEAPONS.spear.attackSpeed);

    this.anims.play(WEAPONS.spear.id); // Play the walking animation
  }

  private fireArrow(): void {
    const { velX, velY } = this.mouseFollower.calcVelocityTowardsMouse(1000);
    
    // Calculate correct spawn position
    const OFFSET_X = 30;
    const offsetX = velX > 0 ? OFFSET_X : -OFFSET_X;
    const spawnX = this.x + offsetX;
    const spawnY = this.y - this.height / 2 - 30;
  
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

  equipWeapon(weapon: Weapon): void {
    if (this.equippedWeapon && this.equippedWeapon.id === weapon.id) {
      return;
    }

    this.cooldownBar.startCooldown(weapon?.attackSpeed ?? 0, true);
    this.setFrame(weapon.spritesheetFrame);
    this.equippedWeapon = WEAPONS[weapon.id];
  }

  /**
   * Get typed body
   */
  public getBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
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
    const { velX, velY } = this.mouseFollower.calcVelocityTowardsMouse(this.config.dashVelocity);
    const dashDuration = this.dash(velX, velY, this.config.dashDecayVelocity) / 2;
    const rotateDelay = dashDuration * 0.3;
    const rotateDuration = dashDuration * 0.7;

    // ################################################################
    // Rotate towards dash
    // ################################################################
    this.scene.tweens.killTweensOf(this);
    this.setRotation(this.mouseFollower.calcMouseAngle() + Math.PI / 2);
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
