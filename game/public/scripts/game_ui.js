var whatBuy = '';
var whatSell = '';
var sellAmount;
var buyAmount;

var planet = null;    // planet data we received for Trading


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
    autoOpen: false,
    width: 1000,
    height: 600,
    
    close: function(event,ui){
      socket.send({
        type: "endTrade"
      })
    },
    
    buttons : {
      "Leave Planet" : function(){
        $(this).dialog("close");
      },
      "Trade" : function(){
        if( (whatBuy == '' || whatSell == '') || whatBuy == whatSell){
          $("#info_box").html("You need to select the resources, and make sure they are different!");
          $("#info_box").dialog("open");
        }
        else{
          sendTradePacket(whatBuy, buyAmount, whatSell, sellAmount);
        }
      }
    }
  });
  
    
  $("#chatForm").submit(function(event){
    event.preventDefault();
    chat.send();
  });
  
});

function sendTradePacket(tBuy, bAmount, tSell, sAmount){
  socket.send({
    type: "trade",
    buy: {
      resource: tBuy.toLowerCase(),
      amount: bAmount
    },
    sell: {
      resource: tSell.toLowerCase(),
      amount: sAmount
    }
  })
}

function hookTrading(){
  
  $("#bottom_ship").append(
    "<img src=images/spaceship{0}.png></img>".format(me.shipType)
  )
  
  $("#buy_choose").selectable({
    stop : function(event, ui){
      whatBuy = $("#buy_choose li.ui-selected p").html();
      onBothResourcesSelect();    
    }
    
  });
  
  $("#sell_choose").selectable({
    stop : function(evt, ui){
      whatSell = $("#sell_choose li.ui-selected p").html();
      onBothResourcesSelect();
    }
  });
  
  $("#slider_buy").slider({
    slide: function(event,ui){
      $("#buy_amount").html(ui.value + " Units");
      buyAmount = ui.value;
      
      var rate = getRes(whatSell,planet.prices) / getRes(whatBuy,planet.prices);
      
      sliderValueUpdate("#slider_sell", ui.value * rate);
      
    }
  });
  
  $("#slider_sell").slider({
    slide: function(event,ui){
      $("#sell_amount").html(ui.value + " Units");
      sellAmount = ui.value;
      
      var rate = getRes(whatBuy,planet.prices) / getRes(whatSell,planet.prices);
      sliderValueUpdate("#slider_buy", ui.value * rate);
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

function updateTradingUI(tData){
  planet = tData.planet;
  var localPlanet = planets[planet.name];
  
  $("#planet_name").html(planet.name);
  $("#top_planet").children("img")[0].src = "images/planets/{0}".format(localPlanet.src)
  
  updatePlanetResources();
  
}


function updatePlanetResources(){
  var ulbox = $("#top_planet #res_box ul")
  ulbox.html("");
  ulbox.append("<li>Gold: {0}</li>".format(planet.resources.gold) )
  ulbox.append("<li>Food: {0}</li>".format(planet.resources.food) )
  ulbox.append("<li>Deuterium: {0}</li>".format(planet.resources.deuterium) )
  ulbox.append("<li>Exchange: G{0} | F{1} | D{2}</li>".format(
    planet.prices.gold,
    planet.prices.food,
    planet.prices.deuterium
    ) 
  )
}

function openTradingUI(tData){
  updateTradingUI(tData);
  updateResourcesUI("#res ul", me.resources);
  $("#trade").dialog("open");
}



// gets the amount of resource given as a string, and a pointer
function getRes(str, ptr){
  if(str == "Food"){
    return ptr.food;
  }
  else if(str == "Gold"){
    return ptr.gold;
  }
  else if(str == "Deuterium"){
    return ptr.deuterium;
  }
  else{
    console.log("Error in selecting resoures");
  }
}


function onBothResourcesSelect(){
  if(whatSell != '' && whatBuy != ''){
    
    resetSliders();
    
    var maxSell = getRes(whatSell,me.resources)
    $("#slider_sell").slider("option","max",maxSell);
    
    var multiplier = getRes(whatBuy,planet.prices) / getRes(whatSell,planet.prices);
    var maxBuy = Math.floor( getRes(whatSell,me.resources) * multiplier );
    
    $("#slider_buy").slider("option","max",maxBuy);
    
  } else{
    
  }
}

function resetSliders(){
  $("#slider_buy").slider("option","max",0);
  $("#slider_sell").slider("option","max",0);
  sliderValueUpdate("#slider_sell", 0)
  sliderValueUpdate("#slider_buy", 0)
}


function sliderValueUpdate(id, value){
  $(id).slider("option","value",value);
  
  if(id == "#slider_sell"){
    $("#sell_amount").html(value + " Units");
    sellAmount = value;
  }
  else if(id == "#slider_buy"){
    $("#buy_amount").html(value + " Units");
    buyAmount = value;;
  } 
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

function updateResourcesUI(selector,ptr){
  $(selector).html("<li>Gold: " + ptr.gold + "</li>");
  $(selector).append("<li>Deuterium: " + ptr.deuterium + "</li>");
  $(selector).append("<li>Food: " + ptr.food + "</li>");
}




