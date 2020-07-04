
window.addEventListener('load', function() {
    var Q = Quintus()
            .include("Sprites, Scenes, Input, 2D, UI, TMX")
            .setup({
                scaleToFit: true
            })
            .controls();


    //  Player character
    Q.Sprite.extend("Player", {
        init: function(p) {
            this._super(p, {
                asset: "Player-Idle.png",
                frame: 0,
                x: 40,
                y: 140,
                w: 13,
                h: 17,
                jumpSpeed: -300,
                speed: 200
            });
            this.add("2d, platformerControls");
        },
        step: function(dt) {
            if (Q.inputs['left'] && this.p.direction == 'right') {
                this.p.flip = 'x';
            }
            if (Q.inputs['right'] && this.p.direction == 'left') {
                this.p.flip = false;
            }
        }
    })


    //  Test level
    Q.scene("untitled", function(stage) {
        var background = new Q.TileLayer({
            dataAsset: "untitled.json",
            layerIndex: 0,
            sheet: "tiles",
            type: Q.SPRITE_NONE
        });
        stage.insert(background);

        stage.collisionLayer(new Q.TileLayer({
            dataAsset: "untitled.json",
            layerIndex: 1,
            sheet: "tiles"
        }))


        var player = stage.insert(new Q.Player());

        stage.add("viewport").follow(player, {
            x: true,
            y: true
        }, {
            minX: 0,
            maxX: background.p.w,
            minY: 0,
            maxY: background.p.h
        });
    });


    //  Load assets
    Q.load(["Player-Idle.png", "Tile-hitbox.png", "untitled.tmx", "untitled.json"], function() {
        Q.sheet("tiles", "Tile-hitbox.png");

        Q.sheet("Player-Idle", "Player-Idle.png", {
            tilew: 13,
            tileh: 17
        });  

        Q.stageScene("untitled");
    },  {
        //  Loading bar
        progressCallback: function(loaded, total) {
            document.querySelector("#loading-progress").style.width = Math.floor(loaded/total*100) + "%";
        }
    });
})