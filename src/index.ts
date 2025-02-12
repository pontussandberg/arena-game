import Phaser from "phaser";
import platform from "./assets/grass.png"
import sky from "./assets/sky.png"

class Example extends Phaser.Scene
{
    preload ()
    {
        this.load.setBaseURL('https://labs.phaser.io');

        this.load.image('sky', sky);
        // Load the required assets
        this.load.image('platform', platform); // Replace with your platform image
        this.load.image('player', 'path_to_player_image.png'); // Replace with your player sprite image
    }

    create ()
    {
        this.add.image(500, 375, 'sky');

        // Create the platform in the middle of the screen
        const platform = this.physics.add.staticImage(500, 375, 'platform'); // Position (400, 300) is center of the screen

        // Create the player sprite above the platform
        const player = this.physics.add.sprite(500, 0, 'player'); // Position it above the platform

        // Set player physics properties (like gravity)
        player.setGravityY(300); // Apply gravity so the player falls down
        player.setCollideWorldBounds(true); // Keep the player within the game boundaries

        // Make the player collide with the platform
        this.physics.add.collider(player, platform);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 750,
    scene: Example,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800, x: 0 }
        }
    }
};

const game = new Phaser.Game(config);
