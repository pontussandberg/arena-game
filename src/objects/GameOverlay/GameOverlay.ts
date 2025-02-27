import Phaser from "phaser";
import { BaseScene } from "../../scenes/BaseScene";

export class GameOverlay extends Phaser.GameObjects.Container {
  constructor(scene: BaseScene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.depth = 10000;
    this.setScrollFactor(0);
  }
}
