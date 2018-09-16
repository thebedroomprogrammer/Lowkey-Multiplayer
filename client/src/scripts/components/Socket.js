import { socketEP } from "scripts/utils";
import GS from "scripts/components/GameState";
import msgpack from "msgpack-lite";
import Game from "scripts/components/Game";

export default (function() {
  let ws;
  let createConnection = username => {
    ws = new WebSocket(
      "wss://lowkeymultiplayer.herokuapp.com/?name=" + username
    );
    ws.binaryType = "arraybuffer";

    ws.onmessage = function(socketMsg) {
      let msg = socketEP(socketMsg);

      switch (msg.event) {
        case "CREATE_PLAYER":
          GS.updateGameState({
            type: "CREATE_PLAYER",
            payload: {
              _id: msg.data._id,
              username: msg.data.username,
              players:msg.data.players
            }
          });

          break;

        case "FIRE_BULLET":
          GS.updateGameState({
            type: "FIRE_BULLET",
            payload: msg.data
          });

          break;

        case "INCOMING_PLAYER_POS":
          GS.updateGameState({
            type: "INCOMING_PLAYER_POS",
            payload: msg.data
          });
          break;

        case "REMOVE_PLAYER":
          GS.updateGameState({
            type: "REMOVE_PLAYER",
            payload: msg.data
          });
          break;
        case "PLAYER_HIT":
          GS.updateGameState({
            type: "PLAYER_HIT",
            payload: msg.data
          });
          break;
          case "PLAYER_JOINED":
          GS.updateGameState({
            type: "PLAYER_JOINED",
            payload: msg.data
          });
          break;
        case "RECEIVE_MSG":
      
          let cm = document.createElement("DIV");
          let t = document.createTextNode(
            msg.data.username + " : " + msg.data.msg
          );
          cm.id="chatBubble";
          cm.class = "chat-bubble";
          cm.appendChild(t);
          document.getElementById("chatDisplay").appendChild(cm);
          break;
      }
    };

    setInterval(() => {
      if (GS.gameState.myPlayer.alive) {
        let pos = GS.gameState.myPlayer.pos();
        ws.send(
          msgpack.encode([
            3,
            pos._id,
            pos.x,
            pos.y,
            pos.angle,
            // GS.gameState.myPlayer.life,
            // GS.gameState.myPlayer.username
          ])
        );
      }
    }, 1000 / 30);

    setInterval(() => {
      if (GS.gameState.myPlayer && GS.gameState.myPlayer.bullets) {
        var myPlayerBullets = GS.gameState.myPlayer.bullets.filter(bullet => {
          console.log(bullet.x);
          if (
            bullet.x > 0 &&
            bullet.x < Game.World.width &&
            bullet.y > 0 &&
            bullet.y < Game.World.height
          ) {
            return true;
          }
          return false;
        });
      }
      if (GS.gameState.bullets) {
        var allPlayerBullets = GS.gameState.bullets.filter(bullet => {
          if (
            bullet.x > 0 &&
            bullet.x < Game.World.width &&
            bullet.y > 0 &&
            bullet.y < Game.World.height
          ) {
            return true;
          }
          return false;
        });
      }

      GS.updateGameState({
        type: "DESTROY_BULLETS",
        payload: {
          myPlayerBullets,
          allPlayerBullets
        }
      });
    }, 1000);
  };

  let sendData = data => {
    ws.send(msgpack.encode(data));
  };

  return {
    init: createConnection,
    sendData: sendData
  };
})();
