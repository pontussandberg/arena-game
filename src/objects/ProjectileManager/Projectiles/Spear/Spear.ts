
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
    velX: number, 
    velY: number
  ) {
    super(scene, Textures.goldSpear, startX, startY, velX, velY, shooter, 30);
  }
}