import { BaseScene } from "../../scenes/BaseScene";
import { FloatingBar } from "../FloatingBar";
import { Organism } from "../Organism";

const HEALTH_BAR = {
  height: 8,
  width: 110,
  offsetY: 10,
  color: {
    background: { value: 0x353535, alpha: 0.5 },
    fill: { value: 0xff5555, alpha: 0.6 },
    slackingFill: { value: 0xff5555, alpha: 0.3 },
  },
};

export class HealthBar extends FloatingBar {
  private healthBarFill: Phaser.GameObjects.Rectangle;
  private healthBarSlackingFill: Phaser.GameObjects.Rectangle;
  private maxHp: number;
  private hp: number;

  constructor(scene: BaseScene, organism: Organism, hp: number, maxHp: number) {
    super(scene, organism, HEALTH_BAR.offsetY);

    this.hp = hp;
    this.maxHp = maxHp;

    // Background
    const healthBarBg = scene.add.rectangle(0, 0, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.background.value);
    healthBarBg.setAlpha(HEALTH_BAR.color.background.alpha);
    healthBarBg.setOrigin(0.5, 1);
    this.add(healthBarBg);

    // Slacking fill
    this.healthBarSlackingFill = scene.add.rectangle(0, 0, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.slackingFill.value);
    this.healthBarSlackingFill.setAlpha(HEALTH_BAR.color.slackingFill.alpha);
    this.healthBarSlackingFill.setOrigin(0.5, 1);
    this.add(this.healthBarSlackingFill);

    // Active fill
    this.healthBarFill = scene.add.rectangle(0, 0, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.fill.value);
    this.healthBarFill.setAlpha(HEALTH_BAR.color.fill.alpha);
    this.healthBarFill.setOrigin(0.5, 1);
    this.add(this.healthBarFill);
  }

  public updateHealth(newHp: number) {
    this.hp = Phaser.Math.Clamp(newHp, 0, this.maxHp);
    const newWidth = (this.hp / this.maxHp) * HEALTH_BAR.width;

    this.scene.tweens.add({
      targets: this.healthBarFill,
      width: newWidth,
      duration: 150,
      ease: "Cubic.easeOut",
    });

    this.scene.tweens.add({
      targets: this.healthBarSlackingFill,
      width: newWidth,
      duration: 600,
      ease: "Cubic.easeOut",
      delay: 300,
    });
  }
}
