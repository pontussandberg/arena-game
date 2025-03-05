import Phaser from "phaser";
import { Organism } from "../../Organism";
import { velocityToProjectileRadius } from "../../utility/mathHelpers";

export class BaseProjectile extends Phaser.Physics.Arcade.Sprite {
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
    compensateForShooterMovement = true,
  ) {
    // ################################################################
    // Compensate for shooter velocity
    // ################################################################
    const compensateFactor = 1;
    const shouldCompensateX = compensateForShooterMovement && 
      Math.sign(velocityX) === Math.sign(shooter.body?.velocity?.x ?? 0);
    const shouldCompensateY = compensateForShooterMovement &&
      Math.sign(velocityY) === Math.sign(shooter.body?.velocity?.y ?? 0);
    /**
     * Define the final velocity including compensation
     */
    const { velX, velY } = !compensateForShooterMovement
      ? { 
          velX: velocityX, 
          velY: velocityY, 
        } 
      : {
          velX: velocityX + (shouldCompensateX ? (shooter.body?.velocity?.x ?? 0) * compensateFactor : 0),
          velY: velocityY + (shouldCompensateY ? (shooter.body?.velocity?.y ?? 0) * compensateFactor : 0),
        };

    super(scene, startX, startY, texture);
    this.shooter = shooter;
    this.damage = damage;
    this.rotation = Math.atan2(velY, velX);

    // Add to scene and enable physics
    scene.add.existing(this);
    
    // Delay firing until the first update cycle to ensure the physics body is fully initialized.
    scene.events.once("update", () => {
      if (this.body) {
        this.setVelocity(velX, velY + Phaser.Math.DEG_TO_RAD * 90);
        this.setGravity(0, 700);
        this.setCollideWorldBounds(true);
      }
    });
  }

  /**
   * Rotate the projectile based on velocity, taking gravity into account
   */
  private rotateInDirection(velocityX?: number, velocityY?: number) {
    if (this.body) {
      const velX = velocityX ?? this.body.velocity.x;
      const velY = velocityY ?? this.body.velocity.y;

      // Need this since the first update cycle doesn't have velocityX and velocityY
      if (velX === 0 && velY === 0) {
        return;
      }
      
      this.setRotation(Math.atan2(velY, velX));
    }
  }

  preUpdate() {
    this.rotateInDirection();
  }

  handleCollision(target: Phaser.GameObjects.GameObject) {
    if (target !== this.shooter && target instanceof Organism) {
      target.takeDamage(this.damage);
      this.destroy();
    }
  }
}
