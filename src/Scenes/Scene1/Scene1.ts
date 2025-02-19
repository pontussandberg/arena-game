import Phaser from "phaser";
import { COLLISION_CATEGORY } from "../../constants";
import { Player } from "../../objects";
import boxSmall from "../../assets/box_small.png";
import boxLarge from "../../assets/box_large.png";
import ground from "../../assets/ground.png";
import cloud1 from "../../assets/clouds/cloud_1.png";
import cloud2 from "../../assets/clouds/cloud_2.png";
import cloud3 from "../../assets/clouds/cloud_3.png";
import playerTexture from "../../assets/player.png";
import { Platform } from "../../objects/Platform";
// import debug from "../../assets/debug.png";

const CANVAS = {
  width: 1200,
  height: 850,
};

const one_ms = 1000;
const physics_fps = 120;
const TICK_RATE: number = one_ms / physics_fps;

export default class Scene1 extends Phaser.Scene {
  private accumulatedTickTime: number = 0;
  private player!: Player;
  private platforms: Platform[] = [];
  private clouds: Phaser.Physics.Matter.Image[] = [];

  preload() {
    // Load other assets needed for platforms, background, etc.
    this.load.image("player", playerTexture);
    this.load.image("ground", ground);
    this.load.image("boxSmall", boxSmall);
    this.load.image("boxLarge", boxLarge);
    this.load.image("cloud1", cloud1);
    this.load.image("cloud2", cloud2);
    this.load.image("cloud3", cloud3);

    // this.load.image("debug", debug);
  }

  create() {
    // ################################################################
    // Config
    // ################################################################
    this.matter.world.engine.timing.timeScale = 1; // Keep physics running at real-time speed
    this.cameras.main.setBackgroundColor("93A55E");
    

    
    


    // ################################################################
    // Create Player
    // ################################################################
    this.player = new Player(this, 700, 400);

    // ################################################################
    // Create Platforms
    // ################################################################
    [
      {x: 600, y: CANVAS.height - 79 / 2, texture: "ground"},
      {x: 600, y: CANVAS.height - 79 - 255 / 2, texture: "boxLarge"},
      {x: 400, y: CANVAS.height - 79 - 213 / 2, texture: "boxSmall"},
    ].forEach(config => {
      const platform = new Platform({
        ...config, 
        scene: this
      });
      this.platforms.push(platform);
    });


    // ################################################################
    // Clouds
    // ################################################################
    [
      this.matter.add.image(170, 130, "cloud1", undefined, { isStatic: true }),
      this.matter.add.image(700, 75, "cloud1", undefined, { isStatic: true }),
      this.matter.add.image(435, 200, "cloud2", undefined, { isStatic: true }),
      this.matter.add.image(1000, 110, "cloud3", undefined, { isStatic: true }),
    ].forEach((cloud) => {
      this.clouds.push(cloud);
      cloud.setCollisionCategory(COLLISION_CATEGORY.platform);
    });
  }

  update(_time: number, delta: number) {  
    // Accumulate delta time
    this.accumulatedTickTime += delta; 
    // Loop since we might run multiple iterations per frame
    while (this.accumulatedTickTime >= TICK_RATE) {
      // Remove processed time
      this.accumulatedTickTime -= TICK_RATE; 
      // Run frame
      this.fixedUpdate();
    }
  }
  
  // ################################################################
  // Controled tick rate update
  // ################################################################
  fixedUpdate() {
    this.player.update();
  }
}
