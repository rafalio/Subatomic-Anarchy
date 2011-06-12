function message(obj){
  var el = document.createElement('li');
  el.innerHTML = '<b>' + esc(obj.message[0]) + ':</b> ' + esc(obj.message[1]);
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

function setupChat(buf){
  console.log("Setting up chat!")  
  for (var i in buf) message(buf[i]);
  
}

function updateChat(msg){
  var id = msg.message[0];
  var text = msg.message[1];
  message({message:[id, text]});
}

function updateStatus(msg){
  var id = msg.announcement[0];
  var text = msg.announcement[1];
  message({message:[id, text]});
}

