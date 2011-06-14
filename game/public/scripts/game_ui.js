$(function(){
  
  $("menu a").button();
  
  $("#tabs").tabs({
  });
  
  $(".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *")
  .removeClass("ui-corner-all ui-corner-top")
  .addClass("ui-corner-bottom");
  
  $("#message_link").click(function(){
    $("#compose").dialog('open');
  });

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
    
  
  // Messaging
  $("#compose").dialog({
    autoOpen: false,
    height: 350,
    width: 450,
    modal: true,
    resizable: false,
    draggable: false,
    // Clear value on close
    close : function(event,ui){
      $(this).find('div, input, textarea').each(function(i){
        $(this).val('');
        $(this).html('');
      })
    },
    buttons: {
      "Send Message": function(){
        $.post("/sendMessage", $("#messageForm").serialize(), function(data){
          $("#compose #result").html(data.message);
        }); 
      },
      "Close": function() {
          $("#compose").dialog('close');
      }
    }
  });
  
  $("#compose #to").autocomplete({
    source: '/getUsernames',
    minLength: 1
  })
  
  // Profile
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
  
  
  $("#trade").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: true,
    width: 1000,
    height: 600,
    buttons : {
      "Leave Planet" : function(){
        $(this).dialog("close");
      },
      "Trade" : function(){
         $("#info_box").dialog("open");
      }
    }
  });
  
    
  $("#chatForm").submit(function(event){
    event.preventDefault();
    chat.send();
  });
  
});


function hookTrading(){
  
  $("#bottom_ship").append(
    "<img src=images/spaceship{0}.png></img>".format(me.shipType)
  )
  
  
  
  $("#sell_choose").selectable();
  $("#buy_choose").selectable();
  
  $("#slider_buy").slider({
    slide: function(event,ui){
      $("#buy_amount").html(ui.value + " Units");
    }
  });
  
  $("#slider_sell").slider({
    slide: function(event,ui){
      $("#sell_amount").html(ui.value + " Units");
    }
  });
  
  
  $("#info_box").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    width: 300,
    height: 150,
    buttons: {
      "Close" : function(){
        $(this).dialog("close");
      }
    }
  })
  
  
  
}

function hookUI(){
  hookTrading();
}

function hookImagesToProfile(){
  Object.keys(ship_images).forEach(function(e){
    var el = document.createElement("li");
    el.setAttribute("class","ui-state-default");
    el.innerHTML = ship_images[e].outerHTML
    $("#ship_choose").append(el);
  });
	$("#ship_choose" ).selectable();
}

function updateResourcesUI(res){
  $("#resources ul").html("<li>Gold: " + res.gold + "</li>");
  $("#resources ul").append("<li>Deuterium: " + res.deuterium + "</li>");
  $("#resources ul").append("<li>Food: " + res.food + "</li>");
}




