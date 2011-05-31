require('./db.js');
require('../controllers/mail.js');

var UserSchema = new Schema({
  username: {type: String, unique: true},
  password: String,
  email: String,
  joined: {type: Date, default: Date.now},
  admin: {type: Boolean, default: false},
  position:{
    x : {type: Number, default: 100},
    y : {type: Number, default: 100}
  },
  rotation: {type: Number, default: 0}
})

mongoose.model('User', UserSchema);

// Middleware

UserSchema.pre('save', function(next){
   
  email(this.email,
        "Thanks for registering with our awesome game!",
        "Thanks for registering with our awesome game!",
        
        function(error,success){
          if(error){
            console.log("Registration succesful! But unfortunately the email server broke.");
          }
          else{
            console.log("Registration succesful! A confirmation email has been sent to you!");
          }    
        });
  
  next(null);
  
})

exports.User = mongoose.model('User');