(function(w){
  
  function Planet(pData){
    var ptr = this;
    
    // Clone properties
    Object.keys(pData).forEach( function(d){
      ptr[d] = pData[d];
    })
    
    this.initBitmap();
    
  }

  Planet.prototype.initBitmap = function(){
    var img = planet_images[this.src];
    
    this.planetBitmap = new Bitmap(img);
    this.planetBitmap.regX = img.width / 2;
    this.planetBitmap.regY = img.height / 2;
    this.setBitmapScale(0.55);
    
    this.planetBitmap.onMouseOver = function(e){
      // TODO: Show label
    }
    
    this.syncBitmap();
    stage.addChild(this.planetBitmap);
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
