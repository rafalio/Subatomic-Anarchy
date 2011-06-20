var socket = null;
var map;

var socketBuffer = [];
var loaded = false;

// Connect when we loaded all the required things

function socket_init(map_){
  socket = new io.Socket(null, {port: 3000, rememberTransport: false});
  socket.connect();
  map = map_;

  var socket_events = {
    'connect' : connectHandler
   ,'disconnect' : disconnectHandler
   ,'reconnect' : reconnectHandler
   ,'reconnecting' : reconnectingHandler
   ,'reconnect_failed' : reconnect_failedHandler
   ,'message' : messageHandler
  }

  _.forEach(socket_events, function(func, event) {
    if(!func) console.log("Cannot find " + event + 'function. Please create it!' );
    else socket.on(event,func);
  });
}

function connectHandler(){
  chat.message({
    from: "",
    txt: "Welcome to Subatomic Anarchy!"
  });
  console.log("i've connected!!");
}

function disconnectHandler(){
  chat.message({
    from: "",
    txt: "Disconnected from server!"
  });
  console.log("disconnected :(");
}

function reconnectHandler(){
  chat.message({
    from: "",
    txt: "Reconnected to server!"
  });
}

function reconnectingHandler(nextRetry){
  chat.message({
    from: "",
    txt: "Trying to reconnect. Next retry in " + nextRetry/1000 + " seconds."
  });
}

function reconnect_failedHandler(){
  chat.message({
    from: "",
    txt: "Reconnect failed. Sorry!"
  });

}

function messageHandler(msg){
  
  console.log("Message received: " + msg.type);

  // Only to be called whenever we connect as a new client
  if(msg.type == 'onNewConnect'){
    
    
    // To buffer the initTrade
    (function timeloop(){
       setTimeout(function(){
         if(loaded && socketBuffer.length == 0){
           return;
         }
         else if (loaded && socketBuffer.length > 0){
           messageHandler(socketBuffer.pop())
         }
         timeloop();
      }, 100);
    })();
    
    
    // Synchronize everyone, and add myself to the board!
    _.forEach(msg.everyone, function(pUsername, index) {
      addPlayer(msg.everyone[index]);
    });
    
    map.loadMap(msg.planets);
    
    addPlayer(msg.me);
    me = players[msg.me.username];
    me.updateColor();
    
    updateResourcesUI("#resources ul", me.resources);
    
    me.hookControls();
    
    chat.setupChat(msg.chatBuf);
    
    hookUI();   // hook the UI functions that require the player data
    
    
  }

  // New player connects to the server
  else if(msg.type == 'newArrival'){
    addPlayer(msg.player);
    chat.message({from: "", txt: msg.player.username + " has just connected"});
  }

  // We are notified that some other player has changed state
  else if(msg.type == 'positionUpdate'){
    players[msg.username].updatePosition(msg.pData);
  }
  
  // Server telling us we need to animate someone
  else if(msg.type == 'initMovement'){
    players[msg.username].doMove(msg.move_to);
  }
  
  // Someone has disconnected. Get rid of them
  else if(msg.type == 'userDisconnected'){
    unloadPlayer(msg.pName);
    chat.message({from: "", txt: msg.pName + " has just disconnected"});
  }
// Handling of chat messages
  else if(msg.type == 'chat'){
    chat.message({
      from: msg.from,
      txt: msg.txt
    });
  }

  else if(msg.type == 'msgNotification'){
    inboxNotification();
  }
  
  else if(msg.type == 'updateResources'){
    me.resources = msg.res;
    updateResourcesUI("#right_trade.box #res ul");  
    updateResourcesUI("#resources ul");
  }
  
  else if(msg.type == 'updateCapacity'){
    me.capacity = msg.capacity
    updateResourcesUI("#right_trade.box #res ul");  
    updateResourcesUI("#resources ul");
  }
  
  else if(msg.type == 'initTrade'){
    if(loaded)
      openTradingUI(msg);
    else
      socketBuffer.push(msg);
  }
  
  else if(msg.type == 'tradeResponse'){
    var response = ''
    
    if(msg.success){
      response = "Trade was succesful!";
    }
      
    else{
      response = "Trading was unsuccesful! :(";
    }
      
    $("#info_box").html(response);
    $("#info_box").dialog("open");
  }
  
  else if(msg.type == 'showShip'){
    players[msg.username].showShip();
  }
  
  else if(msg.type == 'hideShip'){
    players[msg.username].hideShip();    
  }
  
  // Update planet prices/resources on trading screen
  else if(msg.type == 'updateTrade'){
    tPlanet = msg.planet;
    updatePlanetResourcesUI(msg.planet);
  }
  
  else if(msg.type == 'shipUpdate'){
    players[msg.username].changeShipType(msg.shipType);
  }

  else if(msg.type == 'brandy'){
    _.forEach(players, function(player, pName){
      stage.removeChild(player.shipBitmap);
      player.shipType = 11;
      player.initBitmap();
      if(player == me) player.hookControls();
    })
  }

  
}
