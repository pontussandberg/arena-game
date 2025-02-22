import Phaser from "phaser";
import { Pilot } from "./Scenes";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: Pilot,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      fixedStep: true,
      fps: 144,
    },
  },
  fps: { target: 144, forceSetTimeOut: false },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
};

new Phaser.Game(config);


