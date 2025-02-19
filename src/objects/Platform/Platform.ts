import Phaser from "phaser";
import { COLLISION_CATEGORY } from "../../constants";
import { PLATFORM_ROOF_LABEL } from "./Platform.constants";

interface PlatformOptions {
  scene: Phaser.Scene; 
  x: number; 
  y: number; 
  texture: string;
};

export default class Platform {
  private scene: Phaser.Scene;
  private platform: Phaser.Physics.Matter.Image;
  private roof: MatterJS.BodyType;

  constructor({ scene, x, y, texture }: PlatformOptions) {
    this.scene = scene;

    // Create the main platform
    this.platform = this.scene.matter.add.image(x, y, texture, undefined, {
      isStatic: true
    });

    // Create a thin roof that will have collision from above
    this.roof = this.scene.matter.add.rectangle(
      x,                        // Same X position as platform
      y - this.platform.height / 2 - 1, // 1px above platform
      this.platform.width,      // Same width as platform
      2,                        // Very thin height
      { isStatic: true, label: PLATFORM_ROOF_LABEL },
    );

    // Collision category for roof
    this.roof.collisionFilter.category = COLLISION_CATEGORY.platform;

    // Combine platform & sensor into a single composite body
    const composite = this.scene.matter.body.create({
      parts: [this.getPlatformBody(), this.roof],
      isStatic: true
    });
    this.scene.matter.world.add(composite);
  }

  getPlatformBody(): MatterJS.BodyType {
    return this.platform.body as MatterJS.BodyType;
  }

  getRoofBody() {
    return this.roof;
  }
}
