export interface PlatformOptions {
  solid: boolean;
}

export default class Platform extends Phaser.GameObjects.Image {
  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    texture: string, 
    options?: PlatformOptions,
  ) {
    super(scene, x, y, texture);
    this.setOrigin(0, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    // Adjust the physics body to match the visual position

    const body = this.getBody();
    body.immovable = true;

    // Set no collision except from the top.
    // From within the object there is never collision.
    if (!options?.solid) {
      body.checkCollision.left = false;
      body.checkCollision.right = false;
      body.checkCollision.down = false;
    }
  }

  private getBody(): Phaser.Physics.Arcade.StaticBody {
    return this.body as Phaser.Physics.Arcade.StaticBody;
  }
}
