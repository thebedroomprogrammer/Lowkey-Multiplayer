var express = require("express");
var app = express();
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var WebSocket = require("ws");
var uuidv4 = require("uuid/v4");

app.set("port", process.env.PORT || 3000);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var server = app.listen(app.get("port"));

const wss = new WebSocket.Server({ server });


app.use(express.static(path.join(__dirname, 'Public')));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/Public/views/index.html');
});

let players = [];

function heartbeat() {
  this.isAlive = true;
}

wss.on("connection", function connection(ws, req) {
  // Assign a unique identifier to the player connected
  ws.uid = uuidv4();
  ws.isAlive = true;
  ws.on("pong", heartbeat);
  players.push(ws.uid);

  ws.send(JSON.stringify(["CREATE_PLAYER", { _id: ws.uid }]));

  ws.on("close", function() {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(["REMOVE_PLAYER", { _id: ws.uid }]));
      }
    });
  });

  ws.on("message", function(message) {
    let msg = socketEP(message);

    switch (msg.event) {
      case "MY_PLAYER_POS":
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(["INCOMING_PLAYER_POS", msg.data]));
          }
        });
        break;
      case "FIRE_BULLET":
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(["FIRE_BULLET", msg.data]));
          }
        });
        break;
    }
  });
});



function socketEP(socketData) {
  let parsedData = JSON.parse(socketData);
  let event = parsedData[0];
  let data = parsedData[1];

  return {
    event,
    data
  };
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
