var connect = require('connect');
var io = require('socket.io');


exports.start = function(data, server, session_store) {    
  io = io.listen(server, {
    transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling','jsonp-polling']
  });
  
  io.on('connection', function(client){
  
    // Get the connection cookie
    var cookie_string = client.request.headers.cookie;
    var parsed_cookies = connect.utils.parseCookie(cookie_string);
    var connect_sid = parsed_cookies['connect.sid'];  
  
    if (connect_sid) {
      session_store.get(connect_sid, function (error, session) {
        
        if(error){
          console.log("ERROR FETCHING SESSION!");
        }
        
        // If the user has a session set up. This would fail if site is open, node crashes,
        // and then you restart node. Socket.IO from client side would try to establish a connection,
        // but we wouldn't have been logged in as seen by the server, hence this would fail. Normally,
        // if the server is running all the time, this shouldn't happen.
        
        if(session){
          // Add current player to playing users.
          
          var uname = session.user.username;
          
          if(! data.players[uname]){
            console.log("adding to session")
            data.players[uname] = session.user;
            data.players[uname].activeConnections = 1;
            
            data.clients[uname] = client;
          }
          else{
            // Player is already playing, just add one extra connection
            data.players[uname].activeConnections += 1
          }
         
         
          // Synchronize the client
          client.send({ 
                type:     'onNewConnect',
                me:       session.user.username,
                everyone: data.players
              });  
        }
      
        // Tell everyone a new guy arrived
        client.broadcast({
          type: 'newArrival',
          player: data.players[uname]
        });
        
        
        client.on('disconnect', function(){

          data.players[session.user.username].activeConnections -= 1;

          if(data.players[session.user.username].activeConnections == 0){
            delete data.players[session.user.username];
            console.log("all instances of user disconnected");
          }
          
          io.broadcast({
            type:   "userDisconnected",
            pName:  session.user.username
          })

        });
      
      });
    } else {
      //MASSIVE ERROR
    }
  
    client.on('message', function(msg){
      console.log("message received!");

      
      switch(msg.type){
        
        // Called when the player says he reached a new location!
        case 'playerUpdate':
          updatePlayerData(msg.pData);
          client.broadcast(msg);
          break;
          
          
        /*  When a player initiates movement, pass the message on to everyone else,
            so that animation can start.
        */
        case 'initMovement':
          client.broadcast(msg);
          break;
          
      }
    });
  
    
  });
  
  function updatePlayerData(pData){
    var p = data.players[pData.username];
    p.position = pData.position;
    p.rotation = pData.rotation;
  }
  
  
}