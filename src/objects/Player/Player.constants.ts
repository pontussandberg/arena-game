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
  none = "none",
  bow = "bow",
  spear = "spear",
}
export const WEAPONS: WeaponMap = {
  [WeaponId.none]: {
    id: WeaponId.none,
    spritesheetFrame: 0,
    attackSpeed: 0,
    mouseFollower: {
      texture: Textures.pointer,
      radius: {
        x: 60,
        y: 90,
      },
    },
  },
  [WeaponId.bow]: {
    id: WeaponId.bow,
    spritesheetFrame: 0,
    attackSpeed: 400,
    mouseFollower: {
      texture: Textures.bow,
      radius: {
        x: 60,
        y: 90,
      },
    },
  },
  [WeaponId.spear]: {
    id: WeaponId.spear,
    spritesheetFrame: 0,
    attackSpeed: 1000,
    mouseFollower: {
      texture: Textures.spear,
      staticPosition: {
        offsetX: 0,
        offsetY: -75,
      },
    },
  },
}