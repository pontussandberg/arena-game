import Phaser from "phaser";
import { PLAYER_CONFIG } from "./Player.constants";

interface Cursors {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  SPACE: Phaser.Input.Keyboard.Key;
  SHIFT: Phaser.Input.Keyboard.Key;
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
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
  private overcappedMaxVelocity: number = PLAYER_CONFIG.maxVelocity;
  /**
   * Must be set to true from the scene it's rendered from in order for the
   * drop-through mechanic to work.
   */
  public standingOnPassThroughPlatform: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setGravity(0, PLAYER_CONFIG.gravity);
    this.depth = PLAYER_CONFIG.depth;
    this.setDrag(PLAYER_CONFIG.drag.x, PLAYER_CONFIG.drag.y);
    this.setMaxVelocity(PLAYER_CONFIG.maxVelocity);

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

  public getBody() {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  private isMaxVelocityDecaying(): boolean {
    return this.overcappedMaxVelocity !== PLAYER_CONFIG.maxVelocity
  }

  // ################################################################
  // Overcapped max velocity  
  // - Gradually decresing overcappedMaxVelocity back to the base max velocity
  // ################################################################
  private decayOvercappedVelocity(): void {
    if (this.overcappedMaxVelocity > PLAYER_CONFIG.maxVelocity) {
      if (this.overcappedMaxVelocity > PLAYER_CONFIG.maxVelocity) {
        // Decay towards normal max velocity when above it
        this.overcappedMaxVelocity = Math.max(
          this.overcappedMaxVelocity - PLAYER_CONFIG.overcappedVelocityDecayRate, 
          PLAYER_CONFIG.maxVelocity
        );
      } else {
        // Ensure it locks at the correct speed when within range
        this.overcappedMaxVelocity = PLAYER_CONFIG.maxVelocity;
      }
  
      // Update player velocity
      this.setMaxVelocity(Math.abs(this.overcappedMaxVelocity));
    } else {
      this.setMaxVelocity(PLAYER_CONFIG.maxVelocity);
    }
  }

  private performJump() {
    this.setVelocityY(-PLAYER_CONFIG.jumpVelocity);
  }

  private performDash(dir: "left" | "right") {
    this.airDashCount++;
    this.overcappedMaxVelocity = PLAYER_CONFIG.dashVelocity;
    this.setVelocityX(
      dir === "right" 
        ? PLAYER_CONFIG.dashVelocity
        : -PLAYER_CONFIG.dashVelocity
    );
  }

  private canJumpBoost(): boolean {
    return this.jumpHoldTimeMs < PLAYER_CONFIG.jumpBoostDurationMs
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
      this.lastDirection === "right" &&
      Phaser.Input.Keyboard.JustDown(this.cursors.A) &&
      body.velocity.x > PLAYER_CONFIG.strafeCancelSnapVelocity
    ) {
      this.setVelocityX(PLAYER_CONFIG.strafeCancelSnapVelocity);
    } else if (
      this.lastDirection === "left" &&
      Phaser.Input.Keyboard.JustDown(this.cursors.D) &&
      body.velocity.x < (-PLAYER_CONFIG.strafeCancelSnapVelocity)
    ) {
      this.setVelocityX(-PLAYER_CONFIG.strafeCancelSnapVelocity);
    }

    // ################################################################
    // Move horizontally
    // ################################################################
    if (this.cursors.A.isDown) {
      this.setAccelerationX(-PLAYER_CONFIG.acceleration);
      this.lastDirection = "left";
    } else if (this.cursors.D.isDown) {
      this.setAccelerationX(PLAYER_CONFIG.acceleration);
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
        PLAYER_CONFIG.dashCharges === undefined 
        || PLAYER_CONFIG.dashCharges > this.airDashCount
      ) 
    ) {
      if (this.cursors.A.isDown) {
        this.performDash("left");
      } else if (this.cursors.D.isDown) {
        this.performDash("right");
      }
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
          PLAYER_CONFIG.multiJumpCharges === undefined 
          || PLAYER_CONFIG.multiJumpCharges > this.multiJumpCounter
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
