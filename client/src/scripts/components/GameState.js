import Player from "scripts/components/Player";
import Bullet from "scripts/components/Bullet";

export default (function() {
  let gameState = {
    players: [],
    myPlayer: {},
    bullets: [],
    initGame: false
  };
  setInterval(() => {
    console.log(gameState.myPlayer);
  }, 1000);

  let updateGameState = action => {
    switch (action.type) {
      case "LOG":
        console.log(action.payload);
        break;

      case "GAME_RESET":
        gameState = {
          players: [],
          myPlayer: {},
          bullets: [],
          initGame: false
        };

        break;
      case "CREATE_PLAYER":
        gameState.myPlayer = new Player.PlayerShip(
          action.payload._id,
          Math.floor(Math.random() * 5000 + 1),
          Math.floor(Math.random() * 5000 + 1),
          action.payload.username
        );
        gameState.initGame = true;

        break;
      case "FIRE_BULLET":
        let dummyBullet = new Bullet.Bullet(
          action.payload._id,
          action.payload.x,
          action.payload.y,
          action.payload.angle
        );
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
              player.life = action.payload.life
            }
          });
        } else {
          let newPlayer = new Player.PlayerShip(
            action.payload._id,
            action.payload.x,
            action.payload.y,
            action.payload.username,
            action.payload.angle
          );
          gameState.players.push(newPlayer);
        }
        break;

      case "DESTROY_BULLETS":
      
        gameState.myPlayer.bullets = action.payload.myPlayerBullets;
        gameState.bullets = action.payload.allPlayerBullets;
      
        break;

      case "PLAYER_HIT":
        if (action.payload._id == gameState.myPlayer._id) {
          if (gameState.myPlayer.life == 20) {
            gameState.myPlayer.alive = false;
            gameState.myPlayer.life = gameState.myPlayer.life - 20;
            gameState.initGame = false;
            document.getElementById("gameCanvas").remove();
            document.getElementById("chatWindow").remove();
            var div = document.createElement("DIV");
            var t = document.createTextNode("GAME OVER!!!"); // Create a text node
            div.appendChild(t); // Append the text to <button>
            document.body.appendChild(div);
            div.style.color = "black";
            div.style.fontSize = "50px";
            div.style.position = "absolute";
            div.style.left = "8px";

            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            gameState.myPlayer.life = gameState.myPlayer.life - 20;
          }
        } else {
          for (let player of gameState.players) {
            if (player._id == action.payload._id) {
              if (player.life == 20) {
                player.life = player.life - 20;
                updateGameState({
                  type: "REMOVE_PLAYER",
                  payload: { _id: player._id }
                });
              } else {
                player.life = player.life - 20;
              }
            }
          }
        }

        break;
    }
  };

  return {
    updateGameState,
    gameState
  };
})();
