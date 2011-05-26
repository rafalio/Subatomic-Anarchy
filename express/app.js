// Express init

var express = require('express');
var app = module.exports = express.createServer();


// Using sequelize as a MySQL ORM

var Sequelize = require("sequelize")
var chainer = new Sequelize.Utils.QueryChainer
var sequelize = new Sequelize("game","root", "root" , {
  	logging: true // for development purposes
  	});

var User = sequelize.define('User',{
	username: Sequelize.STRING,
	password: Sequelize.STRING,
	email: Sequelize.STRING
})


// Recreates the database tables from scratch

var initDb = function() {	
	sequelize.sync({force: true}).on("success", function(){
		console.log("Succesfully synced the database tables!");
	}).on("failure", function(error){
		console.log("There was an error synchronizing the database: " + error);
	});
}


// Forms. Make sure to use my version which can be obtained from 
// git clone git@github.com:radicality/forms.git forms

var forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators;
    
forms.render.setOrdering("after");

var login_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true}),
},"login_form");

var reg_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true}),
    email: fields.email({required: true})
},"register_form");


// App Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    pageTitle: 'Awesome Web Game 3.0 | index',
  });
});

app.get('/init', function(req,res){
	initDb();
	res.render("index", {
		title: "INITING DATABASE",
	});
})

app.get('/login', function(req, res){
  res.render('login', {
    pageTitle: 'Awesome Web Game 3.0 | Login',
    login_form: login_form.toHTML(forms.render.p),
    register_form: reg_form.toHTML(forms.render.p)
  });
});

app.post('/login', function(req,res){
	console.log(req.body.login_form);
	res.redirect('back');
})

app.listen(3000);

console.log("Express server listening on port %d", app.address().port);
