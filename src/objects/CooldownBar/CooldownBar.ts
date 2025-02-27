import Phaser from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { BodyFollower } from "../BodyFollower/BodyFollower";

const COOLDOWN_BAR = {
  height: 4,
  width: 60,
};

export class CooldownBar extends BodyFollower {
  private bar: Phaser.GameObjects.Graphics;
  private remainingTime: number = 0; // Remaining cooldown time
  private lastCooldown: number = 0; // Total cooldown duration

  constructor(
    scene: BaseScene, 
    objectToFollow: Phaser.GameObjects.Sprite,
    offsetY: number = 0,
  ) {
    super(scene, objectToFollow, 100000, offsetY);

    // Background (static)
    const background = new Phaser.GameObjects.Graphics(scene);
    background.fillStyle(0x555555, 0.5);
    background.fillRect(-COOLDOWN_BAR.width / 2, -COOLDOWN_BAR.height / 2, COOLDOWN_BAR.width, COOLDOWN_BAR.height);
    this.add(background);

    // Foreground (progress bar)
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.add(this.bar);
    this.setAlpha(0.75)
  }

  public startCooldown(cd: number) {
    this.lastCooldown = cd;
    this.remainingTime = cd;
    this.setVisible(true);
  }

  public preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.remainingTime > 0) {
      this.remainingTime -= delta;
      this.drawBar();
    } else {
      this.setVisible(false);
    }
  }

  private drawBar() {
    this.bar.clear();
    const progress = Phaser.Math.Clamp(this.remainingTime / this.lastCooldown, 0, 1);

    this.bar.fillStyle(0xffcc00, 1);
    this.bar.fillRect(
      -COOLDOWN_BAR.width / 2,
      -COOLDOWN_BAR.height / 2,
      COOLDOWN_BAR.width * progress,
      COOLDOWN_BAR.height
    );
  }
}
