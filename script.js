
window.addEventListener("load", function() {
    var Q = Quintus()
            .include("Sprites, Scenes, Input, 2D, UI")
            .setup("game");
    
    Q.Sprite.extend("Player", {
        init: function(p) {
            this._super(p, {
                asset: "Stick.png"
            });
            this.add("aiBounce");
        },
        step: function(dt) {
        
        }
    });

    Q.Sprite.extend("Ball", {
        init: function(p) {
            this._super(p, {
                asset: "Ball.png"
            });
            this.add("aiBounce");
        }
    });
      
    Q.scene("court", function(stage) {
        var player1 = stage.insert(new Q.Player({
            x: 100,
            y: Q.height/2
        }));
        var player2 = stage.insert(new Q.Player({
            x: Q.width - 100,
            y: Q.height/2,
            flip: 'x'
        }));
        
        var ball = stage.insert(new Q.Ball({
            x: Q.width/2,
            y: Q.height/2
        }));
    });

    Q.scene("endGame", function(stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width/2,
            y: Q.height/2,
            fill: "rgba(0, 0, 0, 0.5)"
        }));

        var button = container.insert(new Q.UI.Button({
            x: 0,
            y: 0,
            fill: "#CCCCCC",
            label: "Play Again?"
        }));

        button.on("click", function() {
            Q.clearStages();
            Q.stageScene("court");
        });

        container.fit(20);
    });


    Q.load("Stick.png, Ball.png", function() {
        Q.stageScene("court");
    },  {
        progressCallback: function(loaded, total) {
            document.querySelector("#loading-progress").style.width = Math.floor(loaded/total*100) + "%";
            if (loaded == total) document.querySelector("#loading").remove();
        }
    });
})