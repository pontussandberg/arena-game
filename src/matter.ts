import Phaser from "phaser";
import { Scene1 } from "./Scenes";

if (window?.document.body?.style) {
  window.document.body.style.display = "flex";
  window.document.body.style.justifyContent = "center";
  window.document.body.style.paddingTop = "40px";
  window.document.body.style.backgroundColor = "#ADC174";
}

const CANVAS = {
  width: 1200,
  height: 850,
};

const config = {
  type: Phaser.AUTO,
  width: CANVAS.width,
  height: CANVAS.height,
  scene: Scene1,
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 1, x: 0 }, // Matter.js uses a lower gravity scale
      debug: true, // Set to true to visualize physics bodies
    },
  },
};

const game = new Phaser.Game(config);
