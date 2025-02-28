import Phaser from "phaser";
import { HealthBar } from "../HealthBar";
import { BaseScene } from "../../scenes/BaseScene";

const MAX_VEL_DECAY_EVENT_DELAY = 16;

export interface OrganismOptions {
  maxHealth: number;
  onDie?: () => void;
  /**
   * Gravity Y
   */
  gravity: number;
  /**
   * Drag, returning velocity back to 0 gradually when no acceleration is applied
   */
  drag: {
    x: number;
    y: number;
  };
  /**
   * Velocity
   */
  maxVelocity: number;
  /**
   * Acceleration when moving
   */
  acceleration: number;
}

export class Organism extends Phaser.Physics.Arcade.Sprite {
  private acceleration: number;
  
  private readonly baseMaxVelocity: number;

  private health: number;
  private maxHealth: number;
  private healthBar: HealthBar;

  private lastDirection: "left" | "right" = "right";
  private onDie?: OrganismOptions["onDie"];

  constructor(
    scene: BaseScene,
    x: number,
    y: number,
    texture: string,
    onDie: () => void,
    {
      maxHealth,
      gravity,
      drag,
      maxVelocity,
      acceleration,
    }: OrganismOptions,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.onDie = onDie;
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.acceleration = acceleration;
    this.baseMaxVelocity = maxVelocity;

    // ################################################################
    // Physics
    // ################################################################
    this.setCollideWorldBounds(true);
    this.setDrag(drag.x, drag.y);
    this.setGravity(0, gravity);
    this.setCollideWorldBounds(true);
    this.setMaxVelocity(maxVelocity);

    // ################################################################
    // HP Bar
    // ################################################################
    this.healthBar = new HealthBar(scene, this, maxHealth, maxHealth, -14);
  }

  /**
   * Set acceleration in a direction
   */
  public moveHorizontal(dir: "left" | "right"): void {
    if (dir === "left") {
      this.setFlipX(true);
      this.setAccelerationX(-this.acceleration);
      this.lastDirection = "left";
    } else if (dir === "right") {
      this.setFlipX(false);
      this.setAccelerationX(this.acceleration);
      this.lastDirection = "right";
    }
  };

  /**
   * Stop acceleration, let drag slow it down
   */
  public stopMovingHorizontal() {
    this.setAccelerationX(0);
  }

  /**
   * Reduce health by amount, will run die() if result is below 0
   */
  public takeDamage(amount: number): void {
    const result = this.health - amount;
    this.healthBar.updateHealth(result);
    this.health = result;

    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    if (this.onDie) {
      this.onDie?.();
    } else {
      this.destroy();
    }
  }

  update() {
    console.log(this.getBody().maxVelocity.x);
    console.log(this.getBody().velocity.x);
    console.log("------------");
  }

  /**
   * Set velocity in a direction
   * Only has an effect when the greater velocity 
   * of input overcaps the max velocity.
   *  1. Max velocity is set to the greater one of input
   *  2. Velocity is set according to input
   *  3  Max velocity decays in velocity units per frame until its back to base velocity
   * 
   * @returns The duration of the dash in miliseconds
   */
  public dash(
    xVel: number, 
    yVel: number, 
    // Velocity decay per frame
    decay: number,
  ): number {
    const dashMaxVel = Math.max(Math.abs(xVel), Math.abs(yVel));
    if (dashMaxVel <= this.getMaxVelocity()) {
      return 0;
    }
    this.setMaxVelocity(dashMaxVel);
    this.setVelocity(xVel, yVel);
    this.decayMaxVelocityToBase(decay);
    return this.calculateDashDuration(dashMaxVel, decay);
  }

  private calculateDashDuration(newMaxVelocity: number, decayRate: number): number {
    if (newMaxVelocity <= this.baseMaxVelocity || decayRate <= 0) {
      return 0; // No decay needed or invalid input
    }
  
    const totalDecay = newMaxVelocity - this.baseMaxVelocity;
    const framesNeeded = totalDecay / decayRate; 
    const duration = framesNeeded * MAX_VEL_DECAY_EVENT_DELAY;
  
    return Math.ceil(duration);
  }  

  private decayMaxVelocityToBase(decay: number) {
    const decayEvent = this.scene.time.addEvent({
      delay: MAX_VEL_DECAY_EVENT_DELAY, // ~1 frame at 60 FPS
      loop: true,
      callback: () => {
        // Ensure to not decay below baseMaxVelocity
        const decayedVelocity = Math.max(this.baseMaxVelocity, this.getMaxVelocity() - decay)
        this.setMaxVelocity(decayedVelocity);

        // Destroy event when reaching base velocity
        if (decayedVelocity === this.baseMaxVelocity) {
          decayEvent.remove();
        }
      },
    });
  }
  

  // ################################################################
  // Setters
  // ################################################################
  public setHealth(hp: number) {
    this.health = hp;
  }

  public setMaxHealth(newMax: number) {
    this.healthBar.updateMaxHealth(newMax);
    if (newMax < this.health) {
      return this.die();
    }
    this.maxHealth = newMax;
  }

  // ################################################################
  // Getters
  // ################################################################
  public getMaxVelocity(): number {
    const { x, y } = this.getBody().maxVelocity;
    return Math.max(x, y);
  }

  public getLastDirection(): "left" | "right" {
    return this.lastDirection;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  /**
   * Get typed body
   */
  public getBody() {
    return this.body as Phaser.Physics.Arcade.Body;
  }
}
