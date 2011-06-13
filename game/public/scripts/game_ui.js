$(function(){
  
  $("menu a").button();
  
  $("#tabs").tabs({
  });
  
  $(".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *")
  .removeClass("ui-corner-all ui-corner-top")
  .addClass("ui-corner-bottom");
  
  $("#logout_link").click(function(){
    $("#logout_confirm").dialog('open');
  });
  
  $("#profile_link").click(function(){
    $("#profile").dialog('open');
  });
  
  $("#logout_confirm").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    buttons : {
      "Logout" : function(){
        $(location).attr('href','/logout');
      },
      "Cancel" : function(){
        $(this).dialog("close");
      }
    }
  });

  $("#profile").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    width: 400,
    height: 400,
    buttons : {
      "Close" : function(){
        $(this).dialog("close");
      }
    }
  });
    
  $("#chatForm").submit(function(event){
    event.preventDefault();
    chat.send();
  });
  
});

function hookImagesToProfile(){
  Object.keys(ship_images).forEach(function(e){
    var el = document.createElement("li");
    el.setAttribute("class","ui-state-default");
    el.innerHTML = ship_images[e].outerHTML
    $("#ship_choose").append(el);
  });
  
	$("#ship_choose" ).selectable();
}

function updateResources(res) {
  $("#resources ul").html("<li>Gold: " + res.gold + "</li>");
  $("#resources ul").append("<li>Deuterium: " + res.deuterium + "</li>");
  $("#resources ul").append("<li>Food: " + res.food + "</li>");
}