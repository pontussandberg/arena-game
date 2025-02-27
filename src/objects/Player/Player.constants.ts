import { PlayerConfig } from "./Player.types";

export const PLAYER_CONFIG: PlayerConfig = {
  depth: 100,
  jumpVelocity: 350,
  dashVelocity: 900,
  strafeCancelSnapVelocity: 100,
  jumpBoostDurationMs: 200,
  dashDelayMs: 500,
  // multiJumpCharges: 3,
   dashCharges: 3,
  // noDashDelay: true,
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
