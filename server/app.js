var express = require("express");
var app = express();
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var WebSocket = require("ws");
var uuidv4 = require("uuid/v4");
var url = require("url");
var msgpack = require("msgpack-lite");

app.set("port", process.env.PORT || 3000);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var server = app.listen(app.get("port"));

const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "Public")));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/Public/views/index.html");
});

let players = [];

function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", function connection(ws, req) {
  const location = url.parse(req.url, true);
  const username = location.query.name;
  // Assign a unique identifier to the player connected
  ws.uid = uuidv4().split("-")[0];
  ws.isAlive = true;
  ws.on("pong", heartbeat);
  players.push(ws.uid);

  ws.send(msgpack.encode([1, ws.uid, username]));

  ws.on("close", function() {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msgpack.encode([2, ws.uid]));
      }
    });
  });

  ws.on("message", function(message) {
    if (message instanceof Buffer) {
      let msg = socketEP(message);
      switch (msg.event) {
        case "MY_PLAYER_POS":
          wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                msgpack.encode([
                  4,
                  msg.data._id,
                  msg.data.x,
                  msg.data.y,
                  msg.data.angle,
                  msg.data.life,
                  msg.data.username
                ])
              );
            }
          });
          break;
        case "FIRE_BULLET":
          wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                msgpack.encode([
                  5,
                  msg.data._id,
                  msg.data.x,
                  msg.data.y,
                  msg.data.angle
                ])
              );
            }
          });
          break;
        case "PLAYER_HIT":
          wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(msgpack.encode([6, msg.data._id]));
            }
          });
          break;
        case "RECEIVE_MSG":
          wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(msgpack.encode([7, msg.data._id,msg.data.username,msg.data.msg]));
            }
          });
          break;
      }
    }
  });
});

function socketEP(socketData) {
  let decodedData = msgpack.decode(new Uint8Array(socketData));

  let event = "";
  let data = "";
  switch (decodedData[0]) {
    case 1:
      event = "CREATE_PLAYER";
      data = { _id: decodedData[1], username: decodedData[2] };

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
        life: decodedData[5],
        username: decodedData[6]
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
        life: decodedData[5],
        username:decodedData[6]
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
  }
}

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 5000);
