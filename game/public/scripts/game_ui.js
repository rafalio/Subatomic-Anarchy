$(function(){
  
  $("menu a").button();
  
  $("#tabs").tabs({
  });
  
  $(".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *")
  .removeClass("ui-corner-all ui-corner-top")
  .addClass("ui-corner-bottom")
  
  $("#logout_link").click(function(){
    $("#logout_confirm").dialog('open');
  })
  
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
  }) 
  
});