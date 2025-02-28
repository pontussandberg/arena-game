import { Textures } from "../../scenes/Pilot/Pilot.constants";
import { Player } from "../Player";

interface MouseFollowerOptions {
  depth?: number;
  /**
   * Extra space between the body radius and the follower entity
   */
  radius?: {
    x?: number;
    y?: number;
  },
}

export default class MouseFollower extends Phaser.Physics.Arcade.Sprite {
  private player: Player;
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

  constructor(
    scene: Phaser.Scene, 
    player: Player, 
    texture?: string, 
    options?: MouseFollowerOptions
  ) {
    super(scene, player.x, player.y, texture ?? Textures.pointer);
    this.depth = options?.depth ?? 0;
    this.player = player;
    this.maxRadiusX = options?.radius?.x ?? 0;
    this.maxRadiusY = options?.radius?.y ?? 0;
    this.setMaxRadius(this.maxRadiusX, this.maxRadiusY);

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  setMaxRadius(gapX: number, gapY: number) {
    this.maxRadiusX = gapX;
    this.maxRadiusY = gapY;
  }

  updateTexture(key: Textures | null) {
    if (key === null) {
      this.setVisible(false);
    } else {
      this.setVisible(true);
      this.setTexture(key);
    }
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
  public show() {
    this.setVisible(true);
    this.setAlpha(1);
    this.getBody().setEnable(true);
  }

  // Dont render the object visually and physically
  public hide() {
    this.setVisible(false);
    this.setAlpha(0);
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
    const ellipseValue = (dx * dx) / (this.maxRadiusX * this.maxRadiusX) + (dy * dy) / (this.maxRadiusY * this.maxRadiusY);
  
    // The point is outside the oval, project it back onto the ellipse
    if (ellipseValue > 1) {
      const scaleFactor = Math.sqrt(1 / ellipseValue);
      dx *= scaleFactor;
      dy *= scaleFactor;
    }
  
    // Smoothly move toward the constrained position inside the oval
    this.y += ((this.player.y + dy) - this.y) * this.followSpeed;
    this.x += ((this.player.x + dx) - this.x) * this.followSpeed;
    this.rotation = this.mouseAngle; // Rotate freely when static rotation is not set
  
  }
}
