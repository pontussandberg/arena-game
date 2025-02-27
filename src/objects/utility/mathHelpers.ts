/**
 * Get the mathematical radians for velocity angle and offset for the 90deg image
 */
export const velocityToProjectileRadius = (velX: number, velY: number) => 
  Math.atan2(velY, velX) + Phaser.Math.DEG_TO_RAD * 90;