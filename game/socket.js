exports.start = function(data, server, session_store) {
  var connect = require('connect')
    , io = require('socket.io');
    
  io = io.listen(server, {
    transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling','jsonp-polling']
  });
  
  io.on('connection', function(client){
    console.log("lol wat");
  
    var cookie_string = client.request.headers.cookie;
    var parsed_cookies = connect.utils.parseCookie(cookie_string);
    var connect_sid = parsed_cookies['connect.sid'];  
  
    if (connect_sid) {
      session_store.get(connect_sid, function (error, session) {
        if(error){
          console.log("ERROR FETCHING SESSION!");
        }
        //console.log(sys.inspect(session));
      
        //console.log(players);
      
        var u = session.user.username;
      
        // Add current player to playing users.
        if(!data.players[u])
          data.players[u] = session.user;
      
        console.log(data.players);
      
        // Synchronize the client
      
        client.send({ 
              type:     'onNewConnect',
              me:       session.user,
              everyone: data.players
            });
      
      
        // Tell everyone a new guy arrived
        client.broadcast({
          type: 'newArrival',
          player: data.players[u]
        });
      
      });
    } else {
      //MASSIVE ERROR
    }
  
    client.on('message', function(msg){
      console.log("message received!");
    
      switch(msg.type){
        case 'playerUpdate':
          updatePlayerArray(msg, data.players);
          client.broadcast(msg);
          break;
      }
    });
  
    client.on('disconnect', function(){
      console.log("person disconnected!");
    });
  });
  
  function updatePlayerArray(msg){
    var p = data.players[msg.name];
    p.position = msg.pos;
    p.rotation = msg.rot;
  }
}