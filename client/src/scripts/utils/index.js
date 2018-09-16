import msgpack from "msgpack-lite";

export let socketEP = socketData => {
  if (socketData.data instanceof ArrayBuffer) {
    let decodedData = msgpack.decode(new Uint8Array(socketData.data));
    let event = "";
    let data = "";
    switch (decodedData[0]) {
      case 1:
        event = "CREATE_PLAYER";
        data = {
          _id: decodedData[1],
          username: decodedData[2],
          players: JSON.parse(decodedData[3])
        };

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
          angle: decodedData[4]
          // life: decodedData[5],
          // username: decodedData[6]
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
          angle: decodedData[4]
          // life: decodedData[5],
          // username:decodedData[6]
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
          _id: decodedData[1],
          by: decodedData[2]
        };

        return {
          event,
          data
        };
        break;
      case 7:
        event = "RECEIVE_MSG";
        data = {
          _id: decodedData[1],
          username: decodedData[2],
          msg: decodedData[3]
        };

        return {
          event,
          data
        };
        break;
      case 8:
        event = "PLAYER_JOINED";
        data = {
          _id: decodedData[1],
          username: decodedData[2]
        };

        return {
          event,
          data
        };
        break;
    }
  }
};

export let area = (x1, y1, x2, y2, x3, y3) => {
  return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
};

export let checkPointInPlane = ({ x1, y1, x2, y2, x3, y3, x4, y4, x, y }) => {
  let A = area(x1, y1, x2, y2, x3, y3) + area(x1, y1, x4, y4, x3, y3);
  let A1 = area(x, y, x1, y1, x2, y2);
  let A2 = area(x, y, x2, y2, x3, y3);
  let A3 = area(x, y, x3, y3, x4, y4);
  let A4 = area(x, y, x1, y1, x4, y4);

  return A == A1 + A2 + A3 + A4;
};

export let findX = (x1,x2,x) => {
  let findX;
  if (x1 + x2 < 25) {
    findX = 25;
  } else if (x1 + x2 >= x) {
    findX = x - 25;
  } else if (x1 + x2 >= 25 && x1 + x2 + 25 <= x) {
    findX = x1 + x2;
  }
  return findX;
};

export let findY = (y1, y2, y) => {
  let findY;
  if (y1 + y2 < 25) {
    findY = 25;
  } else if (y1 + y2 >= y) {
    findY = y - 25;
  } else if (y1 + y2 >= 25 && y1 + y2 + 25 <= y) {
    findY = y1 + y2;
  }
  return findY;
};
