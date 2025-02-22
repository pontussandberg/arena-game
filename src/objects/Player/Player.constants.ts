export const PLAYER_CONFIG: {
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
   * Drag, Friction on the player
   */
  drag: number;
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
   * At what rate the player with overcapped max velocity returns to normal max velocity
   * Velocity decrease per frame
   */
  overcappedVelocityDecayRate: number;
} = {
  depth: 100,
  maxVelocity: 700,
  jumpVelocity: 350,
  dashVelocity: 1300,
  acceleration: 1000,
  strafeCancelSnapVelocity: 100,
  gravity: 700,
  drag: 1000,
  jumpBoostDurationMs: 200,
  multiJumpCharges: undefined,
  dashCharges: undefined,
  overcappedVelocityDecayRate: 10, 
};