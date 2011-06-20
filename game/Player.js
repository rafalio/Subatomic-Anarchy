var helpers = require('./helpers.js');

var deuteriumnotmove = 2;

function Player(playermodel) {
  this.source = playermodel;
}


//Getters
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
  return ret;Strawberries
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

Player.prototype.getTrade = function() {
  return this.currTrade;
}

Player.prototype.genUpgradePrices = function() {
  var ret = {};
  ret.capacity = this.getCapacity() - 200;
  ret.brandy = 1000;
  return ret;
}

Player.prototype.canMove = function() {
  return this.getResource("deuterium") >= deuteriumnotmove;
}


//Buying

Player.prototype.buy = function(what) {
  if(what == "capacity")
    return this.buyCapacity();
  else if(what == "strawberries")
    return this.buyStrawberries();
  else if(what == "brandy")
    return this.buyBrandy();
  else
    return false;
}

Player.prototype.buyCapacity = function() {
  if(this.getResource("gold") >= this.getCapacity()-200) {
    this.updateResource("decrease", "gold", this.getCapacity()-200);
    this.updateCapacity(500);
    this.sendResourceUpdate();
    this.sendCapacityUpdate();
    return true;
  } else {
    return false;
  }
}

Player.prototype.buyBrandy = function() {
  if(this.getResource("gold") >= 1000) {
    this.updateResource("decrease", "gold", 1000);
    this.sendResourceUpdate();
    this.client.send({
      type: 'brandy'
    });
    this.brandy = true;
    return true;
  } else {
    return false;
  }
}

Player.prototype.buyStrawberries = function() {
  return true;
}

//Socket
Player.prototype.connectSocket = function(client) {
  this.client = client;
  client.broadcast({
    type: 'newArrival',
    player: this.getBasicData()
  });
  if(this.brandy !== undefined)
    this.client.send({
      type: 'brandy'
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


Player.prototype.sendCapacityUpdate = function() {
  this.client.send({
    type: 'updateCapacity',
    capacity: this.getCapacity()
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

Player.prototype.send = function(msg) {
  this.client.send(msg);
}

Player.prototype.broadcastShipChange = function() {
  this.client.broadcast({
    type: 'shipUpdate',
    username: this.getName(),
    shipType: this.getShipType()
  });
}

//Updating
Player.prototype.updateResource = function(incdec, res, am) {
  if(incdec == 'increase')
    this.source.resources[res] += am;
  else if(incdec == 'decrease')
    this.source.resources[res] -= am;
  else
    return;
  this.save();
}

Player.prototype.updatePosition = function(pData) {
  if(this.currTrade !== undefined) {
    console.log("Player %s is cheating - trying to move when in trade. Or maybe we have an error. I don't know.", this.getName());
  } else {
    if(this.canMove()) {
      this.source.rotation = pData.rotation;
      this.source.position.x = pData.position.x;
      this.source.position.y = pData.position.y;
      this.updateResource("decrease", "deuterium", deuteriumnotmove);
      this.broadcastPositionUpdate();
      this.sendResourceUpdate();
      this.save();
    } else {
      console.log("Player %s is cheating. Can't move without deuterium.", this.getName());
    }
  }
}

Player.prototype.updateShipType = function(shipType) {
  this.source.shipType = shipType;
  this.broadcastShipChange();
  this.save();
}

Player.prototype.updateCapacity = function(amount) {
  this.source.capacity += amount;
  this.save();
}

//Trading
Player.prototype.initTrade = function(planet) {
  if(this.currTrade != undefined) {
    console.log("Player %s is already trading on %s. Can't initiate trade with %s!", this.getName(), this.currTrade.getName(), planet.getName());
  } else {
    this.currTrade = planet;
    console.log("sending inittrade");
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
  this.updateResource('decrease', tData.sell.resource, tData.sell.amount);
  this.updateResource('increase', tData.buy.resource, tData.buy.amount);
  this.sendResourceUpdate();
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
