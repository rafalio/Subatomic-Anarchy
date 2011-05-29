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

function connectHandler(){
  console.log("i've connected!!")
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

function messageHandler(obj){
  
}