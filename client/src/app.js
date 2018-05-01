import Game from "scripts/components/Game";
import Player from "scripts/components/Player";
import Bullet from "scripts/components/Bullet";

(function() {
  
  var myPlayer = {
    x: 10,
    y: 10
  };

  var myGamePiece = new Player.PlayerShip();

  function draw() {
    colorRect(0, 0, Game.canvas.height, Game.canvas.width, "black");
    myGamePiece.moveAngle = 0;
    myGamePiece.speed = 0;
    if (window.keys && window.keys[32]) {
      myGamePiece.fireBullet();
    }
    if (window.keys && window.keys[65]) {
      myGamePiece.moveAngle = -3;
    }
    if (window.keys && window.keys[68]) {
      myGamePiece.moveAngle = 3;
    }
    if (window.keys && window.keys[87]) {
      myGamePiece.speed = 3;
    }
    if (window.keys && window.keys[83]) {
      myGamePiece.speed = -3;
    }

    myGamePiece.newPos();
    myGamePiece.update();
    myGamePiece.bullets.forEach(function(bullet) {
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
