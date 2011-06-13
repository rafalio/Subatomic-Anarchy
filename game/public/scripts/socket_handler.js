var socket = null;

// Connect when we loaded all the required things

function socket_init(){
  socket = new io.Socket(null, {port: 3000, rememberTransport: false});
  socket.connect();

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
    })
    
    me = players[msg.me];
    
    updateResources(me.resources);
    
    me.hookControls();
    
    chat.setupChat(msg.chatBuf);
    
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
  //else if(msg.type == 'notification'){
  //  createNotification(msg.content);
  //}
  
  else if(msg.type == 'updateResources') {
    
  }
}
