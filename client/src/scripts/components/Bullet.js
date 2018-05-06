import Game from "scripts/components/Game";

export default (function() {
  function Bullet(id, x, y, angle, speed) {
    this.width = 2;
    this._id = id;
    this.color = "white";
    this.height = 7;
    this.speed = 5;
    this.angle = angle;
    this.x = x;
    this.y = y;
    this.mode = 0; //0 for manual , 1 for semi , 2 for auto
  }
  Bullet.prototype.newPos = function() {
    this.x += this.speed * Math.sin(this.angle);
    this.y -= this.speed * Math.cos(this.angle);
  };

  Bullet.prototype.update = function() {
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
  return {
    Bullet
  };
})();
