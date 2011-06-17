var helpers = require('./helpers.js');
var sys = require('sys');
function Planet(planetmodel) {
  this.source = planetmodel;
  this.currTrades = {};
}

Planet.prototype.getBasicData = function() {
  return helpers.arrayFilter(["name", "kind", "position", "src", "size"], this.source);
}

Planet.prototype.getName = function() {
  return this.source.name;
}

Planet.prototype.getPos = function() {
  var ret = {};
  ret.x = parseInt(this.source.position.x.toString());
  ret.y = parseInt(this.source.position.y.toString());
  return ret;
}

Planet.prototype.getResource = function(res) {
  console.log(res);
  return parseInt(this.source.resources[res].toString());
}

//Updating
Planet.prototype.updateResource = function(incdec, res, am) {
  if(incdec == 'increase')
    this.source.resources[res] += am;
  else if(incdec == 'decrease')
    this.source.resources[res] -= am;
  else
    return;
  this.updateTradingPlayers();
  this.save();
}

Planet.prototype.updateTradingPlayers = function() {
  var tmp = this.currTrades;
  Object.keys(this.currTrades).forEach(function(e,i,a) {
    tmp[e].updateTrade();
  });
}

//Trading
Planet.prototype.getTradeData = function() {
  ret = {};
  ret.name = this.getName();
  ret.resources = this.source.resources;
  ret.prices = this.genPrices();
  return ret;
}

Planet.prototype.initTrade = function(player) {
  if(this.currTrades[player.getName()] != undefined) {
    console.log("Player %s is already trading on %s. Can't initiate trade!", player.getName(), this.getName());
  } else {
    this.currTrades[player.getName()] = player;
    player.initTrade(this);
  }
}

Planet.prototype.doTrade = function(tData) {
  this.updateResource('decrease', tData.buy.resource, tData.buy.amount);
  this.updateResource('increase', tData.sell.resource, tData.sell.amount);
}

Planet.prototype.endTrade = function(player) {
  if(this.currTrades[player.getName()] == undefined)
    console.log("Player %s wasn't trading on %s, so the trade can't be ended", player.getName(), this.getName());
  else {
    delete this.currTrades[player.getName()];
  }
}

Planet.prototype.genPrices = function() {
  //toDo
  return {"gold": 1, "deuterium": 2, "food": 3};
}

Planet.prototype.priceMatch = function() {
  //toDo
  return true;
}

//DB
Planet.prototype.save = function(f) {
  this.source.save(function(e) {
     if(e)
       console.log("some saving problems: " + e);
  });
}

exports.Planet = Planet;