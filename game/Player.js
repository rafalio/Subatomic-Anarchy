var helpers = require('./helpers.js');

function Player(playermodel) {
  this.source = playermodel;
}

Player.prototype.getId = function(){
  return this.source._id;
}


Player.prototype.getBasicData = function() {
  return helpers.arrayFilter(["username", "position", "rotation", "shipType"], this.source);
}

Player.prototype.getMainData = function() {
  return helpers.arrayFilter(["username", "position", "rotation", "resources", "shipType", "capacity"], this.source);
}

Player.prototype.getName = function() {
  return this.source.username;
}

Player.prototype.getPos = function() {
  var ret = {};
  ret.x = parseInt(this.source.position.x.toString());
  ret.y = parseInt(this.source.position.y.toString());
  return ret;
}

Player.prototype.getRot = function() {
  return parseInt(this.source.rotation.toString());
}

Player.prototype.getTrade = function() {
  return this.currTrade;
}

Player.prototype.getAdmin = function() {
  return this.source.admin;
}

Player.prototype.getResource = function(res) {
  return parseInt(this.source.resources[res].toString());
}

Player.prototype.getResourcesAmount = function() {
  return this.getResource('gold') + this.getResource('deuterium') + this.getResource('food');
}

Player.prototype.getShipType = function() {
  return parseInt(this.source.shipType.toString());
}

Player.prototype.getCapacity = function() {
  return parseInt(this.source.capacity.toString());
}

//Socket
Player.prototype.connectSocket = function(client) {
  this.client = client;
  client.broadcast({
    type: 'newArrival',
    player: this.getBasicData()
  });
}

Player.prototype.disconnectSocket = function() {
  this.endTrade();
  delete this.client;
}

Player.prototype.sendResourceUpdate = function() {
  this.client.send({
    type: 'updateResources',
    res: this.source.resources
  });
}

Player.prototype.broadcastPositionUpdate = function() {
  this.client.broadcast({
    type: 'positionUpdate',
    username: this.getName(),
    pData: {
      position: this.getPos(),
      rotation: this.getRot()
    }
  });
}

Player.prototype.broadcastShipChange = function() {
  this.client.broadcast({
    type: 'shipUpdate',
    username: this.getName(),
    shipType: this.getShipType()
  });
}

//Updating
Player.prototype.updateResource = function(incdec, res, am, update) {
  if(incdec == 'increase')
    this.source.resources[res] += am;
  else if(incdec == 'decrease')
    this.source.resources[res] -= am;
  else
    return;
  if(update)
    this.sendResourceUpdate();
  this.save();
}

Player.prototype.updatePosition = function(pData) {
  if(this.currTrade != undefined) {
    console.log("Player %s is cheating - trying to move when in trade. Or maybe we have an error. I don't know.", this.getName());
  } else {
    this.source.rotation = pData.rotation;
    this.source.position.x = pData.position.x;
    this.source.position.y = pData.position.y;
    this.broadcastPositionUpdate();
    this.save();
  }
}

Player.prototype.updateShipType = function(shipType) {
  this.source.shipType = shipType;
  this.broadcastShipChange();
  this.save();
}

//Trading
Player.prototype.initTrade = function(planet) {
  if(this.currTrade != undefined) {
    console.log("Player %s is already trading on %s. Can't initiate trade with %s!", this.getName(), this.currTrade.getName(), planet.getName());
  } else {
    this.currTrade = planet;
    console.log("sending inittrade");
    console.log(this.currTrade.getTradeData());
    //send info about the trading planet
    this.client.send({
      type: "initTrade",
      planet: this.currTrade.getTradeData()
    });
    //send position udpate to clients so that ship dissappears and save something special in the database for the position and stuff.
    //cause we need to know if he's hidden
    this.client.broadcast({
      type: 'hideShip',
      username: this.getName()
    });
  }
}

Player.prototype.doTrade = function(tData) {
  //send trade confirmation. Don't remember the format
  this.tradeCorrect();
  this.updateResource('decrease', tData.sell.resource, tData.sell.amount, false);
  this.updateResource('increase', tData.buy.resource, tData.buy.amount, true);
  this.currTrade.doTrade(tData);
}

Player.prototype.endTrade = function(player) {
  if(this.currTrade == undefined)
    console.log("Player %s wasn't trading, so trade cannot be ended.", this.getName());
  else {
    this.currTrade.endTrade(this);
    delete this.currTrade;
    this.client.broadcast({
      type: 'showShip',
      username: this.getName()
    });
  }
}

Player.prototype.updateTrade = function() {
  //send info about the trading planet
  this.client.send({
    type: "updateTrade",
    planet: this.currTrade.getTradeData()
  });
}

Player.prototype.tradeError = function() {
  console.log("trade failure");
  this.client.send({
    type: 'tradeResponse',
    success: false
  });
}

Player.prototype.tradeCorrect = function() {
  console.log("trade success");
  this.client.send({
    type: 'tradeResponse',
    success: true
  });
}

Player.prototype.verifyTrade = function(tData) {
  //check capacity
  var capacity = (this.getResourcesAmount() - tData.sell.amount + tData.buy.amount) <= this.getCapacity();
  //check availability of sell
  var sell = this.getResource(tData.sell.resource) >= tData.sell.amount;
  return capacity && sell;
}

//DB
Player.prototype.save = function() {
  this.source.save(function(e) {
     if(e)
       console.log("some saving problems: " + e);
     else
       console.log("saving success");
  });
}

exports.Player = Player;
