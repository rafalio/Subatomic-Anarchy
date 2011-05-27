nodemailer = require("nodemailer");
nodemailer.sendmail = true;

initDb = function() {	
	sequelize.sync({force: true}).on("success", function(){
		console.log("Succesfully synced the database tables!");
	}).on("failure", function(error){
		console.log("There was an error synchronizing the database: " + error);
	});
}

simpleWrite =  function(res,data){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(data);
}

email = function(rec){
  nodemailer.send_mail({
    sender: "awesomegame@awesome.com",
    to:rec,
    subject:"Thanks for registering with our awesome game!",
    body:"Thanks for registering with our awesome game!"},
    function(error, success){
        console.log("Message "+ ( success? "sent" : "failed" ));
    });
}