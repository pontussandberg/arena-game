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
  private isJumpLingering: boolean = false;
  private isDroppingThrough: boolean = false;
  private cursors?: Cursors;
  private airDashCount: number = 0;
  private lastDirection: "left" | "right" = "right";
  /**
   * Whenever this is set to a greater value than provided in the config
   * the max movement speed will decay from the value back to base value
   * over a configurable rate.
   */
  private decayingMaxVelocity: number = PLAYER_CONFIG.maxVelocity;
  /**
   * Set from the scene when standing on drop-through platform
   */
  public standingOnPassThroughPlatform: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setGravity(0, PLAYER_CONFIG.gravity);
    this.depth = PLAYER_CONFIG.depth;
    this.setDrag(PLAYER_CONFIG.drag, 0);
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

  getBody() {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  isMaxVelocityDecaying(): boolean {
    return this.decayingMaxVelocity !== PLAYER_CONFIG.maxVelocity
  }

  update() {
    const body = this.getBody();

    // Snap X position when very close to 0 to avoid floting-point drift
    if (Math.abs(body.velocity.x) < 1 && Math.abs(this.x % 1) > 0.01) {
      this.x = Math.round(this.x);
    }

    if (this.cursors) {
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
      } else {
        if (this.isDroppingThrough) {
          this.isDroppingThrough = false;
          setTimeout(() => {
            body.checkCollision.down = true;
          }, 100)
        }
      }

      // ################################################################
      // Air dash
      // ################################################################
      if (
        Phaser.Input.Keyboard.JustDown(this.cursors.SHIFT) &&
        (PLAYER_CONFIG.maxAirDashCount === undefined || PLAYER_CONFIG.maxAirDashCount > this.airDashCount) &&
        !this.isMaxVelocityDecaying()
      ) {
        const { airDashVelocity } = PLAYER_CONFIG;
        let hasDashed = false;
        if (this.cursors.A.isDown) {
          this.setVelocityX(-airDashVelocity);
          hasDashed = true;
        } else if (this.cursors.D.isDown) {
          this.setVelocityX(airDashVelocity);
          hasDashed = true;
        }

        if (hasDashed) {
          this.decayingMaxVelocity = airDashVelocity

          // Allow upwards dash angle when holding W.
          // if (this.cursors.W.isDown) {
          //   this.setVelocityY(-airDashVelocity/4)
          // }
        }
      }
      
      // ################################################################
      // Jump
      // ################################################################
      if (this.cursors.SPACE.isUp) {
        this.isJumpLingering = false;
      }
      if (
        this.cursors.SPACE.isDown 
        && (body.blocked.down || this.isJumpLingering && this.jumpHoldTimeMs <= PLAYER_CONFIG.maxJumpLingeringMs)
      ) {
        // Lingering jump boost tracker
        this.jumpHoldTimeMs = this.jumpHoldTimeMs + this.scene.game.loop.delta;
        this.isJumpLingering = true;
        this.setVelocityY(-PLAYER_CONFIG.jumpVelocity);
      }
      // Multi jump
      else if (
        Phaser.Input.Keyboard.JustDown(this.cursors.SPACE) &&
        (PLAYER_CONFIG.maxMultiJumpCount === undefined || this.multiJumpCounter < PLAYER_CONFIG.maxMultiJumpCount)
      ) {
        this.jumpHoldTimeMs = 0;
        this.setVelocityY(-PLAYER_CONFIG.jumpVelocity);
        this.multiJumpCounter += 1;
      }
      
      // ################################################################
      // Decaying max velocity - gradually decresing decayingMaxVelocity back to the base max velocity
      // ################################################################
      if (this.decayingMaxVelocity !== PLAYER_CONFIG.maxVelocity) {
        const decayAmount = PLAYER_CONFIG.uncappedVelocityDecayRate;
    
        if (this.decayingMaxVelocity > PLAYER_CONFIG.maxVelocity) {
            // Decay towards normal max velocity when above it
            this.decayingMaxVelocity = Math.max(this.decayingMaxVelocity - decayAmount, PLAYER_CONFIG.maxVelocity);
        } else if (this.decayingMaxVelocity < -PLAYER_CONFIG.maxVelocity) {
            // Decay towards negative max velocity when below it (for moving left)
            this.decayingMaxVelocity = Math.min(this.decayingMaxVelocity + decayAmount, -PLAYER_CONFIG.maxVelocity);
        } else {
            // Ensure it locks at the correct speed when within range
            this.decayingMaxVelocity = PLAYER_CONFIG.maxVelocity;
        }
    
        this.setMaxVelocity(Math.abs(this.decayingMaxVelocity));
      }
    }
  }
}
