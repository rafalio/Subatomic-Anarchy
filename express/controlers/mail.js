// Emails rec
var nodemailer = require("nodemailer");
nodemailer.sendmail = true;

email = function(rec,subject,body){
  /*
  
  Let's not email until production environment since I'm testing a lot and it's annoying....
  
  nodemailer.send_mail({
    sender: "awesomegame@awesome.com",
    to: rec,
    subject: subject,
    body: body},
    function(error, success){
        console.log("Message "+ ( success? "sent" : "failed" ));
    });
    */
}