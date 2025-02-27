
import { BaseScene } from "../../../../scenes/BaseScene";
import { Textures } from "../../../../scenes/Pilot/Pilot.constants";
import { PROJECTILE_DIMENSIONS } from "../../ProjectileManager.constants";
import { BaseProjectile } from "../BaseProjectile";

/**
 * Expects input coordinates to be at the middle edge of the bow.
 */
const getStartOffset = (bowRotation: number, arrowHeight: number) => {
  // The offset for the arrow's rear end from the bow's middle edge.
  // We use the bow's rotation to calculate this offset.
  const offsetX = Math.cos(bowRotation) * (arrowHeight / 2);
  const offsetY = Math.sin(bowRotation) * (arrowHeight / 2);
  return { offsetX, offsetY };
};

export class Arrow extends BaseProjectile {
  constructor(
    scene: BaseScene, 
    shooter: Phaser.GameObjects.Sprite, 
    startX: number, 
    startY: number, 
    velX: number, 
    velY: number,
  ) {

    // Calculate spawn position so that the rear edge of it
    const arrowRotation = Math.atan2(velY, velX); // Angle in radians
    const { offsetX, offsetY } = getStartOffset(arrowRotation, PROJECTILE_DIMENSIONS.arrow.height);
    const arrowBottomEdgeX = startX + offsetX;
    const arrowBottomEdgeY = startY + offsetY;

    super(scene, Textures.defaultArrow, arrowBottomEdgeX, arrowBottomEdgeY, velX, velY, shooter, 10);


    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.world.enable(this);
  }
}
