import { BaseScene } from "../../scenes/BaseScene";
import { FloatingBar } from "../FloatingBar";

export class CooldownCharges extends FloatingBar {
  private maxCharges: number;
  private cooldownTime: number;
  private currentCharges: number;
  private chargeQueue: number[];
  private dots: Phaser.GameObjects.Arc[];
  private dotTween?: Phaser.Tweens.Tween;

  constructor(
    scene: BaseScene,
    objectToFollow: Phaser.GameObjects.Sprite,
    offsetY: number,
    charges: number,
    cooldown: number
  ) {
    super(scene, objectToFollow, offsetY);

    this.maxCharges = charges;
    this.cooldownTime = cooldown;
    this.currentCharges = charges;
    //this.cooldowns = [];
    this.chargeQueue = [];

    // Create the dots for display
    this.dots = [];
    for (let i = 0; i < this.maxCharges; i++) {
      let dot = scene.add.circle(0, 0, 10, 0xffffff);
      dot.setOrigin(0.5, 0.5);
      this.add(dot);
      this.dots.push(dot);

      // Position the dots in a horizontal line
      dot.x = i * 30; // Adjust spacing as needed
      // @ts-ignore
      dot.id = i;
    }

    scene.add.existing(this);
  }

  consumeCharge() {
    if (this.currentCharges > 0) {
      this.currentCharges--;
      this.attemptCooldown();
    }
  }

  hasCharges() {
    return this.currentCharges > 0;
  }

  setDotToQueState(index: number) {
    const dot = this.dots[index]
    if (dot) {
      dot.setFillStyle(0xff0000); // Change to red during cooldown
      dot.setAlpha(0.3);
    }
  }

  /**
   * Attempts to start a cooldown.
   * 
   * Returns `true` if the cooldown could start or if no charges are avialble
   * @returns {boolean}
   */
  attemptCooldown(): boolean {
    // Right-most index of an available charge
    let chargeIndex = this.maxCharges - 1 - this.chargeQueue.length;
    if (chargeIndex < 0) {
      return false;
    }

    /**
     * # requiresQueue concept
     * 
     * True == Any count of charge is currently recharging.
     *  - Make the charge visually as static 100% cooldown remaining.
     *  - Swap charge positon with the currently animating charge.
     *  - Current animation will trigger animation for next dot via 
     *    the queue system mechanic.
     * 
     * False == No cooldown in progress
     * - Initate animation for right-most dot
     */
    const requiresQueue = this.chargeQueue.length > 0
    if (requiresQueue) {
      this.setDotToQueState(chargeIndex);
      this.moveDot(chargeIndex, chargeIndex + 1);
    } else {
      this.animateCharge(chargeIndex);
    }

    // Always push to queue
    this.chargeQueue.push(chargeIndex);

    // Cooldown successfully started
    return true;
  }


  /**
   * Replace dot position with target dot position in the array of dots and 
   * visually in game by replacing their cordinates.
   */
  moveDot(dotIndex: number, targetDotIndex: number) {
    const dot = this.dots[dotIndex]; // Get the dot to move
    const targetDot = this.dots[targetDotIndex]; // Get the target dot

    const tempX = dot.x;
    const tempY = dot.y;

    // Swap positions in the visual display
    dot.setPosition(targetDot.x, targetDot.y);
    targetDot.setPosition(tempX, tempY);

    // Swap their positions in the array
    const temp = this.dots[dotIndex];
    this.dots[dotIndex] = this.dots[targetDotIndex];
    this.dots[targetDotIndex] = temp;
  }


  /**
   * Start animating a charge. 
   * Will use reccursion when there are charges in queue after
   * completeing the cooldown animation.
   */
  animateCharge(index: number) {
    // Apply cooldown animation on the dot (e.g., change color or a simple animation)
    const dot = this.dots[index];
    if (!dot) {
      return;
    }

    // @ts-ignore
    console.log("animating; ", dot.id)



    dot.setFillStyle(0xff0000); // Change to red during cooldown
    dot.setAlpha(1); // Change to red during cooldown
    this.dotTween = this.scene.tweens.add({
      targets: dot,
      alpha: 0.3,
      duration: this.cooldownTime,
      ease: 'Linear',
      onComplete: () => {
        dot.setAlpha(1); // Reset color when done
        dot.setFillStyle(0xffffff); // Reset color when done
        this.currentCharges += 1;
        console.log(this.chargeQueue)
        this.chargeQueue.shift();
        console.log(this.chargeQueue);
        const next = this.dots.length - this.chargeQueue.length;
        if (next) {
          this.animateCharge(next);
        }
      }
    });
  }
}
