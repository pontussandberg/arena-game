import Phaser from "phaser";
import { HealthBar } from "../HealthBar";

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
}

export class Organism extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private healthBar: HealthBar;
  private onDie?: OrganismOptions["onDie"];

  constructor(
    scene: Phaser.Scene, 
    x: number,
    y: number,
    texture: string,
    onDie: () => void,
    {
      maxHealth,
      gravity,
      drag,
    }: OrganismOptions,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.onDie = onDie;
    this.health = maxHealth;
    this.maxHealth = maxHealth;

    // ################################################################
    // Physics
    // ################################################################
    this.setCollideWorldBounds(true);
    this.setDrag(drag.x, drag.y);
    this.setGravity(0, gravity);
    this.setCollideWorldBounds(true);

    // ################################################################
    // HP Bar
    // ################################################################
    this.healthBar = new HealthBar(scene, this, maxHealth, maxHealth);
  }

  takeDamage(amount: number): void {
    const result = this.health - amount;
    this.healthBar.updateHealth(result);
    this.health = result;
    
    console.log(`${this.texture.key} took ${amount} damage, remaining health: ${this.health}`);

    if (this.health <= 0) {
      this.die();
    }
  }

  setHealth(hp: number) {
    this.health = hp;
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  setMaxHealth(newMax: number) {
    this.healthBar.updateMaxHealth(newMax);
    if (newMax < this.health) {
      return this.die();    
    }
    this.maxHealth = newMax;
  }

  private die(): void {
    if (this.onDie) {
      this.onDie?.();
    } else {
      this.destroy();
    }
  }

  /**
   * Get typed body
   */
  public getBody() {
    return this.body as Phaser.Physics.Arcade.Body;
  }
}
