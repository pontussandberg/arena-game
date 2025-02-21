import Phaser from "phaser";

export default class _ extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    this.setOrigin(0, 0);
    scene.add.existing(this);
  }
}
