import { Textures } from "../../scenes/Pilot/Pilot.constants";
import { Player, Weapon } from "../Player";

interface MouseFollowerOptions {
  /**
   * Extra space between the body radius and the follower entity
   */
  radius?: {
    x?: number;
    y?: number;
  };
}

export default class MouseFollower extends Phaser.Physics.Arcade.Sprite {
  private player: Player;
  // Speed factor (closer to 1 = faster)
  private followSpeed: number = 0.8;
  // The angle from player center to mouse position
  public mouseAngle: number = 0;
  // Timeout used to momentarily hide the mouse follower
  private hideTimeout: NodeJS.Timeout | null = null;
  /**
   * Computed max radius for constraint from center of player body
   * This will be calculated as an oval boundary shape
   */
  private maxRadiusX!: number;
  private maxRadiusY!: number;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    texture?: string,
    options?: MouseFollowerOptions
  ) {
    const x = player.x;
    const y = player.y;

    super(scene, x, y, texture ?? Textures.pointer);
    this.depth = player.depth;
    this.player = player;
    this.maxRadiusX = options?.radius?.x ?? 0;
    this.maxRadiusY = options?.radius?.y ?? 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Use POST_UPDATE for movement updates instead of velocity
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.updatePosition, this);
  }

  private updatePosition() {
    const mouseCords = this.getMouseWorldCordinates();
  
    // Adjust for the player's center position considering the origin is at the bottom
    const playerCenterX = this.player.x;
    const playerCenterY = this.player.y - this.player.height / 2; // Adjust for center vertically
  
    let dx = mouseCords.x - playerCenterX;
    let dy = mouseCords.y - playerCenterY;
  
    const distance = Math.sqrt(dx * dx + dy * dy);
  
    // Apply radius constraints if provided
    if (this.maxRadiusX > 0 && this.maxRadiusY > 0) {
      // Calculate the angle to the mouse
      const angle = Math.atan2(dy, dx);
  
      // Clamp the follower's distance to the maximum radius
      const clampedX = Math.cos(angle) * Math.min(this.maxRadiusX, Math.abs(dx));
      const clampedY = Math.sin(angle) * Math.min(this.maxRadiusY, Math.abs(dy));
  
      // Apply the position update while staying within the radius limits
      this.x = Phaser.Math.Linear(this.x, playerCenterX + clampedX, this.followSpeed);
      this.y = Phaser.Math.Linear(this.y, playerCenterY + clampedY, this.followSpeed);
    } else {
      // If no radius is set, move directly towards the mouse position
      this.x = Phaser.Math.Linear(this.x, mouseCords.x, this.followSpeed);
      this.y = Phaser.Math.Linear(this.y, mouseCords.y, this.followSpeed);
    }
  
    // Smoothly rotate towards the mouse position
    const targetAngle = Math.atan2(dy, dx);
    this.rotation = Phaser.Math.Linear(this.rotation, targetAngle, this.followSpeed);
  }

  private getBody() {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  public calcMouseAngle(originX?: number, originY?: number) {
    const mouseCords = this.getMouseWorldCordinates();
    let dx = mouseCords.x - (originX || this.player.x);
    let dy = mouseCords.y - (originY || this.player.y);
    return Math.atan2(dy, dx);
  }

  public calcVelocityTowardsMouse(velocity: number, originX?: number, originY?: number) {
    const angle = this.calcMouseAngle(originX, originY);
    const velX = Math.cos(angle) * velocity;
    const velY = Math.sin(angle) * velocity;
    return {
      velX,
      velY,
    };
  }

  public getMouseWorldCordinates() {
    const { x: cursorX, y: cursorY } = this.scene.input.activePointer;
    const { scrollX, scrollY } = this.scene.cameras.main;
    return {
      x: scrollX + cursorX,
      y: scrollY + cursorY,
    };
  }
}
