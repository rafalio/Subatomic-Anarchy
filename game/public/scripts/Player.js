(function(w){
  
  var proto = Player.prototype;
  Player.prototype.label;
  
  
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
    this.label = new Text("","bold 16px Arial","rgba(255,255,255,0.5)");
    this.label.textAlign = "center";
    
    // cloning properties
    _.forEach(pData, function(element, index) {
      ptr[index] = pData[index];
    });
    
    this.label.text = "<" + this.username + ">";

    this.R_PER_TICK = 10;
    this.M_PER_TICK = 0.05;
    
    this.control = {};
    
    this.initBitmap();
    console.log(this);
  }
  
  
  /*  Use this function to update the player state. pData is an object that holds
      various update information.
  */
  Player.prototype.updatePosition = function(pData){
    this.position.x = pData.position.x;
    this.position.y = pData.position.y;
    this.rotation   = pData.rotation;
    
    this.control.movement_done = true;
    
    this.syncBitmap();
  }
  
  
  // Hides a player from the view
  Player.prototype.hideShip = function(){
    stage.removeChild(this.shipBitmap);
    stage.removeChild(this.label);
  }
  
  Player.prototype.showShip = function(){
    stage.addChild(this.shipBitmap);
    stage.addChild(this.label);
    this.syncBitmap();
  }
  
  Player.prototype.updateColor = function(){
    this.label.color = "rgba(0,255,0,1)";
  }
  
  
  // We exit from planets on the left hand side, so don't put them on the rightmost border!
  Player.prototype.exitPlanet = function(pData){

    if(me.resources.deuterium < 2) return;

    var planet = planets[pData.name];
    this.doMove({
      x: planet.position.x + 1,
      y: planet.position.y
    });
    // Notify the server to start the animation for other people connected
    var control = this.control;
    socket.send({
      type: 'initMovement',
      move_to: control.move_to
    });
  }
  
  Player.prototype.resourcesTotal = function(){
    return _.map(this.resources, function(value,key){ return value; }).reduce(function(pValue,cValue){ 
      return pValue + cValue});
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
      if(!pressed1){
        player.setBitmapScale(1.3);
        pressed1 = true;
        
        stage.onMouseDown = function(e){
          map.dragged = false;
          pressed2 = true;
          stage.onMouseUp = function(e){
            if(typeof minimap != "undefined"){
              if(minimap.mouseOver()){
                return;
              }
            }
            var move_to_grid = map.snapToGrid({x: e.stageX, y: e.stageY});
            
            if(_.isEqual(player.position, move_to_grid)){
              player.setBitmapScale(1);
              pressed1 = false;
              stage.onMouseDown = null;
              stage.onMouseUp = null;
            }
            else {
              if(!map.dragged && pressed2){
                
                if(player.resources.deuterium >= 2){
                  player.doMove(move_to_grid);

                  // Notify the server to start the animation for other people connected
                  socket.send({
                    type: 'initMovement',
                    move_to: control.move_to
                  });

                }

                  pressed2 = false;
              }
            }
          }
        }
      }
      else{
        player.setBitmapScale(1);
        pressed1 = false;
        stage.onMouseDown = null;
        stage.onMouseUp = null;
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
    //console.log(ship_images);
    //console.log(this.shipType);
    
    var img = ship_images[this.shipType];
    this.shipBitmap = new Bitmap(img);
    
    this.shipBitmap.regX = img.width / 2;
    this.shipBitmap.regY = img.height / 2;
    
    this.syncBitmap();
    
    stage.addChild(this.shipBitmap);
    stage.addChild(this.label);    
  }
  
  Player.prototype.changeShipType = function(type){
    stage.removeChild(this.shipBitmap);
    this.shipType = type;
    this.initBitmap();
    if(me.username == this.username)
      this.hookControls();
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
    this.label.x              = newpos.x;
    this.label.y              = newpos.y - 52;
  }
  
  
  
  
  // Useful information about the player that we send
  Player.prototype.generateDataPacket = function(){
    return {
      position:   this.position,
      rotation:   this.rotation,
    }
  }
  
  
  /*  
    Generates a packet that stores the needed information for a playerUpdate.
  */
  
  Player.prototype.generateUpdatePacket = function(){
    return {
      type: 'positionUpdate',
      pData: this.generateDataPacket()
    }
  }
  
  
  Player.prototype.tick = function(){

    this.R_PER_TICK = 200 / Ticker.getMeasuredFPS();
    this.M_PER_TICK = 1 / Ticker.getMeasuredFPS(); 

    var control = this.control;
    minimap.redraw();
    
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
            if(this == me)
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
