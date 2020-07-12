
window.addEventListener("load", function() {
    var Q = Quintus()
            .include("Sprites, Scenes, Input, 2D, UI, Touch")
            .setup("game")
            .touch();
    
    Q.input.keyboardControls({
        UP: 'player2-up',
        DOWN: 'player2-down',
        W: 'player1-up',
        S: 'player1-down',
    });

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

            if (Q.state.get("player1_score") >= Q.state.get("player2_score")) this.p.vx = this.p.speed;
            else this.p.vx = -this.p.speed;
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

                if (Q.state.get("player2_score") == 3) {
                    Q.clearStage("hud");
                    Q.stageScene("player2-win");
                    Q.state.reset();
                }
                else {
                    setTimeout(() => {
                        Q.clearStage("court");
                        Q.stageScene("court");
                    }, 1000);
                }
            }
            if (this.p.x > Q.width - 50) {
                Q.state.inc("player1_score", 1);
                this.destroy();

                if (Q.state.get("player1_score") == 3) {
                    Q.clearStage("hud");
                    Q.stageScene("player1-win");
                    Q.state.reset();
                }
                else {
                    setTimeout(() => {
                        Q.clearStage("court");
                        Q.stageScene("court");
                    }, 1000);
                }
            }
        },

        collide: function(col) {
            if (col.obj.isA("Player1")) {
                var dy = (this.p.y - col.obj.p.y) / col.obj.p.h * 2.5;
                if (col.normalX >= 0) {
                    this.p.vx = this.p.speed;
                    this.p.speed += 20;
                }
                this.p.vy = dy * this.p.speed;
            } 

            if (col.obj.isA("Player2")) {
                var dy = (this.p.y - col.obj.p.y) / col.obj.p.h * 2.5;
                if (col.normalX <= 0) {
                    this.p.vx = -this.p.speed;
                    this.p.speed += 20;
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
        Q.state.reset({
            player1_score: 0,
            player2_score: 0
        });

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
    });
    
    Q.scene("title", function(stage) {
        stage.insert(new Q.UI.Text({
            label: "Pong",
            align: "center",
            x: Q.width/2,
            y: Q.height/3,
            size: 40
        }));
        
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
            Q.stageScene("hud", 1);
        }));

        stage.insert(new Q.UI.Text({
            label: "Score 3 to win",
            align: "center",
            x: Q.width/2,
            y: Q.height/2 + 50,
            size: 15
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

    Q.scene("player1-win", function(stage) {
        stage.insert(new Q.UI.Text({
            label: "Player 1 wins!",
            align: 'center',
            x: Q.width/2,
            y: Q.height/3,
            size: 50
        }));

        var button = stage.insert(new Q.UI.Button({
            x: Q.width/2,
            y: Q.height/2,
            border: 1,
            fill: "white",
            label: "Play Again?"
        }, function() {
            Q.stageScene("court");
            Q.stageScene("hud", 1);
        }));
    });

    Q.scene("player2-win", function(stage) {
        stage.insert(new Q.UI.Text({
            label: "Player 2 wins!",
            align: 'center',
            x: Q.width/2,
            y: Q.height/3,
            size: 50
        }));

        var button = stage.insert(new Q.UI.Button({
            x: Q.width/2,
            y: Q.height/2,
            border: 1,
            fill: "white",
            label: "Play Again?"
        }, function() {
            Q.stageScene("court");
            Q.stageScene("hud", 1);
        }));
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
});