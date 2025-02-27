import { ProjectileDimensions } from "./ProjectileManager.types";

/**
 * Map of all projectile types
 */
export enum ProjectileId {
  arrow = "arrow",
  goldSpear = "goldSpear",
};

export const PROJECTILE_TEXTURE_MAP = {
  [ProjectileId.arrow]: "defaultArrow",
  [ProjectileId.goldSpear]: "goldSpear",
};

export const PROJECTILE_DIMENSIONS: Record<ProjectileId, ProjectileDimensions> = {
  [ProjectileId.arrow]: {
    width: 6,
    height: 37,
  },
  [ProjectileId.goldSpear]: {
    width: 9,
    height: 121,
  },
};
