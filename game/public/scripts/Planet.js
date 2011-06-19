(function(w){
  
  Planet.prototype.label_name;
  Planet.prototype.label_description;
  
  function Planet(pData){
    var ptr = this;
    this.label_name = new Text("", "bold 24px Arial","#FFF");
    this.label_description = new Text("", "bold 12px Arial","#FFF");
    this.label_name.textAlign = "center";
    this.label_description.textAlign = "center";
    
    // Clone properties
    _.forEach(pData, function(data, d) {
      ptr[d] = data;
    });
    this.initBitmap();
  }

  Planet.prototype.initBitmap = function(){
    var img = planet_images[this.src];
    
    this.planetBitmap = new Bitmap(img);
    this.planetBitmap.regX = img.width / 2;
    this.planetBitmap.regY = img.height / 2;
    this.setBitmapScale(0.55);
    
    this.hookControls();
    
    this.syncBitmap();
    stage.addChild(this.planetBitmap);
  }
  
  Planet.prototype.hookControls = function(){
    var ptr = this;
    this.planetBitmap.onMouseOver = function(e){
      ptr.updateLabels();
      stage.addChild(ptr.label_name);
      stage.addChild(ptr.label_description);
    }
    this.planetBitmap.onMouseOut = function(e){
      stage.removeChild(ptr.label_name);
      stage.removeChild(ptr.label_description);
    }
  }
  
  Planet.prototype.updateLabels = function(){
    var size = "";
    switch(this.size){
      case "dwarf":         size = "Dwarf";        break;
      case "terrestrial":   size = "Terrestrial";  break;
      case "giant":         size = "Giant";        break;
    }
    
    var kind = "";
    switch(this.kind){
      case "agricultural":  kind = "Agricultural"; break;
      case "factory":       kind = "Factory";      break;
      case "mining":        kind = "Mining";       break;
    }
    
    this.label_name.text = this.name;
    this.label_description.text = size + " " + kind + " Planet";
    
    this.label_name.x = this.planetBitmap.x;
    this.label_name.y = this.planetBitmap.y - 70;
    this.label_description.x = this.planetBitmap.x;
    this.label_description.y = this.planetBitmap.y - 50;
  }
  
  Planet.prototype.setBitmapScale = function(s){
    this.planetBitmap.scale = s;
    this.planetBitmap.scaleX = this.planetBitmap.scaleY = s;
  }
  
  Planet.prototype.syncBitmap = function(){
    var newpos = map.gridToStage(this.position);
    this.planetBitmap.x         = newpos.x;
    this.planetBitmap.y         = newpos.y;
    this.planetBitmap.rotation  = this.rotation;
  }
  
  w.Planet = Planet;
})(window);
