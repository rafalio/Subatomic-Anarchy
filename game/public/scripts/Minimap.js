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
    var ptr = this;
    stage.x = -((stage.mouseX - ptr.pos.x)*map.dim.width)/ptr.dim.width + canvas.width/2;
    stage.y = -((stage.mouseY - ptr.pos.y)*map.dim.height)/ptr.dim.height + canvas.height/2;
    
    if(stage.x > 0) stage.x = 0;
    if(stage.y > 0) stage.y = 0;
    if(stage.x < canvas.width-map.dim.width) stage.x = canvas.width-map.dim.width;
    if(stage.y < canvas.height-map.dim.height) stage.y = canvas.height-map.dim.height;
    
    this.x = ptr.pos.x - stage.x;
    this.y = ptr.pos.y - stage.y;
    
    minimap.updatePos();
  }
  
  Minimap.prototype.redraw = function(){
  	var color1 = Graphics.getRGB(0xFF,0xFF,0xFF,1); // White
  	var color2 = Graphics.getRGB(0x00,0x00,0x00,1); // Black
  	var color3 = Graphics.getRGB(0xFF,0x00,0x00,1); // Red
  	var color4 = Graphics.getRGB(0x00,0xFF,0x00,1); // Green
  	var color5 = Graphics.getRGB(0x00,0x00,0xFF,1); // Blue
  	var color6 = Graphics.getRGB(0xFF,0xFF,0xFF,0.75); // Grey
  	
  	this.shape.graphics.clear();
  	
  	// Box
  	this.shape.graphics.beginStroke(color1).beginFill(color2).rect(0,0,this.dim.width,this.dim.height);
    
    // Current View
    this.shape.graphics.beginStroke(color4).beginFill().rect((-stage.x*this.dim.width)/map.dim.width,
                                                             (-stage.y*this.dim.height)/map.dim.height,
                                                             (canvas.width*this.dim.width)/map.dim.width,
                                                             (canvas.height*this.dim.height)/map.dim.height);
    
    // Blips
    var ptr = this;
    
    if(typeof planets != "undefined"){ // Planets (grey crosses)
      _.forEach(planets, function(planet, i) {
        var pos = {x: planet.position.x*ptr.dim.width/map.grid_num.x  + (ptr.dim.width/map.grid_num.x)/2,
                   y: planet.position.y*ptr.dim.height/map.grid_num.y + (ptr.dim.height/map.grid_num.y)/2};
        ptr.shape.graphics.beginStroke(color6).beginFill()
        ptr.shape.graphics.moveTo(pos.x-(ptr.dim.width/map.grid_num.x)/2, pos.y);
        ptr.shape.graphics.lineTo(pos.x+(ptr.dim.width/map.grid_num.x)/2, pos.y);
        ptr.shape.graphics.moveTo(pos.x, pos.y-(ptr.dim.height/map.grid_num.y)/2);
        ptr.shape.graphics.lineTo(pos.x, pos.y+(ptr.dim.height/map.grid_num.y)/2);
      });
    }
    if(typeof players != "undefined"){ // Players (you: green, others: blue)
      _.forEach(players, function(player, i) {
        if(player == me){
          ptr.shape.graphics.beginStroke().beginFill(color4);
        }
        else{
          ptr.shape.graphics.beginStroke().beginFill(color5);
        }
        
        ptr.shape.graphics.rect(player.position.x*ptr.dim.width/map.grid_num.x,
                                player.position.y*ptr.dim.height/map.grid_num.y,
                                ptr.dim.width/map.grid_num.x, ptr.dim.height/map.grid_num.y);
      });
    }
    
    this.shape.cache(0,0,this.dim.width,this.dim.height);
    stage.addChild(this.shape);
  }
  
  Minimap.prototype.getPos = function(){
    var ptr = this;
    if(this.mouseOver()){
      var pos = {x: floor((((stage.mouseX - ptr.pos.x)*map.dim.width)/ptr.dim.width)/map.grid_size),
                 y: floor((((stage.mouseY - ptr.pos.y)*map.dim.height)/ptr.dim.height)/map.grid_size)};
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
