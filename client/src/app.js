import Game from "scripts/components/Game";
import Player from "scripts/components/Player";
import Bullet from "scripts/components/Bullet";
import Socket from "scripts/components/Socket";
import GS from "scripts/components/GameState";

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

var button = document.getElementById("startGame");
button.addEventListener("click", function() {
  button.remove();
 
  Socket.init();
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
