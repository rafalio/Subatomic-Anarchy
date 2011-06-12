(function(w){
  
  var proto = Player.prototype;
  
  
  /* 
  Constructor:
  
  We create a new Player object based on the data received from the server.
  A possibility would be to use the same model on the server, but I believe the
  objects being sent over the network would be bigger due to all the prototyping etc.
  
  Do not create a new Player until all the resources have loaded (ship images), and we have
  connected via socket.io
  */
  
  function Player(pData){
    var ptr = this;
    
    // cloning properties
    Object.keys(pData).forEach( function(d, index, arr){
      ptr[d] = pData[d];
    })

    this.R_PER_TICK = 10;
    this.M_PER_TICK = 0.05;
    
    this.control = {};
    
    this.initBitmap();
  }
  
  
  /*  Use this function to update the player state. pData is an object that holds
      various update information.
  
  */
  Player.prototype.updatePlayer = function(pData){
    this.position.x = pData.position.x;
    this.position.y = pData.position.y;
    this.rotation   = pData.rotation;
    
    this.syncBitmap();
  }  
  
  
  
  /*
    Hooks control to the current player. This is only called for the player
    that is connected, as in P1 cannot control P2.
  */
  
  Player.prototype.hookControls = function(){
    var bitmap  = this.shipBitmap;
    var player  = this;
    var control = this.control;
    
    bitmap.onPress = function(e){
      if(!pressed1) {
        if(!pressed2) {
          player.setBitmapScale(1.3);
          pressed1 = true;
          pressed2 = true;
          pressed_obj = player;
          
          stage.onMouseDown = function(e){
            var move_to_grid = map.snapToGrid({x: e.stageX, y: e.stageY});
            if(_.isEqual(player.position, move_to_grid)) {
              player.setBitmapScale(1);
              pressed1 = false;
              stage.onMouseDown = null;  // unhook events
              document.onkeydown = null;
            } else {
              player.doMove(move_to_grid);

              // Notify the server to start the animation for other people connected
              socket.send({
                type: 'initMovement',
                pName: me.username,
                move_to: control.move_to
              });
            }
          }
          
          document.onkeydown = function(e){
            if(e.keyCode == KEY.ESCAPE) {
              player.setBitmapScale(1);
              pressed1 = false;
              pressed2 = false;
              stage.onMouseDown = null; // unhook events
              document.onkeydown = null;
            }
          }
        } else {
          pressed2 = false;
        }
      }
    }
  }
  
  // Sets up the control datastructure that says where the ship will go.
  // When movement is finished, movement_done becomes true
  Player.prototype.doMove = function(coords){
     var control = this.control;
     
     control.move_to   = {};
     control.move_to.x = coords.x;
     control.move_to.y = coords.y;
     
     control.movement_done  = false;
     
     control.should_move    = true;
     
     // Compute rotation
     var v1             = sub(control.move_to, this.position);
     var v2             = {x: 0, y: - manhattan(this.position, control.move_to)};
     var a              = (this.position.x > control.move_to.x ? -1 : 1 );
     var b              = (a == -1 ? 360 : 0);          
     var new_angle      = a*v_angle(v1,v2) * 180 / Math.PI + b;
     var crossing360    = (this.rotation < new_angle ? 360 - new_angle + this.rotation : 360 - this.rotation + new_angle);
     var notcrossing360 = Math.abs(this.rotation-new_angle);

     control.rotate_to = new_angle;
     control.should_rotate = true;
     
     
     // 1 : clockwise, -1 : anticlockwise
     if(crossing360 < notcrossing360) {
       control.rot_complete = crossing360;
       control.rotate_dir = (this.rotation < control.rotate_to ? -1 : 1);
       
     } else {
       control.rot_complete = notcrossing360;
       control.rotate_dir = (this.rotation < control.rotate_to ? 1 : -1);
     }
     control.move_complete  = dist(this.position, control.move_to);
     
  }
  
  Player.prototype.setBitmapScale = function(s){
    this.shipBitmap.scaleX = this.shipBitmap.scaleY = s;
  }
  
  Player.prototype.initBitmap = function(){
    
    // load bitmap depending on ship type    
    
    var img = ship_images[this.shipType];
    this.shipBitmap = new Bitmap(img);
    
    this.shipBitmap.regX = img.width / 2;
    this.shipBitmap.regY = img.height / 2;
    
    this.syncBitmap();
    
    stage.addChild(this.shipBitmap);
    
  }
  
  /*
    The position attribute of the player will change. We must reflect this in the bitmap.
    This function will synchronize the bitmap with the player's attributes.
    
    Hence, do not change directly the following properties of a player.shipBitmap:
      position, rotation
  */
  Player.prototype.syncBitmap = function(){
    var newpos = map.gridToStage(this.position);

    this.shipBitmap.x         = newpos.x;
    this.shipBitmap.y         = newpos.y;
    this.shipBitmap.rotation  = this.rotation;
  }
  
  
  
  
  // Useful information about the player that we send
  Player.prototype.generateDataPacket = function(){
    return {
      username:   this.username,
      position:   this.position,
      rotation:   this.rotation,
    }
  }
  
  
  /*  
    Generates a packet that stores the needed information for a playerUpdate.
  */
  
  Player.prototype.generateUpdatePacket = function(){
    return {
      type: 'playerUpdate',
      pData: this.generateDataPacket()
    }
  }
  
  
  Player.prototype.tick = function(){
    var control = this.control;
    
    if(!control.movement_done){
      
      if(control.should_rotate){
        
        if(control.rot_complete <= 0){
          control.should_rotate = false;
          this.rotation = control.rotate_to;
        }
        
        else{
          this.rotation        += control.rotate_dir*this.R_PER_TICK
          control.rot_complete -= this.R_PER_TICK;
        }
        
        this.syncBitmap();
      }

      
      // Start moving when rotating is done.
      if(control.should_rotate == false){
        
        if(control.should_move){
          
          if(control.move_complete <= 0){
            
            this.position = control.move_to;
            control.should_move   = false;
            control.movement_done = true;


            /*  By this point, the player has finished the movement. Notify
                the server of that, so that the change can be propagated.
            */
            socket.send(this.generateUpdatePacket());
          }

          else{
            this.position.x += Math.sin(this.rotation * Math.PI / 180) * this.M_PER_TICK;
            this.position.y -= Math.cos(this.rotation * Math.PI / 180) * this.M_PER_TICK;
            control.move_complete -= this.M_PER_TICK;
          }
          
          this.syncBitmap();
        }
      }      
    }
  }
  
  w.Player = Player;
  
})(window);