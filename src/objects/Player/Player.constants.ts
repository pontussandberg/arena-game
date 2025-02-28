import { Textures } from "../../scenes/Pilot/Pilot.constants";
import { PlayerConfig, Weapon, WeaponMap } from "./Player.types";

export const PLAYER_CONFIG: PlayerConfig = {
  // multiJumpCharges: 3,
  // noDashDelay: true,
  depth: 100,
  jumpVelocity: 350,
  strafeCancelSnapVelocity: 100,
  jumpBoostDurationMs: 200,
  dashDelayMs: 500,
  dashVelocity: 1000,
  dashCharges: 3,
  dashDecayVelocity: 5,
  overcappedVelocityDecayRate: 10,
  organismOptions: {
    acceleration: 1000,
    maxVelocity: 500,
    maxHealth: 100,
    gravity: 700,
    drag: {
      x: 1000,
      y: 100,
    },
  },
};

export enum WeaponId {
  bow = "bow",
  spear = "spear",
}
export const WEAPONS: WeaponMap = {
  [WeaponId.bow]: {
    id: WeaponId.bow,
    mouseFollowerTexture: Textures.bow,
    attackSpeed: 400,
    mouseFollower: {
      radius: {
        x: 60,
        y: 90,
      },
    },
  },
  [WeaponId.spear]: {
    id: WeaponId.spear,
    mouseFollowerTexture: Textures.pointer,
    attackSpeed: 1000,
    mouseFollower: {
      radius: {
        x: 70,
        y: 80,
      },
    },
  },
}