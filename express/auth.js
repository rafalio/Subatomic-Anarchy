var models = require('./models/models.js');
require('./controllers/mail.js');

exports.authUser = function(data, callback){
  models.User.findOne({username: data.username}, function(err, user){
    if(err){
      console.log("DB error...");
      callback(null);
    }
    else if(user.password == data.password) callback(user);
    else callback(null);
  })
}


exports.registerUser = function(data, callback){
  models.User.findOne( {username: data.username}, function(err, result){
    if(err) console.log("DB Error occured");
    
    if(result != null){
      callback('Sorry, that username is already taken! Please select a different username!');
    }
    
    else{
      var new_user = new models.User(data);
     
      new_user.save(function(err){
        if(!err){
          email(data.email,
                "Thanks for registering with our awesome game!",
                "Thanks for registering with our awesome game!",
                function(error,success){
                  if(error)
                    callback("Registration succesful! But unfortunately the email server broke.");
                  else
                    callback("Registration succesful! A confirmation email has been sent to you!");
                });
        }
        else{
          console.log("DB error occured");
        }
      })
    }
  })
}