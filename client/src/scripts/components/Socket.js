import { socketEP } from "scripts/utils";
import GS from "scripts/components/GameState";

export default (function() {
  let ws;
  let createConnection = () => {
    ws = new WebSocket("ws://localhost:3000");

    ws.onmessage = function(socketMsg) {
      let msg = socketEP(socketMsg);

      switch (msg.event) {
        case "CREATE_PLAYER":
          console.log("create player");
          GS.updateGameState({
            type: "CREATE_PLAYER",
            payload: {
              _id: msg.data._id
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
      }
    };

    setInterval(() => {
      ws.send(JSON.stringify(["MY_PLAYER_POS", GS.gameState.myPlayer.pos()]));
    }, 1000 / 30);
  };

  let sendData = data => {
    ws.send(JSON.stringify(data));
  };

  return {
    init: createConnection,
    sendData: sendData
  };
})();
