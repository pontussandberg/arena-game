import Phaser from "phaser";
import { PLAYER_CONFIG  } from "./Player.constants";
import { MouseFollower } from "../MouseFollower";
import { PlayerConfig } from "./Player.types";

interface Cursors {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  SPACE: Phaser.Input.Keyboard.Key;
  SHIFT: Phaser.Input.Keyboard.Key;
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private config: PlayerConfig;
  private mouseFollower!: MouseFollower;
  private multiJumpCounter: number = 0;
  private jumpHoldTimeMs: number = 0;
  private isJumpHolding: boolean = false;
  private isDroppingThrough: boolean = false;
  private cursors?: Cursors;
  private airDashCount: number = 0;
  private lastDirection: "left" | "right" = "right";
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
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    texture: string, 
    config: PlayerConfig = PLAYER_CONFIG,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.config = config;
    this.depth = config.depth;
    this.overcappedMaxVelocity = config.overcappedVelocityDecayRate;

    // Init mouse follower
    this.mouseFollower = new MouseFollower(scene, this, "bow");

    // Physics
    this.setCollideWorldBounds(true);
    this.setGravity(0, this.config.gravity);
    this.setDrag(this.config.drag.x, this.config.drag.y);
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

  private applyVelocityTowardsArrow(velocity: number) {
    // Get direction vector from player to MouseFollower
    const dx = this.mouseFollower.x - this.x;
    const dy = this.mouseFollower.y - this.y;
  
    // Normalize the direction vector (to ensure consistent movement speed)
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return; // Prevent division by zero
  
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
  
    // Apply velocity in that direction
    this.setVelocity(normalizedDx * velocity, normalizedDy * velocity);
  }
  

  public getBody() {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  private isMaxVelocityDecaying(): boolean {
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

  private performDash() {
    this.airDashCount++;
    this.overcappedMaxVelocity = this.config.dashVelocity;
    this.applyVelocityTowardsArrow(this.config.dashVelocity);
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
    // Flip sprite asset to match velocity
    // ################################################################
    if (body.velocity.x > 0) {
      this.setFlipX(false);
    } else if (body.velocity.x < 0) {
      this.setFlipX(true);
    }

    // ################################################################
    // Move horizontally
    // ################################################################
    if (this.cursors.A.isDown) {
      this.setAccelerationX(-this.config.acceleration);
      this.lastDirection = "left";
    } else if (this.cursors.D.isDown) {
      this.setAccelerationX(this.config.acceleration);
      this.lastDirection = "right";
    } else {
      // Stop applying force, let drag slow it down
      this.setAccelerationX(0); 
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
      && !this.isMaxVelocityDecaying()
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
