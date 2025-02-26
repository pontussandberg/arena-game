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

    // Doesn't need as long as they are rendered added to a group
    // scene.physics.add.existing(this);
    
    // Delay firing until the first update cycle to ensure the physics body is fully initialized. 
    // When added to a Phaser.Physics.Arcade.Group, the body may not be immediately available,
    // and setting velocity too early can be ignored.
    scene.events.once("update", () => {
      if (this.body) {
        this.setVelocity(velocityX, velocityY);
        this.setGravity(0, 700);
        this.setCollideWorldBounds(true);
      }
    });
  }

  handleCollision(target: Phaser.GameObjects.GameObject) {
    if (target instanceof Organism) {
      target.takeDamage(this.damage);
      this.destroy();
    }
  }
}
