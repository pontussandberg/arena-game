import Phaser from "phaser";
import { Player } from "../Player";
import { HealthBar } from "./HealthBar";

export class GameOverlay extends Phaser.GameObjects.Container {
  private healthBar: HealthBar;

  constructor(scene: Phaser.Scene, player: Player, hp: number, maxHp: number) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.depth = 10000;
    this.setScrollFactor(0);

    // ################################################################
    // HP Bar
    // ################################################################
    this.healthBar = new HealthBar(scene, player, hp, maxHp);
    this.add(this.healthBar);
  }

  // ################################################################
  // HP Bar
  // ################################################################
  public updateHealth(hp: number) {
    this.healthBar.updateHealth(hp);
  }
  public updateMaxHealth(maxHp: number) {
    this.healthBar.updateMaxHealth(maxHp);
  }
}
