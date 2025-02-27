import Phaser from "phaser";
import { HealthBar } from "../HealthBar";
import { BaseScene } from "../../scenes/BaseScene";

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
  private health: number;
  private maxHealth: number;
  private healthBar: HealthBar;
  private acceleration: number;
  private maxVelocity: number;
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
    this.maxVelocity = acceleration;

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
    return this.maxVelocity;
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
