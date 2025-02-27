import Phaser from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { BodyFollower } from "../BodyFollower/BodyFollower";

const COOLDOWN_BAR = {
  height: 4,
  width: 60,
};

export class CooldownBar extends BodyFollower {
  private bar: Phaser.GameObjects.Graphics;
  public remainingCooldown: number = 0; // Remaining cooldown time
  private cooldown: number = 1; // Prevents division by zero
  private inverse: boolean = false; // Whether the bar should fill up instead of emptying

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
    this.setAlpha(0.75);
  }

  /**
   * Starts the cooldown timer.
   * @param ms Cooldown duration in milliseconds
   * @param inverse If `true`, the bar fills up instead of emptying.
   */
  public startCooldown(ms: number, inverse: boolean = false) {
    // Prevents division by zero
    this.cooldown = Math.max(ms, 1); 
    this.remainingCooldown = ms;
    this.inverse = inverse;
    this.drawBar(); // ✅ Update UI immediately
  }

  public preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.remainingCooldown > 0) {
      this.remainingCooldown -= delta;
    } else {
      this.remainingCooldown = 0;
    }

    this.drawBar(); 
  }

  private drawBar() {
    this.bar.clear();

    // Ensure `progress` is valid and avoid division by zero
    const progress = this.remainingCooldown > 0 
      ? Phaser.Math.Clamp(this.remainingCooldown / this.cooldown, 0, 1)
      : (this.inverse ? 0 : 1); // ✅ Ensures full/empty state when cooldown is 0

    const barProgress = this.inverse ? (1 - progress) : progress;

    this.bar.fillStyle(0xffcc00, 1);
    this.bar.fillRect(
      -COOLDOWN_BAR.width / 2,
      -COOLDOWN_BAR.height / 2,
      COOLDOWN_BAR.width * barProgress,
      COOLDOWN_BAR.height
    );
  }
}
