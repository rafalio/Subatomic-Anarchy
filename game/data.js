// Shared data

// Arrays to keep players and planets. Synchronizes with client side.
var players = {};
var planets = {};
var models;

function start(_models,cb) {
  models = _models;
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

function addPlayer(player) {
  if(!players[player.username]) {
    console.log("adding %s to session", player.username);
    players[player.username] = player;
  } else {
    console.log("player %s tried to connect for a second time", player.username);
  }
}

function deletePlayer(username) {
  delete players[username];
  console.log("deleting player %s from player list", username);
}

function playersExtr() {
  var ret = {};
  Object.keys(players).forEach(function(e,i,a){
    ret[e] = playerExtr(e);
  });
  return ret;
}

function playerExtr(username) {
  return arrayFilter(["username","position","rotation","shipType","resources", "capactiy"], players[username]);
}

function planetsExtr() {
  var ret = {};
  Object.keys(planets).forEach(function(e,i,a){
    ret[e] = arrayFilter(["name", "kind", "resources", "position", "src"], planets[e]);
  });
  return ret;
}

function updatePlayerData(data, username){
  models.User.findById(players[username]._id, function(err, p) {
    Object.keys(data).forEach(function(e,i,a) {
      players[username][e] = data[e];
      p[e] = data[e];
    });
    p.save(function(err) {
      if(err)
        console.log('Databse data saving error');
      else
        console.log('Saving successfull');
    });
  });
}

exports.start = start;
exports.players = players;
exports.planets = planets;
exports.arrayFilter = arrayFilter;
exports.addPlayer = addPlayer;
exports.deletePlayer = deletePlayer
exports.playersExtr = playersExtr;
exports.playerExtr = playerExtr;
exports.planetsExtr = planetsExtr;
exports.updatePlayerData = updatePlayerData;