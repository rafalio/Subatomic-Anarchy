// Shared data

// Arrays to keep players and planets. Synchronizes with client side.
var players = {};
var planets = {};
var users = {};
var models;
var socket;
var Planet;

function start(_models, _socket, _Planet, cb) {
  models = _models;
  socket = _socket;
  Planet = _Planet;
  loadPlanets(cb);
}

function loadPlanets(cb) {
  models.Planet.find({},function(err, res){
    if(!err) {
      res.forEach(function(e){
        planets[e["name"]] = new Planet.Planet(e);
      });
      cb();
    } else {
      console.log("Massive fucking error. Go and fix right now!");
    }
  });
}

function addPlayer(player, client, chatBuf) {
  if(!players[player.getName()]) {
    console.log("adding %s to game", player.getName());
    players[player.getName()] = player;
    player.connectSocket(client);
    client.send({ 
      type:     'onNewConnect',
      me:       player.getMainData(),
      everyone: getPlayersExcept(player.getName()),
      planets:  getPlanets(),
      chatBuf:  chatBuf
    });
   // console.log(getPlanets());
    checkTrade(player.getName());
    
  } else {
    console.log("player %s tried to connect to the game a second time", player.getName());
  }
}

function getPlayersExcept(exclude) {
  var ret = {};
  Object.keys(players).forEach(function(e,i,a) {
    if(e != exclude)
      ret[e] = players[e].getBasicData();
  });
  return ret;
}

function getPlanets() {
  var ret = {};
  Object.keys(planets).forEach(function(e,i,a) {
    ret[e] = planets[e].getBasicData();
  });
  return ret;
}

function deletePlayer(username) {
  players[username].disconnectSocket();
  delete players[username];
  console.log("deleting player %s from player list", username);
}

function newPos(pData, username) {
  players[username].updatePosition(pData);
  checkTrade(username);
}

function checkTrade(username) {
  var ship = players[username].getPos();
  Object.keys(planets).forEach(function(e,i,a) {
    var planet = planets[e].getPos();
    if(ship.x == planet.x && ship.y == planet.y) {
      planets[e].initTrade(players[username]);
    }
  });
}

function doTrade(msg, username) {
  players[username].startDoTrade(msg);
}

function endTrade(username) {
  players[username].endTrade();
}

function shipUpdate(msg, username) {
  players[username].updateShipType(msg.shipType);
}

exports.start = start;
exports.users = users;
exports.players = players;
exports.planets = planets;
exports.addPlayer = addPlayer;
exports.endTrade = endTrade;
exports.deletePlayer = deletePlayer
exports.newPos = newPos;
exports.doTrade = doTrade;
exports.shipUpdate = shipUpdate;