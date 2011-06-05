namespace.module('game.socket', function(exports, require){
  
  var game              = require('game.drawing')
  var dynamic_messenger = require('game.dynamic_messenger');
  
  socket = new io.Socket(null, {port: 3000, rememberTransport: false});
  socket.connect();
  
  exports.socket = socket;
  
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

    console.log("message received: " + msg);

    // Only to be called whenever we connect as a new client
    if(msg.type == 'onNewConnect'){  
      // Synchronize everyone
      game.setPlayers(msg.everyone);
      game.setMe(msg.me.username);
      game.init();   // Entry point to EaselJS
    }

    // A challenger appears!
    else if(msg.type == 'newArrival'){
      game.addNewPlayer(msg.player);
    }

    // Challenger changes position!
    else if(msg.type == 'playerUpdate'){
      console.log("hurray, server notified us!");
      game.updatePlayer(msg);
    }
    
    else if(msg.type == 'notification'){
      console.log("notification received! " + msg.content);
      dynamic_messenger.createNotification(msg.content);
    }
    
  }
  
});