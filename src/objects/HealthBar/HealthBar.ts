import { BaseScene } from "../../scenes/BaseScene";
import { Organism } from "../Organism";

// constants
const HEALTH_BAR = {
  height: 6,
  width: 60,
  healthSegementHp: 0,
  
  color: {
    background: {
      value: 0x353535,
      alpha: 1,
    },
    fill: {
      value: 0xff5555,
      alpha: 0.6,
    },
    slackingFill: {
      value: 0xff5555,
      alpha: 0.3,
    },
    segment: {
      value: 0xcccccc,
      alpha: 0.6,
    }
  }
};

export class HealthBar {
  private scene: BaseScene;
  private organism: Organism;
  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBarFill: Phaser.GameObjects.Rectangle;
  private healthBarSlackingFill: Phaser.GameObjects.Rectangle;
  private healthSegments: Phaser.GameObjects.Rectangle[] = [];
  private maxHp: number;
  private hp: number;
  private offsetY: number;

  constructor(
    scene: BaseScene,
    organism: Organism,
    hp: number,
    maxHp: number,
    offsetY = 0,
  ) {
    this.scene = scene;
    this.organism = organism;
    this.hp = hp;
    this.maxHp = maxHp;
    this.offsetY = offsetY;

    const { x, y } = this.organism;
    
    // Background health bar
    this.healthBarBg = scene.add.rectangle(x, y + offsetY, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.background.value);
    this.healthBarBg.setAlpha(HEALTH_BAR.color.background.alpha);
    this.healthBarBg.setOrigin(0.5, 0.5);
    this.healthBarBg.depth = organism.depth;

    // Slacking fill
    this.healthBarSlackingFill = scene.add.rectangle(x, y + offsetY, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.slackingFill.value);
    this.healthBarSlackingFill.setAlpha(HEALTH_BAR.color.slackingFill.alpha);
    this.healthBarSlackingFill.setOrigin(0.5, 0.5);
    this.healthBarSlackingFill.depth = organism.depth

    // Active fill
    this.healthBarFill = scene.add.rectangle(x, y + offsetY, HEALTH_BAR.width, HEALTH_BAR.height, HEALTH_BAR.color.fill.value);
    this.healthBarFill.setAlpha(HEALTH_BAR.color.fill.alpha);
    this.healthBarFill.setOrigin(0.5, 0.5);
    this.healthBarFill.depth = organism.depth

    this.renderHealthSegments();
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.updatePosition, this);
  }

  private updatePosition() {
    const x = this.organism.x;
    const y = this.organism.y + this.offsetY;
  
    this.healthBarBg.setPosition(x, y);
    this.healthBarFill.setPosition(x, y);
    this.healthBarSlackingFill.setPosition(x, y);
  
    this.renderHealthSegments();
  }
  

  public updateMaxHealth(newMaxHp: number) {
    this.maxHp = newMaxHp;
    this.renderHealthSegments();
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
    // Don't render segments if set to 0
    if (HEALTH_BAR.healthSegementHp === 0) {
      return;
    }

    this.healthSegments.forEach(segment => segment.destroy()); // Remove existing segments
    this.healthSegments = [];
    
    const segmentWidth = 1; // Width of each segment
    //const segmentsToRender = this.maxHp / HEALTH_BAR.healthSegementHp; // Calculate how many segments (50 HP per segment)
    const segmentsToRender = Math.floor(this.maxHp / HEALTH_BAR.healthSegementHp); // Calculate how many segments (50 HP per segment)
    // Total width the segments should span
    const totalWidth = HEALTH_BAR.width / segmentsToRender;
    for (let i = 1; i < segmentsToRender; i++) { 
      const segmentX = this.healthBarBg.x - (this.healthBarBg.width / 2) + i * totalWidth;      
      const segment = this.scene.add.rectangle(segmentX, this.healthBarBg.y, segmentWidth, HEALTH_BAR.height, HEALTH_BAR.color.segment.value); 
      segment.setAlpha(HEALTH_BAR.color.segment.alpha);
      this.healthSegments.push(segment);
    }
  } 
}