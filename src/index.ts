import Phaser from "phaser";
import boxSmall from "./assets/box_small.png"
import boxLarge from "./assets/box_large.png"
import ground from "./assets/ground.png"
import player from "./assets/player.png"
import cloud1 from "./assets/clouds/cloud_1.png"
import cloud2 from "./assets/clouds/cloud_2.png"
import cloud3 from "./assets/clouds/cloud_3.png"
import "./index.css"

const CANVAS = {
  width: 1200,
  height: 850,
};

const playerMovement = {
  runSpeed: 400,
  jumpSpeed: 400,
  maxMultiJumpCount: 2,
  maxJumpLingeringMs: 100,
};

class Scene1 extends Phaser.Scene {
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private staticPlatforms: Phaser.Physics.Arcade.StaticGroup | null = null;
  private clouds: Phaser.Physics.Arcade.StaticGroup | null = null;
  private multiJumpCounter: number = 0;
  private isJumping: boolean = false;
  private jumpHoldTimeMs: number = 0;

  preload() {
    this.load.image('boxSmall', boxSmall);
    this.load.image('boxLarge', boxLarge);
    this.load.image('ground', ground);
    this.load.image('player', player);
    this.load.image('cloud1', cloud1);
    this.load.image('cloud2', cloud2);
    this.load.image('cloud3', cloud3);
  }

  create() {
    this.cameras.main.setBackgroundColor('93A55E');

    // ################################################################
    // Player
    // ################################################################
    this.player = this.physics.add.sprite(700, 400, 'player');
    this.player.setGravityY(300);
    this.player.setCollideWorldBounds(true);

    // ################################################################
    // Platforms
    // ################################################################
    this.staticPlatforms = this.physics.add.staticGroup();
    this.staticPlatforms.create(600, CANVAS.height - 79 / 2, 'ground');
    this.staticPlatforms.create(600, CANVAS.height - 79 - 255 / 2, 'boxLarge');
    this.staticPlatforms.create(400, CANVAS.height - 79 - 213 / 2, 'boxSmall');
    this.physics.add.collider(this.player, this.staticPlatforms);
    this.staticPlatforms.children.iterate((platform) => {
      if (!this.player) {
        // Exit
        return false;
      }
      const platformBody = platform.body as Phaser.Physics.Arcade.StaticBody;
      platformBody.checkCollision.left = false;
      platformBody.checkCollision.right = false;
      // Continue
      return true;
    });

    // ################################################################
    // Clouds
    // ################################################################
    this.clouds = this.physics.add.staticGroup();
    this.clouds.create(170, 130, "cloud1");
    this.clouds.create(700, 75, "cloud1");
    this.clouds.create(435, 200, "cloud2");
    this.clouds.create(1000, 110, "cloud3");
    this.physics.add.collider(this.player, this.clouds);

    // ################################################################
    // Initiate cursor
    // ################################################################
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
  }

  update() {
    // ################################################################
    // Inputs
    // ################################################################
    if (this.cursors && this.player) {
      // ################################################################
      // Move horizontally
      // ################################################################
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-playerMovement.runSpeed);
      }
      else if (this.cursors.right.isDown) {
        this.player.setVelocityX(playerMovement.runSpeed);
      }
      else {
        this.player.setVelocityX(0);
      }

      
      // ################################################################
      // Jump
      // ################################################################
      // Reset jump trackers when touching ground
      if (this.player.body.touching.down) {
        this.isJumping = false;
        this.jumpHoldTimeMs = 0;
        this.multiJumpCounter = 0;
      }

      // Give velocity upwards when jumping from ground or have lingering jump and holding jump pressed
      if (
        this.cursors.up.isDown 
        && (this.player.body.touching.down || this.jumpHoldTimeMs <= playerMovement.maxJumpLingeringMs)
      ) {
        this.isJumping = true;
        this.player.setVelocityY(-playerMovement.jumpSpeed);
      }
      // Multi jump
      else if (
        Phaser.Input.Keyboard.JustDown(this.cursors.up) &&
        this.isJumping &&
        this.multiJumpCounter <= playerMovement.maxMultiJumpCount
      ) {
        this.jumpHoldTimeMs = 0;
        this.player.setVelocityY(-playerMovement.jumpSpeed);
        this.multiJumpCounter++
      }

      // Track time in air, this is reset whenever multi jump is triggered
      if (this.isJumping) {
        this.jumpHoldTimeMs = this.jumpHoldTimeMs + this.game.loop.delta
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: CANVAS.width,
  height: CANVAS.height,
  scene: Scene1,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800, x: 0 }
    }
  }
};

const game = new Phaser.Game(config);
