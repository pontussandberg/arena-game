import { BaseScene } from "../../scenes/BaseScene";
import { Organism } from "../Organism";

const HEALTH_BAR = {
  height: 8,
  width: 110,
  /**
   * Cooldownbar.height + Cooldownbar.offsetY will place
   * Healthbar on top of Cooldownbar
   */
  offsetY: 10,
  color: {
    background: { value: 0x353535, alpha: 0.5 },
    fill: { value: 0xff5555, alpha: 0.6 },
    slackingFill: { value: 0xff5555, alpha: 0.3 },
    segment: { value: 0xcccccc, alpha: 0.6 },
  },
};

export class HealthBar extends Phaser.GameObjects.Container {
  private organism: Organism;
  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBarFill: Phaser.GameObjects.Rectangle;
  private healthBarSlackingFill: Phaser.GameObjects.Rectangle;
  private healthSegments: Phaser.GameObjects.Rectangle[] = [];
  private maxHp: number;
  private hp: number;
  private offsetY: number;

  constructor(scene: BaseScene, organism: Organism, hp: number, maxHp: number) {
    const offsetY = 0 - organism.height - HEALTH_BAR.offsetY;
    super(scene, organism.x, organism.y + offsetY);

    this.organism = organism;
    this.hp = hp;
    this.maxHp = maxHp + 100;
    this.offsetY = offsetY;
    this.depth = organism.depth;

    // Background health bar
    this.healthBarBg = scene.add.rectangle(0, 0, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.background.value);
    this.healthBarBg.setAlpha(HEALTH_BAR.color.background.alpha);
    this.healthBarBg.setOrigin(0.5, 1);

    // Slacking fill
    this.healthBarSlackingFill = scene.add.rectangle(0, 0, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.slackingFill.value);
    this.healthBarSlackingFill.setAlpha(HEALTH_BAR.color.slackingFill.alpha);
    this.healthBarSlackingFill.setOrigin(0.5, 1);

    // Active fill
    this.healthBarFill = scene.add.rectangle(0, 0, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.fill.value);
    this.healthBarFill.setAlpha(HEALTH_BAR.color.fill.alpha);
    this.healthBarFill.setOrigin(0.5, 1);

    this.add([this.healthBarBg, this.healthBarSlackingFill, this.healthBarFill]);
    this.renderHealthSegments();
    
    scene.add.existing(this);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
  }

  private updatePosition() {
    this.setPosition(this.organism.x, this.organism.y + this.offsetY);
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

  private renderHealthSegments() {
    return;
    this.healthSegments.forEach(segment => segment.destroy());
    this.healthSegments = [];

    const segmentWidth = 1;
    const segmentsToRender = Math.floor(this.maxHp / HEALTH_BAR.height);
    const totalWidth = HEALTH_BAR.width / segmentsToRender;

    for (let i = 1; i < segmentsToRender; i++) {
      const segmentX = -HEALTH_BAR.width / 2 + i * totalWidth;
      const segment = this.scene.add.rectangle(segmentX, 0, segmentWidth, HEALTH_BAR.height, HEALTH_BAR.color.segment.value);
      segment.setAlpha(HEALTH_BAR.color.segment.alpha);
      this.add(segment);
      this.healthSegments.push(segment);
    }
  }

  update() {
    this.updatePosition();
  }
}
