import msgpack from "msgpack-lite";

export let socketEP = socketData => {
  if (socketData.data instanceof ArrayBuffer) {
    let decodedData = msgpack.decode(new Uint8Array(socketData.data));
    let event = "";
    let data = "";
    switch (decodedData[0]) {
      case 1:
        event = "CREATE_PLAYER";
        data = { _id: decodedData[1] };

        return {
          event,
          data
        };
        break;
      case 2:
        event = "REMOVE_PLAYER";
        data = { _id: decodedData[1] };

        return {
          event,
          data
        };
        break;

      case 3:
        event = "MY_PLAYER_POS";
        data = {
          _id: decodedData[1],
          x: decodedData[2],
          y: decodedData[3],
          angle: decodedData[4],
          life:decodedData[5]
        };

        return {
          event,
          data
        };
        break;

      case 4:
        event = "INCOMING_PLAYER_POS";
        data = {
          _id: decodedData[1],
          x: decodedData[2],
          y: decodedData[3],
          angle: decodedData[4],
          life: decodedData[5]
        };

        return {
          event,
          data
        };
        break;
      case 5:
        event = "FIRE_BULLET";
        data = {
          _id: decodedData[1],
          x: decodedData[2],
          y: decodedData[3],
          angle: decodedData[4]
        };

        return {
          event,
          data
        };
        break;
      case 6:
        event = "PLAYER_HIT";
        data = {
          _id: decodedData[1]
        };

        return {
          event,
          data
        };
        break;
    }
  }
};
