import Phaser from "phaser";
import { PLAYER_CONFIG  } from "./Player.constants";
import { MouseFollower } from "../MouseFollower";
import { PlayerConfig } from "./Player.types";
import { GameOverlay } from "../GameOverlay";
import { Organism } from "../Organism";
import { ProjectileManager } from "../../core/ProjectileManager";
import BaseScene from "../../Scenes/BaseScene";

interface Cursors {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  SPACE: Phaser.Input.Keyboard.Key;
  SHIFT: Phaser.Input.Keyboard.Key;
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
  private lastDirection: "left" | "right" = "right";
  private projectileManager!: ProjectileManager;
  /**
   * Whenever this is set to a greater value than provided in the config
   * the max movement velocity will decay from the value back to base value
   * over a configurable rate.
   */
  private overcappedMaxVelocity!: number;
  /**
   * Must be set to true from the scene it's rendered from in order for the
   * drop-through mechanic to work.
   */
  public standingOnPassThroughPlatform: boolean = false;

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
    this.config = config;
    this.depth = config.depth;
    this.overcappedMaxVelocity = config.overcappedVelocityDecayRate;
    this.projectileManager = projectileManager;
    
    // ################################################################
    // Init Game Overlay
    // ################################################################
    /**
    this.gameOverlay = new GameOverlay(
      scene, 
      this, 
      this.getHealth(), 
      this.getMaxHealth()
    );
    */

    // ################################################################
    // Init Mouse Follower
    // ################################################################
    this.mouseFollower = new MouseFollower(
      scene, 
      this, 
      "bow", 
      {
        depth: config.depth,
        radiusGap: {
          x: 40,
          y: 20,
        }
      }
    );

    // Physics
    this.setMaxVelocity(this.config.maxVelocity);

    // Input
    if (scene.input.keyboard) {
      this.cursors = {
        W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        SHIFT: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      };
    }
  }

  public getBaseMaxVelocity() {
    return this.config.maxVelocity;
  }

  /**
   * Get typed body
   */
  public getBody() {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  /**
   * Apply a velocity towards mouseFollower.mouseAngle
   */
  private applyVelocityTowardsMouse(velocity: number) {
    const { velX, velY } = this.getVelocityTowardsMouse(velocity);
    this.overcappedMaxVelocity = this.config.dashVelocity;
    this.setFlipX(velX < 0);
    this.setVelocity(velX, velY);
  }

  /**
   * Get a velocity in the direction of the mouse mouseFollower.mouseAngle
   */
  private getVelocityTowardsMouse(velocity: number) {
    const angle = this.mouseFollower.mouseAngle;
    const velX = Math.cos(angle) * velocity;
    const velY = Math.sin(angle) * velocity;
    return {
      velX,
      velY,
    };
  }

  /**
   * Check if velocity is overcapped with overcappedMaxVelocity
   */
  private hasOvercappedMaxVelocity(): boolean {
    return this.overcappedMaxVelocity !== this.config.maxVelocity
  }

  // ################################################################
  // Overcapped max velocity  
  // - Gradually decresing overcappedMaxVelocity back to the base max velocity
  // ################################################################
  private decayOvercappedVelocity(): void {
    if (this.overcappedMaxVelocity > this.config.maxVelocity) {
      if (this.overcappedMaxVelocity > this.config.maxVelocity) {
        // Decay towards normal max velocity when above it
        this.overcappedMaxVelocity = Math.max(
          this.overcappedMaxVelocity - this.config.overcappedVelocityDecayRate, 
          this.config.maxVelocity
        );
      } else {
        // Ensure it locks at the correct speed when within range
        this.overcappedMaxVelocity = this.config.maxVelocity;
      }
  
      // Update player velocity
      this.setMaxVelocity(Math.abs(this.overcappedMaxVelocity));
    } else {
      this.setMaxVelocity(this.config.maxVelocity);
      this.overcappedMaxVelocity = this.config.maxVelocity;
    }
  }

  private performJump() {
    this.setVelocityY(-this.config.jumpVelocity);
  }

  private resetRotation() {
    this.scene.tweens.add({
      targets: this,
      rotation: 0,  // Reset back to default upright position
      duration: 500,  // Time in ms for smooth transition
      ease: "Quad.easeOut",  // Smooth easing effect
    });
  }  

  private performDash() {
    this.airDashCount++;
    this.applyVelocityTowardsMouse(this.config.dashVelocity);
    this.mouseFollower.hideOverDuration(700);

    // ################################################################
    // Rotate towards dash
    // ################################################################
    // Cancel any existing rotation tweens before applying a new dash rotation
    this.scene.tweens.killTweensOf(this);
    this.setRotation(this.mouseFollower.mouseAngle + Math.PI / 2);
    this.scene.time.addEvent({
      delay: 300, // Wait before starting reset
      callback: () => this.resetRotation(),
      callbackScope: this,
    });
  }

  private canJumpBoost(): boolean {
    return this.jumpHoldTimeMs < this.config.jumpBoostDurationMs
  }

  public update() {
    this.mouseFollower.update();
     
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
      this.lastDirection === "right" &&
      Phaser.Input.Keyboard.JustDown(this.cursors.A) &&
      body.velocity.x > this.config.strafeCancelSnapVelocity
    ) {
      this.setVelocityX(this.config.strafeCancelSnapVelocity);
    } else if (
      this.lastDirection === "left" &&
      Phaser.Input.Keyboard.JustDown(this.cursors.D) &&
      body.velocity.x < (-this.config.strafeCancelSnapVelocity)
    ) {
      this.setVelocityX(-this.config.strafeCancelSnapVelocity);
    }

    // ################################################################
    // Move horizontally
    // ################################################################
    if (this.cursors.A.isDown) {
      this.setFlipX(true);
      this.setAccelerationX(-this.config.acceleration);
      this.lastDirection = "left";
    } else if (this.cursors.D.isDown) {
      this.setFlipX(false);
      this.setAccelerationX(this.config.acceleration);
      this.lastDirection = "right";
    } else {
      // Stop applying force, let drag slow it down
      this.setAccelerationX(0); 
    }

    // ################################################################
    // Fire arrow
    // ################################################################
    if (Phaser.Input.Keyboard.JustDown(this.cursors.W)) {
      const { velX, velY } = this.getVelocityTowardsMouse(1000);
      this.projectileManager.fireProjectile(
        this, 
        "arrow", 
        velX, 
        velY,
        15,
        this.mouseFollower.x,
        this.mouseFollower.y,
      );
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
    if (
      this.cursors.SHIFT.isDown 
      && (this.config.noDashDelay || !this.hasOvercappedMaxVelocity())
      && (
        this.config.dashCharges === undefined 
        || this.config.dashCharges > this.airDashCount
      ) 
    ) {
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

    // Decay overcapped velocity back to normal cap
    this.decayOvercappedVelocity();  
  }
}
