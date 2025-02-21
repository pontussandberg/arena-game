import Phaser from "phaser";
import { Pilot } from "./Scenes";

const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = document.body.getBoundingClientRect();


const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: Pilot,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
    },
    fps: { target: 144, forceSetTimeOut: false },
    physics: { arcade: { fixedStep: true, fps: 144 } },
  },
  scale: {
    mode: Phaser.Scale.RESIZE, // Automatically resize to fit the screen
    autoCenter: Phaser.Scale.CENTER_BOTH // Center the game
  },
};

const game = new Phaser.Game(config);
