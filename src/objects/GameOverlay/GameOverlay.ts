import Phaser from "phaser";
import { Player } from "../Player";

export class GameOverlay extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, player: Player, hp: number, maxHp: number) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.depth = 10000;
    this.setScrollFactor(0);
  }
}
