import { BaseScene } from "../../scenes/BaseScene";

export class FloatingBar extends Phaser.GameObjects.Container {
  protected objectToFollow: Phaser.GameObjects.Sprite;
  protected offsetY: number;
  public scene: BaseScene;

  constructor(
    scene: BaseScene, 
    objectToFollow: Phaser.GameObjects.Sprite, 
    offsetY: number,
  ) {
    super(
      scene, 
      objectToFollow.x, 
      objectToFollow.y - objectToFollow.height - offsetY
    );
    this.objectToFollow = objectToFollow;
    this.offsetY = offsetY;
    this.depth = objectToFollow.depth;
    this.scene = scene;

    scene.add.existing(this);
    scene.events.on(
      Phaser.Scenes.Events.POST_UPDATE, 
      this.updatePosition, 
      this,
    );
  }

  protected updatePosition() {
    this.setPosition(this.objectToFollow.x, this.objectToFollow.y - this.objectToFollow.height - this.offsetY);
  }
}
