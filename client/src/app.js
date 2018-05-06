import Game from "scripts/components/Game";
import Player from "scripts/components/Player";
import Bullet from "scripts/components/Bullet";
import Socket from "scripts/components/Socket";
import GS from "scripts/components/GameState";

(function() {
  Socket.init();

  function draw() {
    
    colorRect(0, 0, Game.canvas.height, Game.canvas.width, "black");
    GS.gameState.myPlayer.moveAngle = 0;
    GS.gameState.myPlayer.speed = 0;
    if (window.keys && window.keys[32]) {
      GS.gameState.myPlayer.fireBullet();
    }
    if (window.keys && window.keys[65]) {
      GS.gameState.myPlayer.moveAngle = -3;
    }
    if (window.keys && window.keys[68]) {
      GS.gameState.myPlayer.moveAngle = 3;
    }
    if (window.keys && window.keys[87]) {
      GS.gameState.myPlayer.speed = 3;
    }
    if (window.keys && window.keys[83]) {
      GS.gameState.myPlayer.speed = -3;
    }

    GS.gameState.myPlayer.newPos();
    GS.gameState.myPlayer.update();
    GS.gameState.bullets.forEach((bullet)=>{
      bullet.newPos();
      bullet.update();
    });
    GS.gameState.players.forEach((player)=>{
      player.update();
    });
    GS.gameState.myPlayer.bullets.forEach(function(bullet) {
      bullet.newPos();
      bullet.update();
    });
  }

  function update() {
    setInterval(function() {
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
 
})();
