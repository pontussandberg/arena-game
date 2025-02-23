import boxSmall from "../../assets/box_small.png"
import boxLarge from "../../assets/box_large.png"
import ground from "../../assets/ground.png"
import player from "../../assets/player.png"
import mouseFollower from "../../assets/mouse-follower.png"
import cloudGroup from "../../assets/cloud-group.png"
import bow from "../../assets/bow.png";
import { Platform, Player } from "../../objects";
import { FullscreenBtn } from "../../objects/FullscreenBtn"
import { GroundedPlatform } from "../../objects/GroundedPlatform/GroundedPlatform"
import { SCENE_CONFIG } from "./Pilot.constants"
import { MouseFollower } from "../../objects/MouseFollower"

export default class Pilot extends Phaser.Scene {
  private player!: Player;
  // Platforms that let players through from below
  private passThroughPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private groundTiles!: Phaser.Physics.Arcade.StaticGroup;
  private clouds!: Phaser.Physics.Arcade.StaticGroup;
  private mouseFollower!: MouseFollower;

  preload() {
    this.load.image('boxSmall', boxSmall);
    this.load.image('boxLarge', boxLarge);
    this.load.image('ground', ground);
    this.load.image('player', player);
    this.load.image('cloudGroup', cloudGroup);
    this.load.image('mouseFollower', mouseFollower);
    this.load.image('bow', bow);
  }

  create() {
    const {
      mapWidth,
      mapHeight,
      groundHeight,
      backgroundColorHex,
    } = SCENE_CONFIG;

    // ################################################################
    // Player
    // ################################################################
    this.player = new Player(this, 700, mapHeight - groundHeight - 900, "player");
    
    // ################################################################
    // Camera
    // ################################################################
    this.cameras.main.setBackgroundColor(backgroundColorHex);
    this.cameras.main.startFollow(this.player);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);


    // ################################################################
    // Create Solid platforms
    // ################################################################
    this.groundTiles = this.physics.add.staticGroup();
    [
      new Platform(this, 0 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 1 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 2 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 3 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 4 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 5 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 6 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 7 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 8 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
      new Platform(this, 9 * 1000, mapHeight - groundHeight, 'ground', { solid: true }),
    ].forEach(object => this.groundTiles.add(object));

    this.physics.add.collider(this.player, this.groundTiles);
    
    // ################################################################
    // Create Ground boxes
    // ################################################################
    this.passThroughPlatforms = this.physics.add.staticGroup();
    [
      new GroundedPlatform(this, 600, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 400, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 1200, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 1550, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 600 + 1800, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 400 + 1800, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 1200 + 1800, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 1550 + 1800, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 600 + 1800 * 2, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 400 + 1800 * 2, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 1200 + 1800 * 2, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 1550 + 1800 * 2, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 600 + 1800 * 3, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 400 + 1800 * 3, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 1200 + 1800 * 3, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 1550 + 1800 * 3, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 600 + 1800 * 4, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 400 + 1800 * 4, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 1200 + 1800 * 4, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 1550 + 1800 * 4, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 600 + 1800 * 5, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 400 + 1800 * 5, mapHeight - groundHeight, 'boxSmall'),
      new GroundedPlatform(this, 1200 + 1800 * 5, mapHeight - groundHeight, 'boxLarge'),
      new GroundedPlatform(this, 1550 + 1800 * 5, mapHeight - groundHeight, 'boxSmall'),
    ].forEach(object => this.passThroughPlatforms.add(object));

    this.physics.add.collider(this.player, this.passThroughPlatforms, (_player, _platform) => {
      const player = _player as Player;
      const platform = _platform as Platform;
      if (Math.abs(platform.y) === Math.abs(player.y + player.height / 2)) {
        player.standingOnPassThroughPlatform = true;
      }
    });

    // ################################################################
    // Create Clouds
    // ################################################################
    this.clouds = this.physics.add.staticGroup();
    [
      new FullscreenBtn(this, 0 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 1 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 2 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 3 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 4 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 5 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 6 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 7 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 8 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
      new FullscreenBtn(this, 9 * 1000 + 100, mapHeight - groundHeight - 1200, "cloudGroup"),
    ].forEach(object => this.clouds.add(object))
  }

  update() {
    this.player.update();
  }
}