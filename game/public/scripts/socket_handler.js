var socket = null;
var map;

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

  Object.keys(socket_events).forEach( function(event, index, arr){
    var f = socket_events[event];
    if(!f) console.log("Cannot find " + fname + 'function. Please create it!' );
    else socket.on(event,f);
  })
}

function connectHandler(){
  console.log("i've connected!!");
}

function disconnectHandler(){
  console.log("disconnected :(");
}

function reconnectHandler(){

}

function reconnectingHandler(nextRetry){

}

function reconnect_failedHandler(){

}

function messageHandler(msg){
  
  console.log("Message received: " + msg.type);

  // Only to be called whenever we connect as a new client
  if(msg.type == 'onNewConnect'){
    
    console.log(msg);
    
    // Synchronize everyone, and add myself to the board!
    Object.keys(msg.everyone).forEach(function(pUsername, index, arr){
      addPlayer(msg.everyone[pUsername]);
    });
    
    map.loadMap(msg.planets);
    
    addPlayer(msg.me);
    me = players[msg.me.username];
    
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
  
  else if(msg.type == 'updateResources'){
    me.resources = msg.res;
    updateResourcesUI("#right_trade.box #res ul", me.resources);  
    updateResourcesUI("#resources ul", me.resources);
  }
  
  else if(msg.type == 'initTrade'){
    openTradingUI(msg);
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
    //me.showShip();
  }
  
  else if(msg.type == 'hideShip'){
    //me.hideShip();    
  }
  
  // Update planet prices/resources on trading screen
  else if(msg.type == 'updateTrade'){
    tPlanet = msg.planet;
    updatePlanetResourcesUI(msg.planet);
  }
  
  else if(msg.type == 'shipUpdate'){
    players[msg.username].changeShipType(msg.shipType);
  }
  
}
