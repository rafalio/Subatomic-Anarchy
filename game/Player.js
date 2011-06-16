var helpers = require('./helpers.js');

function Player(playermodel) {
  this.source = playermodel;
}

Player.prototype.getBasicData = function() {
  return helpers.arrayFilter(["username", "position", "rotation", "shipType"], this.source);
}

Player.prototype.getMainData = function() {
  return helpers.arrayFilter(["username", "position", "rotation", "resources", "shipType", "capactiy"], this.source);
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

Player.prototype.getAdmin = function() {
  return this.source.admin;
}

Player.prototype.getResource = function(res) {
  return parseInt(this.source.resources[res].toString());
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

//Updating
Player.prototype.updateResource = function(incdec, res, am) {
  if(incdec == 'increase')
    this.source.resources[res] += am;
  else if(incedec == 'decrease')
    this.source.resources[res] -= am;
  else
    return;
  this.sendResourceUpdate();
  this.save();
}

Player.prototype.updatePosition = function(pData) {
  if(this.currTrade != undefined) {
    console.log("Player $s is cheating - trying to move when in trade. Or maybe we have an error. I don't know.", this.getName());
  } else {
    this.source.rotation = pData.rotation;
    this.source.position.x = pData.position.x;
    this.source.position.y = pData.position.y;
    this.broadcastPositionUpdate();
    this.save();
  }
}

//Trading
Player.prototype.initTrade = function(planet) {
  if(this.currTrade != undefined) {
    console.log("Player %s is already trading on %s. Can't initiate trade with %s!", this.getName(), this.currTrade.getName(), planet.getName());
  } else {
    this.currTrade = planet;
    console.log('I\'m here');
    console.log(planet.getTradeData());
    //send info about the trading planet
    this.client.send({
      type: "initTrade",
      planet: planet.getTradeData()
    });
    //send position udpate to clients so that ship dissappears and save something special in the database for the position and stuff.
    //cause we need to know if he's hidden
    this.client.broadcast({
      type: 'hideShip',
      username: this.getName()
    });
  }
}

Player.prototype.startDoTrade = function(tData) {
  if(this.currentTrade == undefined)
    console.log("Player %s is not trading.", this.getName());
  else
    this.currentTrade.doTrade(this,tData);  
}

Player.prototype.doTrade = function(tData) {
  //send trade confirmation. Don't remember the format
  this.client.send();
  this.updateResource('decrease', tData.sell.resource, tData.sell.amount);
  this.updateResource('increase', tData.buy.resource, tData.buy.amount);
}

Player.prototype.endTrade = function(player) {
  if(this.currTrade == undefined)
    console.log("Player %s wasn't trading, so trade cannot be ended.", this.getName());
  else {
    currTrade.endTrade(this);
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
    planet: currTrade.getTradeData()
  });
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