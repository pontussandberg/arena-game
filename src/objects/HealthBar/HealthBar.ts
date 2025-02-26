import Phaser from "phaser";
import { Organism } from "../Organism";

const HP_BAR_WIDTH = 60;
const HP_BAR_HEIGHT = 8;
const HP_SEGMENT_GAP = 25;
const ENABLE_HEALTH_SEGMENTS = false;

export class HealthBar extends Phaser.GameObjects.Container {
  private organism: Organism;
  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBarFill: Phaser.GameObjects.Rectangle;
  private healthBarSlackingFill: Phaser.GameObjects.Rectangle;
  private healthSegments: Phaser.GameObjects.Rectangle[] = [];
  private maxHp: number;
  private hp: number;

  constructor(scene: Phaser.Scene, organism: Organism, hp: number, maxHp: number) {
    super(scene, organism.x, organism.y);
    this.organism = organism;
    this.hp = hp;
    this.maxHp = maxHp;

    scene.add.existing(this);

    // Health Bar Background
    this.healthBarBg = scene.add.rectangle(0, 0, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x555555);
    this.healthBarBg.setOrigin(0.5, 0.5);

    // Health Bar Fill
    this.healthBarFill = scene.add.rectangle(0, 0, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0xE54848);
    this.healthBarFill.setOrigin(0.5, 0.5);
    this.healthBarFill.alpha = 1;

    // Slacking Health Fill (Delayed Effect)
    this.healthBarSlackingFill = scene.add.rectangle(0, 0, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0xE54848);
    this.healthBarSlackingFill.setOrigin(0.5, 0.5);
    this.healthBarSlackingFill.alpha = 0.3;

    // Add elements to container
    this.add(this.healthBarBg);
    this.add(this.healthBarFill);
    this.add(this.healthBarSlackingFill);

    // Init health segments
    this.renderHealthSegments();
  }

  /**
   * Creates small health segment lines at every 25 HP
   */
  private renderHealthSegments() {
    if (!ENABLE_HEALTH_SEGMENTS) {
      return;
    }

    this.healthSegments.forEach(segment => segment.destroy());
    this.healthSegments = [];

    const numSegments = Math.floor(this.maxHp / HP_SEGMENT_GAP);
    const segmentSpacing = HP_BAR_WIDTH / numSegments;

    for (let i = 1; i < numSegments; i++) {
      const x = -HP_BAR_WIDTH / 2 + i * segmentSpacing;
      const segment = this.scene.add.rectangle(x, 0, 1, HP_BAR_HEIGHT, 0xffffff);
      segment.setOrigin(0.5, 0.5);
      segment.alpha = 0.75;
      this.add(segment);
      this.healthSegments.push(segment);
    }
  }

  private setHealthBarPosition() {
    this.setPosition(this.organism.x, this.organism.y - (this.organism.getBody().height / 2) - 30);
  }

  /**
   * Updates the health bar position relative to the organism.
   */
  public preUpdate() {
    this.setHealthBarPosition();
  }

  /**
   * Updates max health and re-renders hp bar segments.
   */
  public updateMaxHealth(maxHp: number) {
    this.maxHp = maxHp;
    this.renderHealthSegments();
  }

  /**
   * Updates health and animates the bar.
   */
  public updateHealth(hp: number) {
    this.hp = Phaser.Math.Clamp(hp, 0, this.maxHp);
    const healthPercent = this.hp / this.maxHp;
    const newWidth = HP_BAR_WIDTH * healthPercent;

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