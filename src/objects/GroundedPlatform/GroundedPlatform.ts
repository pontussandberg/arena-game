import { Platform } from "../Platform";
import { PlatformOptions } from "../Platform/Platform";

export class GroundedPlatform extends Platform {
  constructor(scene: Phaser.Scene, x: number, groundYPos: number, texture: string, options?: PlatformOptions) {
      super(scene, x, groundYPos, texture, options);

      // Check after render
      this.y = groundYPos - this.height; 

      // Ensure physics body is correctly sized
      if (this.body) {
        this.body.position.y = this.y;
      }
  }
}
