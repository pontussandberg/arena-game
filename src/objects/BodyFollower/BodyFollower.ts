import { BaseScene } from "../../scenes/BaseScene";

export class BodyFollower extends Phaser.GameObjects.Sprite {
  private objectToFollow: Phaser.GameObjects.Sprite;
  private offsetTop: number;

  constructor(scene: BaseScene, texture: string, objectToFollow: Phaser.GameObjects.Sprite, offsetTop: number = 0) {
    super( 
      scene,
      objectToFollow.x,
      objectToFollow.y - offsetTop,
      texture,
    );
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.offsetTop = offsetTop;
    this.objectToFollow = objectToFollow;
  }

  private setFollowerPosition() {
    this.setPosition(this.objectToFollow.x, this.objectToFollow.y - (this.objectToFollow.height / 2) - this.offsetTop);
  }

  /**
   * Updates the position every render
   */
  public preUpdate() {
    this.setFollowerPosition();
  }

}