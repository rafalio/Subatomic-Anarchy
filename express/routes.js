var sys = require('sys');

var logged_in = {};

// Routes

app.get('/', function(req, res){
  if(!req.session.user) {
    simpleWrite(res, "You're not logged in!");
  } else {
    simpleWrite(res, "You're logged in as " + req.session.user.username);
  }
});

app.get('/init', function(req,res){
	initDb();
	res.render("index", {
		title: "INITING DATABASE",
	});
})

app.get('/login', function(req, res){
  res.render('login', {
    title: 'Awesome Web Game 3.0 | Login',
    login_form: login_form.toHTML(forms.render.p),
    register_form: register_form.toHTML(forms.render.p)
  });
});

app.post('/login', function(req,res){
  
  console.log(sys.inspect(req.body));  

	login_form.handle(req, {
	    success: function(form){
          var data = form.data;
          
          User.find({ where: {username : data.username}}).on("success",function(user){
            if(!user){
              simpleWrite(res,"No user with that username found!");
            }
            else if(user.password == data.password){
              req.session.user = fetchAttributes(user);
              simpleWrite(res,"Authentication succesfull!");
            }
            else{
              simpleWrite(res,"Authentication failed, passwords don't match!");
            }
          })
	    },
	    other : function(form){
	        simpleWrite(res,"There was an error with the form, please check it! ");
	    }
	})
})

app.post('/register', function(req,res){
    console.log("Trying to register...");
    
    register_form.handle(req, {
        success : function(form){
          var data = form.data;
          console.log(data);    

          User.count({
            where : {
              username : data.username
            }
          }).on("success", function(count){
            if(count > 0){
              simpleWrite(res,"Sorry, that username is already taken! Please select a different username!");
            }
            else{
              var new_user = User.build(data);
              new_user.save();
              simpleWrite(res,"Registration succesful! A confirmation email has been sent to you!");
              email(data.email);
          }
          })
        },
        other : function(form){
          simpleWrite(res,"You filled out the form wrong! Try again! ");
        }
    });
})