// Emails rec
var nodemailer = require("nodemailer");
nodemailer.sendmail = true;

email = function(rec,subject,body,f){
  nodemailer.send_mail({
    sender: "awesomegame@awesome.com",
    to: rec,
    subject: subject,
    body: body},
    f);
}