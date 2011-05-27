// Forms. Make sure to use my version which can be obtained from 
// git clone git@github.com:radicality/forms.git forms

forms = require('forms');
var fields = forms.fields,
    validators = forms.validators;
    
forms.render.setOrdering("after");

login_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true}),
});

register_form = forms.create({
    username: fields.string({required: true}),
    password: fields.password({required: true}),
    email: fields.email({required: true})
});