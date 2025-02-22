export const PLAYER_CONFIG: {
  maxVelocity: number;
  jumpVelocity: number;
  airDashVelocity: number;
  depth: number;
  acceleration: number;
  strafeCancelSnapVelocity: number;
  gravity: number;
  drag: number;
  maxJumpLingeringMs: number;
  maxMultiJumpCount?: number;
  maxAirDashCount?: number;
  uncappedVelocityDecayRate: number;
} = {
  /**
   * Velocity
   */
  maxVelocity: 700,
  jumpVelocity: 350,
  /**
   * Will break velocity cap if its a greater value
   */
  airDashVelocity: 1300,
  /**
   * Rendered z-index
   */
  depth: 100,
  /**
   * Player acceleration
   */
  acceleration: 1000,
  /**
   * Snaps player to velocity if moving faster when changing directions horizontally
   */
  strafeCancelSnapVelocity: 100,
  /**
   * Gravity Y
   */
  gravity: 700,
  /**
   * Drag, Friction on the player
   */
  drag: 1000,
  /**
   * Time in miliseconds the player can hold down jump key to linger the jump velocity
   */
  maxJumpLingeringMs: 200,
  /**
   * Count of multi jump player can do in the air before landing
   */
  maxMultiJumpCount: undefined,
  /**
   * Count of air dashes can do in the air before landing
   * Undefined for no limit
   */
  maxAirDashCount: undefined,
  /**
   * At what rate the player with uncapped max velocity returns to normal max velocity
   * Represented in frames per second
   */
  uncappedVelocityDecayRate: 10, 
};