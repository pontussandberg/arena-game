import { BaseScene } from "../../scenes/BaseScene";

type ControledItem = {
  id: string;
  texture: string;
  x: number;
  y: number;
  visible?: boolean;
}

const SCALE = 0.8;

export class BodyFollower extends Phaser.GameObjects.Container {
  private objectToFollow: Phaser.GameObjects.Sprite;
  private controlledImages: Map<string, Phaser.GameObjects.Image> = new Map();
  private offsetY: number;
  private hideTimeout: NodeJS.Timeout | null = null;
  
  constructor(
    scene: BaseScene, 
    objectToFollow: Phaser.GameObjects.Sprite,
    depth: number,
    offsetY: number = 0,
    controlledItems?: ControledItem[],
  ) {
    super(scene, objectToFollow.x, objectToFollow.y);
    this.depth = depth;
    this.objectToFollow = objectToFollow;
    this.offsetY = offsetY * SCALE;
    this.scale = SCALE;

    if (controlledItems) {
      controlledItems.forEach((item) => {
        const image = scene.add.image(item.x, item.y, item.texture);
        image.setVisible(!!item.visible);
        this.add(image);
        this.controlledImages.set(item.id, image);
      });
    }

    scene.add.existing(this);
  }

  setControlledItemVisibility(id: string, show: boolean) {
    const found = this.controlledImages.get(id);
    if (found) {
      found.setVisible(show);
    }
  }

  setControlledItemRotation(id: string, radians: number) {
    const found = this.controlledImages.get(id);
    if (found) {
      found.setRotation(radians);
    }
  }

  hideControlledItemOverDuration(id: string, ms: number) {
    this.setControlledItemVisibility(id, false);
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = setTimeout(() => {
      this.setControlledItemVisibility(id, true);
    }, ms);
  }

  private setFollowerPosition() {
    this.setPosition(this.objectToFollow.x, this.objectToFollow.y - (this.objectToFollow.height / 2) + this.offsetY);
  }

  /**
   * Updates the position every render
   */
  public preUpdate(_time: number, _delta: number) {
    this.setFollowerPosition();
  }
}