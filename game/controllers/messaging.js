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
        from: req.session.user._id,
        to: to_id,
        content: data.message
      });
      
      msg.save(function(err){
        if(!err){
          res.send({type: "success", message: "Your message has been succesfuly sent!"});
          
          // Maybe do dynamic notificaiton here if person is logged in!
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
