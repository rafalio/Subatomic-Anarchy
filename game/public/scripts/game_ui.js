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
  
  // Function for composing and sending messages
  $(function() {
      $( "#compose:ui-dialog" ).dialog( "destroy" );

      var id = $( "#to" ),
        message = $( "#message" ),
        allFields = $( [] ).add( id ).add( message ),
        tips = $( ".validateTips" );

      function updateTips( t ) {
        tips
          .text( t )
          .addClass( "ui-state-highlight" );
        setTimeout(function() {
          tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
      }

  //TODO Autocompletion of usernames
      var tags = [];
      $( "#id_to" ).autocomplete({
			  source: tags
		  });
    
  // Scripts for sending messages
    $("#compose").dialog({
      autoOpen: false,
      height: 350,j
      width: 450,
      modal: true,
      buttons: {
        "Send Message": function(){
          var bValid = true;
          allFields.removeClass( "ui-state-error" );
          $.post("/sendMessage", $("#messageForm").serialize(), function(data){
            $("#compose").dialog("close");
          }); 
        },
        close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
        }
      }
    
    });

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
    console.log("asdfa")
    var el = document.createElement("li");
    el.setAttribute("class","ui-state-default");
    el.innerHTML = ship_images[e].outerHTML
    $("#ship_choose").append(el);
  })
  
	$("#ship_choose" ).selectable();
}
