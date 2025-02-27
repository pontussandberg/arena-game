import { OrganismOptions } from "../Organism";

export interface PlayerConfig {
  /**
   * Rendered z-index
   */
  depth: number;
  /**
   * Velocity
   */
  jumpVelocity: number;
  /**
   * Snaps player to set value if moving faster than
   * set value when changing directions horizontally
   */
  strafeCancelSnapVelocity: number;
  /**
   * Time in miliseconds the player can hold down jump key to linger the jump velocity
   */
  jumpBoostDurationMs: number;
  /**
   * Count of multi jump player can do in the air before landing
   * Undefined for no limit
   */
  multiJumpCharges?: number;
  /**
   * Can overcap velocity cap
   */
  dashVelocity: number;
  /**
   * Count of air dashes can do in the air before landing
   * Undefined for no limit
   */
  dashCharges?: number;
  /**
   * Fixed delay between each dash
   */
  dashDelayMs?: number;
  /**
   * At what rate the player with overcapped max velocity returns to normal max velocity
   * Velocity decrease per frame
   */
  overcappedVelocityDecayRate: number;
  organismOptions: OrganismOptions;
}
