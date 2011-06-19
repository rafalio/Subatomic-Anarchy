(function(w){
  
  Minimap.prototype.dim         = {width: 200, height: 200};
  Minimap.prototype.pos         = {x: 50, y: 50};
  Minimap.prototype.shape       = undefined;
  
  function Minimap(ix, iy, w, h){
    this.dim.width = w;
    this.dim.height = h;
    this.pos.x = ix;
    this.pos.y = iy;
    
    this.shape = new Shape();
    this.shape.x = this.pos.x;
    this.shape.y = this.pos.y;
    this.shape.width = w;
    this.shape.height = h;
    stage.addChild(this.shape);
    
    this.redraw();
  }
  
  Minimap.prototype.onMouse = function(e){
    var me = this;
    stage.x = -((stage.mouseX - me.pos.x)*map.dim.width)/me.dim.width + canvas.width/2;
    stage.y = -((stage.mouseY - me.pos.y)*map.dim.height)/me.dim.height + canvas.height/2;
    
    if(stage.x > 0) stage.x = 0;
    if(stage.y > 0) stage.y = 0;
    if(stage.x < canvas.width-map.dim.width) stage.x = canvas.width-map.dim.width;
    if(stage.y < canvas.height-map.dim.height) stage.y = canvas.height-map.dim.height;
    
    this.x = me.pos.x - stage.x;
    this.y = me.pos.y - stage.y;
    
    minimap.updatePos();
  }
  
  Minimap.prototype.redraw = function(){
  	var color1 = Graphics.getRGB(0xFF,0xFF,0xFF,1);
  	var color2 = Graphics.getRGB(0x00,0x00,0x00,1);
  	var color3 = Graphics.getRGB(0xFF,0x00,0x00,1);
  	var color4 = Graphics.getRGB(0x00,0xFF,0x00,1);
  	var color5 = Graphics.getRGB(0x00,0x00,0xFF,1);
  	
  	this.shape.graphics.clear();
  	
  	// Box
  	this.shape.graphics.beginStroke(color1).beginFill(color2).rect(0,0,this.dim.width,this.dim.height);
    
    // Current View
    this.shape.graphics.beginStroke(color4).beginFill().rect((-stage.x*this.dim.width)/map.dim.width,
                                                             (-stage.y*this.dim.height)/map.dim.height,
                                                             (canvas.width*this.dim.width)/map.dim.width,
                                                             (canvas.height*this.dim.height)/map.dim.height);
    
    // Blips
    var me = this;
    
    if(typeof planets != "undefined"){ // Planets (red)
      _.forEach(planets, function(planet, i) {
        me.shape.graphics.beginStroke().beginFill(color3).rect(planet.position.x*me.dim.width/map.grid_num.x,
                                                               planet.position.y*me.dim.height/map.grid_num.y, me.dim.width/map.grid_num.x,
                                                               me.dim.height/map.grid_num.y);
      });
    }
    if(typeof players != "undefined"){ // Players (blue)
      _.forEach(players, function(player, i) {
        me.shape.graphics.beginStroke().beginFill(color5).rect(player.position.x*me.dim.width/map.grid_num.x,
                                                               player.position.y*me.dim.height/map.grid_num.y, me.dim.width/map.grid_num.x,
                                                               me.dim.height/map.grid_num.y);
      });
    }
    
    this.shape.cache(0,0,this.dim.width,this.dim.height);
    stage.addChild(this.shape);
  }
  
  Minimap.prototype.getPos = function(){
    var me = this;
    if(this.mouseOver()){
      var pos = {x: floor((((stage.mouseX - me.pos.x)*map.dim.width)/me.dim.width)/map.grid_size),
                 y: floor((((stage.mouseY - me.pos.y)*map.dim.height)/me.dim.height)/map.grid_size)};
      return pos;
    }
  }
  
  Minimap.prototype.updatePos = function(){
    this.redraw();
    this.shape.x = this.pos.x - stage.x;
    this.shape.y = this.pos.y - stage.y;
  }
  
  Minimap.prototype.mouseOver = function(){
    return (stage.mouseX > minimap.pos.x && stage.mouseY > minimap.pos.y &&
            stage.mouseX <= minimap.pos.x+minimap.dim.width && stage.mouseY <= minimap.pos.y+minimap.dim.height);
  }

  w.Minimap = Minimap;
})(window);
