/**
 * All scenes should extend from this.
 * Should have all functionality that is necessary when 
 * passing the scene it to  game objects - helps with seamless typesafety.
 */
export default class BaseScene extends Phaser.Scene {
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
    this.restartScene = this.restartScene.bind(this);
  }

  restartScene() {
    this.scene.restart();
  }
}