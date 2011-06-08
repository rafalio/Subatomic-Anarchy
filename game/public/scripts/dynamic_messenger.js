function createNotification(msg){
  var div = document.getElementById('notification')
  if(!div){
    div = document.createElement('div');
    div.setAttribute("id","notification");
    window.document.body.appendChild(div);
  }

  div.innerHTML = msg;

  $(function(){
     $("#notification").dialog({
       position: 'right',
       height: 100,
       width: 170,
       title: "Notification!",
       resizable: false,
       draggable: false,
       autoOpen: false,
       hide: 'scale',
       show: 'scale'
     })
   })
 
   $(function(){
     $('#notification').dialog('open');
   })

  window.setTimeout(function(){
    $(function(){
      $('#notification').dialog('close');
    })
  }, 8000)
 
}

