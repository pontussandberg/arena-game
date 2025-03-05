import boxSmall from "../../assets/box_small.png"
import boxLarge from "../../assets/box_large.png"
import ground from "../../assets/ground.png"
import player from "../../assets/spritesheet.png"
import arrow from "../../assets/projectiles/arrow.png"
import spear from "../../assets/projectiles/spear.png"
import rect from "../../assets/rect.png"
import cloudGroup from "../../assets/cloud-group.png"
import bow from "../../assets/weapons/bow.png";
import pointer from "../../assets/pointer.png";
import { Platform, Player } from "../../objects";
import { FullscreenBtn } from "../../objects/FullscreenBtn"
import { GroundedPlatform } from "../../objects/GroundedPlatform/GroundedPlatform"
import { SCENE_CONFIG, Textures } from "./Pilot.constants"
import { ProjectileManager } from "../../objects/ProjectileManager/ProjectileManager"
import { BaseScene } from "../BaseScene";
import { BaseProjectile } from "../../objects/ProjectileManager/Projectiles/BaseProjectile"
import { ASSET_SCALE } from "../../constants"

export default class Pilot extends BaseScene {
  private player!: Player;
  private passThroughPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private groundTiles!: Phaser.Physics.Arcade.StaticGroup;
  private clouds!: Phaser.Physics.Arcade.StaticGroup;
  private projectileManager!: ProjectileManager;
  public texturesMap = Textures;

  constructor() {
    super({ key: "Pilot" });
    this.texturesMap = Textures;
  }

  preload() {
    this.load.image(Textures.boxSmall, boxSmall);
    this.load.image(Textures.boxLarge, boxLarge);
    this.load.image(Textures.ground, ground);
    this.load.spritesheet(Textures.player, player, {
      frameWidth: 127 * ASSET_SCALE,
      frameHeight: 110 * ASSET_SCALE,
    });
    this.load.image(Textures.cloudGroup, cloudGroup);
    this.load.image(Textures.bow, bow);
    this.load.image(Textures.defaultArrow, arrow);
    this.load.image(Textures.spear, spear);
    this.load.image(Textures.pointer, pointer);
    this.load.image(Textures.rect, rect);
  }

  create() {
    const {
      mapWidth,
      mapHeight,
      groundHeight,
      backgroundColorHex,
    } = SCENE_CONFIG;

    this.cameras.main.setZoom(1);

    // ################################################################
    // Projectile Manager
    // ################################################################
    this.projectileManager = new ProjectileManager(this);

    // ################################################################
    // Player
    // ################################################################
    this.player = new Player(
      this,
      700,
      mapHeight - groundHeight - 900,
      "player",
      this.projectileManager
    );

    // ################################################################
    // Player and projectile collisions
    // ################################################################
    this.physics.add.collider(
      this.player,
      this.projectileManager.getProjectilesGroup(),
      (player, projectile) => {
        if (player instanceof Player && projectile instanceof BaseProjectile) {
          projectile.handleCollision(player);
        }
      },
      (player, projectile) => {
        return player !== this.player;
      },
    )

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
      new Platform(this, 0 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 1 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 2 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 3 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 4 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 5 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 6 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 7 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 8 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
      new Platform(this, 9 * 1000 + 100, mapHeight - groundHeight - 2000, "cloudGroup"),
    ].forEach(object => this.clouds.add(object))
  }

  update() {
    this.player.update();
  }
}