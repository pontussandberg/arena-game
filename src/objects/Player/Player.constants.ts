export const PLAYER_CONFIG = {
  /**
   * Velocity
   */
  maxVelocity: 700,
  jumpVelocity: 400,
  /**
   * Will break velocity cap if its a greater value
   */
  airDashVelocity: 1600,
  /**
   * Rendered z-index
   */
  depth: 100,
  /**
   * Player acceleration
   */
  acceleration: 800,
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
  maxMultiJumpCount: 2,
  /**
   * Count of air dashes can do in the air before landing
   */
  maxAirDashCount: 2,
  /**
   * At what rate the player with uncapped max velocity returns to normal max velocity
   * Represented in frames per second
   */
  uncappedVelocityDecayRate: 10, 
};