// Forms. Make sure to use my version which can be obtained from 
// git clone git@github.com:radicality/forms.git forms

var forms = require('forms');
var fields = forms.fields
  , validators = forms.validators;
    
forms.render.setOrdering("after");

var login_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true}),
});

var register_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true}),
    email: fields.email({required: true})
});

exports.login_form = login_form;
exports.register_form = register_form;