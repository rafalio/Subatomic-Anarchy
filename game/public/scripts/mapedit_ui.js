$(function(){

  $("#random_link").click(function(){
    $("#generate_random").dialog('open');
  });
  
  $("#export_link").click(function(){
    export_map();
  });

  $("#generate_random").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    buttons : {
      "Generate" : function(){
        generate_map(parseInt(document.getElementById("pnum").value),
                     {min: parseInt(document.getElementById("dmin").value),
                      max: parseInt(document.getElementById("dmax").value)},
                     {min: parseInt(document.getElementById("fmin").value),
                      max: parseInt(document.getElementById("fmax").value)},
                     {min: parseInt(document.getElementById("gmin").value),
                      max: parseInt(document.getElementById("gmax").value)}
                     );
        $(this).dialog("close");
      },
      "Cancel" : function(){
        $(this).dialog("close");
      }
    }
  });
});
