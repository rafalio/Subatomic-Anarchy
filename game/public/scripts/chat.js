(function(w){
  
  // this is a singleton pattern
  
  function Chat(){
    
  }
  
  Chat.prototype.message = function(obj){
    var el = document.createElement('p');
    el.innerHTML = '<b>' + this.esc(obj.from) + ':</b> ' + this.esc(obj.txt);
    document.getElementById('chatBox').appendChild(el);
    document.getElementById('chatBox').scrollTop = 1000000;
  }

  Chat.prototype.send = function(){
    var val = document.getElementById('chatInput').value;

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

  Chat.prototype.esc = function(msg){
    return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  Chat.prototype.setupChat = function(buf){  
    for (var i in buf) this.message(buf[i]); 
  }

  w.Chat = Chat;
  
})(window);


  
  
  
  
