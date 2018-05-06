import Player from "scripts/components/Player";
import Bullet from "scripts/components/Bullet";

export default (function() {
  let gameState = {
    players: [],
    myPlayer: {},
    bullets:[]
  };

  let updateGameState = action => {
    switch (action.type) {
      case "LOG":
        console.log(action.payload);
        break;

      case "CREATE_PLAYER":
        gameState.myPlayer = new Player.PlayerShip(action.payload._id);

        break;
      case "FIRE_BULLET":
        let dummyBullet = new Bullet.Bullet(action.payload._id,action.payload.x,action.payload.y,action.payload.angle);
        gameState.bullets.push(dummyBullet);

        break;
      case "REMOVE_PLAYER":
        let indexOfPlayerToBeRemoved = gameState.players
          .map(player => player._id)
          .indexOf(action.payload._id);
        gameState.players.splice(indexOfPlayerToBeRemoved, 1);

        break;
      case "INCOMING_PLAYER_POS":
        if (
          gameState.players
            .map(players => players._id)
            .includes(action.payload._id)
        ) {
          gameState.players.forEach(player => {
            if (player._id == action.payload._id) {
              player.x = action.payload.x;
              player.y = action.payload.y;
              player.angle = action.payload.angle;
            }
          });
        } else {
          let newPlayer = new Player.PlayerShip(
            action.payload._id,
            action.payload.x,
            action.payload.y,
            action.payload.angle
          );
          gameState.players.push(newPlayer);
        }

        break;
    }
  };

  return {
    updateGameState,
    gameState
  };
})();
