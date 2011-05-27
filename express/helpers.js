nodemailer = require("nodemailer");
nodemailer.sendmail = true;

// Call this to flush database and synchronize tables
initDb = function() {	
	sequelize.sync({force: true}).on("success", function(){
		console.log("Succesfully synced the database tables!");
	}).on("failure", function(error){
		console.log("There was an error synchronizing the database: " + error);
	});
}

// Writes a very simple response
simpleWrite =  function(res,data){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(data);
}

// Emails rec
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

// Fetches out just the attributes out of a Sequelize Datastructure.
fetchAttributes = function(obj){
  var ret = {};
  if( !('attributes' in obj) ){
    return undefined;
  }
  else{
    for(m in obj.attributes){
      var f = obj.attributes[m];
      ret[f] = obj[f];
    }
    return ret;
  }
}