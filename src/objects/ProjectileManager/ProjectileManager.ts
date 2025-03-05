import Phaser from "phaser";
import { Arrow } from "./Projectiles/Arrow/Arrow";
import { Spear } from "./Projectiles/Spear/Spear";
import { BaseScene } from "../../scenes/BaseScene";
import { PROJECTILE_DIMENSIONS, ProjectileId } from "./ProjectileManager.constants";

/**
 * This should be instantiated in a scene instance where collisions are set.
 */
export class ProjectileManager {
  private scene: BaseScene;
  private projectiles: Phaser.Physics.Arcade.Group;

  constructor(scene: BaseScene) {
    this.scene = scene;

    this.projectiles = this.scene.physics.add.group({
      runChildUpdate: true,
    });
  }

  private factoryProjectile(
    shooter: Phaser.GameObjects.Sprite,
    velocityX: number,
    velocityY: number,
    startX: number,
    startY: number,
    type: ProjectileId,
  ) {
    switch (type) {
      case ProjectileId.arrow:
        return new Arrow(
          this.scene,      
          shooter,
          startX,
          startY,
          velocityX,
          velocityY,
        );
      case ProjectileId.spear:
        return new Spear(
          this.scene,      
          shooter,
          startX,
          startY,
          velocityX,
          velocityY,
        );
    }
  }

  /**
   * Adds a new Projectile to the manager Physics Group
   */
  fireProjectile(
    shooter: Phaser.GameObjects.Sprite,
    velocityX: number,
    velocityY: number,
    startX: number,
    startY: number,
    type: ProjectileId,
  ) {
    const projectile = this.factoryProjectile(
      shooter,
      velocityX,
      velocityY,
      startX,
      startY,
      type,
    );

    this.projectiles.add(projectile);
  }

  /**
   * Returns the projectile group so the scene can set up its own collisions
   */
  getProjectilesGroup() {
    return this.projectiles;
  }
}
