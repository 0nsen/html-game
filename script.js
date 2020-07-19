
window.addEventListener("load", function() {
    var Q = Quintus()
            .include("Sprites, Scenes, Input, UI, Touch")
            .setup("game")
            .touch();
    
    Q.input.keyboardControls({  //  Gán các phím vào các sự kiện
        UP: 'player2-up',
        DOWN: 'player2-down',
        W: 'player1-up',
        S: 'player1-down',
    });

    ////////////////////////////////////////////////////////////
    //  Sprites

    Q.Sprite.extend("Player1", {    //  Tạo player 1 kế thừa từ Q.Sprite
        init: function(p) { // Khởi tạo
            this._super(p, {    //  Kế thừa methods và attributes của Q.Sprite và thêm thay đổi
                asset: "Stick.png", // Ảnh player 1
                type: Q.SPRITE_DEFAULT | Q.SPRITE_FRIENDLY,
            });
        },

        step: function(dt) {    // Hàm được gọi trong từng frame của game
            //  Di chuyển lên xuống
            if (Q.inputs['player1-up']) this.p.y -= 20;
            if (Q.inputs['player1-down']) this.p.y += 20;
        }
    });

    Q.Sprite.extend("Player2", {    //  Tạo player 2
        init: function(p) {
            this._super(p, {
                asset: "Stick.png", // Ảnh player 2
                flip: 'x',  // Lật ngược ảnh
                type: Q.SPRITE_DEFAULT | Q.SPRITE_FRIENDLY
            });
        },

        step: function(dt) {    // Hàm được gọi trong từng frame của game
            //  Di chuyển lên xuống
            if (Q.inputs['player2-up']) this.p.y -= 20;
            if (Q.inputs['player2-down']) this.p.y += 20;
        }
    });

    Q.Sprite.extend("Ball", {   //  Tạo bóng
        init: function(p) {
            this._super(p, {
                asset: "Ball.png",
                speed: 300, // Tốc độ bóng ban đầu
                vx: 0,  //  Tốc độ bóng theo x
                vy: 0,  // Tốc độ bóng theo y
                collisionMask: Q.SPRITE_DEFAULT
            });

            this.on("hit", this, "collide");    //  Khi bị "hit" => chạy hàm collide (phía dưới)

            //  Nếu score bên nào nhỏ hơn thì bóng khi khởi tạo sẽ chạy về bên đó trước
            if (Q.state.get("player1_score") >= Q.state.get("player2_score")) this.p.vx = this.p.speed;
            else this.p.vx = -this.p.speed;
        },

        step: function(dt) {
            //  Bóng tự di chuyển 
            this.p.x += this.p.vx * dt;
            this.p.y += this.p.vy * dt;

            this.stage.collide(this);   // Cần dòng này để va chạm

            //  Va chạm với biên trên và dưới của game
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

            //  Tính điểm
            if (this.p.x < 50) {    //  Nếu bóng vượt sau player 1
                Q.state.inc("player2_score", 1);    //  Tăng điểm player 2
                this.destroy();
            
                //  Đợi 1 giây rồi restart court
                setTimeout(() => {
                    Q.clearStage("court");
                    Q.stageScene("court");
                }, 1000);
                
            }
            if (this.p.x > Q.width - 50) {  //  Nếu bóng vượt sau player 2
                Q.state.inc("player1_score", 1);    //  Tăng điểm player 1
                this.destroy();

                setTimeout(() => {
                    Q.clearStage("court");
                    Q.stageScene("court");
                }, 1000);
            }            
        },

        // Kiểm tra va chạm
        collide: function(col) {
            if (col.obj.isA("Player1")) {   //  Nếu va chạm player 1
                var dy = (this.p.y - col.obj.p.y) / col.obj.p.h * 2.5;  //  Tính góc tới theo y
                
                if (col.normalX >= 0) {
                    this.p.vx = this.p.speed;   //  Tốc độ bóng theo x
                    this.p.speed += 20; //  Mỗi lần va chạm => tăng tốc độ bóng
                }

                this.p.vy = dy * this.p.speed;  //  Tốc độ bóng theo y
            } 

            if (col.obj.isA("Player2")) {   //  Nếu va chạm player 2
                var dy = (this.p.y - col.obj.p.y) / col.obj.p.h * 2.5;
                
                if (col.normalX <= 0) {
                    this.p.vx = -this.p.speed;
                    this.p.speed += 20;
                }

                this.p.vy = dy * this.p.speed;
            } 

            //  Nảy bóng khỏi player khi va chạm
            this.p.x -= col.separate[0];
            this.p.y -= col.separate[1];
        }
    });
    

    ////////////////////////////////////////////////////////////
    // Scenes + UI

    Q.scene("court", function(stage) {  //  Tạo scene "court"
        var player1 = stage.insert(new Q.Player1({  //  Cho player 1 vào tại vị trí x, y
            x: 100,
            y: Q.height/2,
        }));

        var player2 = stage.insert(new Q.Player2({  //  Cho player 2 vào tại vị trí x, y
            x: Q.width - 100,
            y: Q.height/2,
        }));

        var ball = stage.insert(new Q.Ball({    //  Cho bóng vào tại vị trí x, y
            x: Q.width/2,
            y: Q.height/2
        }));

        //  Điều kiện thắng
        if (Q.state.get("player1_score") == 3) {    //  Nếu score = 3
            Q.state.reset();    //  Reset điểm
            Q.stageScene("player1-win");    //  Chạy scene player 1 thắng
        }
        else if (Q.state.get("player2_score") == 3) {
            Q.state.reset();
            Q.stageScene("player2-win");
        }
        
    });

    Q.scene("hud", function(stage) {    //  Tạo scene "hud" (Hiển thị điểm)
        //  Khởi tạo và reset điểm
        Q.state.reset({
            player1_score: 0,
            player2_score: 0
        });

        stage.insert(new Q.Score({  //  Hiển thị score của player 1 tại x, y
            label: "Player 1 score: 0",
            x: Q.width / 5,
            y: 20,
            playerNum: "player1"
        }));
        stage.insert(new Q.Score({  //  Hiển thị score của player 2 tại x, y
            label: "Player 2 score: 0",
            x: 4 * Q.width / 5,
            y: 20,
            playerNum: "player2"
        }));
    });
    
    Q.scene("title", function(stage) {  //  Tạo scene "title" (Tiêu đề game)
        stage.insert(new Q.UI.Text({    //  Tạo chữ 
            label: "Pong",
            align: "center",
            x: Q.width/2,
            y: Q.height/3,
            size: 40
        }));
        
        stage.insert(new Q.UI.Button({  //  Tạo nút start game
            label: "start game",
            align: "center",
            fill: "white",
            border: 1,
            x: Q.width / 2,
            y: Q.height / 2,
            size: 15
        },  
        function() {    //  Khi bấm nút thì chạy
            Q.stageScene("court");  //  Bắt đầu scene "court" ở lớp 0
            Q.stageScene("hud", 1); //  Bắt đầu scene "hud" ở lớp 1
            //  Cho 2 scene này ở 2 lớp khác nhau để khi restart không bị mất điểm
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

    var playagainButton = new Q.UI.Button({ //  Nút chơi lại
        x: Q.width/2,
        y: Q.height/2,
        border: 1,
        fill: "white",
        label: "Play Again?"
    }, function() {
        Q.stageScene("court");
        Q.stageScene("hud", 1);
    });

    Q.UI.Text.extend("PlayerWin", { //  Tạo thông báo thắng kế thừa từ Q.UI.Text
        init: function(p) {
            this._super(p, {
                label: "You win!",  //  label khởi tạo
                align: "center",
                x: Q.width/2,
                y: Q.height/3,
                size: 50
                //  playerNum sẽ được nhập vào sau
            });

            if (this.p.playerNum == "player1") this.p.label = "Player 1 wins!";
            else if (this.p.playerNum == "player2") this.p.label = "Player 2 wins!";
        }
    });

    Q.scene("player1-win", function(stage) {    //  Tạo scene player 1 thắng
        stage.insert(new Q.PlayerWin({  //  Cho thông báo thắng vào với playerNum là người chơi nào thắng
            playerNum: "player1"
        }));

        stage.insert(playagainButton);  //  Thêm nút chơi lại
    });

    Q.scene("player2-win", function(stage) {    //  Tạo scene player 2 thắng
        stage.insert(new Q.PlayerWin({
            playerNum: "player2"
        }));

        stage.insert(playagainButton);
    });

    Q.UI.Text.extend("Score", { //  Tạo bảng điểm kế thừa từ Q.UI.Text
        init: function(p) {
            this._super(p, {
                align: "center",
                weight: "normal",
                size: 18,
            });

            //  Nếu trạng thái điểm nào thay đổi thì chạy hàm cập nhật điểm
            //  Vd: Q.state.on("change.player1_score", this, "score")
            Q.state.on("change." + this.p.playerNum + "_score", this, "score");
        },

        //  Hàm cập nhật điểm
        score: function(score) {
            if (this.p.playerNum == "player1") {
                this.p.label = "Player 1 score: " + Q.state.get("player1_score");
            }
            else if (this.p.playerNum == "player2") {
                this.p.label = "Player 2 score: " + Q.state.get("player2_score");
            }
        }
    });


    ////////////////////////////////////////////////////////////

    //  Load các asset cần thiết
    Q.load("Stick.png, Ball.png", function() {
        Q.stageScene("title");  //  Khi load xong => chạy scene "title"
    },  {
        //  Thanh load 
        progressCallback: function(loaded, total) {
            document.querySelector("#loading-progress").style.width = Math.floor(loaded/total*100) + "%";
            if (loaded == total) document.querySelector("#loading").remove();
        }
    });
});