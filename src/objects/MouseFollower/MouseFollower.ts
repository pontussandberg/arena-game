import { Player } from "../Player";

interface MouseFollowerOptions {
  depth?: number;
  /**
   * Extra space between the body radius and the follower entity
   */
  radiusGap?: {
    x?: number;
    y?: number
  }
}

export default class MouseFollower extends Phaser.Physics.Arcade.Sprite {
  private player!: Player;
  // Speed factor (closer to 1 = faster)
  private followSpeed: number = 0.8; 
  // The angle from player center to mouse position
  public mouseAngle: number = 0;
  // Timeout used to momentarely hide the mouse follower
  private hideTimeout: NodeJS.Timeout | null = null;

  /**
   * Computed max radius for contraint from center of player body
   * This will be calculated as an oval boundry shape
   */
  private maxRadiusX!: number;
  private maxRadiusY!: number;

  constructor(scene: Phaser.Scene, player: Player, texture: string, options: MouseFollowerOptions) {
    super(scene, player.x, player.y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.depth = options.depth ?? 0;

    /**
     * Compute max radius for x and y
     */
    const { width: playerWidth, height: playerHeight } = player.getBody();
    this.maxRadiusX = (options.radiusGap?.x ?? 0) + (playerWidth / 2);
    this.maxRadiusY = (options.radiusGap?.y ?? 0) + (playerHeight / 2);

    // Store player
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

    // Store angle for external use
    this.mouseAngle = Math.atan2(dy, dx);

    // Check if the point is outside the oval constraint
    const { height: playerHeight, width: playerWidth } = this.player.getBody();
    const ellipseValue = (dx * dx) / (this.maxRadiusX * this.maxRadiusX) + (dy * dy) / (this.maxRadiusY * this.maxRadiusY);

    if (ellipseValue > 1) {
      // The point is outside the oval, project it back onto the ellipse
      const scaleFactor = Math.sqrt(1 / ellipseValue); 
      dx *= scaleFactor;
      dy *= scaleFactor;
    }

    // Smoothly move toward the constrained position inside the oval
    this.y += ((this.player.y + dy) - this.y) * this.followSpeed;
    this.x += ((this.player.x + dx) - this.x) * this.followSpeed;

    // ✅ Keep rotation so the asset points toward the player
    this.rotation = this.mouseAngle;
  }
}
