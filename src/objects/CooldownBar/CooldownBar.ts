import { BaseScene } from "../../scenes/BaseScene";
import { FloatingBar } from "../FloatingBar";

const COOLDOWN_BAR = {
  offsetY: 10,
  height: 4,
  width: 110,
  background: { fill: 0x555555, alpha: 0.5 },
  foreGround: { fill: 0xffcc00, alpha: 1 },
};

export class CooldownBar extends FloatingBar {
  private bar: Phaser.GameObjects.Graphics;
  private background: Phaser.GameObjects.Graphics;
  public remainingCooldown: number = 0;
  private cooldown: number = 1;
  private inverse: boolean = false;

  constructor(scene: BaseScene, objectToFollow: Phaser.GameObjects.Sprite) {
    super(scene, objectToFollow, COOLDOWN_BAR.offsetY);

    // Background
    this.background = new Phaser.GameObjects.Graphics(scene);
    this.background.fillStyle(COOLDOWN_BAR.background.fill, COOLDOWN_BAR.background.alpha);
    this.background.fillRect(-COOLDOWN_BAR.width / 2, 0, COOLDOWN_BAR.width, COOLDOWN_BAR.height);
    this.add(this.background);

    // Foreground (progress bar)
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.bar.setAlpha(0.75);
    this.add(this.bar);
  }

  public startCooldown(ms: number, inverse: boolean = false) {
    this.cooldown = Math.max(ms, 1);
    this.remainingCooldown = ms;
    this.inverse = inverse;
    this.drawBar();
  }

  public preUpdate(time: number, delta: number) {
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
      : (this.inverse ? 0 : 1);

    const barProgress = this.inverse ? (1 - progress) : progress;

    this.bar.fillStyle(COOLDOWN_BAR.foreGround.fill, COOLDOWN_BAR.foreGround.alpha);
    this.bar.fillRect(-COOLDOWN_BAR.width / 2, 0, COOLDOWN_BAR.width * barProgress, COOLDOWN_BAR.height);
  }
}
