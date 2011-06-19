(function(w){
  
  // this is a singleton pattern
  
  function Chat(){
    
  }
  
  Chat.prototype.message = function(obj){
    var el = document.createElement('div');
    if (obj.from.length == 0) {
      el.setAttribute("class", "notification");
      el.innerHTML =  obj.txt;
    } else if(obj.from == me.username) {
      el.setAttribute("class", "message");
      el.innerHTML = '<span class="me">' + obj.from + ':</span> ' + obj.txt; 
    } else {
      el.setAttribute("class", "message");
      el.innerHTML = '<span class="them">' + obj.from + ':</span> ' + obj.txt;
    }
    document.getElementById('chatBox').appendChild(el);
    document.getElementById('chatBox').scrollTop = 1000000;
  }

  Chat.prototype.send = function(){
    var val = document.getElementById('chatInput').value;
    
    if(val.length != 0) {
      socket.send({
        type: "chat",
        txt: val
      });

      this.message({
        from: me.username,
        txt: val
      });
      document.getElementById('chatInput').value = '';
    }
  }

  Chat.prototype.esc = function(msg){
    return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  Chat.prototype.setupChat = function(buf){  
    for (var i in buf) this.message(buf[i]); 
  }

  w.Chat = Chat;
  
})(window);


  
  
  
  
