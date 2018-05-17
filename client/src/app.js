import Game from "scripts/components/Game";
import Player from "scripts/components/Player";
import Bullet from "scripts/components/Bullet";
import Socket from "scripts/components/Socket";
import GS from "scripts/components/GameState";
import "styles/index.css";

function detectCollision() {
  if (GS.gameState.myPlayer) {
    let myPlayerCalculatedX =
      GS.gameState.myPlayer.x - GS.gameState.myPlayer.width / 2;
    let myPlayerCalculatedY =
      GS.gameState.myPlayer.y - GS.gameState.myPlayer.height / 2;
    GS.gameState.players.every(player => {
      let playerCalculatedX = player.x - player.width / 2;
      let playerCalculatedY = player.y - player.height / 2;
      if (
        rangeIntersect(
          myPlayerCalculatedX,
          myPlayerCalculatedX + GS.gameState.myPlayer.width,
          playerCalculatedX,
          playerCalculatedX + player.width
        ) &&
        rangeIntersect(
          myPlayerCalculatedY,
          myPlayerCalculatedY + GS.gameState.myPlayer.height,
          playerCalculatedY,
          playerCalculatedY + player.height
        )
      ) {
        GS.gameState.myPlayer.collision(true);
        return false;
      } else {
        GS.gameState.myPlayer.collision(false);
        return true;
      }
    });

    if (
      GS.gameState.myPlayer.y >
        Game.canvas.height - GS.gameState.myPlayer.height / 2 ||
      GS.gameState.myPlayer.x >
        Game.canvas.width - GS.gameState.myPlayer.width / 2 ||
      GS.gameState.myPlayer.y < 15 ||
      GS.gameState.myPlayer.x < 15
    ) {
      GS.gameState.myPlayer.collision(true);
    }
    let bulletsArray = [];
    let myBulletsArray = [];
    //detecting bullet collision between players and bullets
    for (let bullet of GS.gameState.bullets) {
      let bulletCalculatedX = bullet.x - bullet.width / 2;
      let bulletCalculatedY = bullet.y - bullet.height / 2;
      let pushBullet = true;
      //check with myPlayer
      if (GS.gameState.myPlayer) {
        let myPlayerCalculatedX =
          GS.gameState.myPlayer.x - GS.gameState.myPlayer.width / 2;
        let myPlayerCalculatedY =
          GS.gameState.myPlayer.y - GS.gameState.myPlayer.height / 2;
        if (
          rangeIntersect(
            myPlayerCalculatedX,
            myPlayerCalculatedX + GS.gameState.myPlayer.width,
            bulletCalculatedX,
            bulletCalculatedX + bullet.width
          ) &&
          rangeIntersect(
            myPlayerCalculatedY,
            myPlayerCalculatedY + GS.gameState.myPlayer.height,
            bulletCalculatedY,
            bulletCalculatedY + bullet.height
          )
        ) {
          pushBullet = false;
        }
      }
      //check with all players
      for (let player of GS.gameState.players) {
        let playerCalculatedX = player.x - player.width / 2;
        let playerCalculatedY = player.y - player.height / 2;
        if (
          bullet._id != player._id &&
          rangeIntersect(
            bulletCalculatedX,
            bulletCalculatedX + bullet.width,
            playerCalculatedX,
            playerCalculatedX + player.width
          ) &&
          rangeIntersect(
            bulletCalculatedY,
            bulletCalculatedY + bullet.height,
            playerCalculatedY,
            playerCalculatedY + player.height
          )
        ) {
          pushBullet = false;
        }
      }
      if (pushBullet) {
        bulletsArray.push(bullet);
      }
    }
    //checking when myPlayerbullet hits other players
    if (GS.gameState.myPlayer && GS.gameState.myPlayer.bullets) {
      for (let bullet of GS.gameState.myPlayer.bullets) {
        let bulletCalculatedX = bullet.x - bullet.width / 2;
        let bulletCalculatedY = bullet.y - bullet.height / 2;
        let pushBullet = true;
        //check with all players
        for (let player of GS.gameState.players) {
          let playerCalculatedX = player.x - player.width / 2;
          let playerCalculatedY = player.y - player.height / 2;
          if (
            bullet._id != player._id &&
            rangeIntersect(
              bulletCalculatedX,
              bulletCalculatedX + bullet.width,
              playerCalculatedX,
              playerCalculatedX + player.width
            ) &&
            rangeIntersect(
              bulletCalculatedY,
              bulletCalculatedY + bullet.height,
              playerCalculatedY,
              playerCalculatedY + player.height
            )
          ) {
            Socket.sendData([6, player._id]);
            GS.updateGameState({
              type: "PLAYER_HIT",
              payload: {
                _id: player._id
              }
            });
            pushBullet = false;
          }
        }
        if (pushBullet) {
          myBulletsArray.push(bullet);
        }
      }
    }

    GS.updateGameState({
      type: "DESTROY_BULLETS",
      payload: {
        myPlayerBullets: myBulletsArray,
        allPlayerBullets: bulletsArray
      }
    });
  }
}

function rangeIntersect(min0, max0, min1, max1) {
  return (
    Math.max(min0, max0) >= Math.min(min1, max1) &&
    Math.min(min0, max0) <= Math.max(min1, max1)
  );
}

var form = document.getElementById("welcomeForm");
form.addEventListener("submit", function(e) {
  e.preventDefault();
  let inputName = document.getElementById("username");
  if (!inputName.value) {
    inputName.placeholder = "Enter you name! WTF!";
    return;
  }

  configureHTML();
  
  Socket.init(inputName.value);
  var GAME_LOOP;
  function draw() {
    if (GS.gameState.initGame) {
      colorRect(0, 0, Game.canvas.width, Game.canvas.height, "black");
      GS.gameState.myPlayer.moveAngle = 0;
      GS.gameState.myPlayer.speed = 0;
      if (window.keys && window.keys[32]) {
        GS.gameState.myPlayer.fireBullet();
      }
      if (window.keys && window.keys[65]) {
        GS.gameState.myPlayer.moveAngle = -5;
      }
      if (window.keys && window.keys[68]) {
        GS.gameState.myPlayer.moveAngle = 5;
      }
      if (window.keys && window.keys[87]) {
        GS.gameState.myPlayer.speed = 5;
      }
      if (window.keys && window.keys[83]) {
        GS.gameState.myPlayer.speed = -5;
      }
      detectCollision();
      GS.gameState.myPlayer.newPos();
      GS.gameState.myPlayer.update();
      GS.gameState.bullets.forEach(bullet => {
        bullet.newPos();
        bullet.update();
      });
      GS.gameState.players.forEach(player => {
        player.update();
      });
      GS.gameState.myPlayer.bullets.forEach(function(bullet) {
        bullet.newPos();
        bullet.update();
      });
    }
  }

  function update() {
    GAME_LOOP = setInterval(function() {
      draw();
    }, 1000 / Game.FPS);
  }

  update();

  //helpers
  function colorRect(leftX, topY, width, height, drawColor) {
    Game.ctx.fillStyle = drawColor;
    Game.ctx.fillRect(leftX, topY, width, height);
  }

  function colorCircle(centerX, centerY, radius, drawColor) {
    Game.ctx.fillStyle = drawColor;
    Game.ctx.beginPath();
    Game.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    Game.ctx.fill();
  }
});

//This code is not mine
(function() {
  var canvas = document.getElementById("welcomeCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d");

  var TAU = 2 * Math.PI;

  let times = [];
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function Ball(startX, startY, startVelX, startVelY) {
    this.x = startX || Math.random() * canvas.width;
    this.y = startY || Math.random() * canvas.height;
    this.vel = {
      x: startVelX || Math.random() * 2 - 1,
      y: startVelY || Math.random() * 2 - 1
    };
    this.update = function(canvas) {
      if (this.x > canvas.width + 50 || this.x < -50) {
        this.vel.x = -this.vel.x;
      }
      if (this.y > canvas.height + 50 || this.y < -50) {
        this.vel.y = -this.vel.y;
      }
      this.x += this.vel.x;
      this.y += this.vel.y;
    };
    this.draw = function(ctx, can) {
      ctx.beginPath();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "red";
      ctx.arc((0.5 + this.x) | 0, (0.5 + this.y) | 0, 3, 0, TAU, false);
      ctx.fill();
    };
  }

  var balls = [];
  for (var i = 0; i < canvas.width * canvas.height / (65 * 65); i++) {
    balls.push(
      new Ball(Math.random() * canvas.width, Math.random() * canvas.height)
    );
  }

  var lastTime = Date.now();
  function update() {
    var diff = Date.now() - lastTime;
    for (var frame = 0; frame * 16.6667 < diff; frame++) {
      for (var index = 0; index < balls.length; index++) {
        balls[index].update(canvas);
      }
    }
    lastTime = Date.now();
  }
  var mouseX = -1e9,
    mouseY = -1e9;
  document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  function distMouse(ball) {
    return Math.hypot(ball.x - mouseX, ball.y - mouseY);
  }

  function draw() {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#001c33";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var index = 0; index < balls.length; index++) {
      var ball = balls[index];
      ball.draw(ctx, canvas);
      ctx.beginPath();
      for (var index2 = balls.length - 1; index2 > index; index2 += -1) {
        var ball2 = balls[index2];
        var dist = Math.hypot(ball.x - ball2.x, ball.y - ball2.y);
        if (dist < 100) {
          ctx.strokeStyle = "red";
          ctx.globalAlpha = 1 - (dist > 100 ? 0.8 : dist / 150);
          ctx.lineWidth = "2px";
          ctx.moveTo((0.5 + ball.x) | 0, (0.5 + ball.y) | 0);
          ctx.lineTo((0.5 + ball2.x) | 0, (0.5 + ball2.y) | 0);
        }
      }
      ctx.stroke();
    }
  }

  // Start
  loop();
})();


function configureHTML(){
  document.getElementById("welcomeScreen").remove();
  let gameCanvas = document.getElementById("gameCanvas");
  gameCanvas.style.display = "inline-block";
  gameCanvas.focus();
  gameCanvas.insertAdjacentHTML(
    "afterend",
    `<div class="chat-window" id="chatWindow">
      <div id="chatDisplay" class="chat-display">
      </div>
      <div class="send-container">
        <form id="chatForm">
          <input id="chatInput" type="text"/>
          <button id="chatSubmit" type="submit">
            send
          </button>
        </form>
      <div>
    </div>`
  );

  document.getElementById("chatForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    let msg = document.getElementById("chatInput").value;
    document.getElementById("chatInput").value = "";
    let cd = document.getElementById("chatDisplay");
    let cm = document.createElement("DIV");
    let t = document.createTextNode(GS.gameState.myPlayer.username + " : "+msg);
    cm.appendChild(t);
    document.getElementById("chatDisplay").appendChild(cm);
    Socket.sendData([7,GS.gameState.myPlayer._id,GS.gameState.myPlayer.username,msg]);
  });
}