import { Player } from "../Player";

export default class MouseFollower extends Phaser.Physics.Arcade.Sprite {
  private player: Phaser.GameObjects.Sprite;
  // Speed factor (closer to 1 = faster)
  private followSpeed: number = 0.8; 
   // Maximum allowed distance from the player
  private maxRadius: number = 100;
  // The angle from player center to mouse position
  public mouseAngle: number = 0;
  // Timeout used to momentarely hide the mouse follower
  private hideTimeout: NodeJS.Timeout | null = null;

  constructor(scene: Phaser.Scene, player: Player, texture: string, depth: number) {
    super(scene, player.x, player.y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this); // Add physics body
    this.depth = depth;

    const gapFromBody = 20;
    this.maxRadius = player.getBody().width + gapFromBody
    this.player = player;
  }

  private getBody() {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  public hideOverDuration(ms: number) {
    this.hide();
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.hideTimeout = setTimeout(() => {
      this.show();
    }, ms) ;
  }

  // Render the object visually and physically
  private show() {
    this.setVisible(true);
    this.setAlpha(1);

    // Enable physics
    this.getBody().setEnable(true);
  }

  // Dont render the object visually and physically
  private hide() {
    this.setVisible(false);
    this.setAlpha(0);

    // Disable physics
    this.getBody().setEnable(false);
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

    // Store angle on instance for external access
    const angle = Math.atan2(dy, dx);
    this.mouseAngle = angle;

    if (distance > this.maxRadius) {
      // Limit movement to within the max radius
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
