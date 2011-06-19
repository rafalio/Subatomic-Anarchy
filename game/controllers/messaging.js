var Forms = require('forms')
var forms;
var models;


var sys = require('sys');
  
function start(forms_, models_, pdata_) {
  forms = forms_;
  models = models_;
  pdata = pdata_;
}

/* Used to get the number of unread messages */
function getUnread(req, res){
  var count = 0;
  models.Message.find({to: req.user.getId()}).sort('date', -1).each(function(err,msg,next){
  if(msg){
    if (msg.read == false) count++;
    next();
  }
  else{ res.send(count.toString()) };
  });
}

/* Used to fetch messages that are newer than the one that is specified
 * in the post request
 */
function getNewMessages(req, res){
  var id = req.body.id;
  var msgBuf = [];
  models.Message.find({to: req.user.getId()}).sort('date', -1).each(function(err,msg,next){
    if(msg.id != id){
      models.User.findOne({_id: msg.from}, function(err, result){
        sender = result.username;                
        msgBuf.push({
          "id"      : msg._id,
          "date"    : msg.date,
          "sender"  : result.username,
          "read"    : msg.read
        });
        next();
      })
    }
    else{
      res.send(msgBuf);
    }
  });
}

/* Used to fetch all the message headers for a user */
function getMessages(req,res){

  var msgBuf = [];
  // call 'next' to advance the Mongo streaming cursor manually
  models.Message.find({to: req.user.getId()}).sort('date', -1).each(function(err,msg,next){
    if(msg){
      console.log(msg.from)
      models.User.findOne({_id: msg.from}, function(err, result){
        console.log(result)
        console.log(msg);
        sender = result.username;                
        msgBuf.push({
          "id"      : msg._id,
          "date"    : msg.date,
          "sender"  : result.username,
          "read"    : msg.read
        });
        
        next();
      })
    }
    else{
      res.send(msgBuf);
    }
  });
}

function getSent(req, res){
  var sentBuf = [];
  models.Message.find({from: req.session.user._id}).sort('date', -1).each(function(err,msg,next){
    if(msg){
      models.User.findOne({_id: msg.to}, function(err, result){
        msg.receiver = result.username;
        console.log(msg);
        sentBuf.push({
          "id"      : msg._id,
          "date"    : msg.date,
          "receiver": result.username,
          "content" : msg.content,
          "read"    : msg.read,
        });
        next();
      })
    }
    else{
      res.send(sentBuf);
    }
  });
}

// GET
function inbox(req,res){
  
  var msgBuf = [];
  var sentBuf = [];
  
  // call 'next' to advance the Mongo streaming cursor manually
  
  models.Message.find({to: req.user._id}).sort('date', -1).each(function(err,msg,next){
    if(msg){
      models.User.findOne({_id: msg.from}, function(err, result){
        msg.sender = result.username;
        msgBuf.push(msg);
        next();
      })
    }
    else{
      models.Message.find({from: req.user._id}).sort('date', -1).each(function(err,msg,next){
        if(msg){
          models.User.findOne({_id: msg.to}, function(err, result){
            msg.receiver = result.username;
            sentBuf.push(msg);
            next();
          });
        }
        else{
          res.send(msgBuf);        
          
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


//POST
/* Used to get the content of a particular message
 */
function getMessage(req, res){
  var id = req.body.id;
  //Getting the message
  models.Message.findOne({_id: id}, function(err, msg){
    if (msg){
      models.User.findOne({_id: msg.from}, function(err, result){
        sender = result.username;                

        //We now need to update that the message was read        
        msg.read = true;
        msg.save();
        
        //Send the content of the message back to client
        res.send({
          "date"    : msg.date,
          "sender"  : result.username,
          "content" : msg.content,
        });
      });
    }
    else {
      console.log("Message could not be found! Help!");
    }
  });
}


// POST
function sendMessage(req,res){
  
  var data = req.body;
  
  if(data.to == '' || data.message == ''){
    res.send({type: 'fail', message: "Please fill out the form correctly!"});
    return;
  }
  
  models.User.findOne({username: data.to}, function(err, result){
    if(!result){
      res.send({
        type: "fail",
        message: "Sorry, no user with that username found, please try again!"
      });
    }
    else{
      var to_id = result._id;
      var msg = new models.Message({
        from: req.user.getId(),
        to: to_id,
        content: data.message
      });
      
      msg.save(function(err){
        if(!err){
          res.send({type: "success", message: "Your message has been succesfuly sent!"});
          
          /* Dynamic Notification */
          var toClient = pdata.players[data.to];
          if (toClient && toClient.client !== undefined){
              toClient.client.send({
                type: "msgNotification"
              });
          }
        }
        else{
          res.send({type: "fail", message: "There has been an error sending your message. Try again later!"});
        }
      }) 
    }
    
  })
  
}



// For the autocomplete!
function getUsernames(req,res){
  console.log(req.query);
  var data = req.query['term'];
  var pattern = '/^' + data + '/';
  console.log(pattern);
  
  var pattern = new RegExp(data);
  
  var buffer = [];
  
  // mega inefficient, hits database for ALL users on each call, because I don't think regex works for mongoose :S
  models.User.find({}).each(function(err,user,next){
    if(user) {
      if(pattern.test(user.username)){
        var obj = {}
        obj['id'] = user.username;
        obj['value'] = user.username;
        buffer.push(obj); 
      }
      next();
    }
    else{
      console.log(buffer);
      res.send(buffer);
    }
  })
  
}

exports.start = start;
exports.inbox = inbox;
exports.sendMessage = sendMessage;
exports.getUsernames = getUsernames;
exports.getMessages = getMessages;
exports.getSent = getSent;
exports.getMessage = getMessage;
exports.getNewMessages = getNewMessages;
exports.getUnread = getUnread;
