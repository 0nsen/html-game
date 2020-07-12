
window.addEventListener("load", function() {
    var Q = Quintus()
            .include("Sprites, Scenes, Input, 2D, UI")
            .setup("game");
    
    Q.input.keyboardControls({
        UP: 'player2-up',
        DOWN: 'player2-down',
        W: 'player1-up',
        S: 'player1-down',
        ENTER: 'enter'
    })

    ////////////////////////////////////////////////////////////
    //  Sprites

    Q.Sprite.extend("Player1", {
        init: function(p) {
            this._super(p, {
                asset: "Stick.png",
                type: Q.SPRITE_DEFAULT | Q.SPRITE_FRIENDLY,
            });
        },

        step: function(dt) {
            if (Q.inputs['player1-up']) this.p.y -= 20;
            if (Q.inputs['player1-down']) this.p.y += 20;
        }
    });

    Q.Sprite.extend("Player2", {
        init: function(p) {
            this._super(p, {
                asset: "Stick.png",
                flip: 'x',
                type: Q.SPRITE_DEFAULT | Q.SPRITE_FRIENDLY
            });
        },

        step: function(dt) {
            if (Q.inputs['player2-up']) this.p.y -= 20;
            if (Q.inputs['player2-down']) this.p.y += 20;
        }
    });

    Q.Sprite.extend("Ball", {
        init: function(p) {
            this._super(p, {
                asset: "Ball.png",
                speed: 200,
                vx: 0,
                vy: 0,
                collisionMask: Q.SPRITE_DEFAULT
            });

            this.on("hit", this, "collide");
            this.p.vx = this.p.speed;
            //this.p.vy = this.p.speed;
        },

        step: function(dt) {
            this.p.x += this.p.vx * dt;
            this.p.y += this.p.vy * dt;

            this.stage.collide(this);

            if(this.p.y < 15) { 
                this.p.vy = Math.abs(this.p.vy); 
            }
            if(this.p.y > Q.height - 15) { 
                this.p.vy = -Math.abs(this.p.vy); 
            }
            
            // if(this.p.x > Q.width - 15) { 
            //     this.p.vx = -Math.abs(this.p.vx); 
            // }

            // if(this.p.x < 15) { 
            //     this.p.vx = Math.abs(this.p.vx); 
            // }

            if (this.p.x < 50) {
                Q.state.inc("player2_score", 1);
                this.destroy();
                Q.stageScene("court");
            }
            if (this.p.x > Q.width - 50) {
                Q.state.inc("player1_score", 1);
                this.destroy();
                Q.stageScene("court");
            }
        },

        collide: function(col) {
            if (col.obj.isA("Player1")) {
                var dy = (this.p.y - col.obj.p.y) / col.obj.p.h * 2.5;
                if (col.normalX >= 0) {
                    this.p.vx = this.p.speed;
                    this.p.speed += 10;
                }
                this.p.vy = dy * this.p.speed;
            } 

            if (col.obj.isA("Player2")) {
                var dy = (this.p.y - col.obj.p.y) / col.obj.p.h * 2.5;
                if (col.normalX <= 0) {
                    this.p.vx = -this.p.speed;
                    this.p.speed += 10;
                }
                this.p.vy = dy * this.p.speed;
            } 

            this.p.x -= col.separate[0];
            this.p.y -= col.separate[1];
        }
    });
    

    ////////////////////////////////////////////////////////////
    // Scenes + UI

    Q.scene("court", function(stage) {
        Q.state.reset({
            player1_score: 0,
            player2_score: 0
        });

        Q.stageScene("hud", 1);

        var player1 = stage.insert(new Q.Player1({
            x: 100,
            y: Q.height/2,
        }));
        var player2 = stage.insert(new Q.Player2({
            x: Q.width - 100,
            y: Q.height/2,
        }));

        var ball = stage.insert(new Q.Ball({
            x: Q.width/2,
            y: Q.height/2
        }));
    });

    Q.scene("hud", function(stage) {
        stage.insert(new Q.Score1({
            label: "Player 1 score: 0",
            x: Q.width / 5,
            y: 20,
        }));
        stage.insert(new Q.Score2({
            label: "Player 2 score: 0",
            x: 4 * Q.width / 5,
            y: 20,
        }));

        if (Q.state.get("player1_score") == 3) {
            Q.stageScene("endGame", 1, {
                label: "Player 1 win!"
            });
        }
        else if(Q.state.get("player2_score") == 3) {
            Q.stageScene("endGame", 1, {
                label: "Player 2 win!"
            });
        }
    });
    
    Q.scene("title", function(stage) {
        Q.clearStage(1);
        
        stage.insert(new Q.UI.Button({
            label: "start game",
            align: "center",
            fill: "white",
            border: 1,
            x: Q.width / 2,
            y: Q.height / 2,
            size: 15
        },  
        function() {
            Q.stageScene("court");
        }));

        stage.insert(new Q.UI.Text({
            label: "Pong",
            align: "center",
            x: Q.width/2,
            y: Q.height/3,
            size: 40
        }));
        
        stage.insert(new Q.UI.Text({
            label: "Player 1: W S",
            align: "center",
            x: Q.width / 5,
            y: 4 * Q.height / 5,
            size: 15
        }));

        stage.insert(new Q.UI.Text({
            label: "Player 2: UP DOWN",
            align: "center",
            x: 4 * Q.width / 5,
            y: 4 * Q.height / 5,
            size: 15
        }));
    });

    Q.scene("endGame", function(stage) {
        stage.insert(new Q.UI.Text({
            label: "You win!",
            align: 'center',
            x: Q.width/2,
            y: Q.height/2,
            size: 20
        }));

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
        container.fit(20);
    });

    Q.UI.Text.extend("Score1", {
        init: function(p) {
            this._super(p, {
                align: "center",
                weight: "normal",
                size: 18
          });
    
            Q.state.on("change.player1_score", this, "score");
        },
    
        score: function(score) {
            this.p.label = "Player 1 score: " + Q.state.get("player1_score");
            
        }
    });

    Q.UI.Text.extend("Score2", {
        init: function(p) {
            this._super(p, {
                align: "center",
                weight: "normal",
                size: 18
          });
    
            Q.state.on("change.player2_score", this, "score");
        },
    
        score: function(score) {
            this.p.label = "Player 2 score: " + Q.state.get("player2_score");
        }
    });


    ////////////////////////////////////////////////////////////

    Q.load("Stick.png, Ball.png", function() {
        Q.stageScene("title");
    },  {
        progressCallback: function(loaded, total) {
            document.querySelector("#loading-progress").style.width = Math.floor(loaded/total*100) + "%";
            if (loaded == total) document.querySelector("#loading").remove();
        }
    });
})