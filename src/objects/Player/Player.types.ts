export interface PlayerConfig {
  /**
   * Rendered z-index
   */
  depth: number;
  /**
   * Velocity
   */
  maxVelocity: number;
  jumpVelocity: number;
  /**
   * Can overcap velocity cap
   */
  dashVelocity: number;
  /**
   * Player acceleration
   */
  acceleration: number;
  /**
   * Snaps player to set value if moving faster than
   * set value when changing directions horizontally
   */
  strafeCancelSnapVelocity: number;
  /**
   * Gravity Y
   */
  gravity: number;
  /**
   * Drag, returning velocity back to 0 gradually when no acceleration is applied
   */
  drag: {
    x: number;
    y: number;
  };
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
   * Count of air dashes can do in the air before landing
   * Undefined for no limit
   */
  dashCharges?: number;
  /**
   * Disable the mechanic that limits dashing before 
   * overcapped velocity has been reset
   */
  noDashDelay?: boolean;
  /**
   * At what rate the player with overcapped max velocity returns to normal max velocity
   * Velocity decrease per frame
   */
  overcappedVelocityDecayRate: number;
  /**
   * Base HP
   */
  baseHp: 100;
}
