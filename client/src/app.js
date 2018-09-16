import Game from "scripts/components/Game";
import Player from "scripts/components/Player";
import Bullet from "scripts/components/Bullet";
import Socket from "scripts/components/Socket";
import GS from "scripts/components/GameState";
import "styles/index.css";
import { checkPointInPlane, findX, findY } from "scripts/utils";

var canvas = document.getElementById("gameCanvas");

function updateDashboard() {
  let alive = document.getElementById("alive");
  let killed = document.getElementById("killed");
  alive.innerText = GS.gameState.players.length + 1;
  killed.innerText = GS.gameState.myPlayer.killCount;
}

function findNearestPlayer() {
  let myPlayer = {
    x: GS.gameState.myPlayer.x,
    y: GS.gameState.myPlayer.y
  };

  let distances = [];
  for (let player of GS.gameState.players) {
    distances.push({
      _id: player._id,
      x: player.x,
      y: player.y,
      d: Math.hypot(player.x - myPlayer.x, player.y - myPlayer.y)
    });
  }

  if (distances.length > 0) {
    let viewportX1 = Math.abs(Game.Viewport.x);
    let viewportY1 = Math.abs(Game.Viewport.y);
    let nearestPlayerData = distances.sort((a, b) => {
      return a.d - b.d;
    })[0];
    let viewportCordinates = {
      x1: viewportX1,
      y1: viewportY1,
      x2: viewportX1 + Game.canvas.width,
      y2: viewportY1,
      x3: viewportX1 + Game.canvas.width,
      y3: viewportY1 + Game.canvas.height,
      x4: viewportX1,
      y4: viewportY1 + Game.canvas.height
    };

    let angle = parseInt(
      Math.atan2(
        myPlayer.y - nearestPlayerData.y,
        myPlayer.x - nearestPlayerData.x
      ) *
        (180 / Math.PI)
    );
    if (angle < 0) {
      angle = angle + 360;
    }

    let isNearestPlayerInSight = checkPointInPlane({
      ...viewportCordinates,
      x: nearestPlayerData.x,
      y: nearestPlayerData.y
    });
    if (!isNearestPlayerInSight) {
      if ((angle > 315 && angle < 365) || (angle >= 0 && angle <= 45)) {
        let foundY = findY(
          nearestPlayerData.y,
          Game.Viewport.y,
          Game.canvas.height
        );
        if (foundY) {
          Game.ctx.save();
          Game.ctx.beginPath();
          Game.ctx.moveTo(15, foundY);
          Game.ctx.lineTo(40, 15 + foundY);
          Game.ctx.lineTo(40, foundY - 15);
          Game.ctx.fillStyle = "black";
          Game.ctx.fill();
          Game.ctx.restore();
        }
      } else if (angle > 45 && angle <= 135) {
        //top
        let foundX = findX(
          nearestPlayerData.x,
          Game.Viewport.x,
          Game.canvas.width
        );
        if (foundX) {
          Game.ctx.save();
          Game.ctx.beginPath();
          Game.ctx.moveTo(foundX, 15);
          Game.ctx.lineTo(foundX - 15, 40);
          Game.ctx.lineTo(foundX + 15, 40);
          Game.ctx.fillStyle = "black";
          Game.ctx.fill();
          Game.ctx.restore();
        }
      } else if (angle > 135 && angle <= 225) {
        //right
        let foundY = findY(
          nearestPlayerData.y,
          Game.Viewport.y,
          Game.canvas.height
        );
        if (foundY) {
          Game.ctx.save();
          Game.ctx.beginPath();
          Game.ctx.moveTo(Game.canvas.width - 15, foundY);
          Game.ctx.lineTo(Game.canvas.width - 40, 15 + foundY);
          Game.ctx.lineTo(Game.canvas.width - 40, foundY - 15);
          Game.ctx.fillStyle = "black";
          Game.ctx.fill();
          Game.ctx.restore();
        }
      } else if (angle > 225 && angle <= 315) {
        //bottom
        let foundX = findX(
          nearestPlayerData.x,
          Game.Viewport.x,
          Game.canvas.width
        );
        if (foundX) {
          Game.ctx.save();
          Game.ctx.beginPath();
          Game.ctx.moveTo(foundX, Game.canvas.height - 15);
          Game.ctx.lineTo(foundX - 15, Game.canvas.height - 40);
          Game.ctx.lineTo(foundX + 15, Game.canvas.height - 40);
          Game.ctx.fillStyle = "black";
          Game.ctx.fill();
          Game.ctx.restore();
        }
      }
    }
  }
}

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
        Game.World.height - GS.gameState.myPlayer.height / 2 ||
      GS.gameState.myPlayer.x >
        Game.World.width - GS.gameState.myPlayer.width / 2 ||
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
        console.log("pushed");
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
            Socket.sendData([6, player._id, GS.gameState.myPlayer._id]);
            GS.updateGameState({
              type: "PLAYER_HIT",
              payload: {
                _id: player._id,
                by: GS.gameState.myPlayer._id
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
const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);
const tau = Math.PI * 2;

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
      detectCollision();
      updateDashboard();
      // colorRect(0, 0,Game.World.height, Game.World.width, "white");

      Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height); //clear the viewport AFTER the matrix is reset

      Game.Viewport.x = clamp(
        -GS.gameState.myPlayer.x + Game.canvas.width / 2,
        Game.canvas.width - Game.World.width,
        0
      );
      Game.Viewport.y = clamp(
        -GS.gameState.myPlayer.y + Game.canvas.height / 2,
        Game.canvas.height - Game.World.height,
        0
      );

      for (let i = 0; i < Game.World.width; i += 50) {
        for (let j = 0; j < Game.World.height; j += 50) {
          if ((i / 10 + j / 10) & 1) {
            Game.ctx.fillStyle = "hsl(" + (360 - (i + j) / 10) + ", 70%, 70%)";
            Game.ctx.fillRect(
              j + Game.Viewport.x,
              i + Game.Viewport.y,
              100,
              100
            );
          }
        }
      }
      findNearestPlayer();
      GS.gameState.myPlayer.moveAngle = 0;
      GS.gameState.myPlayer.speed = 0;
      if (window.keys && window.keys[32]) {
        GS.gameState.myPlayer.fireBullet();
      }
      if (window.keys && window.keys[65]) {
        GS.gameState.myPlayer.moveAngle = -10;
      }
      if (window.keys && window.keys[68]) {
        GS.gameState.myPlayer.moveAngle = 10;
      }
      if (window.keys && window.keys[87]) {
        if (window.keys && window.keys[16]) {
          GS.gameState.myPlayer.speed = 20;
        } else {
          GS.gameState.myPlayer.speed = 20;
        }
      }
      if (window.keys && window.keys[83]) {
        GS.gameState.myPlayer.speed = -20;
      }

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
  for (var i = 0; i < (canvas.width * canvas.height) / (65 * 65); i++) {
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

function configureHTML() {
  if (document.body.requestFullscreen) {
    document.body.requestFullscreen();
  } else if (document.body.mozRequestFullScreen) {
    /* Firefox */
    document.body.mozRequestFullScreen();
  } else if (document.body.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    document.body.webkitRequestFullscreen();
  } else if (document.body.msRequestFullscreen) {
    /* IE/Edge */
    document.body.msRequestFullscreen();
  }

  document.getElementById("welcomeScreen").remove();
  let gameCanvas = document.getElementById("gameCanvas");
  gameCanvas.style.display = "inline-block";
  gameCanvas.focus();
  gameCanvas.insertAdjacentHTML(
    "afterend",
    `
    <div id="ctrl-fire" ></div> 
    <div id="ctrl-up" ></div> 
    <div id="ctrl-down" ></div> 
    <div id="ctrl-left" ></div> 
    <div id="ctrl-right" ></div> 
    <div class="chat-window" id="chatWindow">
      <div id="statsDisplay" class="stats-display">
      <table>
      <tr><td>Alive : </td><td id="alive"></td></tr> 
      <tr><td>Killed : </td><td id="killed"></td></tr>
      </table>
      </div>
      <div id="feedDisplay" class="feed-display">
      </div>
      <div id="chatDisplay" class="chat-display">
      </div>
      <div class="send-container">
        <form id="chatForm">
          <input autocomplete="off" id="chatInput" type="text"/>
          <button id="chatSubmit" type="submit">
            SEND
          </button>
        </form>
      <div>
    </div>`
  );

  function handleStart(keyCode, div, type = "keydown") {
    window.keys = window.keys || {};
    window.keys[keyCode] = type == "keydown";
    switch (div) {
      case "top":
        up.style.borderBottom = "40px solid red";
        break;
      case "bottom":
        down.style.borderTop = "40px solid red";
        break;
      case "left":
        left.style.borderRight = "40px solid red";
        break;
      case "right":
        right.style.borderLeft = "40px solid red";
        break;
      case "fire":
        fire.style.backgroundColor = "red";
        break;
    }
  }

  function handleEnd(keyCode, div, type = "keyup") {
    window.keys[keyCode] = type == "keydown";
    switch (div) {
      case "top":
        up.style.borderBottom = "40px solid rgba(1,1,1,0.34)";
        break;
      case "bottom":
        down.style.borderTop = "40px solid rgba(1,1,1,0.34)";
        break;
      case "left":
        left.style.borderRight = "40px solid rgba(1,1,1,0.34)";
        break;
      case "right":
        right.style.borderLeft = "40px solid rgba(1,1,1,0.34)";
        break;
      case "fire":
        fire.style.backgroundColor = "rgba(1,1,1,0.34)";
        break;
    }
  }

  var up = document.getElementById("ctrl-up");
  up.addEventListener(
    "touchstart",
    () => {
      handleStart(87, "top");
    },
    false
  );
  up.addEventListener(
    "touchend",
    () => {
      handleEnd(87, "top");
    },
    false
  );

  var down = document.getElementById("ctrl-down");
  down.addEventListener(
    "touchstart",
    () => {
      handleStart(83, "bottom");
    },
    false
  );
  down.addEventListener(
    "touchend",
    () => {
      handleEnd(83, "bottom");
    },
    false
  );

  var left = document.getElementById("ctrl-left");
  left.addEventListener(
    "touchstart",
    () => {
      handleStart(65, "left");
    },
    false
  );
  left.addEventListener(
    "touchend",
    () => {
      handleEnd(65, "left");
    },
    false
  );

  var right = document.getElementById("ctrl-right");
  right.addEventListener(
    "touchstart",
    () => {
      handleStart(68, "right");
    },
    false
  );
  right.addEventListener(
    "touchend",
    () => {
      handleEnd(68, "right");
    },
    false
  );

  var fire = document.getElementById("ctrl-fire");
  fire.addEventListener(
    "touchstart",
    () => {
      handleStart(32, "fire");
    },
    false
  );
  fire.addEventListener(
    "touchend",
    () => {
      handleEnd(32, "fire");
    },
    false
  );

  let chatWindow = document.getElementById("chatWindow");
  chatWindow.style.height = window.innerHeight - 6 + "px";
  document.getElementById("chatForm").addEventListener("submit", e => {
    e.preventDefault();
    let msg = document.getElementById("chatInput").value;
    document.getElementById("chatInput").value = "";
    let cd = document.getElementById("chatDisplay");
    let cm = document.createElement("DIV");
    let t = document.createTextNode(
      GS.gameState.myPlayer.username + " : " + msg
    );
    cm.appendChild(t);
    cd.appendChild(cm);
    Socket.sendData([
      7,
      GS.gameState.myPlayer._id,
      GS.gameState.myPlayer.username,
      msg
    ]);
  });
}
