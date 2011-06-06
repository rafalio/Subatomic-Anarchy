namespace.module('game.drawing', function(exports, require){
  
  var s = require('game.socket');
  
  // Pre:   Players array initialized with player data
  // Post:  Each entry in the player array is expanded with a bitmap and txt for EaselJS
  
  var pressed = true;
  
  
  function hookEvent(target, evt, fn){
    target.addEventListener(evt, fn)
  }
  
  function unhookEvent(target, evt, fn){
    target.removeEventListener(evt, fn);
  }
  
  
  function assocForEach(obj,fn){
    Object.keys(obj).forEach(fn);
  }
  
  function snapToGrid(position){
    
  }

  function onImageLoadInit(img){
    w = img.width;
    h = img.height;

    assocForEach(players, function(name){
      registerUser(name)
    })

    var me_bitmap = players[me].shipBitmap;
    
    me_bitmap.onPress = function(e){
      
      console.log("pressed!");
      
      console.log(pressed);
      
      if(pressed){
        me_bitmap.scaleX = 1.3;
        me_bitmap.scaleY = 1.3;
        
        stage.onMouseDown = function(e){
          var m = players[me];
          
          console.log(e);
          
          m.position.x = Math.floor(e.stageX / map.grid_size);
          m.position.y = Math.floor(e.stageY / map.grid_size);
          
          me_bitmap.scaleX = 1.0;
          me_bitmap.scaleY = 1.0;
          
          synchronizePlayer(m);
          
          pressed = false;
          fromStage = true;
          
          stage.onMouseDown = null; // unhook event
        }
        
      }
      
      else{
        me_bitmap.scaleX = 1.0;
        me_bitmap.scaleY = 1.0;
      }
      
      pressed = !pressed
    }
    

    synchronizePlayers();
  }


  // Creates the ship (using img), and the message text.

  function registerUser(name){

    var p = players[name];

    p.shipBitmap = new Bitmap(ship);

    p.shipBitmap.regX = w / 2;
    p.shipBitmap.regY = h / 2;

    p.shipBitmap.rotation = p.rotation;

    p.mapTxt    = new Text(p.username, "12px Arial", "#FFF");
    p.mapTxt.x  = p.shipBitmap.x
    p.mapTxt.y  = p.shipBitmap.y - 70;

    stage.addChild(p.shipBitmap);
    stage.addChild(p.mapTxt);

  }

  // Synchronizes the players positions and the bitmap being drawn
  function synchronizePlayers(){
    assocForEach(players, function(element){
      var p = players[element];
      synchronizePlayer(p);
    })
  }

  // Synchronizes the ship/text with the position/rotation of the player.
  function synchronizePlayer(p){
    var newpos = gridToStage(p.position);

    //console.log(newpos);
    console.log(p);

    p.shipBitmap.x = newpos.x;
    p.shipBitmap.y = newpos.y;
    p.shipBitmap.rotation = p.rotation;
    p.mapTxt.x = p.position.x;
    p.mapTxt.y = p.position.y - 70;
  }


  // Notify the server that my own position changed

  function notifyServer(){
    //console.log(players[me]);

    s.socket.send({
      type: 'playerUpdate',
      name: players[me].username,
      pos:   players[me].position,
      rot:  players[me].rotation
    })
  }

  var ship, ctx, bitmap, labels

  var map = {
        grid_size : 100,
        dim : {width: 5000, height: 5000},
        grid_num : {
          x : 50,
          y : 50
        }
      }

  // Array to keep all the players and their positions
  // Additionaly, extend everything to have  Bitmap and txt

  var players = [];
  
  var me; // don't touch

  function tick() {
    stage.update();
  }


  // Converts a grid positition (ie (3,5) ), to a stage coordinate position in pixels.
  // Places it in the center of the grid.

  function gridToStage(pos){
    return {
      x: (pos.x + 0.5)*map.grid_size,
      y: (pos.y + 0.5)*map.grid_size
    }
  }


  function setStageScale(s){
    stage.scaleX = s;
    stage.scaleY = s;
  }

  function init() {
      canvas = document.getElementById('canvas');

      stage = new Stage(canvas)
      ship = new Image();

      var g = new Shape();
      stage.addChild(g);

    	var color = Graphics.getRGB(0xFF,0xFF,0xFF,0.2)

    	// Vertical lines
    	for(var i = 0; i < map.dim.width; i += map.grid_size ){
    	  g.graphics.beginStroke(color).moveTo(i,0).lineTo(i, map.dim.height).endStroke();
    	}
    	// Horizontal lines
    	for(var i = 0; i < map.dim.height; i += map.grid_size ){
    	  g.graphics.beginStroke(color).moveTo(0,i).lineTo(map.dim.width,i).endStroke();
    	}

      g.cache(0,0,map.dim.width,map.dim.height);

      labels = new Container();

      for(var i = 0; i < map.grid_num.x; i++){
        for(var j = 0; j < map.grid_num.y; j++){
          var txt   = new Text("({0},{1})".format(i,j), "12px Arial", Graphics.getRGB(0xFF,0xFF,0xFF,0.7));
          txt.x = i * map.grid_size + map.grid_size/2;
          txt.y = j * map.grid_size + map.grid_size/2;
          labels.addChild(txt);
        }
      }

      labels.cache(0,0,map.dim.width,map.dim.height);
      stage.addChild(labels);
      
      console.log(stage);
      
      var scroll_listener;
      
      canvas.addEventListener("mousedown", function(evt){
        var off_x = evt.offsetX;
        var off_y = evt.offsetY;
      
        var st = {
          x: stage.x,
          y: stage.y
        }
      
        scroll_listener = function(e){
      
          var newCoords = {
            x: st.x - (off_x - e.offsetX),
            y: st.y - (off_y - e.offsetY)
          }
      
          //TODO: Add checking for out-of-bounds on the other end
          // That's a function of grid_size, map dimensions, and canvas size.
          if(newCoords.x < 0){
            stage.x = newCoords.x;
          }
          if(newCoords.y < 0){
            stage.y = newCoords.y;
          }
      
        }
      
        document.addEventListener("mousemove", scroll_listener);
      
      })
      
      document.addEventListener("mouseup", function(evt){
        document.removeEventListener("mousemove",scroll_listener);
      })
      
      canvas.addEventListener("mousewheel", function(evt){
        evt.preventDefault();
        var delta = evt.wheelDeltaY;      
        setStageScale(stage.scaleX + delta/500);
      })
      
      ship.onload = function() {
      
          onImageLoadInit(ship);
      
          document.addEventListener("keydown", function(e) {
      
              var d = 20;
              var rot = 90;
      
              var bitmap = players[me].shipBitmap;
              var txt = players[me].mapTxt;
              var p = players[me];
      
              switch (e.keyCode) {
                case KEY['ARROW_RIGHT']:
                    e.preventDefault();
                    p.position.x += 1;
                    synchronizePlayer(p);
      
                    break;
                case KEY['ARROW_LEFT']:
                    e.preventDefault();
                    p.position.x -= 1;
                    synchronizePlayer(p);
      
                    break;
                case KEY['ARROW_UP']:
                    e.preventDefault();
                    p.position.y -= 1;
                    synchronizePlayer(p);
                    break;
                case KEY['ARROW_DOWN']:
                    e.preventDefault();
                    p.position.y += 1;
                    synchronizePlayer(p);
                    break;
              }
      
              notifyServer();
      
          }, true);
      
      }
      
      ship.src = "images/spaceship.png";
      Ticker.addListener(window);   
  }
  
  function setMe(m){
    me = m;
  }
  
  function setPlayers(p){
    players = p;
  }
  
  function addNewPlayer(player){
    players[player.username] = player;
    registerUser(player.username);
  }
  
  function updatePlayer(msg){
    var p = players[msg.name];
    p.position = msg.pos;
    p.rotation = msg.rot;
    synchronizePlayer(p);
  }
  
  
  exports.init = init;
  exports.synchronizePlayer = synchronizePlayer;
  exports.registerUser = registerUser;
  exports.players = players;
  exports.setPlayers = setPlayers;
  exports.setMe = setMe;
  exports.tick = tick;
  exports.addNewPlayer = addNewPlayer;
  exports.updatePlayer = updatePlayer;
  
});