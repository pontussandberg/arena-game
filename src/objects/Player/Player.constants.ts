import { PlayerConfig } from "./Player.types";

export const PLAYER_CONFIG: PlayerConfig = {
  depth: 100,
  maxVelocity: 700,
  jumpVelocity: 350,
  dashVelocity: 1300,
  acceleration: 1000,
  strafeCancelSnapVelocity: 100,
  gravity: 700,
  drag: {
    x: 1000,
    y: 100,
  },
  jumpBoostDurationMs: 200,
  multiJumpCharges: undefined,
  dashCharges: 2,
  overcappedVelocityDecayRate: 10, 
};