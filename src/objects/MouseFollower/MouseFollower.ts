import { Textures } from "../../scenes/Pilot/Pilot.constants";
import { Player, Weapon } from "../Player";

type RotateOriginY = "top" | "bottom" | "center";

export default class MouseFollower extends Phaser.Physics.Arcade.Sprite {
  private player: Player;
  // Speed factor (closer to 1 = faster)
  private followSpeed: number = 0.8;
  // The angle from player center to mouse position
  public mouseAngle: number = 0;
  private rotateOriginY: RotateOriginY;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    texture: string,
    // Origin where to rotate the body away from
    rotateOriginY: RotateOriginY = "center",
  ) {
    const x = player.x;
    const y = player.y;

    super(scene, x, y, texture);
    this.depth = player.depth;
    this.player = player;
    this.rotateOriginY = rotateOriginY;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    /**
     * Update position when camera follow updates and after any render.
     * For some reason we get a visual lag without including camera FOLLOW_UPDATE event.
     */
    scene.events.on(
      Phaser.Scenes.Events.POST_UPDATE, 
      () => this.updatePosition(), 
      this.scene
    );
    scene.cameras.main.on(
      Phaser.Cameras.Scene2D.Events.FOLLOW_UPDATE, 
      this.updatePosition, 
      this
    );
  }

  /**
   * Set the location where the mouse follower should originate from
   * when it comes to public calculations or this.rotation
   */
  public setOriginY(rotateOriginY: RotateOriginY) {
    this.rotateOriginY = rotateOriginY;
  }

  /**
   * Get y position based on origin
   */
  private getPlayerY() {
    switch(this.rotateOriginY) {
      case "top":
        return this.player.y - this.player.height;
      case "bottom":
        return this.player.y;
      case "center":
        return this.player.y - this.player.height / 2;
    }
  }

  private updatePosition() {
    const mouseCords = this.getMouseWorldCordinates();
  
    // Adjust for the player's center position considering the origin is at the bottom
    const playerCenterX = this.player.x;
    const playerY = this.getPlayerY();
  
    let dx = mouseCords.x - playerCenterX;
    let dy = mouseCords.y - playerY;

    // If no radius is set, move directly towards the mouse position
    this.x = mouseCords.x;
    this.y = mouseCords.y;
    // Smoothly rotate towards the mouse position
    const targetAngle = Math.atan2(dy, dx);
    this.rotation = Phaser.Math.Linear(this.rotation, targetAngle, this.followSpeed);
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
    const pointer = this.scene.input.activePointer;
    return this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
  }
}
