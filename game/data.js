// Shared data

// Array to keep players. Synchronizes with client side
var players = {};
var clients = {};
var planets = {};

function arrayFilter(filters, array) {
  var ret = {};
  filters.forEach(function(e){
    if(array[e] != null)
      ret[e] = array[e];
  });
  return ret;
}

exports.players = players;
exports.clients = clients;
exports.planets = planets;
exports.arrayFilter = arrayFilter;