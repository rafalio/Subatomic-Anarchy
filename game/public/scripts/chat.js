function message(obj){
  var el = document.createElement('p');
  if ('announcement' in obj) el.innerHTML = '<em>' + esc(obj.announcement) + '</em>';
  else if ('message' in obj) el.innerHTML = '<b>' + esc(obj.message[0]) + ':</b> ' + esc(obj.message[1]);
  if( obj.message && window.console && console.log ) console.log(obj.message[0], obj.message[1]);
  document.getElementById('chatBox').appendChild(el);
  document.getElementById('chatBox').scrollTop = 1000000;
}

function send(){
  var val = document.getElementById('chatInput').value;
  socket.send({
    type: "chat",
    val: val  
  });
  message({message:['You', val]});
  document.getElementById('chatInput').value = '';
}
      
function esc(msg){
  return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateChat(msg){
  var id = msg.message[0];
  var text = msg.message[1];
  message({message:[id, text]});
}

