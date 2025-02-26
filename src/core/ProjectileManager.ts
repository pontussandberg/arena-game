import Phaser from "phaser";
import { Projectile } from "../objects/Projectile";

export class ProjectileManager {
  private scene: Phaser.Scene;
  private projectiles: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.projectiles = this.scene.physics.add.group({
      classType: Projectile,
      runChildUpdate: true,
    });
  }

  /** Adds a new projectile to the manager */
  fireProjectile(
    shooter: Phaser.GameObjects.Sprite,
    texture: string,
    velocityX: number,
    velocityY: number,
    damage: number,
    startX?: number,
    startY?: number,
  ) {
    const x = startX ?? shooter.x;
    const y = startY ?? shooter.y;

    const projectile = new Projectile(
      this.scene,
      texture,
      x,
      y,
      velocityX,
      velocityY,
      shooter,
      damage,
    );

    this.projectiles.add(projectile);
  }

  /** Returns the projectile group so the scene can set up its own collisions */
  getProjectilesGroup() {
    return this.projectiles;
  }
}
