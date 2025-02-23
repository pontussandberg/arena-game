import { Player } from "../Player";

export default class MouseFollower extends Phaser.Physics.Arcade.Sprite {
  private followSpeed: number = 0.8  ; // Speed factor (closer to 1 = faster)
  private maxRadius: number = 100; // Maximum allowed distance from the player
  private player: Phaser.GameObjects.Sprite; // The player reference

  constructor(scene: Phaser.Scene, player: Player, texture: string) {
    super(scene, player.x, player.y, texture);

    // This
    const gapFromBody = 20;
    this.maxRadius = player.getBody().width + gapFromBody

    scene.add.existing(this);
    scene.physics.add.existing(this); // Add physics body

    this.setCircle(10); // Optional: Set a circular physics body
    this.setCollideWorldBounds(true); // Prevent it from leaving world bounds

    this.player = player;
  }

  update() {
    const pointer = this.scene.input.activePointer;
    const camera = this.scene.cameras.main;

    // Get mouse position in world coordinates
    const targetX = camera.scrollX + pointer.x;
    const targetY = camera.scrollY + pointer.y;

    // Calculate the vector from the player to the pointer
    let dx = targetX - this.player.x;
    let dy = targetY - this.player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.maxRadius) {
      // Limit movement to within the max radius
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * this.maxRadius;
      dy = Math.sin(angle) * this.maxRadius;
    }

    // Smoothly move toward the calculated position
    this.y += ((this.player.y + dy) - this.y) * this.followSpeed;
    this.x += ((this.player.x + dx) - this.x) * this.followSpeed;

    /**
     * Rotate the follower (arrow) to always point toward the player
     * Assumes the static img has the motive pointing down
     */
    this.rotation = Math.atan2(this.player.y - this.y, this.player.x - this.x) + Math.PI / 2;
  }
}
