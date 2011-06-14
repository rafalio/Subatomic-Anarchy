// Shared data

// Arrays to keep players and planets. Synchronizes with client side.
var players = {};
var planets = {};
var models;
var socket;

function start(_models, _socket,cb) {
  models = _models;
  socket = _socket;
  loadPlanets(cb);
}

function arrayFilter(filters, array) {
  var ret = {};
  filters.forEach(function(e){
    if(array[e] != null)
      ret[e] = array[e];
  });
  return ret;
}

function loadPlanets(cb) {
  models.Planet.find({},function(err, res){
    if(!err) {
      res.forEach(function(e){
        planets[e["name"]] = e;
      });
      cb();
    } else {
      console.log("Massive fucking error. Go and fix right now!");
    }
  });
}

function addPlayer(player, client) {
  if(!players[player.username]) {
    console.log("adding %s to session", player.username);
    players[player.username] = player;
    players[player.username].client = client;
  } else {
    console.log("player %s tried to connect for a second time", player.username);
  }
}

function deletePlayer(username) {
  delete players[username];
  console.log("deleting player %s from player list", username);
}

function playersExtr(exclude) {
  var ret = {};
  Object.keys(players).forEach(function(e,i,a) {
    if(e != exclude)
      ret[e] = playerExtr(e);
  });
  return ret;
}

function playerExtr(username) {
  return arrayFilter(["username", "position", "rotation", "shipType"], players[username]);
}

function mainPlayerExtr(username) {
  return arrayFilter(["username", "position", "rotation", "resources", "shipType", "capactiy"], players[username]);
}

function planetsExtr() {
  var ret = {};
  Object.keys(planets).forEach(function(e,i,a) {
    ret[e] = arrayFilter(["name", "kind", "position", "src"], planets[e]);
  });
  return ret;
}

function updatePlanetData(data, planetname) {
  updateData('planet', data, planetname);
}

function updatePlayerData(data, username){
  updateData('player', data, username)
}

function updateData(t, data, name) {
  var a;
  var m;
  if (t == 'player') {
    a = players;
    m = models.User;
  } else if (t == 'planet') {
    a = planets;
    m = models.Planet;
  } else {
    return;
  }
  m.findById(a[name]._id, function(err, p) {
    Object.keys(data).forEach(function(e,i,arr) {
      if(a[name][e] != undefined)
        p[e] = a[name][e] = data[e];
      else
        console.log("Trying to save wrong data");
    });
    p.save(function(err) {
      if(err)
        console.log('Databse data saving error');
      else
        console.log('Saving successfull');
    });
  });
}

function newPos(pData, uname) {
  console.log('I\'m hjdfksdf');
  Object.keys(planets).forEach(function(e,i,a){
    if(pData.position.x == planets[e].position.x && pData.position.y == planets[e].position.y) {
      console.log('i\'m here');
      var planet = {
        name: e,
        resources: planets[e].resources,
        prices: genPrices(e)
      };
      socket.initTrade(players[uname].client, uname, planet);
      pData.position.x = -1;
      pData.position.y = -1;
      //you can't break out of forEach. I'll try to fix it osme other time.
    }
  });
  socket.updatePos(players[uname].client, uname, pData);
  updatePlayerData(pData, uname);
}

function genPrices(planetname) {
  return {gold:1, food:2, deuterium:3};
}

exports.start = start;
exports.players = players;
exports.planets = planets;
exports.arrayFilter = arrayFilter;
exports.addPlayer = addPlayer;
exports.deletePlayer = deletePlayer
exports.playersExtr = playersExtr;
exports.playerExtr = playerExtr;
exports.mainPlayerExtr = mainPlayerExtr;
exports.planetsExtr = planetsExtr;
exports.newPos = newPos;