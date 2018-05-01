import Game from "scripts/components/Game";
import Bullet from "scripts/components/Bullet";

export default (function() {
  //Player Ship Code Starts
  function PlayerShip() {
    this.width = 30;
    this.color = "white";
    this.height = 30;
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = 30;
    this.y = 30;
    this.bullets = [];
    this.canFire = true;
  }

  PlayerShip.prototype.newPos = function() {
    this.angle += this.moveAngle * Math.PI / 180;
    this.x += this.speed * Math.sin(this.angle);
    this.y -= this.speed * Math.cos(this.angle);
  };

  PlayerShip.prototype.update = function() {
    Game.ctx.save();
    Game.ctx.translate(this.x, this.y);
    Game.ctx.rotate(this.angle);
    Game.ctx.fillStyle = this.color;
    Game.ctx.fillRect(
      this.width / -2,
      this.height / -2,
      this.width,
      this.height
    );
    Game.ctx.restore();
  };

  PlayerShip.prototype.fireBullet = function() {
    if (this.canFire && window.keys[32]) {
      this.canFire = false;
      this.bullets.push(new Bullet.Bullet(this.x, this.y, this.angle, this.speed));
      var thisPlayerShip = this;
      setTimeout(function() {
        thisPlayerShip.canFire = true;
      }, 150);
    }
  };

  return {
      PlayerShip
  }
})();
