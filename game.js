var game;
var gameOptions = {

    // Jordens gravitation
    playerGravity: 1900,
    // Snäll björn snabbhet
    playerSpeed: 160,
    // Arg björn snabbhet
    enemySpeed: 150,
    // Hoppa högre!
    playerJump: 600,
    // Poäng!
    score: 0
}
window.onload = function () {
    var gameConfig = {
        type: Phaser.CANVAS,
        width: 640,
        height: 192,
        backgroundColor: 0x444444,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: [preloadGame, playGame]
    }
    game = new Phaser.Game(gameConfig);
}
class preloadGame extends Phaser.Scene {
    constructor() {
        super("PreloadGame");
    }
    preload() {
        this.load.tilemapTiledJSON("level", "level.json");
        this.load.image("tile", "tile.png");
        this.load.image("hero", "bearbae.gif");
        this.load.image("enemy", "meanbear.gif");
        this.load.image("enemy2", "meanbear.gif");
    }
    create() {
        this.scene.start("PlayGame");
    }
}
class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    create() {

        // creatin of "level" tilemap
        this.map = this.make.tilemap({
            key: "level"
        });

        // fixing tiles
        var tile = this.map.addTilesetImage("tileset01", "tile");
        this.map.setCollision(1);
        this.layer = this.map.createStaticLayer("layer01", tile);

        // adding nicebear
        this.hero = this.physics.add.sprite(game.config.width / 2, 150, "hero");
        this.hero.body.gravity.y = gameOptions.playerGravity;
        this.hero.body.velocity.x = gameOptions.playerSpeed;

        // adding meanbear
        this.enemy = this.physics.add.sprite(game.config.width / 4, 144, "enemy");
        this.enemy.body.velocity.x = gameOptions.enemySpeed;

        // adding jump
        this.canJump = true;
        this.input.on("pointerdown", this.handleJump, this);
        this.input.keyboard.on("keydown_SPACE", this.resetGame, this);
    }

    resetGame(){
        gameOptions.enemySpeed = 160;
        gameOptions.playerSpeed = 150;
        gameOptions.playerJump = 600;
        gameOptions.score = 0;
        this.scene.start("PlayGame");
    }

    handleJump() {

        // the hero can jump when:
        // canJump is true AND the hero is on the ground (blocked.down)
        if ((this.canJump && this.hero.body.blocked.down)) {

            // applying jump force
            this.hero.body.velocity.y = -gameOptions.playerJump;

            // hero can't jump anymore
            this.canJump = false;
        }
    }
    update() {

        // handling collision between the hero and the tiles
        this.physics.world.collide(this.hero, this.layer, function (hero, layer) {

            // hero on the ground
            if (hero.body.blocked.down) {
                this.canJump = true;
            }

            // hero on the ground and touching a wall on the right
            if (this.hero.body.blocked.right && this.hero.body.blocked.down) {

                // horizontal flipping hero sprite
                this.hero.flipX = true;
            }

            // same concept applies to the left
            if (this.hero.body.blocked.left && this.hero.body.blocked.down) {
                this.hero.flipX = false;
            }

            // adjusting hero speed according to the direction it's moving
            this.hero.body.velocity.x = gameOptions.playerSpeed * (this.hero.flipX ? -1 : 1);
        }, null, this);

        // handling collision between the enemy and the tiles
        this.physics.world.collide(this.enemy, this.layer, function (hero, layer) {

            if (this.enemy.body.blocked.right) {
                this.enemy.flipX = true;
                gameOptions.enemySpeed = gameOptions.enemySpeed + 50;
                gameOptions.score = gameOptions.score + 100;
                document.getElementById('scoreBoard').innerHTML = "Bearscore: " + gameOptions.score;
            } if (this.enemy.body.blocked.left) {
                this.enemy.flipX = false;
                gameOptions.enemySpeed = gameOptions.enemySpeed + 50;
                gameOptions.score = gameOptions.score + 100;
                document.getElementById('scoreBoard').innerHTML = "Bearscore: " + gameOptions.score;
            }

            // adjusting enemy speed according to the direction it's moving
            this.enemy.body.velocity.x = gameOptions.enemySpeed * (this.enemy.flipX ? -1 : 1);
        }, null, this);

        // handling collision between enemy and hero
        this.physics.world.collide(this.hero, this.enemy, function (hero, enemy) {
            //if u jump on head
            if (enemy.body.touching.up && hero.body.touching.down) {
                this.hero.body.velocity.y = -gameOptions.playerJump;
                gameOptions.score = gameOptions.score + 50;
                gameOptions.enemySpeed = gameOptions.enemySpeed - 20;
                document.getElementById('scoreBoard').innerHTML = "Bearscore: " + gameOptions.score;
                this.enemy.flipX = true;

                this.enemy2 = this.physics.add.sprite(game.config.width / 4, 144, "enemy2");
                this.enemy.body.velocity.x = gameOptions.enemySpeed;
            }
            else {
                gameOptions.enemySpeed = 150;
                gameOptions.playerSpeed = 0;
                gameOptions.playerJump = 100;
                //this.scene.start("PlayGame");
                this.hero.flipY = true;
            }
        }, null, this);
    }
}
