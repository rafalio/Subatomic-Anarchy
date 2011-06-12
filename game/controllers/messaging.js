var Forms = require('forms')
var forms;
var models;
var pdata;

var sys = require('sys');
  
function start(forms_, models_, pdata_) {
  forms = forms_;
  models = models_;
  pdata = pdata_;
}

// GET

function inbox(req,res){
  
  var msgBuf = [];
  var sentBuf = [];
  
  // call 'next' to advance the Mongo streaming cursor manually
  
  models.Message.find({to: req.session.user._id}).sort('date', -1).each(function(err,msg,next){
    if(msg){
      models.User.findOne({_id: msg.from}, function(err, result){
        msg.sender = result.username;
        msgBuf.push(msg);
        next();
      })
    }
    else{
      models.Message.find({from: req.session.user._id}).sort('date', -1).each(function(err,msg,next){
        if(msg){
          models.User.findOne({_id: msg.to}, function(err, result){
            msg.receiver = result.username;
            sentBuf.push(msg);
            next();
          });
        }
        else{
          res.render('inbox',{
            head: 'inbox_head',
            title: 'Messages',
            message_form: forms.message_form.toHTML(Forms.render.p),
            messages: msgBuf,
            sent_messages: sentBuf
          });
        }
      });
    }
  });
}

// POST

function sendMessage(req,res){
  forms.message_form.handle(req, {
	    success: function(form){
	      
          var data = form.data;
          
          models.User.findOne({username: data.to}, function(err, result){
            if(!result){
              res.send("Sorry, no user with that username found, try again!");
            }
            else{
              var to_id = result._id;
              var msg = new models.Message({
                from: req.session.user._id,
                to: to_id,
                content: data.message
              });
              
              msg.save(function(err){
                if(!err){
                  
                  var to_client = pdata.clients[data.to]
                  console.log(to_client);
                  
                  if(to_client){
                    to_client.send({
                      type: "notification",
                      content: "New message from " + req.session.user.username
                    });
                  }
                  res.send("Message has been sent succesfuly!");
                } else{
                  res.send("There has been an error sending your message. Try again later!");
                }
              })
              
            }
          })       
	    },
	    other: function(form){
	        res.send("There was an error with the form, please check it! ");
	    }
  })
}

exports.start = start;
exports.inbox = inbox;
exports.sendMessage = sendMessage;
