import Game from "scripts/components/Game";
import Bullet from "scripts/components/Bullet";
import Socket from "scripts/components/Socket";

export default (function() {
  //Player Ship Code Starts
  function PlayerShip(id, x = 30, y = 30, angle = 0) {
    this.width = 30;
    this.color = "white";
    this.height = 30;
    this.speed = 0;
    this.angle = angle;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;
    this.bullets = [];
    this.canFire = true;
    this._id = id;
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
      this.bullets.push(
        new Bullet.Bullet(this._id, this.x, this.y, this.angle, this.speed)
      );
      Socket.sendData([
        "FIRE_BULLET",
        { _id: this._id, x: this.x, y: this.y, angle: this.angle }
      ]);
      var thisPlayerShip = this;
      setTimeout(function() {
        thisPlayerShip.canFire = true;
      }, 150);
    }
  };

  PlayerShip.prototype.pos = function() {
    return {
      _id: this._id,
      x: this.x,
      y: this.y,
      angle: this.angle
    };
  };

  return {
    PlayerShip
  };
})();
