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
    console.log(gameState);
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
          parseFloat((Math.floor(Math.random() * 5000 + 1)).toFixed(2)),
          parseFloat((Math.floor(Math.random() * 5000 + 1)).toFixed(2)),
          0,
          action.payload.username
        );
        for(let player of action.payload.players){
          if(player._id != action.payload._id){
            gameState.players.push(new Player.PlayerShip(
              player._id,
              5000,
              5000,
              0,
              player.username
            ));
          }
        }
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
          if(indexOfPlayerToBeRemoved >= 0){
            gameState.players.splice(indexOfPlayerToBeRemoved, 1);
          }
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
              // player.life = action.payload.life
            }
          });
        } else {
          // let newPlayer = new Player.PlayerShip(
          //   action.payload._id,
          //   action.payload.x,
          //   action.payload.y,
          //   action.payload.angle
          // );
          // gameState.players.push(newPlayer);
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
              let msg = "";
              if (player.life == 20) {
                if(action.payload.by == gameState.myPlayer._id){
                  gameState.myPlayer.killCount += 1; 
                  msg = `${gameState.myPlayer.username} killed ${player.username}`;
                }else{
                  let indexOfKiller = gameState.players
                  .map(player => player._id)
                  .indexOf(action.payload.by);
                  msg =  msg = `${gameState.players[indexOfKiller].username} killed ${player.username}`
                }
                player.life = player.life - 20;
                let fd = document.getElementById("feedDisplay");
                let fm = document.createElement("DIV");
                let t = document.createTextNode(
                 msg
                );
                fm.appendChild(t);
                fd.appendChild(fm);
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
        case "PLAYER_JOINED":
        gameState.players.push(new Player.PlayerShip(
          action.payload._id,
          5000,
          5000,
          0,
          action.payload.username
        ));
    }
  };

  return {
    updateGameState,
    gameState
  };
})();
