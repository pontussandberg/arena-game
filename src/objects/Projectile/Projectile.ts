import Phaser from "phaser";
import { Organism } from "../Organism";

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  shooter: Phaser.GameObjects.Sprite;
  damage: number; 

  constructor(
    scene: Phaser.Scene,
    texture: string,
    startX: number,
    startY: number,
    velocityX: number,
    velocityY: number,
    shooter: Phaser.GameObjects.Sprite,
    damage: number,
  ) {
    super(scene, startX, startY, texture);
    this.shooter = shooter;
    this.damage = damage;

    // Add to scene and enable physics
    scene.add.existing(this);

    // Delay firing until the first update cycle to ensure the physics body is fully initialized. 
    scene.events.once("update", () => {
      if (this.body) {
        this.setVelocity(velocityX, velocityY);
        this.setGravity(0, 700);
        this.setCollideWorldBounds(true);
      }
    });
  }

  preUpdate() {
    if (this.body) {
      // Rotate the projectile based on velocity, taking gravity into account
      const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
      this.setRotation(angle + Phaser.Math.DEG_TO_RAD * 90);
    }
  }

  handleCollision(target: Phaser.GameObjects.GameObject) {
    if (target instanceof Organism) {
      target.takeDamage(this.damage);
      this.destroy();
    }
  }
}