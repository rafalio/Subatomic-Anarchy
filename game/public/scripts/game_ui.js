var whatBuy = '';
var whatSell = '';
var planet = null;    // planet data we received for Trading
var msgheadersLoaded = false;
var selectedMessage = '';
var latestmsg = ''; // Used to store the id of the latest message
var sellAmount;
var buyAmount;
var tPlanet = null; //planet pointer
var unread = '0';


$(function(){
  
  setUnread();  
  
  $("menu a").button();

  $("#compose_link").click(function(){
    $("#compose").dialog('open');
  });
  
  $("#messages_link").click(function(){
    $("#messages").dialog('open');
    msgheadersLoaded = true;
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
    
  $("#messages").dialog({
    open: function(){
      getNewMessages();
    },
    autoOpen: false,
    height: 600,
    width: 720,
    resizable: false,
    draggable: false,
    modal: true,
    buttons: {
      "Compose Message": function(){
        $("#compose").dialog('open');
      },
      "Close": function(){
        $(this).dialog('close');
      }
    }
  }),

  // Message composition
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
      },
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
    height: 600,
    buttons : {
      "Close" : function(){
        $(this).dialog("close");
      },
      "Apply" : function(){
        var type = $("#profile li.ui-selected").attr('id');
        socket.send({
          type: "shipUpdate",
          shipType: type
        })
        me.changeShipType(type);
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
      me.exitPlanet(tPlanet);

      resetSliders();
      resetSelects(); 
      whatBuy = '';
      whatSell = '';

    },
    
    buttons : {
      "Leave Planet" : function(){
        if(me.resources.deuterium >= 2)
          $(this).dialog("close");
        else return false;
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


  $("ol#shopping_selectable").selectable();

  $("#open_shop").click(function(){
    $("#shop").dialog("open"); 
  })

  $("#shop").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    width: 400,
    height: 400,
    open: function(event,ui){
      updateShopPricesUI();
    },
    buttons : {
      "Leave Shop" : function(){
        $(this).dialog("close")
      },
      "Buy" : function(){
        buyStuff();
      }

    }
  })
  
});


function updateShopPricesUI(){
   $.get("/getPrices", function(prices){
        $("p#capacity span").html(prices.capacity + " Gold");
        $("p#brandy span").html(prices.brandy + " Gold");
      })
}

function buyStuff(){
    var toBuy = $("#shop li.ui-selected p").attr('id');
    console.log("Buying " + toBuy);
    $.post("/buy", {item: toBuy}, function(data){
      console.log(data);
      $("#shop #response").html(data);
      updateShopPricesUI();
    })
}


/* Used to flash the inbox when new messages
 * have been recieved
 */
function inboxNotification(){
  //Flashing effect
  var blinks = 2;
  for (i = 0; i<blinks; i++){
    $("#messages_link").fadeOut("Slow");
    $("#messages_link").fadeIn("Slow");
  }
  setUnread();
  getNewMessages();
}

/* Used for getting the number of unread messages in the database
 * and and updating it in the button 
*/
function setUnread(){
  $.get("/getUnread", function(data){
    unread = data;
    $("#messages_link").html('<span class="ui-button-text">Inbox (' + unread +')</span>');
  });  
}


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

/* Gets a list of messages from the database
 * Need to give it a call-back function
 */
function getMessages(f){
  $.get("/getMessages", function(data){
    f(data);
  });
}

/* Function that checks and gets a list of new
 * messages from the database, need to give it a call-back function
 */
function getNewMessages(){
  var msg = latestmsg;
  
  if (latestmsg == ''){    
    getMessages(function(data){
      if (data.length > 0){
        $("#notice").html("<p>Please select a message from the left<p>"); 
        latestmsg = data[0].id;
        for (i = 0 ; i < data.length; i++) renderList(data[i]); 
      }
      else {
        $("#notice").html("<p>There are no messages to display</p>");
      }   
    });
    
  }
  else {
    var parent = "left_inbox";
    $.post("/getNewMessages",{id: msg} , function(data){
      //console.log(data)
      if (data != '') latestmsg = data[0].id;
      for (i = 0; i<data.length; i++) renderList(data[i], 'before');
    });
  }


}


/* Empties the divs of the particular parent
 * Warning: only invoke this if the children are non-empty for the moment
 */
function flushChildren(parent){
  var children = document.getElementById(parent).childNodes;
  for (i=0; i<children.length; i++){
    var c = [children[i]];
    $(c).empty();
  }
}


/* Used to add the list of message headers
 * have to give it a style of before or after
 */
function renderList(msg, position){
  var type  = "left_inbox_list"; 
  var date  = msg.date.substr(0, 10);
  var field = msg.sender;
  var id    = msg.id;
  var read  = msg.read; 

  var el = document.createElement('li');

  var parent = document.getElementById(type);  
  
  /* readEl used for styling elements that have not been read */  
  if (!read){
    $(el).css('font-weight', 'bold');
  }
  el.setAttribute('id', id);

  var fromEl = document.createElement('h3');
  fromEl.innerHTML = 'From: ' + field
  var dateEl = document.createElement('p');
  dateEl.innerHTML = /*'Date: '*/ date

  el.appendChild(fromEl);
  el.appendChild(dateEl);  
  
  /* Appending to the message header section */
  if (position != 'before'){
    parent.appendChild(el);
  }
  else {
    $(parent).prepend(el);
  }

  document.getElementById(type).scrollTop = 1000000;

  /* Used to associate a clicking event with the message header */
  hookMessageClicks("#"+msg.id);
}

/* What happens when a message header is clicked on */
function hookMessageClicks(id){
  $(id).click(function(){ 
    var msgid = id.substr(1, id.length);
    $.post("/getMessage", {id: msgid}, function(data){
      renderContent(data); 
      highlightMessage(msgid);
      setUnread();
    });
  });
}

/* Called when message is clicked on and uses global variable
 * selectedMessage for making sure only one has been selected
 */
function highlightMessage(msgid){
  var background = "#1464F4"; /* Nice blue color */
  if (selectedMessage != '') {
    //Packaging the css properties into an object    
    var cssObj = {
      'background-color'  : '',
      'font-color'        : ''
    };
    $('#'+selectedMessage).css(cssObj);
  }
  var newcssObj = {
    'background-color'  : background,
    'color'             : '#fff',
    'font-weight'       : 'normal' /* Changing the style so no longer bold */
  }
  selectedMessage = msgid;
  $('#' + msgid).css(newcssObj);
  
}


/* Called when a message is clicked on and renders the message
 * that was clicked on
 */
function renderContent(data){

  //Rendering date properly
  var date    = data.date.substr(0, 10);
  var time    = data.date.substring(11,19);
  var msg     = data.content;
  var sender  = data.sender; 
  
  //Getting the children of the parent and flushing them
  var parent   = "message";
  flushChildren(parent);

  //Creating the message elements
  var fromEl = document.createElement('h3'); 
  fromEl.innerHTML = 'From: ' + sender;

  var dateEl = document.createElement('h3');
  dateEl.innerHTML = 'Date: ' + date + ' ' + time;

  var preMessageEl = document.createElement('h3');
  preMessageEl.innerHTML = '';

  var messageEl = document.createElement('p');
  messageEl.innerHTML = msg;

  //Appending to the message div so that we can see full message
  $('#from').append(fromEl);
  $('#date').append(dateEl);
  $('#msgcontent').append(preMessageEl);
  $('#msgcontent').append(messageEl);
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
      
      var rate = getRes(whatSell,tPlanet.prices) / getRes(whatBuy,tPlanet.prices);
      
      sliderValueUpdate("#slider_sell", ui.value * rate);
      
    }
  });
  
  $("#slider_sell").slider({
    slide: function(event,ui){
      $("#sell_amount").html(ui.value + " Units");
      sellAmount = ui.value;
      
      var rate = getRes(whatBuy,tPlanet.prices) / getRes(whatSell,tPlanet.prices);
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
  tPlanet = tData.planet;
  var localPlanet = planets[tPlanet.name];
  
  $("#planet_name").html(tPlanet.name);
  $("#top_planet").children("img")[0].src = "images/planets/{0}".format(localPlanet.src)
  
  $("#planet_subtitle").html("{0} {1} Planet".format(localPlanet.size.capitalize(), localPlanet.kind.capitalize()));
  
  updatePlanetResourcesUI(tPlanet);
  
}


function updatePlanetResourcesUI(p){
  var ulbox = $("#top_planet #res_box ul")
  ulbox.html("");
  ulbox.append("<li>Gold: {0}</li>".format(p.resources.gold.round2(2)) )
  ulbox.append("<li>Food: {0}</li>".format(p.resources.food.round2(2)) )
  ulbox.append("<li>Deuterium: {0}</li>".format(p.resources.deuterium.round2(2)) )
  ulbox.append("<li>Exchange: G{0} | F{1} | D{2}</li>".format(
    p.prices.gold,
    p.prices.food,
    p.prices.deuterium
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
    
    var capacity_available = me.capacity - me.resourcesTotal();
    
    var maxSell = getRes(whatSell,me.resources)
    $("#slider_sell").slider("option","max",maxSell);
    
    var multiplier = getRes(whatBuy,tPlanet.prices) / getRes(whatSell,tPlanet.prices);
    var maxBuy = Math.floor( getRes(whatSell,me.resources) * multiplier );
    
    maxBuy = Math.min(maxBuy,capacity_available, getRes(whatBuy,tPlanet.resources));
    
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

function resetSelects(){
  $("#trade #buy_wrap ol").children().each(function(index){
    $(this).removeClass('ui-selected').addClass('ui-state-default'); 
  })
  $("#trade #sell_wrap ol").children().each(function(index){
    $(this).removeClass('ui-selected').addClass('ui-state-default'); 
  })

}



function sliderValueUpdate(id, value){
  $(id).slider("option","value",value);
  
  if(id == "#slider_sell"){
    $("#sell_amount").html(value.round2(2) + " Units");
    sellAmount = value;
  }
  else if(id == "#slider_buy"){
    $("#buy_amount").html(value.round2(2) + " Units");
    buyAmount = value;;
  } 
}


function hookImagesToProfile(){
  var i = 1;
  _.forEach(ship_images, function(image, key){
    var el = document.createElement("li");
    el.setAttribute("class","ui-state-default");
    el.setAttribute("id",i)
    el.innerHTML = image.outerHTML
    $("#ship_choose").append(el);
    i++;
  });
	$("#ship_choose" ).selectable();
}

function updateResourcesUI(selector){
  $(selector).html("<li>Gold: " + me.resources.gold.round2(2) + "</li>");
  $(selector).append("<li>Deuterium: " + me.resources.deuterium.round2(2) + "</li>");
  $(selector).append("<li>Food: " + me.resources.food.round2(2) + "</li>");
  $(selector).append("<li>Capacity: " + me.resourcesTotal().round2(2) + "/" + me.capacity + "</li>");
}
