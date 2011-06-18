var helpers = require('./helpers.js');
var sys = require('sys');
function Planet(planetmodel) {
  this.source = planetmodel;
  this.currTrades = {};
}

//ResourceProducers
Planet.prototype.produceResources = function() {
  var kind = this.getKind();
  var size = this.getSize();
  
  if(!this.canProduce())
    return;
    
  var sd = 5;
  var mean
  if(size == "dwarf")
    mean = 25;
  else if(size == "terrestrial")
    mean = 75;
  else if(size == "giant")
    mean = 125;
  else {
    console.log("error size");
    return;  
  }
  
  var fooddi = "decrease";
  var deuteriumdi = "decrease";
  var golddi = "decrease";
  
  if(kind == "agricultural")
    fooddi = "increase";
  else if(kind == "factory")
    deuteriumdi ="increase";
  else if(kind == "mining")
    golddi = "increase";

  var num = helpers.normal();
  var food = Math.floor(Math.abs(num[0])*sd+mean);
  var deuterium = Math.floor(Math.abs(num[1])*sd+mean);
  var gold = Math.floor(Math.abs(helpers.normal()[0])*sd+mean);

  this.updateResource(fooddi, "food", food);
  this.updateResource(deuteriumdi, "deuterium", deuterium);
  this.updateResource(golddi, "gold", gold);

  this.updateTradingPlayers();
}

Planet.prototype.canProduce = function() {
  var kind = this.getKind();
  var gold = this.getResource("gold") > 0;
  var deuterium = this.getResource("deuterium") > 0;
  var food = this.getResource("food") > 0;
  
  if(kind == "agricultural")
    return gold && deuterium;
  else if(kind == "factory")
    return food && gold;
  else if(kind == "mining")
    return food && deuterium;
  else
    return false;
}

//Getters
Planet.prototype.getBasicData = function() {
  return helpers.arrayFilter(["name", "kind", "position", "src", "size"], this.source);
}

Planet.prototype.getName = function() {
  return this.source.name.toString();
}

Planet.prototype.getPos = function() {
  var ret = {};
  ret.x = parseInt(this.source.position.x.toString());
  ret.y = parseInt(this.source.position.y.toString());
  return ret;
}

Planet.prototype.getResource = function(res) {
  return parseInt(this.source.resources[res].toString());
}

Planet.prototype.getSize = function() {
  return this.source.size.toString();
}

Planet.prototype.getKind = function() {
  return this.source.kind.toString();
}

//Updating
Planet.prototype.updateResource = function(incdec, res, am) {
  if(incdec == 'increase') {
    this.source.resources[res] += am;
  } else if(incdec == 'decrease') {
    if(this.source.resources[res] - am <= 0)
      this.source.resources[res] = 0
    else
      this.source.resources[res] -= am;
  } else {
    console.log("error incdec");
    return;
  }
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
  this.updateTradingPlayers();
}

Planet.prototype.endTrade = function(player) {
  if(this.currTrades[player.getName()] == undefined)
    console.log("Player %s wasn't trading on %s, so the trade can't be ended", player.getName(), this.getName());
  else {
    delete this.currTrades[player.getName()];
  }
}

Planet.prototype.verifyTrade = function(tData) {
  //check price validity
  var price = this.priceMatch(tData);
  //check amount of selling stuff
  var sell = this.getResource(tData.buy.resource) >= tData.buy.amount
  return price && sell;
}

Planet.prototype.genPrices = function() {
  //toDo
  return {gold: 1, deuterium: 2, food: 3};
}

Planet.prototype.priceMatch = function(iData) {
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