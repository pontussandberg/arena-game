import Phaser from "phaser";
import { BaseScene } from "../../scenes/BaseScene";

const COOLDOWN_BAR = {
  offsetY: 10,
  height: 4,
  width: 110,

  background: {
    fill: 0x555555,
    alpha: 0.5,
  },
  foreGround: {
    fill: 0xffcc00,
    alpha: 1,
  }
};

export class CooldownBar extends Phaser.GameObjects.Container {
  private bar: Phaser.GameObjects.Graphics;
  private background: Phaser.GameObjects.Graphics;
  public remainingCooldown: number = 0; // Remaining cooldown time
  private cooldown: number = 1; // Prevents division by zero
  private inverse: boolean = false; // Whether the bar should fill up instead of emptying
  private objectToFollow : Phaser.GameObjects.Sprite;

  constructor(
    scene: BaseScene, 
    objectToFollow: Phaser.GameObjects.Sprite,
  ) {  
    super(scene, objectToFollow.x, objectToFollow.y - objectToFollow.height - COOLDOWN_BAR.offsetY + COOLDOWN_BAR.height); // Set position relative to the object
    this.objectToFollow = objectToFollow;
    this.depth = objectToFollow.depth;

    // Background (static, physics-enabled sprite)
    this.background = new Phaser.GameObjects.Graphics(scene);
    this.background.fillStyle(COOLDOWN_BAR.background.fill, COOLDOWN_BAR.background.alpha); // Darker color for the background
    this.background.fillRect(-COOLDOWN_BAR.width / 2, 0, COOLDOWN_BAR.width, COOLDOWN_BAR.height);
    this.add(this.background);  // Add background to the container

    // Foreground (progress bar, physics-enabled sprite)
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.bar.setAlpha(0.75);  // Set transparency for the bar
    this.add(this.bar);  // Add bar to the container

    // Register the container (which contains the bar and background) with the scene
    scene.add.existing(this);

    // Listen to the POST_UPDATE event to update the position and bar behavior
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
  }

  private getY() {
    return 
  }

  /**
   * Starts the cooldown timer.
   * @param ms Cooldown duration in milliseconds
   * @param inverse If `true`, the bar fills up instead of emptying.
   */
  public startCooldown(ms: number, inverse: boolean = false) {
    this.cooldown = Math.max(ms, 1); 
    this.remainingCooldown = ms;
    this.inverse = inverse;
    this.drawBar(); // ✅ Update UI immediately
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
      : (this.inverse ? 0 : 1); // ✅ Ensures full/empty state when cooldown is 0

    const barProgress = this.inverse ? (1 - progress) : progress;

    this.bar.fillStyle(COOLDOWN_BAR.foreGround.fill, COOLDOWN_BAR.foreGround.alpha);
    this.bar.fillRect(
      -COOLDOWN_BAR.width / 2,
      0,
      COOLDOWN_BAR.width * barProgress,
      COOLDOWN_BAR.height
    );
  }

  /**
   * Updates the position of the CooldownBar based on the player position
   */
  public updatePosition() {
    const x = this.objectToFollow.x;
    const y = this.objectToFollow.y - this.objectToFollow.height - COOLDOWN_BAR.offsetY;
    this.setPosition(x, y);  // Update position for the container
  }

  /**
   * Updates the cooldown bar after each POST_UPDATE event.
   */
  update() {
    // Find the player or target to follow (this example assumes `this.scene` has a `player` object)
    
    // Update the position first

    this.updatePosition();
    
    
    // You can add other logic here, like checking cooldown or triggering events
    if (this.remainingCooldown <= 0) {
      // Example of doing something when cooldown is finished
      //console.log("Cooldown finished");
    }
  }
}
