var Forms   = require('forms')
  , forms   = require('../models/forms.js')
  , models  = require('../models/models.js')
  


// GET

function inbox(req,res){
  
  models.Message.find({to: req.session.user._id}, function(err,result){
    
    console.log("messages: " + result);
    
    res.render('inbox',{
      layout: 'game_layout',
      title: 'Your inbox!',
      message_form: forms.message_form.toHTML(Forms.render.p),
      messages: result
    })
    
  })
  
  

}

// POST

function sendMessage(req,res){
  forms.message_form.handle(req, {
	    success: function(form){
	      
	        console.log(req.session.user);
	        
          var data = form.data;
          console.log(data);
          
          models.User.findOne({username: data.to}, function(err, result){
            if(!result){
              simpleWrite(res,"Sorry, no user with that username found, try again!");
            }
            else{
              var to_id = result._id;
              var msg = new models.Message({
                from: req.session.user._id,
                to: to_id,
                content: data.message
              })
              
              msg.save(function(err){
                if(!err){
                  simpleWrite(res,"Message has been sent succesfuly!");
                } else{
                  simpleWrite(res,"There has been an error sending your message. Try again later!");
                }
              })
              
            }
          })       
	    },
	    other : function(form){
	        simpleWrite(res,"There was an error with the form, please check it! ");
	    }
  })
}
   

exports.inbox = inbox;
exports.sendMessage = sendMessage;