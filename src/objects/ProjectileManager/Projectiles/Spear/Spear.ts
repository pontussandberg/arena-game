
import { BaseScene } from "../../../../scenes/BaseScene";
import { Textures } from "../../../../scenes/Pilot/Pilot.constants";
import { ProjectileId } from "../../ProjectileManager.constants";
import { BaseProjectile } from "../BaseProjectile";

export class Spear extends BaseProjectile {
  constructor(
    scene: BaseScene, 
    shooter: Phaser.GameObjects.Sprite, 
    startX: number, 
    startY: number, 
    velocityX: number, 
    velocityY: number,
    compensateForShooterMovement?: boolean,
  ) {
    // ################################################################
    // Init
    // ################################################################
    super(
      scene, 
      Textures.spear, 
      startX, 
      startY, 
      velocityX, 
      velocityY, 
      shooter, 
      30, 
      compensateForShooterMovement
    );
  }
}