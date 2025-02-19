import Phaser from "phaser";
import playerTexture from "../../assets/player.png"; // Import texture
import { COLLISION_CATEGORY } from "../../constants";
import { PLAYER_MOVEMENT } from "./Player.constants";
import { PLATFORM_ROOF_LABEL } from "../Platform/Platform.constants";

export default class Player extends Phaser.Physics.Matter.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isJumping: boolean = false;
  private multiJumpCounter: number = 0;
  private jumpHoldTimeMs: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, "player");
    scene.add.existing(this);
    this.setDepth(10);

    // Configure physics properties
    this.setFixedRotation();
    this.setFriction(0.02);
    this.setBounce(0);





    // Set collision categories
    this.setCollisionCategory(COLLISION_CATEGORY.player);
    this.setCollidesWith([COLLISION_CATEGORY.platform]);

    // Store input keys
    this.cursors = scene.input.keyboard!.createCursorKeys();

    // Detect ground collision
    
    this.setOnCollide((d: any) => {
      console.log("==>",d.bodyA.bounds.max.y)
    
      // Typeguard
      if (!d?.bodyA || !d?.bodyB) return; 
      
      // Find objects
      const playerBody = d.bodyA === this.body ? d.bodyA : d.bodyB;
      const otherBody = playerBody === d.bodyA ? d.bodyB : d.bodyA;
      if (otherBody.label === PLATFORM_ROOF_LABEL) {
        if (this.body && this.body.velocity.y < 0) {
          console.log("Ignoring topSensor collision while moving up", this.body.velocity.y);
          
          // ✅ Disable collision with the topSensor
          this.setCollidesWith([]);
          
          return; // Ignore the collision
        } else {
          
          this.isJumping = false;
          this.jumpHoldTimeMs = 0;
          this.multiJumpCounter = 0;
        }
      }

      console.log(d)
      
      /**
      // Check if the player’s bottom is colliding with the top of another object
      const isBottomTouching = Math.floor(Math.abs(playerBody.bounds.max.y - otherBody.bounds.min.y - 1)) === 0;
      
      if (isBottomTouching) {
        console.log("Player is standing on an object");
        this.isJumping = false;
        this.jumpHoldTimeMs = 0;
        this.multiJumpCounter = 0;
      }
        **/
    });
  }

  update() {
    this.handleMovement();
    if (this.body && this.body.velocity.y > 0) {
      this.setCollidesWith([COLLISION_CATEGORY.platform])
    } else {
      this.setCollidesWith([]);
    }
    console.log(this)

  }

  private handleMovement() {
    // Move left & right
    if (this.cursors.left.isDown) {
      this.setVelocityX(-PLAYER_MOVEMENT.runSpeed);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(PLAYER_MOVEMENT.runSpeed);
    } else {
      this.setVelocityX(0);
    }

    // Jump logic
    if ((!this.isJumping || this.jumpHoldTimeMs < PLAYER_MOVEMENT.maxJumpLingeringMs) && this.cursors.up.isDown) {
      this.isJumping = true;
      this.setVelocityY(-PLAYER_MOVEMENT.jumpSpeed);
    }
    // Multi-jump (Double jump, etc.)
    else if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) &&
      this.isJumping &&
      this.multiJumpCounter <= PLAYER_MOVEMENT.maxMultiJumpCount
    ) {
      this.jumpHoldTimeMs = 0;
      this.setVelocityY(-PLAYER_MOVEMENT.jumpSpeed);
      this.multiJumpCounter++;
    }

    // Track jump hold time
    if (this.isJumping) {
      this.jumpHoldTimeMs += this.scene.game.loop.delta;
    }
  }
}
